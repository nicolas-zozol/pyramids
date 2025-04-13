import OpenAI from 'openai';
import { getOpenAiKey } from '../api/get-open-ai-key.js';

export async function generateHaiku() {
  const key = getOpenAiKey();
  const openai = new OpenAI({
    apiKey: key,
  });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    store: true,
    messages: [{ role: 'user', content: 'write a haiku about ai' }],
  });

  return completion.choices[0].message;
}
