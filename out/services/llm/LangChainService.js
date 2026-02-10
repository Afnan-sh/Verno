"use strict";
/**
 * Simplified LangChain Service - Lightweight wrapper for conversation management
 * Uses direct provider API calls with conversation memory
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangChainService = void 0;
/**
 * Simplified LangChain-like service with conversation memory
 */
class LangChainService {
    provider = null;
    providerType = null;
    sessions = new Map();
    currentSessionId = null;
    /**
     * Initialize the provider
     */
    async initializeProvider(providerType, apiKey, modelName) {
        this.providerType = providerType;
        // Provider will be set externally via setProvider method
    }
    /**
     * Set the LLM provider
     */
    setProvider(provider) {
        this.provider = provider;
    }
    /**
     * Create a new conversation session
     */
    createSession(sessionId) {
        const id = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.sessions.set(id, {
            id,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        this.currentSessionId = id;
        return id;
    }
    /**
     * Send a chat message with conversation context
     */
    async chat(message, sessionId) {
        const session = this.getSession(sessionId);
        // Add user message
        session.messages.push({
            role: 'user',
            content: message,
            timestamp: Date.now(),
        });
        // Build prompt with conversation history
        const prompt = this.buildPromptWithHistory(session);
        // Generate response using provider
        if (!this.provider) {
            throw new Error('Provider not set');
        }
        const response = await this.provider.generateText(prompt);
        // Add assistant message
        session.messages.push({
            role: 'assistant',
            content: response,
            timestamp: Date.now(),
        });
        session.updatedAt = Date.now();
        return response;
    }
    /**
     * Stream a chat message
     */
    async streamChat(message, sessionId, onToken) {
        const session = this.getSession(sessionId);
        // Add user message
        session.messages.push({
            role: 'user',
            content: message,
            timestamp: Date.now(),
        });
        const prompt = this.buildPromptWithHistory(session);
        if (!this.provider) {
            throw new Error('Provider not set');
        }
        // Check if provider supports streaming
        const providerAny = this.provider;
        if (typeof providerAny.streamGenerate === 'function') {
            let fullResponse = '';
            await providerAny.streamGenerate(prompt, {}, (token) => {
                fullResponse += token;
                onToken(token);
            });
            // Add assistant message
            session.messages.push({
                role: 'assistant',
                content: fullResponse,
                timestamp: Date.now(),
            });
        }
        else {
            // Fallback to non-streaming
            const response = await this.provider.generateText(prompt);
            onToken(response);
            session.messages.push({
                role: 'assistant',
                content: response,
                timestamp: Date.now(),
            });
        }
        session.updatedAt = Date.now();
    }
    /**
     * Get conversation history
     */
    async getConversationHistory(sessionId) {
        const session = this.getSession(sessionId);
        return [...session.messages];
    }
    /**
     * Clear conversation memory
     */
    async clearSession(sessionId) {
        const session = this.getSession(sessionId);
        session.messages = [];
        session.updatedAt = Date.now();
    }
    /**
     * Delete a session
     */
    deleteSession(sessionId) {
        this.sessions.delete(sessionId);
        if (this.currentSessionId === sessionId) {
            this.currentSessionId = null;
        }
    }
    /**
     * Get all session IDs
     */
    getAllSessions() {
        return Array.from(this.sessions.keys());
    }
    /**
     * Set current session
     */
    setCurrentSession(sessionId) {
        if (!this.sessions.has(sessionId)) {
            throw new Error(`Session ${sessionId} not found`);
        }
        this.currentSessionId = sessionId;
    }
    /**
     * Get current session ID
     */
    getCurrentSessionId() {
        return this.currentSessionId;
    }
    /**
     * Get provider type
     */
    getProviderType() {
        return this.providerType;
    }
    /**
     * Get session
     */
    getSession(sessionId) {
        const id = sessionId || this.currentSessionId;
        if (!id) {
            throw new Error('No session ID provided and no current session set');
        }
        const session = this.sessions.get(id);
        if (!session) {
            throw new Error(`Session ${id} not found`);
        }
        return session;
    }
    /**
     * Build prompt with conversation history
     */
    buildPromptWithHistory(session) {
        let prompt = '';
        // Add conversation history
        for (const msg of session.messages) {
            if (msg.role === 'user') {
                prompt += `User: ${msg.content}\n\n`;
            }
            else if (msg.role === 'assistant') {
                prompt += `Assistant: ${msg.content}\n\n`;
            }
            else if (msg.role === 'system') {
                prompt += `System: ${msg.content}\n\n`;
            }
        }
        return prompt;
    }
}
exports.LangChainService = LangChainService;
//# sourceMappingURL=LangChainService.js.map