/**
 * Groq LLM provider implementation
 */

import { ILLMProvider } from '../../../types';

export class GroqProvider implements ILLMProvider {
  private apiKey: string = '';
  private model: string = 'allam-2-7b';
  private apiEndpoint: string = 'https://api.groq.com/openai/v1/chat/completions';

  async initialize(apiKey: string): Promise<void> {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('Groq API key cannot be empty');
    }
    this.apiKey = apiKey.trim();
  }

  async generateText(prompt: string, options?: Record<string, unknown>): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Groq API key not set');
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          model: this.model,
          temperature: (options?.temperature as number) || 0.7,
          max_tokens: (options?.maxTokens as number) || 2000,
          top_p: 0.95
        })
      });

      if (!response.ok) {
        const errorData: any = await response.json();
        throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
      }

      const data: any = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      throw error;
    }
  }

  getModelInfo(): Record<string, unknown> {
    return {
      provider: 'Groq',
      model: this.model,
      endpoint: this.apiEndpoint
    };
  }
}
