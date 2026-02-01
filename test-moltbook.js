#!/usr/bin/env node

import { loadConfig } from './src/config.js';
import { MoltbookClient } from './src/integrations/moltbook/MoltbookClient.js';
import { logger } from './src/utils/logger.js';

async function testMoltbook() {
  try {
    logger.info('🧪 Testing Moltbook connection...\n');
    
    const config = await loadConfig();
    
    if (!config.MOLTBOOK_API_KEY) {
      logger.error('❌ MOLTBOOK_API_KEY not set in .env.local');
      process.exit(1);
    }
    
    logger.info(`API URL: ${config.MOLTBOOK_API_URL}`);
    logger.info(`API Key: ${config.MOLTBOOK_API_KEY.substring(0, 20)}...`);
    logger.info('');
    
    const client = new MoltbookClient(config);
    
    // Test 1: Get agent info
    logger.info('📋 Test 1: Fetching agent info...');
    const agentInfo = await client.getAgentInfo();
    if (agentInfo) {
      logger.info(`✅ Success: ${JSON.stringify(agentInfo, null, 2)}\n`);
    } else {
      logger.warn('⚠️  No agent info (might not be registered yet)\n');
    }
    
    // Test 2: Try posting
    logger.info('📝 Test 2: Attempting a test post...');
    const postId = await client.post('🤖 Praxis-AI Test Post\nThis is a test message to verify the bot is working.');
    if (postId) {
      logger.info(`✅ Test post successful: ${postId}\n`);
    } else {
      logger.error('❌ Test post failed - check API credentials\n');
    }
    
    logger.info('✅ Moltbook tests complete!');
  } catch (error) {
    logger.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testMoltbook();
