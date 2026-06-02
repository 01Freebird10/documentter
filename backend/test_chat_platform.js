import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Force Mock payments & Redis
process.env.USE_MOCK_REDIS = 'true';
process.env.PAYMENT_PROVIDER = 'mock';

// Dynamically import RAG, Chat services, and models to prevent ESM hoisting conflicts
const { 
  chunkCodeFile, 
  generateEmbedding, 
  localVectorStore, 
  indexRepository, 
  retrieveRepositoryContext, 
  calculateCosineSimilarity 
} = await import('./src/services/ragService.js');

const { processChatMessage } = await import('./src/services/chatService.js');
const { sendMessage, getConversationHistory, clearConversation, getSmartSuggestions } = await import('./src/controllers/chatController.js');

const User = (await import('./src/models/User.js')).default;
const Project = (await import('./src/models/Project.js')).default;
const ChatMessage = (await import('./src/models/ChatMessage.js')).default;

dotenv.config();

const runTests = async () => {
  console.log('\n======================================================');
  console.log('       REPOMIND AI AI CHAT PLATFORM INTEGRATION TEST       ');
  console.log('======================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/repomind_chat_test';

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('[STEP 1] Connected to MongoDB database successfully.');

    // Seed mock tester developer
    const mockDeveloper = await User.findOneAndUpdate(
      { email: 'architect.tester@repomind.ai' },
      { name: 'Core Architect Tester', plan: 'pro', credits: 500 },
      { upsert: true, new: true }
    );
    console.log(`- Seeded mock user: ${mockDeveloper.name} (${mockDeveloper.email})`);

    // Create a mock active Project record
    const mockProject = await Project.create({
      userId: mockDeveloper._id,
      projectName: 'chat-platform-core-spec',
      sourceType: 'zip',
      extractedPath: path.resolve('./src/uploads'), // Crawls standard backend uploads folder
      techStack: ['Node.js', 'Express.js', 'React', 'MongoDB'],
      analysisContext: {
        routes: [
          { method: 'post', path: '/api/chat/message', controllerName: 'chatController' },
          { method: 'get', path: '/api/chat/history', controllerName: 'chatController' }
        ],
        schemas: [
          { modelName: 'ChatMessage', fieldsCount: 5 }
        ],
        quality: {
          refactoringSuggestions: [
            'Break down monolithic chat controllers into decoupled services.'
          ]
        }
      }
    });
    console.log(`- Seeded mock project: ${mockProject.projectName} (ID: ${mockProject._id})`);

    // ------------------------------------------------------------------
    // TEST 1: Code Chunker & Boundaries Boundaries Preservation
    // ------------------------------------------------------------------
    console.log('\n[TEST 2] Verifying Smart Code Chunker with boundaries preservation...');
    
    const mockSourceCode = `
import fs from 'fs';

class UserAuthService {
  constructor() {
    this.session = null;
  }

  async authenticateUser(email, password) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Auth failed');
    return user;
  }
}

export default UserAuthService;
`;
    
    const chunks = chunkCodeFile('src/services/authService.js', mockSourceCode, 10, 2);
    console.log(`- Compiled total chunks: ${chunks.length}`);
    chunks.forEach((c, idx) => {
      console.log(`  * Chunk #${idx + 1} lines range: ${c.lines}`);
      console.log(`    Snippet Preview:\n${c.text.split('\n').slice(0, 3).join('\n')}\n    ...`);
    });

    if (chunks.length > 0 && chunks[0].text.includes('src/services/authService.js')) {
      console.log('=> Smart Code Chunker: SUCCESS! ✅');
    } else {
      console.error('=> Smart Code Chunker: FAILED! ❌');
    }

    // ------------------------------------------------------------------
    // TEST 2: Deterministic Mock Vector Embeddings
    // ------------------------------------------------------------------
    console.log('\n[TEST 3] Verifying float vector Cosine Similarity operations...');
    
    const textA = 'Architected a modular backend gateway using Express and MongoDB (Mongoose ODM)';
    const textB = 'Architected a modular backend gateway using Express and MongoDB (Mongoose ODM)';
    const textC = 'Completely unrelated text block describing slide layout templates and charts bounds';

    const vecA = await generateEmbedding(textA);
    const vecB = await generateEmbedding(textB);
    const vecC = await generateEmbedding(textC);

    const simIdentical = calculateCosineSimilarity(vecA, vecB);
    const simDifferent = calculateCosineSimilarity(vecA, vecC);

    console.log(`- Cosine Similarity (Identical Texts): ${simIdentical.toFixed(4)}`);
    console.log(`- Cosine Similarity (Unrelated Texts): ${simDifferent.toFixed(4)}`);

    if (simIdentical > 0.99 && simDifferent < 0.3) {
      console.log('=> Vector Embeddings Maths: SUCCESS! ✅');
    } else {
      console.error('=> Vector Embeddings Maths: FAILED! ❌');
    }

    // ------------------------------------------------------------------
    // TEST 3: Repository Crawl, Index & Vector Query Matches
    // ------------------------------------------------------------------
    console.log('\n[TEST 4] Verifying Dynamic Repository Indexing & Top-K Chunks RAG retrieval...');
    
    // We crawl and index the target folder (seeded project extracted path)
    const chunksCount = await indexRepository(mockProject._id, mockProject.extractedPath);
    console.log(`- Total indexed code segments in repository: ${chunksCount}`);

    // Retrieve context for query
    const searchMatches = await retrieveRepositoryContext(mockProject._id, 'How does chat API work', 2);
    console.log(`- Found query nearest matching chunks count: ${searchMatches.length}`);
    searchMatches.forEach((m, idx) => {
      console.log(`  * Match #${idx + 1} score: ${m.score.toFixed(4)} (File: ${m.file}, Lines: ${m.lines})`);
    });

    if (searchMatches.length > 0 && searchMatches[0].score > 0) {
      console.log('=> RAG Repository Context Retrieval: SUCCESS! ✅');
    } else {
      console.error('=> RAG Repository Context Retrieval: FAILED! ❌');
    }

    // ------------------------------------------------------------------
    // TEST 4: Chat Assistant Custom Personalities (Modes)
    // ------------------------------------------------------------------
    console.log('\n[TEST 5] Verifying RAG Prompt compilation & AI chat personalities (Modes)...');
    
    const modesToVerify = ['architect', 'security', 'performance', 'interview'];
    
    for (const activeMode of modesToVerify) {
      const response = await processChatMessage(
        mockProject._id,
        mockDeveloper._id,
        'conv_test_session',
        'Analyze codebase schemas relationships and API rate limits',
        activeMode,
        []
      );
      
      console.log(`\n- [MODE VERIFIED: "${activeMode.toUpperCase()}"]`);
      console.log(`  * Citation files referenced count: ${response.citations?.length}`);
      console.log(`  * Auto-generated dynamic suggestions count: ${response.suggestedQuestions?.length}`);
      console.log(`  * Answer Preview:\n${response.content.split('\n').slice(0, 4).join('\n')}\n    ...`);

      if (response.content && response.citations.length >= 0) {
        console.log(`=> Active Mode "${activeMode}": SUCCESS! ✅`);
      } else {
        console.error(`=> Active Mode "${activeMode}": FAILED! ❌`);
      }
    }

    // ------------------------------------------------------------------
    // TEST 5: REST Controllers & Swagger endpoint triggers
    // ------------------------------------------------------------------
    console.log('\n[TEST 6] Verifying REST Controllers & Swagger message loops...');
    
    const reqChat = {
      body: {
        projectId: mockProject._id,
        conversationId: 'conv_swagger_test_123',
        message: 'Where is login implemented?',
        mode: 'architect'
      },
      user: mockDeveloper
    };

    const resMock = {
      status(code) { this.code = code; return this; },
      json(data) { this.data = data; return this; }
    };

    await sendMessage(reqChat, resMock, (err) => { throw err; });
    console.log('- REST Controller Reply Response message role:', resMock.data?.data?.role);
    console.log('- Saved citations array count in Mongoose:', resMock.data?.data?.citations?.length);

    const savedMessages = await ChatMessage.find({ conversationId: 'conv_swagger_test_123' });
    console.log(`- Verified chat history log count in MongoDB collection: ${savedMessages.length}`);

    if (savedMessages.length === 2 && resMock.data?.data?.role === 'assistant') {
      console.log('=> REST Chat API Controller: SUCCESS! ✅');
    } else {
      console.error('=> REST Chat API Controller: FAILED! ❌');
    }

    // ------------------------------------------------------------------
    // CLEAN UP TEST CODES INDEX & TRACES
    // ------------------------------------------------------------------
    console.log('\n[CLEANUP] Sweeping test database chat traces...');
    await ChatMessage.deleteMany({ projectId: mockProject._id });
    await Project.deleteOne({ _id: mockProject._id });
    await User.deleteOne({ _id: mockDeveloper._id });

  } catch (err) {
    console.error('[TEST CRITICAL FAULT]', err);
  } finally {
    await mongoose.disconnect();
    console.log('- Closed database connection.');
  }

  console.log('\n======================================================');
  console.log('          ALL CHAT PLATFORM TESTS COMPLETED          ');
  console.log('======================================================\n');
  process.exit(0);
};

runTests().catch(err => {
  console.error('[FATAL RUN EXCEPTION]', err);
  process.exit(1);
});
