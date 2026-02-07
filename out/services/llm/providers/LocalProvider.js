"use strict";
/**
 * Local LLM provider implementation for local models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalProvider = void 0;
class LocalProvider {
    model = 'local-model';
    endpoint = 'http://localhost:8000';
    async initialize(apiKey) {
        // TODO: Initialize connection to local LLM server
    }
    async generateText(prompt, options) {
        // TODO: Implement local model API call
        return '';
    }
    getModelInfo() {
        return {
            provider: 'Local',
            model: this.model,
            endpoint: this.endpoint,
            version: '1.0'
        };
    }
}
exports.LocalProvider = LocalProvider;
//# sourceMappingURL=LocalProvider.js.map