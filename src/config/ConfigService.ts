/**
 * Configuration service for extension settings
 */

import * as vscode from 'vscode';
import { IConfigService } from '../types';

export class ConfigService implements IConfigService {
  private readonly configKey = 'verno';

  get<T>(key: string): T | undefined {
    const config = vscode.workspace.getConfiguration(this.configKey);
    return config.get<T>(key);
  }

  async set<T>(key: string, value: T): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.configKey);
    await config.update(key, value, vscode.ConfigurationTarget.Global);
  }

  getAll(): Record<string, unknown> {
    const config = vscode.workspace.getConfiguration(this.configKey);
    return config;
  }
}
