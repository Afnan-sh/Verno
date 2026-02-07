/**
 * OpenAI LLM provider implementation
 */

import { ILLMProvider } from '../../../types';

export class OpenAIProvider implements ILLMProvider {
  private apiKey: string = '';
  private model: string = 'gpt-3.5-turbo';
  private apiEndpoint: string = 'https://api.openai.com/v1/chat/completions';

  async initialize(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
    // Validate API key format
    if (!apiKey || !apiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format');
    }
  }

  async generateText(prompt: string, options?: Record<string, unknown>): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set');
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a helpful code generation assistant.' },
            { role: 'user', content: prompt }
          ],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000
        })
      });

      if (!response.ok) {
        const errorData: any = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data: any = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      throw error;
    }
  }

  getModelInfo(): Record<string, unknown> {
    return {
      provider: 'OpenAI',
      model: this.model,
      endpoint: this.apiEndpoint
    };
  }
}
