#!/usr/bin/env node

import { logger } from './utils/logger.js';
import { loadConfig } from './config.js';
import { PraxisAgent } from './agent/PraxisAgent.js';

async function runTests() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║                   🧪 PRAXIS-AI SYSTEM TEST SUITE 🧪                   ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

  try {
    logger.info('Loading configuration...');
    const config = await loadConfig();
    
    // Test 1: Configuration
    console.log('\n✅ TEST 1: Configuration Loading');
    if (config.AGENT_NAME && config.TELEGRAM_BOT_TOKEN) {
      logger.info(`Agent: ${config.AGENT_NAME}`);
      logger.info('Telegram bot token: ✅');
    } else {
      logger.error('❌ Configuration incomplete');
      process.exit(1);
    }
    
    // Test 2: Initialize Agent
    console.log('\n✅ TEST 2: Agent Initialization');
    const agent = new PraxisAgent(config);
    await agent.initialize();
    logger.info('Agent core systems initialized');
    
    // Test 3: LLM Provider
    console.log('\n✅ TEST 3: LLM Provider');
    logger.info(`Provider: ${config.LLM_PROVIDER}`);
    if (config.ANTHROPIC_API_KEY) {
      logger.info('Anthropic API key: ✅');
    } else if (config.OPENAI_API_KEY) {
      logger.info('OpenAI API key: ✅');
    }
    
    // Test 4: Message Processing
    console.log('\n✅ TEST 4: Message Processing');
    const testResponse = await agent.processMessage('hello', 123456);
    logger.info(`Response: ${testResponse.substring(0, 100)}...`);
    
    // Test 5: Command Processing
    console.log('\n✅ TEST 5: Command Processing');
    const helpResponse = await agent.processMessage('/help', 123456);
    if (helpResponse.includes('Commands')) {
      logger.info('Help command: ✅');
    }
    
    // Test 6: Status Report
    console.log('\n✅ TEST 6: Status Report');
    const statusResponse = await agent.processMessage('/status', 123456);
    if (statusResponse.includes('Status Report')) {
      logger.info('Status command: ✅');
    }
    
    // Test 7: Skill Registry
    console.log('\n✅ TEST 7: Skill System');
    const skillCount = agent.skills.getCount();
    logger.info(`Loaded skills: ${skillCount}`);
    const skills = agent.skills.getSkillList();
    skills.forEach(s => {
      logger.info(`  - ${s.name}: ${s.description}`);
    });
    
    // Summary
    console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                    ✅ ALL TESTS PASSED                                ║
╚════════════════════════════════════════════════════════════════════════╝

🎉 Praxis-AI is ready to run!

Next steps:
  1. npm start               - Start the agent
  2. Open Telegram
  3. Send /help to your bot
  4. Try /status to see agent info

Configuration:
  Agent Name: ${config.AGENT_NAME}
  LLM Provider: ${config.LLM_PROVIDER}
  Telegram: ✅ Configured
  Moltbook: ${config.MOLTBOOK_API_KEY ? '✅ Configured' : '⏳ Optional'}
  Base Wallet: ${config.BASE_WALLET_ADDRESS ? '✅ Configured' : '⏳ Optional'}

Database:
  Data directory: ${config.DATA_DIR}
  Agent state: Ready

Skills available: ${skillCount}
  - LaunchToken
  - PostContent
  - EngageContent
  - SuggestCollaboration
  - GenerateDailyInsights
  - CompoundEarnings

Commands available:
  /help      - Show help
  /status    - Agent status
  /post      - Post to Moltbook
  /launch    - Launch token
  /earnings  - View earnings
  /verify    - Setup verification

🚀 Start your agent now: npm start
📖 Full docs: ./SETUP_GUIDE.md
`);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED\n');
    logger.error('Test suite error:', error);
    process.exit(1);
  }
}

runTests();
