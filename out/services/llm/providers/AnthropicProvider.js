"use strict";
/**
 * Anthropic LLM provider implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
class AnthropicProvider {
    apiKey = '';
    model = 'claude-3-sonnet-20240229';
    apiEndpoint = 'https://api.anthropic.com/v1/messages';
    async initialize(apiKey) {
        this.apiKey = apiKey;
        // Validate API key
        if (!apiKey) {
            throw new Error('Invalid Anthropic API key');
        }
    }
    async generateText(prompt, options) {
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
                const errorData = await response.json();
                throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
            }
            const data = await response.json();
            return data.content?.[0]?.text || '';
        }
        catch (error) {
            throw error;
        }
    }
    getModelInfo() {
        return {
            provider: 'Anthropic',
            model: this.model,
            endpoint: this.apiEndpoint
        };
    }
}
exports.AnthropicProvider = AnthropicProvider;
//# sourceMappingURL=AnthropicProvider.js.map