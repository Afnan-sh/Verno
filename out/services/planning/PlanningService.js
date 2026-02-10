"use strict";
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
exports.PlanningService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Manages planning sessions and conversation history
 */
class PlanningService {
    workspaceRoot;
    sessions = new Map();
    currentSessionId = null;
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this.loadSessions();
    }
    /**
     * Create a new planning session
     */
    createSession(userRequest) {
        const sessionId = `plan-${Date.now()}`;
        const session = {
            id: sessionId,
            userRequest,
            conversationHistory: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this.sessions.set(sessionId, session);
        this.currentSessionId = sessionId;
        this.saveSessions();
        return sessionId;
    }
    /**
     * Add a message to the current planning session
     */
    addMessage(role, content) {
        if (!this.currentSessionId) {
            throw new Error('No active planning session');
        }
        const session = this.sessions.get(this.currentSessionId);
        if (!session) {
            throw new Error('Session not found');
        }
        session.conversationHistory.push({
            role,
            content,
            timestamp: Date.now()
        });
        session.updatedAt = Date.now();
        this.saveSessions();
    }
    /**
     * Get the current session
     */
    getCurrentSession() {
        if (!this.currentSessionId)
            return null;
        return this.sessions.get(this.currentSessionId) || null;
    }
    /**
     * Get all sessions
     */
    getAllSessions() {
        return Array.from(this.sessions.values()).sort((a, b) => b.updatedAt - a.updatedAt);
    }
    /**
     * Set the active session
     */
    setCurrentSession(sessionId) {
        if (!this.sessions.has(sessionId)) {
            throw new Error(`Session ${sessionId} not found`);
        }
        this.currentSessionId = sessionId;
    }
    /**
     * Get conversation history as text
     */
    getConversationAsText(sessionId) {
        const session = this.sessions.get(sessionId || this.currentSessionId || '');
        if (!session)
            return '';
        let text = `Planning Session: ${session.userRequest}\n\n`;
        for (const msg of session.conversationHistory) {
            text += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
        }
        return text;
    }
    /**
     * Get conversation history for context injection
     */
    getConversationForContext(sessionId) {
        return this.getConversationAsText(sessionId);
    }
    /**
     * Save sessions to disk
     */
    saveSessions() {
        try {
            const planningDir = path.join(this.workspaceRoot, '.verno-planning');
            if (!fs.existsSync(planningDir)) {
                fs.mkdirSync(planningDir, { recursive: true });
            }
            const indexPath = path.join(planningDir, 'sessions.json');
            fs.writeFileSync(indexPath, JSON.stringify(Array.from(this.sessions.values()), null, 2), 'utf-8');
        }
        catch (err) {
            console.error('Failed to save planning sessions:', err);
        }
    }
    /**
     * Load sessions from disk
     */
    loadSessions() {
        try {
            const planningDir = path.join(this.workspaceRoot, '.verno-planning');
            const indexPath = path.join(planningDir, 'sessions.json');
            if (fs.existsSync(indexPath)) {
                const data = fs.readFileSync(indexPath, 'utf-8');
                const sessions = JSON.parse(data);
                for (const session of sessions) {
                    this.sessions.set(session.id, session);
                }
            }
        }
        catch (err) {
            console.error('Failed to load planning sessions:', err);
        }
    }
}
exports.PlanningService = PlanningService;
//# sourceMappingURL=PlanningService.js.map