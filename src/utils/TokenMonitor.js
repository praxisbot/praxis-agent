import { logger } from './logger.js';
import { DataStore } from './DataStore.js';

export class TokenMonitor {
  constructor(bankrClient, config) {
    this.bankr = bankrClient;
    this.config = config;
    this.dataStore = new DataStore(config.DATA_DIR);
    this.monitoringInterval = null;
    this.praxisTokenAddress = null;
    this.metrics = {
      prices: [],
      volumes: [],
      holders: [],
      liquidity: [],
      transfers: [],
      lastUpdate: null
    };
  }

  setTokenAddress(address) {
    this.praxisTokenAddress = address;
    logger.info(`📊 Token Monitor initialized for: ${address}`);
  }

  async startMonitoring(intervalMs = 300000) { // Default: 5 minutes
    if (this.monitoringInterval) {
      logger.warn('Token monitoring already active');
      return;
    }

    logger.info(`📊 Starting PRAXIS token monitoring (interval: ${intervalMs}ms)`);
    
    // Initial check
    await this.collectMetrics();

    // Set interval
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        logger.error('Token monitoring error:', error);
      }
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('📊 Token monitoring stopped');
    }
  }

  async collectMetrics() {
    if (!this.praxisTokenAddress || !this.bankr.config.BANKR_API_KEY) {
      logger.debug('Cannot collect metrics: token address or API key not set');
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      
      // Get current price
      try {
        const priceResult = await this.bankr.getTokenPrice('PRAXIS', 'Base');
        const priceEntry = {
          timestamp,
          response: priceResult.response,
          jobId: priceResult.jobId,
          data: priceResult.richData || []
        };
        this.metrics.prices.push(priceEntry);
        logger.debug(`📊 Price collected: ${priceResult.response}`);
      } catch (error) {
        logger.debug(`Price fetch failed: ${error.message}`);
      }

      // Keep only last 100 entries to avoid memory bloat
      if (this.metrics.prices.length > 100) {
        this.metrics.prices = this.metrics.prices.slice(-100);
      }

      this.metrics.lastUpdate = timestamp;

      // Save metrics to storage every 10 collections
      if (this.metrics.prices.length % 10 === 0) {
        await this.saveMetrics();
      }
    } catch (error) {
      logger.error('Metrics collection failed:', error);
    }
  }

  async saveMetrics() {
    try {
      await this.dataStore.save('praxis-token-metrics', {
        tokenAddress: this.praxisTokenAddress,
        timestamp: new Date().toISOString(),
        metrics: this.metrics
      });
      logger.debug('📊 Token metrics saved to storage');
    } catch (error) {
      logger.error('Failed to save metrics:', error);
    }
  }

  async loadMetrics() {
    try {
      const saved = await this.dataStore.load('praxis-token-metrics');
      if (saved) {
        this.metrics = saved.metrics || this.metrics;
        logger.info('📊 Loaded historical metrics from storage');
        return saved;
      }
    } catch (error) {
      logger.warn('No saved metrics found:', error);
    }
    return null;
  }

  getLatestPrice() {
    if (this.metrics.prices.length === 0) return null;
    return this.metrics.prices[this.metrics.prices.length - 1];
  }

  getPriceHistory(count = 10) {
    return this.metrics.prices.slice(-count);
  }

  async generateReport() {
    const latest = this.getLatestPrice();
    const history = this.getPriceHistory(10);

    let report = `📊 **PRAXIS Token Monitoring Report**\n\n`;
    report += `**Contract:** ${this.praxisTokenAddress}\n`;
    report += `**Last Updated:** ${this.metrics.lastUpdate}\n`;
    report += `**Monitoring Period:** ${history.length} data points collected\n\n`;

    if (latest) {
      report += `**Latest Price:**\n`;
      report += `${latest.response}\n\n`;
    }

    if (history.length > 1) {
      report += `**Price History (Last 10 Checks):**\n`;
      for (let i = 0; i < history.length; i++) {
        const entry = history[i];
        report += `${i + 1}. ${entry.timestamp}: ${entry.response}\n`;
      }
    }

    report += `\n📈 **Performance Indicators:**\n`;
    report += `• Total Data Points: ${this.metrics.prices.length}\n`;
    report += `• Monitoring Active: ${this.monitoringInterval ? 'Yes ✅' : 'No ❌'}\n`;
    report += `• Last Sync: ${this.metrics.lastUpdate}\n`;

    return report;
  }

  async getMetricsSummary() {
    return {
      tokenAddress: this.praxisTokenAddress,
      monitoring: this.monitoringInterval ? true : false,
      dataPoints: this.metrics.prices.length,
      lastUpdate: this.metrics.lastUpdate,
      latest: this.getLatestPrice()
    };
  }

  // Alert if price drops below threshold
  async checkPriceAlert(threshold) {
    const latest = this.getLatestPrice();
    if (!latest || !threshold) return null;

    // Parse price from response (simple string matching)
    const priceMatch = latest.response.match(/\$?([\d.]+)/);
    if (priceMatch) {
      const currentPrice = parseFloat(priceMatch[1]);
      if (currentPrice < threshold) {
        return {
          alert: true,
          message: `🚨 PRICE ALERT: PRAXIS price (${currentPrice}) is below threshold (${threshold})`,
          currentPrice,
          threshold
        };
      }
    }

    return { alert: false };
  }

  // Compare prices over time
  getPriceChange(hours = 1) {
    if (this.metrics.prices.length < 2) return null;

    const now = new Date();
    const timeAgo = new Date(now.getTime() - hours * 60 * 60 * 1000);

    const recentPrices = this.metrics.prices.filter(p => {
      const pTime = new Date(p.timestamp);
      return pTime >= timeAgo && pTime <= now;
    });

    if (recentPrices.length < 2) return null;

    const oldestPrice = recentPrices[0];
    const newestPrice = recentPrices[recentPrices.length - 1];

    // Simple comparison
    return {
      oldest: oldestPrice,
      newest: newestPrice,
      entries: recentPrices.length,
      period: `${hours}h`
    };
  }
}
