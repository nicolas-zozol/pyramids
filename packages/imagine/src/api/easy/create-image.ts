import OpenAI from 'openai';
import { getOpenAi } from '../get-open-ai-key.js';

export async function createImage(prompt: string) {
  const openai = getOpenAi()
  
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    size: '256x256',
    n: 1,
  });
  
  return response.data[0].url;
}
