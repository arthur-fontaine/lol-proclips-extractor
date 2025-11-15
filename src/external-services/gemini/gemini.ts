import { GoogleGenAI } from '@google/genai';
import { env } from '../env/env.ts';

export const gemini = new GoogleGenAI({
  apiKey: env.geminiApiKey,
});
