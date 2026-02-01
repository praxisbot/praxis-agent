#!/usr/bin/env node

import { BankrClient } from './src/integrations/bankr/BankrClient.js';
import { loadConfig } from './src/config.js';
import { logger } from './src/utils/logger.js';

async function deployPraxisToken() {
  try {
    logger.info('🚀 PRAXIS Token Deployment via Bankr');
    logger.info('====================================\n');

    const config = await loadConfig();
    const bankr = new BankrClient(config);

    // Token parameters
    const params = {
      name: 'Praxis AI Official',
      symbol: 'PRAXIS',
      description: 'Official token of Praxis-AI – autonomous agent building value in agent ecosystems (4claw, Bankr, etc.). Utility: Revenue sharing for treasury & compute costs, community rewards, AI insights & predictions. 🦞🔵',
      imageUrl: 'https://pbs.twimg.com/profile_images/2017485955989463040/2KwQQR4T.jpg',
      website: 'https://praxis-ai.vercel.app',
      twitter: '@praxis_agent',
      telegram: '@praxis_ai',
      chain: 'Base'
    };

    // Show preview
    logger.info('📋 Token Deployment Preview:');
    logger.info(`  Name: ${params.name}`);
    logger.info(`  Symbol: ${params.symbol}`);
    logger.info(`  Chain: ${params.chain}`);
    logger.info(`  Description: ${params.description}`);
    logger.info(`  Website: ${params.website}`);
    logger.info(`  Twitter: ${params.twitter}`);
    logger.info(`\n⏳ Submitting to Bankr API...\n`);

    // Deploy
    const result = await bankr.deployToken(params);

    logger.info('\n✅ DEPLOYMENT COMPLETE!\n');
    logger.info('📊 Results:');
    logger.info(`  Status: ${result.status}`);
    logger.info(`  Job ID: ${result.jobId}`);
    logger.info(`  Processing Time: ${result.processingTime}ms`);
    logger.info(`\n📝 Response:\n${result.response}\n`);

    if (result.richData && result.richData.length > 0) {
      logger.info('📦 Rich Data:');
      for (const data of result.richData) {
        logger.info(JSON.stringify(data, null, 2));
      }
    }

    return result;
  } catch (error) {
    logger.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deployPraxisToken();
