import { Telegraf } from 'telegraf';
import { PraxisAgent } from './agent/PraxisAgent.js';
import { loadConfig } from './config.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    // Load environment config
    const config = await loadConfig();
    
    logger.info('🤖 Initializing Praxis-AI...');
    logger.info(`Core Identity: Praxis-AI – focused executor that builds real value, utility, audience and revenue in the agent ecosystem. Claw forward with purpose.`);
    
    // Initialize Telegram bot
    const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);
    
    // Initialize core agent
    const agent = new PraxisAgent(config);
    await agent.initialize();
    
    // Telegram message handler
    bot.on('message', async (ctx) => {
      try {
        const userId = ctx.from.id;
        const message = ctx.message.text;
        
        // Log interaction
        logger.info(`📨 [${ctx.from.username || userId}] ${message}`);
        
        // Send typing indicator
        await ctx.sendChatAction('typing');
        
        // Process message through agent
        const response = await agent.processMessage(message, userId);
        
        // Send response (split if too long)
        if (response.length > 4096) {
          const chunks = response.match(/[\s\S]{1,4096}/g) || [];
          for (const chunk of chunks) {
            await ctx.reply(chunk);
          }
        } else {
          await ctx.reply(response);
        }
      } catch (error) {
        logger.error('Telegram handler error:', error);
        await ctx.reply(`❌ Error: ${error.message}`);
      }
    });
    
    // Start bot
    bot.launch();
    logger.info('✅ Telegram bot started. Waiting for messages...');
    
    // Initialize background tasks
    await agent.initializeBackgroundTasks();
    
    // Graceful shutdown
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
    
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
