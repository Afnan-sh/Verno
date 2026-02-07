/**
 * File operations service
 */

import { IFileService } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

export class FileService implements IFileService {
  async createFile(filePath: string, content: string): Promise<void> {
    const dir = path.dirname(filePath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
  }

  async readFile(filePath: string): Promise<string> {
    return fs.promises.readFile(filePath, 'utf-8');
  }

  async updateFile(filePath: string, content: string): Promise<void> {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}
