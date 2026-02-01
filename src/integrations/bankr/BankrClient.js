import fetch from 'node-fetch';
import { logger } from '../../utils/logger.js';
import { DataStore } from '../../utils/DataStore.js';

export class BankrClient {
  constructor(config) {
    this.config = config;
    this.apiUrl = 'https://api.bankr.bot';
    this.apiKey = config.BANKR_API_KEY;
    this.dataStore = new DataStore(config.DATA_DIR);
    this.pollInterval = 2000; // 2 seconds
    this.maxAttempts = 150; // ~5 minutes max
  }

  async submitJob(prompt) {
    try {
      if (!this.apiKey) {
        throw new Error('Bankr API key not configured. Set BANKR_API_KEY in .env.local');
      }

      logger.debug(`📤 Submitting Bankr job: "${prompt.substring(0, 100)}..."`);

      const response = await fetch(`${this.apiUrl}/agent/prompt`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error(`Bankr submit failed (${response.status}): ${error}`);
        throw new Error(`Bankr API error ${response.status}: ${error}`);
      }

      const data = await response.json();
      logger.info(`✅ Job submitted: ${data.jobId}`);
      return data.jobId;
    } catch (error) {
      logger.error('Failed to submit job to Bankr:', error);
      throw error;
    }
  }

  async getJobStatus(jobId) {
    try {
      if (!this.apiKey) {
        throw new Error('Bankr API key not configured');
      }

      const response = await fetch(`${this.apiUrl}/agent/job/${jobId}`, {
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get job status: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Failed to get job status:', error);
      throw error;
    }
  }

  async waitForJobCompletion(jobId, showUpdates = true) {
    try {
      let attempt = 0;
      let lastUpdateCount = 0;

      while (attempt < this.maxAttempts) {
        const jobData = await this.getJobStatus(jobId);

        // Show new status updates
        if (showUpdates && jobData.statusUpdates) {
          const newUpdates = jobData.statusUpdates.slice(lastUpdateCount);
          for (const update of newUpdates) {
            logger.info(`⏳ ${update.message}`);
          }
          lastUpdateCount = jobData.statusUpdates.length;
        }

        switch (jobData.status) {
          case 'completed':
            logger.info(`✅ Job completed in ${jobData.processingTime}ms`);
            return jobData;
          
          case 'failed':
            logger.error(`❌ Job failed: ${jobData.error}`);
            throw new Error(`Job failed: ${jobData.error}`);
          
          case 'cancelled':
            logger.warn(`⚠️ Job was cancelled`);
            throw new Error('Job was cancelled');
          
          case 'pending':
          case 'processing':
            attempt++;
            if (attempt % 15 === 0) {
              logger.info(`⏳ Still processing... (${attempt * 2}s elapsed)`);
            }
            await new Promise(resolve => setTimeout(resolve, this.pollInterval));
            break;
          
          default:
            throw new Error(`Unknown job status: ${jobData.status}`);
        }
      }

      throw new Error(`Job timeout after ${this.maxAttempts * 2}s`);
    } catch (error) {
      logger.error('Error waiting for job completion:', error);
      throw error;
    }
  }

  async executePrompt(prompt, waitForCompletion = true) {
    try {
      logger.info(`🤖 Executing Bankr prompt: "${prompt.substring(0, 80)}..."`);
      
      const jobId = await this.submitJob(prompt);
      
      if (waitForCompletion) {
        const result = await this.waitForJobCompletion(jobId, true);
        return {
          jobId,
          response: result.response,
          richData: result.richData || [],
          status: result.status,
          processingTime: result.processingTime
        };
      } else {
        return { jobId };
      }
    } catch (error) {
      logger.error('Bankr prompt execution failed:', error);
      throw error;
    }
  }

  async deployToken(params) {
    try {
      const {
        name,
        symbol,
        description = '',
        imageUrl = '',
        website = '',
        twitter = '',
        telegram = '',
        chain = 'Base'
      } = params;

      // Build prompt for token deployment
      const prompt = this._buildDeploymentPrompt({
        name,
        symbol,
        description,
        imageUrl,
        website,
        twitter,
        telegram,
        chain
      });

      logger.info(`🚀 Deploying token: ${name} (${symbol}) on ${chain}`);
      
      const result = await this.executePrompt(prompt, true);
      
      // Save deployment record
      await this.dataStore.save('bankr-token-deployments', {
        name,
        symbol,
        chain,
        jobId: result.jobId,
        response: result.response,
        richData: result.richData,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      logger.error('Token deployment failed:', error);
      throw error;
    }
  }

  _buildDeploymentPrompt(params) {
    const { name, symbol, description, imageUrl, website, twitter, telegram, chain } = params;
    
    let prompt = `Deploy a new token with the following details:\n`;
    prompt += `Name: ${name}\n`;
    prompt += `Symbol: ${symbol}\n`;
    
    if (description) prompt += `Description: ${description}\n`;
    if (website) prompt += `Website: ${website}\n`;
    if (twitter) prompt += `Twitter: ${twitter}\n`;
    if (telegram) prompt += `Telegram: ${telegram}\n`;
    if (imageUrl) prompt += `Image/Logo URL: ${imageUrl}\n`;
    
    prompt += `Chain: ${chain}\n`;
    prompt += `Please deploy this token and provide the contract address.`;
    
    return prompt;
  }

  async claimFees(symbol) {
    try {
      const prompt = `Claim creator fees for token ${symbol}`;
      const result = await this.executePrompt(prompt, true);
      return result;
    } catch (error) {
      logger.error('Fee claiming failed:', error);
      throw error;
    }
  }

  async checkBalance(asset = 'all', chain = null) {
    try {
      let prompt = `What is my balance of ${asset}`;
      if (chain) prompt += ` on ${chain}`;
      prompt += `?`;

      const result = await this.executePrompt(prompt, true);
      return result;
    } catch (error) {
      logger.error('Balance check failed:', error);
      throw error;
    }
  }

  async getTokenPrice(symbol, chain = null) {
    try {
      let prompt = `What is the current price of ${symbol}`;
      if (chain) prompt += ` on ${chain}`;
      prompt += `?`;

      const result = await this.executePrompt(prompt, true);
      return result;
    } catch (error) {
      logger.error('Price check failed:', error);
      throw error;
    }
  }
}
