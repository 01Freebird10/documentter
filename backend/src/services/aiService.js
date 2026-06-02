import { buildSystemPrompt } from './promptBuilder.js';
import { generateGeminiContent } from './geminiService.js';
import { generateFallbackContent } from './fallbackService.js';
import ApiResponse from '../utils/apiResponse.js';

// In-memory cache layer to optimize token expenses
const aiCache = {};

export const generateAIBlueprints = async (projectId, context) => {
  const cacheKey = projectId.toString();
  
  // 1. Evaluate Cache hits
  if (aiCache[cacheKey]) {
    console.log(`[AI SERVICE] Cache Hit. Serving compiled assets for project: ${projectId}`);
    return aiCache[cacheKey];
  }

  const prompt = buildSystemPrompt(context);
  
  // Estimate prompt token usage (approx. 4 characters per token)
  const promptTokens = Math.round(prompt.length / 4);
  console.log(`[AI SERVICE] Spawning AI Generation. Estimated Prompt size: ${promptTokens} tokens.`);

  let finalContent;
  let source = 'Google Gemini AI';

  try {
    // 2. Attempt Google Gemini LLM generation
    finalContent = await generateGeminiContent(prompt);
  } catch (error) {
    // 3. SECURE FALLBACK: Trigger local offline compiler on errors
    console.warn(`[AI SERVICE REDIRECT] API Generation failed. Activating local Failsafe compiler. Error: ${error.message}`);
    finalContent = generateFallbackContent(context);
    source = 'Failsafe Offline Compiler';
  }

  // Record usage metrics
  const completionTokens = Math.round(JSON.stringify(finalContent).length / 4);
  console.log(`[AI SERVICE SUCCESS] Generation complete. Engine: ${source}. Total token consumption: ${promptTokens + completionTokens} (estimated).`);

  // Cache results
  aiCache[cacheKey] = finalContent;

  return finalContent;
};
