"use strict";
/**
 * Main LLM service interface and orchestration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
class LLMService {
    provider = null;
    maxRetries = 3;
    retryDelay = 1000; // ms
    async initialize(providerType, apiKey) {
        // Load provider based on type
        if (this.provider) {
            await this.provider.initialize(apiKey);
        }
        else {
            throw new Error('Provider not set before initialization');
        }
    }
    async generateText(prompt, options) {
        if (!this.provider) {
            throw new Error('LLM provider not initialized. Please set a provider first.');
        }
        let lastError = null;
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                return await this.provider.generateText(prompt, options);
            }
            catch (error) {
                lastError = error;
                if (attempt < this.maxRetries - 1) {
                    await this.delay(this.retryDelay);
                }
            }
        }
        throw lastError || new Error('Failed to generate text after retries');
    }
    setProvider(provider) {
        this.provider = provider;
    }
    getProvider() {
        return this.provider;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.LLMService = LLMService;
//# sourceMappingURL=LLMService.js.map