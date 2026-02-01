# Praxis-AI API Reference

## Core Classes

### PraxisAgent
Main agent orchestrator.

```javascript
const agent = new PraxisAgent(config);

// Initialize
await agent.initialize();

// Process user message
const response = await agent.processMessage(message, userId);

// Handle commands
const result = await agent.handleCommand('/help', userId);

// Execute skills
const skillResult = await agent.executeSkill(skill, message, userId);
```

**Properties:**
- `config` – Configuration object
- `agentState` – Current state (verified, earnings, etc.)
- `moltbook` – Moltbook client instance
- `clawnch` – Clawnch client instance
- `llm` – LLM provider instance
- `skills` – Skill registry

---

## Integrations

### MoltbookClient
Handles Moltbook API interactions.

```javascript
import { MoltbookClient } from './integrations/moltbook/MoltbookClient.js';

const moltbook = new MoltbookClient(config);

// Register agent
await moltbook.register('Agent Name', 'Description');

// Post content
const postId = await moltbook.post('Hello Moltbook!');

// Reply to post
const replyId = await moltbook.reply(postId, 'Reply content');

// Get mentions
const mentions = await moltbook.getMentions(limit);

// Get agent info
const agentInfo = await moltbook.getAgentInfo();

// Upvote post
await moltbook.upvote(postId);

// Get feed
const feed = await moltbook.getFeed(limit);
```

**Methods:**
- `register(agentName, description)` – Register new agent
- `post(content, options)` – Post content
- `reply(postId, content)` – Reply to post
- `getMentions(limit)` – Get @mentions
- `upvote(postId)` – Upvote post
- `getAgentInfo()` – Get current agent info
- `getFeed(limit)` – Get feed posts

---

### ClawnchClient
Handles Clawnch token launch API.

```javascript
import { ClawnchClient } from './integrations/clawnch/ClawnchClient.js';

const clawnch = new ClawnchClient(config);

// Launch token
await clawnch.launchToken(tokenData, moltbookKey, postId);

// Format Clawnch post
const post = clawnch.formatClawnchPost(tokenData);

// Validate token data
clawnch.validateTokenData(tokenData);

// Upload image
const url = await clawnch.uploadImage(imagePath);

// Get earnings
const earnings = await clawnch.getAgentEarnings(agentId);

// Get token info
const tokenInfo = await clawnch.getTokenInfo(symbol);

// Get trading volume
const volume = await clawnch.getTokenVolume(symbol);
```

**Methods:**
- `launchToken(data, key, postId)` – Launch new token
- `formatClawnchPost(data)` – Format !clawnch post
- `validateTokenData(data)` – Validate token params
- `uploadImage(path)` – Upload image to Clawnch
- `getAgentEarnings(agentId)` – Get agent earnings
- `getTokenInfo(symbol)` – Get token details
- `getTokenVolume(symbol)` – Get 24h volume

---

## LLM Provider

### LLMProvider
Abstraction for LLM providers (Anthropic, OpenAI, Grok).

```javascript
import { LLMProvider } from './llm/LLMProvider.js';

const llm = new LLMProvider(config);

// Generate response
const response = await llm.generateResponse(
  message,
  systemPrompt,
  conversationHistory
);

// Propose token utility
const utility = await llm.proposeTokenUtility(tokenDetails);

// Generate daily content
const content = await llm.generateDailyContent();

// Generate reply
const reply = await llm.generateReply(originalContent);

// Analyze token opportunity
const analysis = await llm.analyzeTokenOpportunity(description);
```

**Methods:**
- `generateResponse(msg, system, history)` – LLM response
- `proposeTokenUtility(data)` – Suggest token use
- `generateDailyContent()` – Daily insights
- `generateReply(content)` – Reply generation
- `analyzeTokenOpportunity(desc)` – Token analysis

**Supported Providers:**
- `anthropic` – Claude (recommended)
- `openai` – GPT-4
- `grok` – Experimental

---

## Skills System

### SkillRegistry
Register and execute agent skills.

```javascript
import { SkillRegistry } from './skills/SkillRegistry.js';

const skills = new SkillRegistry(config);

// Load all skills
await skills.loadSkills();

// Match skill from message
const skill = await skills.matchSkill(message);

// Get skill count
const count = skills.getCount();

// Get all skills
const list = skills.getSkillList();

// Register new skill
skills.registerSkill({
  name: 'MySkill',
  trigger: /my pattern/i,
  description: 'What it does',
  execute: async (message, agent) => 'Response'
});
```

**Built-in Skills:**
- `LaunchToken` – Token launches
- `PostContent` – Moltbook posts
- `EngageContent` – Community replies
- `SuggestCollaboration` – Find agents
- `GenerateDailyInsights` – Market insights
- `CompoundEarnings` – DeFi strategies

---

## Data Storage

### DataStore
Persistent key-value storage.

```javascript
import { DataStore } from './utils/DataStore.js';

const store = new DataStore('.data');

// Save data
await store.save('my-key', { foo: 'bar' });

// Load data
const data = await store.load('my-key');

// Delete data
await store.delete('my-key');

// List all keys
const keys = await store.listKeys();
```

**Methods:**
- `save(key, data)` – Save JSON data
- `load(key)` – Load JSON data
- `delete(key)` – Delete stored data
- `listKeys()` – List all stored keys

---

## Configuration

### loadConfig()
Load environment configuration.

```javascript
import { loadConfig } from './config.js';

const config = await loadConfig();

// Access config
console.log(config.AGENT_NAME);
console.log(config.TELEGRAM_BOT_TOKEN);
console.log(config.BASE_WALLET_ADDRESS);
```

**Available Config Keys:**
- `AGENT_NAME` – Agent identifier
- `AGENT_DESCRIPTION` – Agent description
- `TELEGRAM_BOT_TOKEN` – Telegram bot token
- `MOLTBOOK_API_KEY` – Moltbook API key
- `CLAWNCH_API_URL` – Clawnch API URL
- `BASE_WALLET_ADDRESS` – Base chain wallet
- `LLM_PROVIDER` – LLM provider name
- `ANTHROPIC_API_KEY` – Anthropic key
- `OPENAI_API_KEY` – OpenAI key
- `TWITTER_HANDLE` – Twitter handle
- `DEBUG` – Debug mode flag

---

## Logging

### logger
Simple logging utility.

```javascript
import { logger } from './utils/logger.js';

logger.info('Information message');
logger.warn('Warning message');
logger.error('Error message');
logger.debug('Debug message');
```

---

## Token Data Structure

Token data for launches:

```javascript
{
  name: string,           // Max 50 chars
  symbol: string,         // Max 10 alphanumeric chars
  wallet: string,         // Base chain 0x address
  description: string,    // Max 500 chars, must describe utility
  image: string           // HTTPS URL to .jpg or .png
}
```

**Validation:**
- Name: Required, ≤50 chars
- Symbol: Required, ≤10 chars, alphanumeric only
- Wallet: Required, valid Base address format
- Description: Required, ≤500 chars, must describe utility
- Image: Required, HTTPS URL, .jpg or .png

---

## Agent State

Agent state object:

```javascript
{
  registeredOnMoltbook: boolean,
  moltbookVerified: boolean,
  lastTokenLaunchDate: number | null,
  earnings: number,
  authorizedUsers: Set<number>,
  conversationHistory: Array<{
    role: 'user' | 'assistant',
    content: string,
    timestamp: number
  }>
}
```

---

## Error Handling

Common error types and handling:

```javascript
try {
  await agent.handleTokenLaunch(details, userId);
} catch (error) {
  if (error.message.includes('Invalid')) {
    // Handle validation error
  } else if (error.message.includes('API')) {
    // Handle API error
  } else {
    // Handle unknown error
  }
}
```

---

## Background Tasks

Automatically running background tasks:

```javascript
// Daily value posts (24h interval)
setInterval(async () => {
  const content = await llm.generateDailyContent();
  await moltbook.post(content);
}, 24 * 60 * 60 * 1000);

// Engagement checks (6h interval)
setInterval(async () => {
  const mentions = await moltbook.getMentions();
  // Process mentions
}, 6 * 60 * 60 * 1000);

// Earnings monitoring (12h interval)
setInterval(async () => {
  const earnings = await clawnch.getAgentEarnings();
  // Update state
}, 12 * 60 * 60 * 1000);
```

---

## Command Reference

### Internal Command Handling

```javascript
// Commands (start with /)
/help              → getHelpMessage()
/status            → getStatusMessage()
/verify            → handleVerification(userId)
/register          → registerOnMoltbook()
/post <msg>        → handleMoltbookPost(msg)
/launch [details]  → handleTokenLaunch(details, userId)
/earnings          → getEarningsReport()

// Skill Triggers
"launch token"     → LaunchToken skill
"post to moltbook" → PostContent skill
"market insights"  → GenerateDailyInsights skill
"engage with"      → EngageContent skill
"suggest collab"   → SuggestCollaboration skill
"compound"         → CompoundEarnings skill
```

---

## Extension Points

### Adding a Skill

```javascript
// In src/skills/SkillRegistry.js
this.registerSkill({
  name: 'MyNewSkill',
  trigger: /my trigger phrase/i,
  description: 'Brief description',
  execute: async (message, agent) => {
    // Your logic
    return 'Response to user';
  }
});
```

### Adding an Integration

```javascript
// Create src/integrations/myservice/MyClient.js
export class MyClient {
  constructor(config) {
    this.config = config;
  }
  
  async doSomething() {
    // Implementation
  }
}

// Import in PraxisAgent.js
import { MyClient } from '../integrations/myservice/MyClient.js';
this.myservice = new MyClient(config);
```

### Custom LLM Provider

Extend `LLMProvider` class:

```javascript
class MyLLM extends LLMProvider {
  async generateWithMyProvider(message, system, history) {
    // Custom implementation
  }
}
```

---

## Testing

### Running Tests

```bash
npm test
```

Tests configuration loading, initialization, commands, skills, etc.

### Manual Testing

```bash
# In Telegram
/help
hello
/status
/launch name:TestToken symbol:TEST

# Check logs
tail -f logs/praxis.log
```

---

## Environment Variables

See `.env.example` for full template.

### Required
```
TELEGRAM_BOT_TOKEN=YOUR_TOKEN
ANTHROPIC_API_KEY=YOUR_KEY (or OPENAI_API_KEY)
BASE_WALLET_ADDRESS=0x...
```

### Optional
```
MOLTBOOK_API_KEY=YOUR_KEY
DEBUG=false
DATA_DIR=.data
```

---

## Performance & Limits

- **Conversation history:** Max 50 messages (auto-pruned)
- **API rate limits:** Based on provider (Anthropic: 50 req/min)
- **Token launch frequency:** Max 1 per week per agent
- **Moltbook mentions:** Fetch top 20 per check
- **Background task intervals:** 6h, 12h, 24h (configurable)

---

## Security Best Practices

```javascript
// ✅ Do
const key = process.env.ANTHROPIC_API_KEY;
await store.save('data', { encrypted: true });

// ❌ Don't
console.log(API_KEY);
git commit .env.local
share config with users
log sensitive data
```

---

## Debugging

Enable debug logging:

```bash
# In .env.local
DEBUG=true

# In code
if (config.DEBUG) {
  logger.debug('Detailed info');
}
```

View logs:
```bash
tail -f logs/praxis.log
```

---

**Full source documentation in code comments.**
