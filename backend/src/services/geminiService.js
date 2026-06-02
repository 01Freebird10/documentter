import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import AppError from '../utils/appError.js';

dotenv.config();

let genAI = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export const generateGeminiContent = async (systemPrompt, retries = 2) => {
  if (!genAI) {
    throw new AppError('Gemini API key is not configured. Redirecting to offline compilation.', 401);
  }

  // Model parameters (Gemini 2.5 Flash is standard and highly performant)
  const modelName = 'gemini-1.5-flash'; 

  try {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    console.log(`[AI SERVICE] Invoking Google Generative Model: ${modelName}`);
    
    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();

    if (!text) {
      throw new AppError('Gemini engine returned an empty response.', 500);
    }

    // Parse output JSON schema
    return JSON.parse(text);
  } catch (error) {
    if (retries > 0) {
      console.warn(`[AI SERVICE WARNING] Generation failed. Retrying... (${retries} left). Error: ${error.message}`);
      // Brief delay before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateGeminiContent(systemPrompt, retries - 1);
    }
    throw new AppError(`AI Generation Engine failed: ${error.message}`, 500);
  }
};
