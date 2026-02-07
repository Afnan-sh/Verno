/**
 * Main LLM service interface and orchestration
 */

import { ILLMProvider } from '../../types';

export class LLMService {
  private provider: ILLMProvider | null = null;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // ms

  async initialize(providerType: string, apiKey: string): Promise<void> {
    // Load provider based on type
    if (this.provider) {
      await this.provider.initialize(apiKey);
    } else {
      throw new Error('Provider not set before initialization');
    }
  }

  async generateText(prompt: string, options?: Record<string, unknown>): Promise<string> {
    if (!this.provider) {
      throw new Error('LLM provider not initialized. Please set a provider first.');
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await this.provider.generateText(prompt, options);
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries - 1) {
          await this.delay(this.retryDelay);
        }
      }
    }

    throw lastError || new Error('Failed to generate text after retries');
  }

  setProvider(provider: ILLMProvider): void {
    this.provider = provider;
  }

  getProvider(): ILLMProvider | null {
    return this.provider;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
