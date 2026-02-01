import fetch from 'node-fetch';
import { logger } from './src/utils/logger.js';

async function test() {
  const apiUrl = 'https://www.moltbook.com/api/v1';
  const apiKey = 'moltbook_sk_67hFgl5uk6IqiZ_1JE9qDXh1NECtjNKb';
  
  const payloads = [
    {
      name: 'Simple post',
      data: {
        submolt: 'general',
        title: 'Test',
        content: 'Hello'
      }
    },
    {
      name: 'With type',
      data: {
        submolt: 'general',
        title: 'Test',
        content: 'Hello',
        type: 'text'
      }
    },
    {
      name: 'Different submolt',
      data: {
        submolt: 'praxis',
        title: 'Test',
        content: 'Hello'
      }
    }
  ];
  
  for (const test of payloads) {
    logger.info(`\n🧪 Testing: ${test.name}`);
    logger.info(`Payload: ${JSON.stringify(test.data)}`);
    
    try {
      const response = await fetch(`${apiUrl}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test.data)
      });
      
      const body = await response.text();
      logger.info(`Status: ${response.status}`);
      logger.info(`Response: ${body.substring(0, 200)}`);
    } catch (error) {
      logger.error(`Error: ${error.message}`);
    }
  }
}

test();
