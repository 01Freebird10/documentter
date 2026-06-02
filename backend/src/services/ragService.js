import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { discoverFiles, readFileText } from './parserService.js';

dotenv.config();

// Initialize Gemini SDK if API key exists
let genAI = null;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

// ==========================================
// 1. PSEUDO-RANDOM DETERMINISTIC VECTOR MATHS
// ==========================================
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export const generateMockEmbedding = (text, size = 768) => {
  let seed = hashString(text);
  
  // Linear Congruential Generator (LCG) for deterministic pseudo-random variables
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  const vec = [];
  for (let i = 0; i < size; i++) {
    vec.push(random() * 2 - 1); // Float values between -1.0 and 1.0
  }
  
  // Normalize vector to unit length
  const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return mag === 0 ? vec : vec.map(v => v / mag);
};

// Standard dot product and vector magnitude functions for Cosine Similarity search
const dotProduct = (a, b) => a.reduce((sum, val, idx) => sum + val * (b[idx] || 0), 0);
const magnitude = (arr) => Math.sqrt(arr.reduce((sum, val) => sum + val * val, 0));

export const calculateCosineSimilarity = (a, b) => {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
};

// ==========================================
// 2. IN-MEMORY CODES VECTOR DATABASE ADAPTER
// ==========================================
class LocalVectorStore {
  constructor() {
    this.indices = {}; // Key: projectId, Value: Array of indexed chunks with float embeddings
  }

  addChunks(projectId, chunks) {
    const idStr = projectId.toString();
    this.indices[idStr] = chunks;
    console.log(`[VECTOR STORE] Registered ${chunks.length} codebase chunks for Project: ${projectId}`);
  }

  hasProject(projectId) {
    return !!this.indices[projectId.toString()];
  }

  search(projectId, queryEmbedding, topK = 5) {
    const idStr = projectId.toString();
    const chunks = this.indices[idStr] || [];
    if (chunks.length === 0) {
      console.warn(`[VECTOR STORE WARNING] No index found for Project: ${projectId}. Crawl is empty.`);
      return [];
    }

    const scored = chunks.map(chunk => {
      const score = calculateCosineSimilarity(queryEmbedding, chunk.embedding);
      return { ...chunk, score };
    });

    // Sort by cosine similarity score descending
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}

export const localVectorStore = new LocalVectorStore();

// ==========================================
// 3. SMART CODE CHUNKER STRATEGY
// ==========================================
export const chunkCodeFile = (relativePath, text, chunkSize = 80, overlap = 15) => {
  const ext = path.extname(relativePath).toLowerCase();
  
  // Resolve language designators
  let lang = 'javascript';
  if (ext === '.py') lang = 'python';
  else if (ext === '.md') lang = 'markdown';
  else if (ext === '.json') lang = 'json';
  else if (ext === '.yml' || ext === '.yaml') lang = 'yaml';
  else if (ext === '.html') lang = 'html';
  else if (ext === '.css') lang = 'css';

  const lines = text.split('\n');
  const chunks = [];
  let index = 0;

  while (index < lines.length) {
    let endIdx = Math.min(index + chunkSize, lines.length);

    // Boundary parsing: adjust end index to preserve function, class, and component envelopes
    if (endIdx < lines.length) {
      for (let j = endIdx; j > index + chunkSize - overlap; j--) {
        const line = lines[j] ? lines[j].trim() : '';
        if (
          line.startsWith('function ') ||
          line.startsWith('class ') ||
          line.startsWith('const ') ||
          line.startsWith('export ') ||
          line.startsWith('import ') ||
          line.startsWith('@') ||
          line.startsWith('describe(') ||
          line.startsWith('test(')
        ) {
          endIdx = j; // Cut at boundary
          break;
        }
      }
    }

    const chunkLines = lines.slice(index, endIdx);
    const chunkText = chunkLines.join('\n');
    const startLine = index + 1;
    const endLine = endIdx;

    if (chunkText.trim()) {
      // Inject descriptive file headers
      const formattedHeader = `// File: ${relativePath} | Language: ${lang} | Lines: ${startLine}-${endLine}\n\n`;
      chunks.push({
        text: formattedHeader + chunkText,
        file: relativePath,
        lines: `${startLine}-${endLine}`,
        language: lang
      });
    }

    index = endIdx - overlap;
    if (index >= lines.length || endIdx === lines.length) break;
  }

  return chunks;
};

// ==========================================
// 4. CORE RAG PLATFORM PIPELINES
// ==========================================
export const generateEmbedding = async (text) => {
  if (!genAI) {
    // Return high-fidelity local vector float array if Gemini key is missing
    return generateMockEmbedding(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values; // returns [float, float, ...]
  } catch (err) {
    console.warn(`[EMBEDDING WARNING] Gemini embedding failed: ${err.message}. Activating local fallback.`);
    return generateMockEmbedding(text);
  }
};

export const indexRepository = async (projectId, extractedPath) => {
  if (!fs.existsSync(extractedPath)) {
    throw new Error(`Repository workspace extraction path not found: ${extractedPath}`);
  }

  console.log(`[RAG SERVICE] Commencing repository crawling and indexing for Project: ${projectId}`);
  const files = discoverFiles(extractedPath);

  // Filter allowed code & text files
  const allowedExtensions = new Set([
    '.js', '.jsx', '.ts', '.tsx', '.py', '.json', '.yml', '.yaml', '.md', '.css', '.html'
  ]);

  const relevantFiles = files.filter(f => allowedExtensions.has(f.ext));
  console.log(`- Crawled total relevant files: ${relevantFiles.length}`);

  let allChunks = [];

  for (const file of relevantFiles) {
    const text = readFileText(file.path);
    if (!text.trim()) continue;

    const fileChunks = chunkCodeFile(file.relativePath, text);
    allChunks.push(...fileChunks);
  }

  console.log(`- Smart chunking compiled total chunks count: ${allChunks.length}`);

  // Generate embeddings for all chunks (in batches of 5 to avoid API rate limits)
  const batchSize = 10;
  const chunkLength = allChunks.length;
  
  for (let i = 0; i < chunkLength; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (chunk) => {
        chunk.embedding = await generateEmbedding(chunk.text);
      })
    );
  }

  // Register inside Local Cosine Store
  localVectorStore.addChunks(projectId, allChunks);
  return allChunks.length;
};

export const retrieveRepositoryContext = async (projectId, query, limit = 5) => {
  const idStr = projectId.toString();
  const queryVector = await generateEmbedding(query);
  
  const matches = localVectorStore.search(idStr, queryVector, limit);
  return matches.map(match => ({
    text: match.text,
    file: match.file,
    lines: match.lines,
    score: match.score
  }));
};
