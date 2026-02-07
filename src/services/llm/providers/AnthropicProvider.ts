/**
 * Anthropic LLM provider implementation
 */

import { ILLMProvider } from '../../../types';

export class AnthropicProvider implements ILLMProvider {
  private apiKey: string = '';
  private model: string = 'claude-3-sonnet-20240229';
  private apiEndpoint: string = 'https://api.anthropic.com/v1/messages';

  async initialize(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
    // Validate API key
    if (!apiKey) {
      throw new Error('Invalid Anthropic API key');
    }
  }

  async generateText(prompt: string, options?: Record<string, unknown>): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key not set');
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: options?.maxTokens || 2000,
          system: 'You are a helpful code generation assistant.',
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) {
        const errorData: any = await response.json();
        throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
      }

      const data: any = await response.json();
      return data.content?.[0]?.text || '';
    } catch (error) {
      throw error;
    }
  }

  getModelInfo(): Record<string, unknown> {
    return {
      provider: 'Anthropic',
      model: this.model,
      endpoint: this.apiEndpoint
    };
  }
}
