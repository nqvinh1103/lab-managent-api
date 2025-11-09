import dotenv from 'dotenv';

dotenv.config();

export const geminiConfig = {
  apiKey: process.env.GEMINI_API_KEY || '',
  model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  maxOutputTokens: parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS || '4096', 10),
  temperature: 0.7,
};

if (!geminiConfig.apiKey) {
  console.warn('⚠️  GEMINI_API_KEY is not set in environment variables');
}

