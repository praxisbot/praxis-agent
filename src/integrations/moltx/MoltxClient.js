import fetch from 'node-fetch';
import { logger } from '../../utils/logger.js';
import { DataStore } from '../../utils/DataStore.js';

export class MoltxClient {
  constructor(config) {
    this.config = config;
    this.apiUrl = 'https://moltx.io/v1';
    this.apiKey = config.MOLTX_API_KEY || null;
    this.agentId = config.MOLTX_AGENT_ID || null;
    this.dataStore = new DataStore(config.DATA_DIR);
  }

  async register(agentName, description) {
    try {
      const response = await fetch(`${this.apiUrl}/agents/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: agentName,
          description: description,
          avatar_url: 'https://praxis-ai.vercel.app/avatar.png'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Registration failed: ${response.statusText} - ${error}`);
      }

      const data = await response.json();
      
      // Save registration details
      await this.dataStore.save('moltx-agent', {
        agentId: data.agent_id,
        apiKey: data.api_key,
        claimCode: data.claim?.code,
        name: agentName,
        registeredAt: Date.now()
      });

      this.apiKey = data.api_key;
      this.agentId = data.agent_id;
      
      logger.info(`✅ Registered on Moltx: ${agentName} (${data.agent_id})`);
      return {
        agentId: data.agent_id,
        apiKey: data.api_key,
        claimCode: data.claim?.code,
        claimUrl: data.claim?.url
      };
    } catch (error) {
      logger.error('Moltx registration failed:', error);
      throw error;
    }
  }

  async claim(tweetUrl) {
    try {
      if (!this.apiKey || !this.agentId) {
        throw new Error('Agent not registered on Moltx');
      }

      const response = await fetch(`${this.apiUrl}/agents/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          agent_id: this.agentId,
          tweet_url: tweetUrl
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claim failed: ${response.statusText} - ${error}`);
      }

      const data = await response.json();
      
      // Update registration with claimed status
      const saved = await this.dataStore.load('moltx-agent');
      await this.dataStore.save('moltx-agent', {
        ...saved,
        claimed: true,
        claimedAt: Date.now()
      });

      logger.info(`✅ Moltx agent claimed: ${this.agentId}`);
      return data;
    } catch (error) {
      logger.error('Moltx claim failed:', error);
      throw error;
    }
  }

  async post(content, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('No Moltx API key available');
      }

      const postData = {
        content: content,
        type: options.type || 'post'
      };

      // If this is a reply or quote
      if (options.replyTo) postData.reply_to = options.replyTo;
      if (options.quoteOf) postData.quote_of = options.quoteOf;

      const response = await fetch(`${this.apiUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error(`Moltx post error (${response.status}):`, error);
        throw new Error(`Post failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      logger.info(`✅ Posted to Moltx: ${data.id}`);
      return data.id;
    } catch (error) {
      logger.error('Moltx post failed:', error);
      throw error;
    }
  }

  async like(postId) {
    try {
      if (!this.apiKey) {
        throw new Error('No Moltx API key available');
      }

      const response = await fetch(`${this.apiUrl}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Like failed: ${response.statusText}`);
      }

      logger.info(`✅ Liked post on Moltx: ${postId}`);
      return true;
    } catch (error) {
      logger.error('Moltx like failed:', error);
      throw error;
    }
  }

  async reply(postId, content) {
    try {
      return await this.post(content, {
        type: 'reply',
        replyTo: postId
      });
    } catch (error) {
      logger.error('Moltx reply failed:', error);
      throw error;
    }
  }

  async follow(agentId) {
    try {
      if (!this.apiKey) {
        throw new Error('No Moltx API key available');
      }

      const response = await fetch(`${this.apiUrl}/follow/${agentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Follow failed: ${response.statusText}`);
      }

      logger.info(`✅ Followed agent on Moltx: ${agentId}`);
      return true;
    } catch (error) {
      logger.error('Moltx follow failed:', error);
      throw error;
    }
  }

  async getAgentInfo(agentId) {
    try {
      const response = await fetch(`${this.apiUrl}/agents/${agentId}`);

      if (!response.ok) {
        throw new Error(`Get agent failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Moltx get agent info failed:', error);
      throw error;
    }
  }

  async getLeaderboard(limit = 10) {
    try {
      const response = await fetch(`${this.apiUrl}/leaderboard?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`Get leaderboard failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Moltx leaderboard fetch failed:', error);
      throw error;
    }
  }

  async searchAgents(query, limit = 10) {
    try {
      const response = await fetch(`${this.apiUrl}/search/agents?q=${encodeURIComponent(query)}&limit=${limit}`);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Moltx agent search failed:', error);
      throw error;
    }
  }

  async getFollowingFeed(limit = 20) {
    try {
      if (!this.apiKey) {
        throw new Error('No Moltx API key available');
      }

      const response = await fetch(`${this.apiUrl}/feed/following?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Feed fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Moltx feed fetch failed:', error);
      throw error;
    }
  }

  async isRegistered() {
    try {
      const saved = await this.dataStore.load('moltx-agent');
      return saved && saved.apiKey ? true : false;
    } catch {
      return false;
    }
  }

  async loadCredentials() {
    try {
      const saved = await this.dataStore.load('moltx-agent');
      if (saved && saved.apiKey) {
        this.apiKey = saved.apiKey;
        this.agentId = saved.agentId;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to load Moltx credentials:', error);
      return false;
    }
  }
}
