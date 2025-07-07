import './hello-ai.js';
import dotenv from 'dotenv';
import { generateHaiku } from './hello-ai.js';

dotenv.config();

async function main() {
  try {
    const message = await generateHaiku();
    console.log(message);
  } catch (error) {
    console.error('Error generating haiku:', error);
  }
}

main(); // Commented out to prevent token usage
