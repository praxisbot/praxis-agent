import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class DataStore {
  constructor(dataDir = '.data') {
    this.dataDir = dataDir;
    this.ensureDir();
  }
  
  async ensureDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create data directory:', error);
    }
  }
  
  async save(key, data) {
    try {
      const filePath = path.join(this.dataDir, `${key}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  }
  
  async load(key) {
    try {
      const filePath = path.join(this.dataDir, `${key}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }
  
  async delete(key) {
    try {
      const filePath = path.join(this.dataDir, `${key}.json`);
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete ${key}:`, error);
    }
  }
  
  async listKeys() {
    try {
      const files = await fs.readdir(this.dataDir);
      return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    } catch (error) {
      return [];
    }
  }
}
