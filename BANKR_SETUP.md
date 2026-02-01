# 🚀 Bankr Integration Setup Guide

## Overview
Bankr integration enables Praxis-AI to deploy ERC20 tokens on Base and execute DeFi operations via natural language prompts.

## Quick Setup (5 minutes)

### Step 1: Create Bankr Account
1. Visit https://bankr.bot
2. Click "Sign Up" or "Login"
3. Enter your email address
4. Check your email for One-Time Passcode (OTP)
5. Enter the OTP to verify

### Step 2: Generate API Key
1. After login, go to https://bankr.bot/api
2. Look for "Agent API" section
3. Click "Create New Key" or "+ New API Key"
4. **Important:** Enable "Agent API" access (check the box)
5. Copy the API key (starts with `bk_`)
6. **Save this immediately** - Bankr won't show it again

### Step 3: Configure Praxis-AI
Add the API key to `.env.local`:
```bash
BANKR_API_KEY=bk_your_api_key_here
```

### Step 4: Restart the Bot
```bash
pm2 restart praxis-ai
```

### Step 5: Verify Setup
In Telegram:
```
/bankr
```

Should show: ✅ Configured

## Deploy PRAXIS Token

### Via Telegram
```
/bankr-launch-praxis
```

The bot will:
1. Show token deployment preview
2. Submit job to Bankr API
3. Poll for completion (usually 30-120 seconds)
4. Return contract address and transaction details

### Token Details
- **Name:** Praxis AI Official
- **Symbol:** PRAXIS
- **Chain:** Base (recommended for low fees)
- **Description:** Official token with utility for revenue sharing, community rewards, and AI services
- **Logo:** Professional branding image
- **Fee Wallet:** 0x2805e9dbce2839c5feae858723f9499f15fd88cf

## What Happens During Deployment

1. **API Call** → Bankr receives token details
2. **Contract Deployment** → ERC20 contract deployed on Base chain
3. **Initial Liquidity** → Clanker automatically adds liquidity
4. **Verification** → Contract visible on block explorers
5. **Confirmation** → Token trading enabled immediately

## Post-Deployment

### Monitor Token
```bash
# Token address from deployment response
# View on: https://basescan.org/token/{contract_address}
```

### Trade PRAXIS Token
```
/bankr

Natural language examples:
- "Buy $100 of PRAXIS on Base"
- "What's the price of PRAXIS?"
- "Show my PRAXIS balance"
```

### Claim Creator Fees
```
/bankr

Natural language:
- "Claim fees for PRAXIS"
- "Check my PRAXIS creator fees"
```

## Rate Limits

| User Type | Daily Limit | Cost |
|-----------|------------|------|
| Standard Users | 1 token/day | Gas only |
| Bankr Club | 10 tokens/day | Gas only |

## Supported Chains

| Chain | Best For | Gas Cost |
|-------|----------|----------|
| **Base** | Memecoins, general trading | Very Low ⭐ |
| Unichain | General trading | Very Low |
| Ethereum | Blue chips | High |

## Fee Structure

- Clanker charges a small percentage on each token trade
- Creator (PRAXIS) receives accumulated fees
- Claimable anytime via "Claim fees for PRAXIS"
- No hidden fees

## Troubleshooting

### "API key not configured"
- Verify .env.local has `BANKR_API_KEY`
- Check key starts with `bk_`
- Restart bot: `pm2 restart praxis-ai`

### "Job timeout"
- Bankr API may be slow (normal, 30-120 seconds)
- Check job status at: https://bankr.bot
- Retry deployment

### "Insufficient funds"
- Bankr wallet needs Base ETH for gas
- Deposit ETH to Bankr wallet on Base
- Or use faucet: https://www.alchemy.com/faucets/base

### "Symbol already exists"
- Token symbol must be unique
- Bankr prevents duplicate symbols
- Try different symbol

### "Authentication error"
- API key may be expired
- Generate new key at https://bankr.bot/api
- Update .env.local
- Restart bot

## Security Best Practices

✅ **DO:**
- Store API key safely in .env.local
- Never commit .env.local to git
- Use rate limiting wisely
- Test with small amounts first

❌ **DON'T:**
- Share API key publicly
- Push .env.local to GitHub
- Enable unnecessary API permissions
- Deploy unvetted token metadata

## Legal & Compliance

⚠️ **Disclaimer**
- Token deployment may have legal implications
- Check securities laws in your jurisdiction
- Maintain transparency with community
- Keep deployment documentation

## Links

- **Bankr:** https://bankr.bot
- **API Dashboard:** https://bankr.bot/api
- **Base Explorer:** https://basescan.org
- **Clanker:** https://www.clanker.world

## Next Steps

1. ✅ Create Bankr account
2. ✅ Generate API key with Agent API access
3. ✅ Add to .env.local
4. ✅ Restart Praxis-AI bot
5. ✅ Run `/bankr-launch-praxis`
6. ✅ Share token address with community
7. ✅ Monitor trading activity
8. ✅ Claim creator fees regularly

---

**Questions?** Check Bankr docs: https://www.notion.so/Agent-API-2e18e0f9661f80cb83ccfc046f8872e3
