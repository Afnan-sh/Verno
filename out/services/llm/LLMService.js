"use strict";
/**
 * Main LLM service interface and orchestration
 * Now supports both direct API calls and LangChain-based conversations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
const LangChainService_1 = require("./LangChainService");
class LLMService {
    provider = null;
    maxRetries = 3;
    retryDelay = 1000; // ms
    useLangChain = false;
    langChainService = null;
    onContextUsage;
    /**
     * Set callback for context usage updates
     */
    setContextUsageCallback(callback) {
        this.onContextUsage = callback;
    }
    /**
     * Enable LangChain mode for conversation memory and advanced features
     */
    enableLangChain() {
        this.useLangChain = true;
        if (!this.langChainService) {
            this.langChainService = new LangChainService_1.LangChainService();
        }
    }
    /**
     * Disable LangChain mode and use direct provider API
     */
    disableLangChain() {
        this.useLangChain = false;
    }
    /**
     * Check if LangChain mode is enabled
     */
    isLangChainEnabled() {
        return this.useLangChain;
    }
    /**
     * Get the LangChain service instance
     */
    getLangChainService() {
        return this.langChainService;
    }
    /**
     * Initialize provider (supports both LangChain and direct mode)
     */
    async initialize(providerType, apiKey) {
        if (this.useLangChain && this.langChainService) {
            // Initialize LangChain provider
            const langChainProviderType = this.mapToLangChainProvider(providerType);
            await this.langChainService.initializeProvider(langChainProviderType, apiKey);
        }
        else {
            // Legacy direct API initialization
            if (this.provider) {
                await this.provider.initialize(apiKey);
            }
            else {
                throw new Error('Provider not set before initialization');
            }
        }
    }
    estimateUsage(prompt) {
        if (!this.onContextUsage)
            return;
        try {
            const used = Math.ceil(prompt.length / 4); // Heuristic
            // Determine limit (safe defaults)
            const providerName = this.provider?.constructor.name.toLowerCase() || '';
            let limit = 8192; // default
            if (providerName.includes('gemini'))
                limit = 32768;
            if (providerName.includes('groq'))
                limit = 8192;
            this.onContextUsage(used, limit);
        }
        catch { }
    }
    async generateText(prompt, options) {
        this.estimateUsage(prompt);
        // If LangChain mode is enabled, delegate to LangChain service
        if (this.useLangChain && this.langChainService) {
            const sessionId = options?.sessionId;
            return await this.langChainService.chat(prompt, sessionId);
        }
        // Legacy mode: use direct provider API
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
    /**
     * Streaming generation API. If the provider supports streaming, use it.
     * Otherwise, fall back to a single-shot generateText and emit as one token.
     */
    async streamGenerate(prompt, options, onToken) {
        this.estimateUsage(prompt);
        // If LangChain mode is enabled, use LangChain streaming
        if (this.useLangChain && this.langChainService) {
            const sessionId = options?.sessionId;
            await this.langChainService.streamChat(prompt, sessionId, onToken);
            return;
        }
        // Legacy mode: check provider streaming support
        if (!this.provider) {
            throw new Error('LLM provider not initialized. Please set a provider first.');
        }
        const providerAny = this.provider;
        if (typeof providerAny.streamGenerate === 'function') {
            await providerAny.streamGenerate(prompt, options, onToken);
            return;
        }
        // Fallback: single-shot and emit whole text as one token
        const text = await this.generateText(prompt, options);
        onToken(text);
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
    /**
     * Map provider type string to LangChain provider type
     */
    mapToLangChainProvider(providerType) {
        const lowerType = providerType.toLowerCase();
        if (lowerType.includes('openai'))
            return 'openai';
        if (lowerType.includes('anthropic') || lowerType.includes('claude'))
            return 'anthropic';
        if (lowerType.includes('gemini') || lowerType.includes('google'))
            return 'gemini';
        if (lowerType.includes('groq'))
            return 'groq';
        // Default to gemini if unknown
        return 'gemini';
    }
}
exports.LLMService = LLMService;
//# sourceMappingURL=LLMService.js.map