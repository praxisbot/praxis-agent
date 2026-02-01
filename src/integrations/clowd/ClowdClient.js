import fetch from 'node-fetch';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../../utils/logger.js';
import { DataStore } from '../../utils/DataStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ClowdClient {
  constructor(config) {
    this.config = config;
    this.apiUrl = config.CLOWD_API_URL || 'https://api.clowd.bot';
    this.apiKey = config.CLOWD_API_KEY;
    this.authToken = config.CLOWD_AUTH_TOKEN;
    this.dataStore = new DataStore(config.DATA_DIR);
    this.instanceId = null;
    this.isConnected = false;
  }

  /**
   * Authenticate with Clowd.bot using API key or auth token
   */
  async authenticate() {
    try {
      if (!this.apiKey && !this.authToken) {
        logger.warn('⚠️ No Clowd credentials (CLOWD_API_KEY or CLOWD_AUTH_TOKEN) provided');
        return false;
      }

      const headers = {
        'Content-Type': 'application/json'
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.apiUrl}/auth/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          token: this.authToken || this.apiKey,
          agent_id: this.config.AGENT_ID || 'praxis-ai'
        })
      });

      if (!response.ok) {
        logger.error(`❌ Clowd auth failed: ${response.status}`);
        this.isConnected = false;
        return false;
      }

      const data = await response.json();
      this.isConnected = true;
      logger.info('✅ Clowd.bot authenticated successfully');
      
      // Save auth state
      await this.dataStore.save('clowd-auth', {
        authenticated: true,
        timestamp: Date.now(),
        instanceId: data.instance_id
      });

      return true;
    } catch (err) {
      logger.error(`Error authenticating with Clowd: ${err.message}`);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Check Clowd instance status (uptime, resource usage, connectivity)
   */
  async getStatus() {
    try {
      if (!this.isConnected) {
        const authenticated = await this.authenticate();
        if (!authenticated) {
          return {
            status: 'disconnected',
            message: '❌ Not connected to Clowd.bot. No credentials provided.',
            uptime: 'N/A',
            region: 'N/A'
          };
        }
      }

      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.apiUrl}/instance/status`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const data = await response.json();

      const statusMsg = `
🟢 **Clowd.bot Instance Status**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Status**: ${data.state || 'running'}
**Uptime**: ${this.formatUptime(data.uptime_seconds || 0)}
**Region**: ${data.region || 'us-east-1'}
**CPU Usage**: ${data.cpu_usage || 'N/A'}%
**Memory**: ${data.memory_usage || 'N/A'}%
**IP Address**: ${data.instance_ip || 'N/A'}
**Last Updated**: ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

      logger.info('✅ Clowd status retrieved');
      return {
        status: 'connected',
        message: statusMsg,
        data
      };
    } catch (err) {
      logger.error(`Error getting Clowd status: ${err.message}`);
      return {
        status: 'error',
        message: `❌ Failed to retrieve status: ${err.message}`
      };
    }
  }

  /**
   * Deploy or start a Clowd cloud instance
   */
  async deployInstance(config = {}) {
    try {
      const headers = this.getAuthHeaders();
      
      const deployConfig = {
        agent_id: this.config.AGENT_ID || 'praxis-ai',
        name: config.name || 'praxis-ai-cloud',
        region: config.region || 'us-east-1',
        instance_type: config.instance_type || 't3.small',
        runtime: config.runtime || 'nodejs18',
        memory: config.memory || 512,
        storage: config.storage || 10000,
        auto_scaling: config.auto_scaling !== false,
        environment: {
          NODE_ENV: 'production',
          TELEGRAM_BOT_TOKEN: this.config.TELEGRAM_BOT_TOKEN,
          BANKR_API_KEY: this.config.BANKR_API_KEY,
          PRAXIS_AGENT_ID: this.config.AGENT_ID
        }
      };

      const response = await fetch(`${this.apiUrl}/instance/deploy`, {
        method: 'POST',
        headers,
        body: JSON.stringify(deployConfig)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Deploy failed: ${error.message}`);
      }

      const data = await response.json();
      this.instanceId = data.instance_id;

      const deployMsg = `
🚀 **Cloud Instance Deployed**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Instance ID**: ${data.instance_id}
**Status**: ${data.status}
**Endpoint**: ${data.endpoint}
**Region**: ${data.region}
**Public IP**: ${data.public_ip}
**Console URL**: ${data.console_url}
**Estimated Cost**: \$${data.estimated_monthly_cost}/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent will be running 24/7 at: ${data.endpoint}
`;

      // Save deployment record
      await this.dataStore.save('clowd-deployment', {
        instanceId: data.instance_id,
        deployedAt: Date.now(),
        region: data.region,
        endpoint: data.endpoint,
        status: data.status
      });

      logger.info('✅ Cloud instance deployed');
      return {
        status: 'deployed',
        message: deployMsg,
        data
      };
    } catch (err) {
      logger.error(`Error deploying Clowd instance: ${err.message}`);
      return {
        status: 'error',
        message: `❌ Deployment failed: ${err.message}`
      };
    }
  }

  /**
   * Query Clowd-hosted LLM (uses cloud compute for inference)
   */
  async queryLLM(prompt, options = {}) {
    try {
      if (!this.isConnected) {
        const authenticated = await this.authenticate();
        if (!authenticated) {
          return {
            status: 'error',
            message: '❌ Not connected to Clowd.bot. Cannot access cloud LLM.'
          };
        }
      }

      const headers = this.getAuthHeaders();

      const llmRequest = {
        prompt,
        model: options.model || 'gpt-4-turbo',
        max_tokens: options.max_tokens || 1024,
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.9,
        context: options.context || null
      };

      const response = await fetch(`${this.apiUrl}/llm/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify(llmRequest)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`LLM query failed: ${error.message}`);
      }

      const data = await response.json();

      const llmMsg = `
🤖 **Clowd Cloud LLM Response**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.response}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Model**: ${data.model}
**Tokens Used**: ${data.tokens_used}
**Cost**: \$${data.cost_usd}
**Response Time**: ${data.response_time_ms}ms
`;

      logger.info('✅ Cloud LLM query successful');
      return {
        status: 'success',
        message: llmMsg,
        response: data.response,
        data
      };
    } catch (err) {
      logger.error(`Error querying Clowd LLM: ${err.message}`);
      return {
        status: 'error',
        message: `❌ LLM query failed: ${err.message}`
      };
    }
  }

  /**
   * Start or resume cloud instance
   */
  async startInstance() {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.apiUrl}/instance/start`, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        throw new Error(`Start failed: ${response.status}`);
      }

      const data = await response.json();
      logger.info('✅ Clowd instance started');
      return {
        status: 'started',
        message: `✅ Cloud instance started successfully. It will be ready in ~60 seconds.`,
        data
      };
    } catch (err) {
      logger.error(`Error starting Clowd instance: ${err.message}`);
      return {
        status: 'error',
        message: `❌ Failed to start instance: ${err.message}`
      };
    }
  }

  /**
   * Stop or pause cloud instance to save costs
   */
  async stopInstance() {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.apiUrl}/instance/stop`, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        throw new Error(`Stop failed: ${response.status}`);
      }

      const data = await response.json();
      logger.info('✅ Clowd instance stopped');
      return {
        status: 'stopped',
        message: `✅ Cloud instance stopped to save costs. Restart with /clowd-start.`,
        data
      };
    } catch (err) {
      logger.error(`Error stopping Clowd instance: ${err.message}`);
      return {
        status: 'error',
        message: `❌ Failed to stop instance: ${err.message}`
      };
    }
  }

  /**
   * Get background tasks running on cloud instance
   */
  async getBackgroundTasks() {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.apiUrl}/instance/tasks`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Tasks query failed: ${response.status}`);
      }

      const data = await response.json();
      
      let tasksMsg = '📋 **Cloud Background Tasks**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      
      if (data.tasks.length === 0) {
        tasksMsg += 'No background tasks running.\n';
      } else {
        data.tasks.forEach((task, idx) => {
          tasksMsg += `\n**${idx + 1}. ${task.name}**\n`;
          tasksMsg += `   Status: ${task.status}\n`;
          tasksMsg += `   Uptime: ${this.formatUptime(task.uptime_seconds)}\n`;
          tasksMsg += `   CPU: ${task.cpu_usage}% | Memory: ${task.memory_usage}%\n`;
        });
      }
      
      tasksMsg += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

      return {
        status: 'success',
        message: tasksMsg,
        tasks: data.tasks
      };
    } catch (err) {
      logger.error(`Error getting background tasks: ${err.message}`);
      return {
        status: 'error',
        message: `❌ Failed to retrieve tasks: ${err.message}`
      };
    }
  }

  /**
   * Helper: Get auth headers for Clowd API
   */
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    } else if (this.authToken) {
      headers['X-Auth-Token'] = this.authToken;
    }

    return headers;
  }

  /**
   * Helper: Format uptime seconds to human-readable format
   */
  formatUptime(seconds) {
    if (!seconds) return '0s';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }
}
