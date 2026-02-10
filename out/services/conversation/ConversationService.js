"use strict";
/**
 * Conversation Service: Manages conversation persistence and retrieval
 * Stores conversations in .verno/conversations/ directory
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Service for managing conversation persistence and retrieval
 */
class ConversationService {
    workspaceRoot;
    conversationsDir;
    conversations = new Map();
    currentConversationId = null;
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this.conversationsDir = path.join(workspaceRoot, '.verno', 'conversations');
        this.ensureDirectoryExists();
        this.loadAllConversations();
    }
    /**
     * Create a new conversation
     * @param title Conversation title
     * @param mode Conversation mode (planning, development, chat)
     * @returns Conversation ID
     */
    createConversation(title, mode) {
        const id = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const conversation = {
            id,
            title,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            mode: mode || 'chat',
        };
        this.conversations.set(id, conversation);
        this.currentConversationId = id;
        this.saveConversation(conversation);
        return id;
    }
    /**
     * Add a message to a conversation
     * @param conversationId Conversation ID
     * @param role Message role
     * @param content Message content
     * @param agentId Optional agent identifier
     */
    addMessage(conversationId, role, content, agentId) {
        const conversation = this.getConversation(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} not found`);
        }
        const message = {
            role,
            content,
            timestamp: Date.now(),
            agentId,
        };
        conversation.messages.push(message);
        conversation.updatedAt = Date.now();
        this.saveConversation(conversation);
    }
    /**
     * Get a conversation by ID
     * @param conversationId Conversation ID
     * @returns Conversation or null
     */
    getConversation(conversationId) {
        return this.conversations.get(conversationId) || null;
    }
    /**
     * Get all conversations
     * @returns Array of conversations sorted by update time
     */
    getAllConversations() {
        return Array.from(this.conversations.values())
            .sort((a, b) => b.updatedAt - a.updatedAt);
    }
    /**
     * Get current conversation
     * @returns Current conversation or null
     */
    getCurrentConversation() {
        if (!this.currentConversationId) {
            return null;
        }
        return this.getConversation(this.currentConversationId);
    }
    /**
     * Set the current active conversation
     * @param conversationId Conversation ID
     */
    setCurrentConversation(conversationId) {
        if (!this.conversations.has(conversationId)) {
            throw new Error(`Conversation ${conversationId} not found`);
        }
        this.currentConversationId = conversationId;
    }
    /**
     * Delete a conversation
     * @param conversationId Conversation ID
     */
    deleteConversation(conversationId) {
        const filePath = this.getConversationFilePath(conversationId);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        this.conversations.delete(conversationId);
        if (this.currentConversationId === conversationId) {
            this.currentConversationId = null;
        }
    }
    /**
     * Export a conversation to JSON
     * @param conversationId Conversation ID
     * @param exportPath Export file path
     */
    exportConversation(conversationId, exportPath) {
        const conversation = this.getConversation(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} not found`);
        }
        fs.writeFileSync(exportPath, JSON.stringify(conversation, null, 2), 'utf-8');
    }
    /**
     * Import a conversation from JSON
     * @param importPath Import file path
     * @returns Imported conversation ID
     */
    importConversation(importPath) {
        const data = fs.readFileSync(importPath, 'utf-8');
        const conversation = JSON.parse(data);
        // Generate new ID to avoid conflicts
        const newId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        conversation.id = newId;
        this.conversations.set(newId, conversation);
        this.saveConversation(conversation);
        return newId;
    }
    /**
     * Get conversation messages as text
     * @param conversationId Conversation ID
     * @returns Formatted conversation text
     */
    getConversationAsText(conversationId) {
        const conversation = this.getConversation(conversationId);
        if (!conversation) {
            return '';
        }
        let text = `Conversation: ${conversation.title}\n`;
        text += `Mode: ${conversation.mode}\n\n`;
        for (const msg of conversation.messages) {
            const roleLabel = msg.role.toUpperCase();
            const agentLabel = msg.agentId ? ` [${msg.agentId}]` : '';
            text += `${roleLabel}${agentLabel}: ${msg.content}\n\n`;
        }
        return text;
    }
    /**
     * Clear all messages from a conversation
     * @param conversationId Conversation ID
     */
    clearMessages(conversationId) {
        const conversation = this.getConversation(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} not found`);
        }
        conversation.messages = [];
        conversation.updatedAt = Date.now();
        this.saveConversation(conversation);
    }
    /**
     * Save a conversation to disk
     */
    saveConversation(conversation) {
        try {
            const filePath = this.getConversationFilePath(conversation.id);
            fs.writeFileSync(filePath, JSON.stringify(conversation, null, 2), 'utf-8');
        }
        catch (err) {
            console.error(`Failed to save conversation ${conversation.id}:`, err);
        }
    }
    /**
     * Load all conversations from disk
     */
    loadAllConversations() {
        try {
            if (!fs.existsSync(this.conversationsDir)) {
                return;
            }
            const files = fs.readdirSync(this.conversationsDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(this.conversationsDir, file);
                    const data = fs.readFileSync(filePath, 'utf-8');
                    const conversation = JSON.parse(data);
                    this.conversations.set(conversation.id, conversation);
                }
            }
        }
        catch (err) {
            console.error('Failed to load conversations:', err);
        }
    }
    /**
     * Ensure conversations directory exists
     */
    ensureDirectoryExists() {
        if (!fs.existsSync(this.conversationsDir)) {
            fs.mkdirSync(this.conversationsDir, { recursive: true });
        }
    }
    /**
     * Get file path for a conversation
     */
    getConversationFilePath(conversationId) {
        return path.join(this.conversationsDir, `${conversationId}.json`);
    }
}
exports.ConversationService = ConversationService;
//# sourceMappingURL=ConversationService.js.map