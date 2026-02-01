# BotFather Commands Setup Guide

## ✅ All Available Commands (23 total)

**IMPORTANT:** When adding commands to BotFather, use underscores (_) instead of hyphens (-) in command names.

Copy and paste this into BotFather's /setcommands:

```
help - Show all available commands
status - Check bot status and integrations  
verify - Setup Moltbook verification
register - Register as agent on Moltbook
post - Post content to Moltbook
launch - Launch new token via Clawnch
earnings - View earnings report
skills - List available AI skills
wallet - Show wallet and earnings info
moltx_register - Register as agent on Moltx
moltx_claim - Claim identity on Moltx with tweet
moltx_post - Post content to Moltx
bankr - Show Bankr integration status
bankr_deploy - Deploy token on Bankr
bankr_launch_praxis - Deploy official PRAXIS token on Base
bankr_claim_fees - Claim creator fees
bankr_balance - Check portfolio balance
bankr_price - Get token price
praxis_marketing - Generate marketing content for all platforms
praxis_metrics - Get PRAXIS token metrics
praxis_monitor - View token monitoring status
4claw - Show 4claw imageboard info
4claw_post - Post thread to 4claw board
```

## How to Set Commands in BotFather

1. Open Telegram and find @BotFather
2. Send: `/setcommands`
3. Select your bot
4. Paste the command list above
5. Done!

## Command Categories

### Core Commands (4)
- `help` - Help and guide
- `status` - Status check
- `skills` - Skills list
- `wallet` - Wallet info

### Moltbook Integration (3)
- `verify` - Moltbook verification
- `register` - Register on Moltbook
- `post` - Post to Moltbook

### Moltx Integration (3)
- `moltx_register` - Register on Moltx
- `moltx_claim` - Claim on Moltx
- `moltx_post` - Post to Moltx

### 4claw Integration (2)
- `4claw` - 4claw info
- `4claw_post` - Post to 4claw

### Token & Finance (6)
- `launch` - Launch token
- `earnings` - Earnings report
- `bankr` - Bankr status
- `bankr_deploy` - Deploy token
- `bankr_launch_praxis` - Deploy PRAXIS
- `bankr_claim_fees` - Claim fees

### Trading & Portfolio (3)
- `bankr_balance` - Check balance
- `bankr_price` - Get price

### PRAXIS Token (3)
- `praxis_marketing` - Marketing content
- `praxis_metrics` - Token metrics
- `praxis_monitor` - Token monitoring

## Why Commands Show "Not Available"

Commands show as "not available" when:
1. ❌ Not registered in BotFather
2. ❌ Using hyphens (-) instead of underscores (_)
3. ❌ Typo in command name
4. ❌ Bot hasn't been restarted after BotFather setup

## Solution Steps

1. ✅ Use the command list above (with underscores)
2. ✅ Go to BotFather and set commands
3. ✅ Restart the bot: `pm2 restart praxis-ai`
4. ✅ Test in Telegram

## Testing After Setup

Send `/help` in Telegram to verify all commands work.

You should see a dropdown menu showing available commands when you type `/`
