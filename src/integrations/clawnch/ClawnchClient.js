import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../../utils/logger.js';
import { DataStore } from '../../utils/DataStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ClawnchClient {
  constructor(config) {
    this.config = config;
    this.apiUrl = config.CLAWNCH_API_URL;
    this.dataStore = new DataStore(config.DATA_DIR);
  }
  
  /**
   * Launch token via Clawnch
   * Creates Moltbook post with !clawnch format, then calls Clawnch API
   */
  async launchToken(tokenData, moltbookKey, moltbookPostId) {
    try {
      // Validate token data
      this.validateTokenData(tokenData);
      
      const response = await fetch(`${this.apiUrl}/launch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: tokenData.name,
          symbol: tokenData.symbol,
          description: tokenData.description,
          image_url: tokenData.image,
          wallet_address: tokenData.wallet,
          moltbook_key: moltbookKey,
          post_id: moltbookPostId,
          agent_id: this.config.MOLTBOOK_AGENT_ID
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Launch failed: ${error.message}`);
      }
      
      const data = await response.json();
      
      // Save launch record
      await this.dataStore.save('launch-record', {
        tokenName: tokenData.name,
        symbol: tokenData.symbol,
        launchDate: Date.now(),
        launchId: data.launch_id,
        contractAddress: data.contract_address
      });
      
      logger.info(`✅ Token launched: ${tokenData.symbol} (${tokenData.name})`);
      return data;
    } catch (error) {
      logger.error('Clawnch launch failed:', error);
      throw error;
    }
  }
  
  /**
   * Format token data for Moltbook post (!clawnch format)
   */
  formatClawnchPost(tokenData) {
    const json = {
      name: tokenData.name,
      symbol: tokenData.symbol,
      wallet: tokenData.wallet,
      description: tokenData.description,
      image: tokenData.image
    };
    
    return `!clawnch
\`\`\`json
${JSON.stringify(json, null, 2)}
\`\`\``;
  }
  
  /**
   * Validate token data before launch
   */
  validateTokenData(data) {
    if (!data.name || data.name.length > 50) {
      throw new Error('Invalid token name (max 50 chars)');
    }
    if (!data.symbol || data.symbol.length > 10 || !/^[a-zA-Z0-9]+$/.test(data.symbol)) {
      throw new Error('Invalid symbol (max 10 alphanumeric chars)');
    }
    if (!data.wallet || !this.isValidBaseAddress(data.wallet)) {
      throw new Error('Invalid Base chain wallet address');
    }
    if (!data.description || data.description.length > 500) {
      throw new Error('Invalid description (max 500 chars)');
    }
    if (!data.image || !this.isValidImageUrl(data.image)) {
      throw new Error('Invalid image URL (must be direct https URL to .jpg or .png)');
    }
  }
  
  /**
   * Validate Base chain address format
   */
  isValidBaseAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  
  /**
   * Validate image URL
   */
  isValidImageUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' && /\.(jpg|jpeg|png)$/i.test(url);
    } catch {
      return false;
    }
  }
  
  /**
   * Upload image to Clawnch
   */
  async uploadImage(imagePath) {
    try {
      const imageData = await fs.readFile(imagePath);
      const base64 = imageData.toString('base64');
      
      const response = await fetch(`${this.apiUrl}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64,
          filename: path.basename(imagePath)
        })
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      logger.error('Image upload failed:', error);
      throw error;
    }
  }
  
  /**
   * Get agent earnings from launched tokens
   */
  async getAgentEarnings(agentId) {
    try {
      const response = await fetch(`${this.apiUrl}/agent/${agentId || this.config.MOLTBOOK_AGENT_ID}/earnings`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch earnings: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.earnings || 0;
    } catch (error) {
      logger.error('Failed to fetch earnings:', error);
      return 0;
    }
  }
  
  /**
   * Get token details
   */
  async getTokenInfo(symbol) {
    try {
      const response = await fetch(`${this.apiUrl}/token/${symbol}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      logger.error(`Failed to fetch token info for ${symbol}:`, error);
      return null;
    }
  }
  
  /**
   * Get token trading volume
   */
  async getTokenVolume(symbol) {
    try {
      const token = await this.getTokenInfo(symbol);
      if (!token) return 0;
      return token.volume_24h || 0;
    } catch (error) {
      logger.error(`Failed to fetch volume for ${symbol}:`, error);
      return 0;
    }
  }
}
