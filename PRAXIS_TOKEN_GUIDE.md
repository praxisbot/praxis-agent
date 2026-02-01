# PRAXIS Token Features & Trading Operations Guide

## Overview

Praxis-AI now has a complete suite of tools for managing the PRAXIS token on Base chain, including:
- ✅ Token deployment via Bankr
- ✅ Fee claiming and portfolio management
- ✅ Real-time price monitoring and metrics tracking
- ✅ Multi-platform marketing content generation
- ✅ Trading commands and balance checking

**Current Status:**
- **Contract:** 0x2286A69F56a41c1a3280A410497A6c6cDC08fB07
- **Chain:** Base (Ethereum L2)
- **Status:** Live & Tradeable on Clanker
- **Monitoring:** Active (5-minute intervals)

---

## 1. Token Deployment & Launch

### `/bankr-launch-praxis` - Deploy Official Token
Deploys the official PRAXIS token on Base chain via Bankr API.

**Features:**
- Automatic contract generation
- Token parameters (name, symbol, description, logo, website, social links)
- Returns contract address upon successful deployment
- Automatically starts token monitoring

**Example Response:**
```
✅ **Token Deployment Complete!**

Response: deployed Praxis AI Official contract address is 0x2286A69F56a41c1a3280A410497A6c6cDC08fB07
Job ID: job_XCFSZ22XNHSAL6H2

🔗 **Contract Address:** 0x2286A69F56a41c1a3280A410497A6c6cDC08fB07
📊 **View on Clanker:** https://www.clanker.world/clanker/0x2286A69F56a41c1a3280A410497A6c6cDC08fB07
```

**Prerequisites:**
- Bankr API key configured in `.env.local` (BANKR_API_KEY)
- Sufficient Base ETH for gas fees
- Within rate limits (1/day standard, 10/day Bankr Club members)

---

## 2. Fee Management

### `/bankr-claim-fees` - Claim Creator Fees
Claims accumulated creator fees from token trading.

**Use Case:** Monetize token creation by collecting fees from trading volume

**Requirements:**
- Token must be deployed first (`/bankr-launch-praxis`)
- Bankr API key configured

**Example Response:**
```
✅ **Fee Claim Initiated!**

Response: Claimed fees for PRAXIS token
Job ID: job_ABC123DEF456
Status: completed
```

---

## 3. Portfolio & Balance Management

### `/bankr-balance` - Check Portfolio
Returns current holdings and asset balances across all chains.

**Features:**
- Shows all token holdings
- Displays Base chain assets
- Returns portfolio composition

**Example Response:**
```
💰 **Portfolio Balance**

Response: Current portfolio shows 1000 PRAXIS tokens and 2.5 ETH
```

### `/bankr-price <symbol>` - Get Token Price
Fetches real-time price for any token on Base chain.

**Usage:**
```
/bankr-price PRAXIS          # Get PRAXIS price
/bankr-price ETH             # Get Ethereum price
/bankr-price USDC            # Get USDC price
```

**Example Response:**
```
📊 **PRAXIS Price on Base**

Response: Current price of PRAXIS on Base is $0.00234
```

---

## 4. Token Monitoring & Metrics

### `/praxis-metrics` - Get Current Metrics
Fetches latest PRAXIS token metrics directly from Bankr.

**Features:**
- Real-time price data
- Latest trading information
- Contract verification
- Direct link to Clanker trading interface

**Data Tracked:**
- Current price
- 24h volume
- Holder count (when available)
- Liquidity metrics

**Example Response:**
```
📊 **PRAXIS Token Metrics**

Contract: 0x2286A69F56a41c1a3280A410497A6c6cDC08fB07
Chain: Base (Ethereum L2)
Last Updated: 2026-02-01T04:51:36.000Z

Price Information:
Current price of PRAXIS on Base is $0.00234

🔗 **Trade on Clanker:** https://www.clanker.world/clanker/0x2286A69F56a41c1a3280A410497A6c6cDC08fB07
```

### `/praxis-monitor` - View Monitoring Status
Shows token monitoring history and performance data.

**Features:**
- Monitoring status (active/inactive)
- Historical data points collected
- Price change analysis
- Trend tracking

**Example Response:**
```
📊 **Token Monitoring Status**

Token Address: 0x2286A69F56a41c1a3280A410497A6c6cDC08fB07
Monitoring Active: ✅ Yes
Data Points Collected: 12
Last Update: 2026-02-01T04:55:30.000Z

Latest Data:
Current price of PRAXIS on Base is $0.00245

**Price History (Last 10 Checks):**
1. 2026-02-01T04:35:00Z: $0.00234
2. 2026-02-01T04:40:00Z: $0.00237
...
```

---

## 5. Marketing & Community

### `/praxis-marketing` - Generate Marketing Content
Creates ready-to-use marketing materials for all major platforms.

**Outputs Generated:**
1. **Twitter Post** - Character-limited, hashtag-optimized
2. **Telegram Announcement** - Markdown formatted with links
3. **Discord Embed** - JSON formatted for Discord bots
4. **Reddit Post** - Formatted for r/cryptocurrency and related subreddits
5. **Live Announcement** - ASCII art announcement banner
6. **Email Template** - Professional email newsletter

**Example Usage:**
```
/praxis-marketing
```

**Outputs Include:**
- Contract address (clickable links)
- Token utility description
- Trading platform link (Clanker)
- Community channels
- Call-to-action messaging

**Marketing Package Content:**

#### Twitter Format:
```
🚀 Just launched $PRAXIS - Official token of Praxis-AI!

Our autonomous agent is now tokenized and ready for the ecosystem.

✅ Live on Base (L2 scaling)
✅ Trading on Clanker
✅ Contract: 0x2286...

Join the future of AI agents! 

🔗 https://www.clanker.world/clanker/0x2286A69F56a41c1a3280A410497A6c6cDC08fB07

#crypto #BaseChain #AI #TokenLaunch
```

#### Telegram Format:
```
🦾 *PRAXIS Token Officially Deployed!*

The autonomous agent is now tokenized and live on the Base blockchain.

*Token Details:*
📊 Name: Praxis AI Official
💰 Symbol: PRAXIS
⛓️ Chain: Base (Ethereum L2)
🔗 Contract: `0x2286A69F56a41c1a3280A410497A6c6cDC08fB07`

*Buy Now:*
[Trade on Clanker](https://www.clanker.world/clanker/0x2286A69F56a41c1a3280A410497A6c6cDC08fB07)
```

---

## 6. Bankr Integration Overview

### Core Bankr Commands

| Command | Purpose | Status |
|---------|---------|--------|
| `/bankr` | Show Bankr status & setup | ✅ Working |
| `/bankr-launch-praxis` | Deploy PRAXIS token | ✅ Deployed |
| `/bankr-claim-fees` | Claim creator fees | ✅ Ready |
| `/bankr-balance` | Check portfolio | ✅ Ready |
| `/bankr-price <symbol>` | Get token price | ✅ Ready |

### API Architecture
- **Endpoint:** https://api.bankr.bot
- **Authentication:** X-API-Key header
- **Pattern:** Async job submission → polling → result retrieval
- **Polling Interval:** 2 seconds
- **Max Wait:** 5 minutes (150 attempts)

### Configuration
```javascript
// .env.local
BANKR_API_KEY=bk_Q8P6BEX96GVTEZYATRUBGL4GKFWLDJHN
```

---

## 7. Token Monitoring System

### Auto-Monitoring Features
When a token is deployed:
1. Contract address captured
2. TokenMonitor instance initialized
3. 5-minute polling cycle started
4. Price data collected in history
5. Metrics persisted to storage

### Monitoring Data Stored
- **File:** `.data/praxis-token-metrics`
- **Update Frequency:** Every 5 minutes
- **History Retention:** Last 100 data points
- **Data Points:** Timestamp, price, job ID, raw response

### TokenMonitor Class Methods

```javascript
tokenMonitor.setTokenAddress(address)     // Set contract to monitor
tokenMonitor.startMonitoring(interval)    // Start polling cycle
tokenMonitor.stopMonitoring()             // Stop monitoring
tokenMonitor.collectMetrics()             // Manual metric collection
tokenMonitor.getLatestPrice()             // Get most recent price
tokenMonitor.getPriceHistory(count)       // Get price history
tokenMonitor.generateReport()             // Generate detailed report
tokenMonitor.getMetricsSummary()          // Get quick summary
```

### Accessing Monitoring Data
```javascript
// From Telegram
/praxis-monitor          # View monitoring status
/praxis-metrics          # Get current metrics

// Programmatic
const summary = tokenMonitor.getMetricsSummary();
const report = await tokenMonitor.generateReport();
const price = tokenMonitor.getLatestPrice();
```

---

## 8. Complete Command Reference

### Token Operations
```
/bankr-launch-praxis          # Deploy token (one-time)
/bankr-claim-fees             # Claim accumulated fees
/bankr-balance                # Check portfolio balance
/bankr-price <symbol>         # Get token price
```

### Monitoring & Metrics
```
/praxis-metrics               # Get current metrics
/praxis-monitor               # View monitoring status & history
/praxis-marketing             # Generate marketing content
```

### General Commands
```
/help                         # Show all commands
/status                       # Get bot status
/bankr                        # Show Bankr integration status
```

---

## 9. Workflow Examples

### Complete Launch Workflow
```
Step 1: Deploy Token
/bankr-launch-praxis
→ Returns contract address

Step 2: Check Metrics
/praxis-metrics
→ Shows current price and data

Step 3: Generate Marketing
/praxis-marketing
→ Copy to Twitter, Telegram, Discord, Reddit

Step 4: Monitor Performance
/praxis-monitor
→ Track price and trading activity

Step 5: Claim Fees
/bankr-claim-fees
→ Collect creator rewards
```

### Ongoing Operations
```
Daily:
- /praxis-metrics      (check price)
- /bankr-balance       (check holdings)
- /praxis-monitor      (review trends)

Weekly:
- /praxis-marketing    (refresh marketing)
- /bankr-claim-fees    (collect fees if available)

As Needed:
- /bankr-price <token> (check specific prices)
```

---

## 10. Important Notes

### Rate Limits
- **Standard Bankr Users:** 1 token deployment per 24 hours
- **Bankr Club Members:** 10 token deployments per 24 hours
- **API Calls:** Unlimited within rate limit tiers

### Gas Fees
- All operations require Base ETH for gas
- Typical deployment: ~0.01-0.05 ETH
- Fee claiming: ~0.002 ETH

### Data Persistence
- All metrics saved to `.data/` directory
- Marketing content cached per deployment
- Monitoring history retained for analysis
- Agent state includes token metadata

### Monitoring Behavior
- Starts automatically when token deployed
- Continues running unless stopped
- Consumes minimal resources (2s polling)
- Can be stopped with: `tokenMonitor.stopMonitoring()`

### Trading Safety
- All prices from Bankr API (reliable source)
- No automatic trading (only monitoring)
- Manual fee claiming (prevents accident claims)
- Transparent logging of all operations

---

## 11. Troubleshooting

### Token Not Showing in Monitoring
**Solution:** Ensure /bankr-launch-praxis was run successfully

### Price Data Unavailable
**Problem:** Bankr API returns empty response
**Check:** Verify BANKR_API_KEY is valid and active

### Monitoring Stopped
**Problem:** Manual stop or bot crash
**Solution:** Restart bot with `pm2 restart praxis-ai`

### Marketing Content Won't Generate
**Problem:** Token address not captured
**Check:** Run /bankr-launch-praxis again

### Fee Claiming Failed
**Problem:** No accumulated fees yet
**Note:** Requires active trading volume first

---

## 12. Future Enhancements

### Planned Features
- [ ] Automated fee claiming on threshold
- [ ] Price alert notifications
- [ ] Advanced trading orders via Bankr
- [ ] Community sentiment tracking
- [ ] Liquidity pool management
- [ ] Token holder rewards distribution
- [ ] DAO governance integration

### Integration Opportunities
- Twitter bot for price updates
- Discord bot for announcements
- Email alerts for price milestones
- Analytics dashboard
- Multi-token portfolio tracking

---

## Summary

Praxis-AI now has enterprise-grade token management capabilities including deployment, monitoring, fee management, and marketing. The bot actively tracks PRAXIS token performance every 5 minutes and maintains a complete history for analysis and reporting.

**Status:** Production Ready ✅
**Contract:** 0x2286A69F56a41c1a3280A410497A6c6cDC08fB07
**Trading:** https://www.clanker.world/clanker/0x2286A69F56a41c1a3280A410497A6c6cDC08fB07
**Monitoring:** Active 24/7

For questions or issues, refer to the command help: `/help`
