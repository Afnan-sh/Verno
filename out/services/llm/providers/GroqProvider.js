"use strict";
/**
 * Groq LLM provider implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqProvider = void 0;
class GroqProvider {
    apiKey = '';
    model = 'allam-2-7b';
    apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
    async initialize(apiKey) {
        if (!apiKey || apiKey.trim().length === 0) {
            throw new Error('Groq API key cannot be empty');
        }
        this.apiKey = apiKey.trim();
    }
    async generateText(prompt, options) {
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
                    temperature: options?.temperature || 0.7,
                    max_tokens: options?.maxTokens || 2000,
                    top_p: 0.95
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
            }
            const data = await response.json();
            return data.choices?.[0]?.message?.content || '';
        }
        catch (error) {
            throw error;
        }
    }
    getModelInfo() {
        return {
            provider: 'Groq',
            model: this.model,
            endpoint: this.apiEndpoint
        };
    }
}
exports.GroqProvider = GroqProvider;
//# sourceMappingURL=GroqProvider.js.map