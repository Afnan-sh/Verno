"use strict";
/**
 * OpenAI LLM provider implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const streamingAdapter_1 = require("../streamingAdapter");
class OpenAIProvider {
    apiKey = '';
    model = 'gpt-3.5-turbo';
    apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    async initialize(apiKey) {
        this.apiKey = apiKey;
        // Validate API key format
        if (!apiKey || !apiKey.startsWith('sk-')) {
            throw new Error('Invalid OpenAI API key format');
        }
    }
    async generateText(prompt, options) {
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
                const errorData = await response.json();
                throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
            }
            const data = await response.json();
            return data.choices?.[0]?.message?.content || '';
        }
        catch (error) {
            throw error;
        }
    }
    async streamGenerate(prompt, options, onToken) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not set');
        }
        // If onToken not provided, nothing to do
        if (!onToken)
            return;
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
                    max_tokens: options?.maxTokens || 2000,
                    stream: true
                })
            });
            if (!response.ok || !response.body) {
                // fallback to non-stream
                const text = await this.generateText(prompt, options);
                onToken(text);
                return;
            }
            await (0, streamingAdapter_1.defaultStreamParser)(response.body, (chunk) => {
                onToken(chunk);
            });
        }
        catch (err) {
            // Fallback to single-shot on error
            const text = await this.generateText(prompt, options);
            onToken(text);
        }
    }
    getModelInfo() {
        return {
            provider: 'OpenAI',
            model: this.model,
            endpoint: this.apiEndpoint
        };
    }
}
exports.OpenAIProvider = OpenAIProvider;
//# sourceMappingURL=OpenAIProvider.js.map