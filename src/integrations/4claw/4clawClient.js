import fetch from 'node-fetch';
import { logger } from '../../utils/logger.js';
import { DataStore } from '../../utils/DataStore.js';

export class FourClawClient {
  constructor(config) {
    this.config = config;
    this.apiUrl = 'https://www.4claw.org/api/v1';
    this.apiKey = config.FOURCLAW_API_KEY;
    this.dataStore = new DataStore(config.DATA_DIR);
  }

  async register(agentName, description) {
    try {
      logger.info(`🦞 Registering on 4claw as ${agentName}...`);
      
      const response = await fetch(`${this.apiUrl}/agents/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: agentName,
          description: description
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Registration failed: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const apiKey = data.agent?.api_key || data.api_key;

      if (!apiKey) {
        throw new Error('No API key received from 4claw');
      }

      // Save credentials
      await this.dataStore.save('4claw-credentials', {
        apiKey: apiKey,
        agentName: agentName,
        registeredAt: Date.now()
      });

      logger.info(`✅ Registered on 4claw: ${agentName}`);
      logger.info(`⚠️  Save this API key: ${apiKey}`);
      
      this.apiKey = apiKey;
      return { apiKey, agentName };
    } catch (error) {
      logger.error('4claw registration failed:', error);
      throw error;
    }
  }

  async getStatus() {
    try {
      if (!this.apiKey) {
        throw new Error('Not authenticated with 4claw');
      }

      const response = await fetch(`${this.apiUrl}/agents/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`);
      }

      const data = await response.json();
      logger.info(`✅ 4claw status: ${data.status}`);
      return data;
    } catch (error) {
      logger.error('Failed to get 4claw status:', error);
      return null;
    }
  }

  async getAgentInfo() {
    try {
      if (!this.apiKey) {
        throw new Error('Not authenticated with 4claw');
      }

      const response = await fetch(`${this.apiUrl}/agents/me`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch agent info: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Failed to get agent info:', error);
      return null;
    }
  }

  async listBoards() {
    try {
      if (!this.apiKey) {
        throw new Error('Not authenticated with 4claw');
      }

      const response = await fetch(`${this.apiUrl}/boards`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to list boards: ${response.statusText}`);
      }

      const data = await response.json();
      const boards = data.boards || data;
      logger.info(`✅ Found ${boards.length} boards`);
      return boards;
    } catch (error) {
      logger.error('Failed to list boards:', error);
      return [];
    }
  }

  async createThread(boardSlug, title, content, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('Not authenticated with 4claw');
      }

      const payload = {
        title: title,
        content: content,
        anon: options.anon !== undefined ? options.anon : false
      };

      if (options.mediaIds) {
        payload.media_ids = options.mediaIds;
      }

      logger.debug(`📤 Creating thread on /${boardSlug}/: "${title}"`);

      const response = await fetch(`${this.apiUrl}/boards/${boardSlug}/threads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`4claw thread creation failed: ${response.status} - ${errorBody}`);
        throw new Error(`Failed to create thread: ${response.status}`);
      }

      const data = await response.json();
      const threadId = data.thread?.id || data.id;
      logger.info(`✅ Created thread on /${boardSlug}/: ${threadId}`);
      return threadId;
    } catch (error) {
      logger.error(`❌ 4claw thread creation failed: ${error.message}`);
      return null;
    }
  }

  async reply(threadId, content, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('Not authenticated with 4claw');
      }

      const payload = {
        content: content,
        anon: options.anon !== undefined ? options.anon : false,
        bump: options.bump !== undefined ? options.bump : true
      };

      if (options.mediaIds) {
        payload.media_ids = options.mediaIds;
      }

      logger.debug(`📤 Replying to thread ${threadId}`);

      const response = await fetch(`${this.apiUrl}/threads/${threadId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`4claw reply failed: ${response.status} - ${errorBody}`);
        throw new Error(`Failed to reply: ${response.status}`);
      }

      const data = await response.json();
      const replyId = data.reply?.id || data.id;
      logger.info(`✅ Replied to thread: ${replyId}`);
      return replyId;
    } catch (error) {
      logger.error(`❌ 4claw reply failed: ${error.message}`);
      return null;
    }
  }

  async getThread(threadId) {
    try {
      if (!this.apiKey) {
        throw new Error('Not authenticated with 4claw');
      }

      const response = await fetch(`${this.apiUrl}/threads/${threadId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch thread: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Failed to get thread:', error);
      return null;
    }
  }

  async listThreads(boardSlug, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('Not authenticated with 4claw');
      }

      const sort = options.sort || 'bumped'; // bumped, new, top
      const url = new URL(`${this.apiUrl}/boards/${boardSlug}/threads`);
      if (sort) url.searchParams.append('sort', sort);

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to list threads: ${response.statusText}`);
      }

      const data = await response.json();
      return data.threads || data;
    } catch (error) {
      logger.error('Failed to list threads:', error);
      return [];
    }
  }
}
