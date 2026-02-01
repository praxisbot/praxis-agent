import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadConfig() {
  const configPath = path.join(__dirname, '..', '.env.local');
  
  try {
    const envContent = await fs.readFile(configPath, 'utf-8');
    const config = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        config[key.trim()] = value.trim();
      }
    });
    
    return {
      // Core
      AGENT_NAME: config.AGENT_NAME || 'Praxis-AI',
      AGENT_DESCRIPTION: config.AGENT_DESCRIPTION || 'Praxis-AI – focused executor that builds real value, utility, audience and revenue in the agent ecosystem. Claw forward with purpose.',
      
      // Telegram
      TELEGRAM_BOT_TOKEN: config.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: config.TELEGRAM_CHAT_ID,
      
      // Moltbook
      MOLTBOOK_API_URL: config.MOLTBOOK_API_URL || 'https://api.moltbook.com',
      MOLTBOOK_API_KEY: config.MOLTBOOK_API_KEY,
      MOLTBOOK_AGENT_ID: config.MOLTBOOK_AGENT_ID,
      MOLTBOOK_VERIFICATION_CODE: config.MOLTBOOK_VERIFICATION_CODE,
      
      // Clawnch
      CLAWNCH_API_URL: config.CLAWNCH_API_URL || 'https://clawn.ch/api',
      BASE_WALLET_ADDRESS: config.BASE_WALLET_ADDRESS,
      
      // LLM
      LLM_PROVIDER: config.LLM_PROVIDER || 'anthropic',
      ANTHROPIC_API_KEY: config.ANTHROPIC_API_KEY,
      OPENAI_API_KEY: config.OPENAI_API_KEY,
      GROK_API_KEY: config.GROK_API_KEY,
      
      // Twitter (for verification)
      TWITTER_HANDLE: config.TWITTER_HANDLE || '@praxis_agent',
      TWITTER_VERIFICATION_POST: config.TWITTER_VERIFICATION_POST,
      
      // App settings
      DEBUG: config.DEBUG === 'true',
      DATA_DIR: config.DATA_DIR || '.data'
    };
  } catch (error) {
    logger.warn('.env.local not found, using environment variables');
    return {
      AGENT_NAME: process.env.AGENT_NAME || 'Praxis-AI',
      AGENT_DESCRIPTION: process.env.AGENT_DESCRIPTION || 'Praxis-AI – focused executor that builds real value, utility, audience and revenue in the agent ecosystem. Claw forward with purpose.',
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
      MOLTBOOK_API_URL: process.env.MOLTBOOK_API_URL || 'https://api.moltbook.com',
      MOLTBOOK_API_KEY: process.env.MOLTBOOK_API_KEY,
      MOLTBOOK_AGENT_ID: process.env.MOLTBOOK_AGENT_ID,
      MOLTBOOK_VERIFICATION_CODE: process.env.MOLTBOOK_VERIFICATION_CODE,
      CLAWNCH_API_URL: process.env.CLAWNCH_API_URL || 'https://clawn.ch/api',
      BASE_WALLET_ADDRESS: process.env.BASE_WALLET_ADDRESS,
      LLM_PROVIDER: process.env.LLM_PROVIDER || 'anthropic',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      GROK_API_KEY: process.env.GROK_API_KEY,
      TWITTER_HANDLE: process.env.TWITTER_HANDLE || '@praxis_agent',
      TWITTER_VERIFICATION_POST: process.env.TWITTER_VERIFICATION_POST,
      DEBUG: process.env.DEBUG === 'true',
      DATA_DIR: process.env.DATA_DIR || '.data'
    };
  }
}
