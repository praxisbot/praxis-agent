import fetch from 'node-fetch';
import { logger } from '../../utils/logger.js';
import { DataStore } from '../../utils/DataStore.js';

export class MoltbookClient {
  constructor(config) {
    this.config = config;
    this.apiUrl = config.MOLTBOOK_API_URL;
    this.apiKey = config.MOLTBOOK_API_KEY;
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
          handle: agentName,
          description: description,
          avatar_url: 'https://praxis-ai.vercel.app/avatar.png'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Registration failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      await this.dataStore.save('moltbook-agent', {
        agentId: data.agent_id,
        handle: agentName,
        registeredAt: Date.now()
      });
      
      logger.info(`✅ Registered on Moltbook: ${agentName}`);
      return data;
    } catch (error) {
      logger.error('Moltbook registration failed:', error);
      throw error;
    }
  }
  
  async getAgentInfo() {
    try {
      if (!this.apiKey) {
        throw new Error('No Moltbook API key configured');
      }
      
      logger.info(`🔍 Fetching agent info from ${this.apiUrl}/agents/me`);
      
      const response = await fetch(`${this.apiUrl}/agents/me`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      const responseBody = await response.text();
      logger.debug(`Response status: ${response.status}`);
      
      if (response.status === 401) {
        logger.warn('⚠️  Invalid Moltbook API key');
        return null; // Not authenticated
      }
      
      if (!response.ok) {
        logger.error(`❌ Failed to fetch agent info: ${response.status}`);
        throw new Error(`Moltbook API returned ${response.status}`);
      }
      
      const data = JSON.parse(responseBody);
      logger.info(`✅ Agent info retrieved: ${data.name || data.handle}`);
      return data;
    } catch (error) {
      logger.error(`⚠️  Failed to get agent info: ${error.message}`);
      return null;
    }
  }
  
  async post(content, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('⚠️  Not authenticated with Moltbook - skipping post');
      }
      
      // Extract title from options or content
      let title = options.title || 'Update';
      let postContent = content;
      let submolt = options.submolt || 'general';
      
      // If content includes a newline, first line is title
      if (content.includes('\n') && !options.title) {
        const lines = content.split('\n');
        title = lines[0].substring(0, 100); // Max 100 chars for title
        postContent = lines.slice(1).join('\n');
      }
      
      // Build payload with required fields
      const payload = {
        submolt: submolt,
        title: title,
        content: postContent
      };
      
      if (options.url) {
        payload.url = options.url;
      }
      if (options.mediaUrls) {
        payload.media_urls = options.mediaUrls;
      }
      
      logger.debug(`📤 Sending Moltbook request to ${this.apiUrl}/posts`);
      logger.debug(`Payload: ${JSON.stringify(payload)}`);
      
      const response = await fetch(`${this.apiUrl}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        timeout: 10000
      });
      
      const responseBody = await response.text();
      logger.debug(`Response status: ${response.status}, body: ${responseBody.substring(0, 200)}`);
      
      if (!response.ok) {
        logger.error(`❌ Moltbook API error ${response.status}`);
        throw new Error(`Moltbook API returned ${response.status}: Check your MOLTBOOK_API_KEY and API_URL`);
      }
      
      let data;
      try {
        data = JSON.parse(responseBody);
      } catch (e) {
        logger.error(`Failed to parse response: ${responseBody}`);
        throw new Error('Invalid response from Moltbook API');
      }
      
      const postId = data.data?.id || data.post?.id || data.post_id || data.id || responseBody;
      logger.info(`✅ Posted to Moltbook: ${postId}`);
      return postId;
    } catch (error) {
      logger.error(`❌ Moltbook post failed: ${error.message}`);
      return null; // Return null instead of throwing to allow bot to continue
    }
  }
  
  async reply(postId, content) {
    try {
      if (!this.apiKey) {
        throw new Error('Not authenticated with Moltbook');
      }
      
      const response = await fetch(`${this.apiUrl}/posts/${postId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: content
        })
      });
      
      if (!response.ok) {
        throw new Error(`Reply failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      logger.info(`✅ Replied to post: ${postId}`);
      return data.reply_id;
    } catch (error) {
      logger.error('Moltbook reply failed:', error);
      throw error;
    }
  }
  
  async getMentions(limit = 20) {
    try {
      if (!this.apiKey) {
        throw new Error('Not authenticated with Moltbook');
      }
      
      const response = await fetch(`${this.apiUrl}/mentions?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch mentions: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.mentions || [];
    } catch (error) {
      logger.error('Failed to fetch mentions:', error);
      return [];
    }
  }
  
  async upvote(postId) {
    try {
      if (!this.apiKey) {
        throw new Error('Not authenticated with Moltbook');
      }
      
      const response = await fetch(`${this.apiUrl}/posts/${postId}/upvote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Upvote failed: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      logger.error('Moltbook upvote failed:', error);
      return false;
    }
  }
  
  async getFeed(limit = 20) {
    try {
      if (!this.apiKey) {
        throw new Error('Not authenticated with Moltbook');
      }
      
      const response = await fetch(`${this.apiUrl}/feed?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      logger.error('Failed to fetch feed:', error);
      return { posts: [] };
    }
  }
}
