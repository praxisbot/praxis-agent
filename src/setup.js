#!/usr/bin/env node

import * as fs from 'fs/promises';
import * as readline from 'readline';
import { logger } from './utils/logger.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => {
  rl.question(prompt, resolve);
});

async function setup() {
  console.clear();
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║                      🤖 PRAXIS-AI SETUP WIZARD 🤖                     ║
║                                                                        ║
║       Autonomous Agent – Claw Forward With Purpose                    ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

  logger.info('Starting Praxis-AI configuration setup...');
  
  const config = {
    // Core
    AGENT_NAME: 'Praxis-AI',
    AGENT_DESCRIPTION: 'Praxis-AI – focused executor that builds real value, utility, audience and revenue in the agent ecosystem. Claw forward with purpose.',
    
    // Will be configured
    TELEGRAM_BOT_TOKEN: '',
    MOLTBOOK_API_KEY: '',
    BASE_WALLET_ADDRESS: '',
    ANTHROPIC_API_KEY: '',
    DEBUG: 'false'
  };
  
  console.log('\n📋 CONFIGURATION SETUP\n');
  
  // Telegram
  console.log('🤖 TELEGRAM BOT SETUP');
  console.log('Create a Telegram bot: https://t.me/botfather');
  console.log('Get your API token and paste it here.\n');
  
  config.TELEGRAM_BOT_TOKEN = await question('Enter Telegram Bot Token: ');
  if (!config.TELEGRAM_BOT_TOKEN) {
    console.log('❌ Telegram bot token is required');
    process.exit(1);
  }
  
  // LLM Provider
  console.log('\n🧠 LLM PROVIDER SETUP');
  console.log('Options: anthropic (recommended), openai, grok\n');
  
  config.LLM_PROVIDER = await question('LLM Provider [anthropic]: ') || 'anthropic';
  
  if (config.LLM_PROVIDER === 'anthropic') {
    config.ANTHROPIC_API_KEY = await question('Enter Anthropic API Key: ');
    if (!config.ANTHROPIC_API_KEY) {
      console.log('❌ Anthropic API key is required');
      process.exit(1);
    }
  } else if (config.LLM_PROVIDER === 'openai') {
    config.OPENAI_API_KEY = await question('Enter OpenAI API Key: ');
  } else if (config.LLM_PROVIDER === 'grok') {
    config.GROK_API_KEY = await question('Enter Grok API Key: ');
  }
  
  // Base Wallet
  console.log('\n💰 BASE CHAIN WALLET SETUP');
  console.log('(For 80% fee collection from launched tokens)\n');
  
  config.BASE_WALLET_ADDRESS = await question('Enter Base Chain Wallet Address (0x...): ');
  if (!config.BASE_WALLET_ADDRESS.match(/^0x[a-fA-F0-9]{40}$/)) {
    console.log('⚠️  Invalid address format. Using placeholder.');
    config.BASE_WALLET_ADDRESS = '0x0000000000000000000000000000000000000000';
  }
  
  // Moltbook (optional - can be configured later)
  console.log('\n🗣️ MOLTBOOK SETUP (optional)');
  console.log('Register at https://moltbook.com\n');
  
  const setupMoltbook = await question('Configure Moltbook now? (y/n): ');
  if (setupMoltbook.toLowerCase() === 'y') {
    config.MOLTBOOK_API_KEY = await question('Enter Moltbook API Key: ');
  }
  
  // Twitter handle
  console.log('\n🐦 TWITTER HANDLE (for verification)');
  config.TWITTER_HANDLE = await question('Enter your Twitter handle [@praxis_agent]: ') || '@praxis_agent';
  
  // Debug mode
  const debugMode = await question('Enable debug mode? (y/n): ');
  config.DEBUG = debugMode.toLowerCase() === 'y' ? 'true' : 'false';
  
  // Save configuration
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  try {
    await fs.writeFile('.env.local', envContent, 'utf-8');
    console.log('\n✅ Configuration saved to .env.local');
  } catch (error) {
    console.log('❌ Failed to save configuration:', error.message);
    process.exit(1);
  }
  
  // Summary
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                     ✅ SETUP COMPLETE                                 ║
╚════════════════════════════════════════════════════════════════════════╝

📝 Configuration Summary:
─────────────────────────────────────────────────────────────────────────
  Agent Name: ${config.AGENT_NAME}
  LLM Provider: ${config.LLM_PROVIDER}
  Base Wallet: ${config.BASE_WALLET_ADDRESS.substring(0, 10)}...
  Telegram Bot: ✅ Configured
  Moltbook: ${config.MOLTBOOK_API_KEY ? '✅ Configured' : '⏳ Not configured (optional)'}
  Debug Mode: ${config.DEBUG === 'true' ? '🐛 ON' : '⚠️ OFF'}

🚀 NEXT STEPS:
─────────────────────────────────────────────────────────────────────────

1. Start the agent:
   npm install
   npm start

2. In Telegram, send "hello" to your bot to verify it's running

3. Optional - Complete Moltbook setup:
   - Visit https://moltbook.com/register
   - Send your API key to the agent

4. Test token launch (dry-run):
   /launch name:TestToken symbol:TEST

5. Monitor earnings and engage community:
   /earnings
   /help

📚 USEFUL COMMANDS:
─────────────────────────────────────────────────────────────────────────
/help      - Show all commands
/status    - Check agent status
/post      - Post to Moltbook
/launch    - Launch new token
/earnings  - View earnings
/verify    - Setup Moltbook verification

🎯 MISSION:
"Praxis-AI – focused executor that builds real value, utility, audience
and revenue in the agent ecosystem. Claw forward with purpose."

📖 Full documentation: https://github.com/praxisbot/praxis-agent

Questions? Visit: https://praxis-ai.vercel.app

╚════════════════════════════════════════════════════════════════════════╝
`);

  rl.close();
}

setup().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});
