"use strict";
/**
 * VS Code sidebar panel for agent status
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPanel = void 0;
class AgentPanel {
    context;
    webviewView;
    conversationHistory = [];
    constructor(context) {
        this.context = context;
    }
    /**
     * Set the webview view from the sidebar provider
     */
    setWebviewView(webviewView) {
        this.webviewView = webviewView;
    }
    /**
     * Send a message to the sidebar webview
     */
    postMessage(message) {
        if (this.webviewView) {
            this.webviewView.webview.postMessage(message);
        }
    }
    /**
     * Notify that recording has started
     */
    notifyRecordingStarted() {
        this.postMessage({ type: 'recordingStarted' });
    }
    /**
     * Notify that recording has stopped
     */
    notifyRecordingStopped() {
        this.postMessage({ type: 'recordingStopped' });
    }
    /**
     * Notify that processing has started
     */
    notifyProcessingStarted() {
        this.postMessage({ type: 'processingStarted' });
    }
    /**
     * Notify that processing is complete
     */
    notifyProcessingComplete() {
        this.postMessage({ type: 'processingComplete' });
    }
    /**
     * Update agent status (legacy method for compatibility)
     */
    updateStatus(agentName, status) {
        // Status updates are handled through notification methods
    }
    /**
     * Display conversation history
     */
    displayConversation(messages) {
        this.conversationHistory = messages;
        this.postMessage({
            type: 'conversationHistory',
            messages: messages
        });
    }
    /**
     * Add a new message to conversation
     */
    /**
     * Add a new message to conversation
     * @param silent If true, adds to history but does not send to webview (prevents double echo)
     */
    addMessage(role, content, options) {
        const message = {
            role,
            content,
            timestamp: new Date().toISOString()
        };
        this.conversationHistory.push(message);
        if (!options?.silent) {
            this.postMessage({
                type: 'newMessage',
                message
            });
        }
    }
    /**
     * Show thinking indicator
     */
    showThinking(show) {
        this.postMessage({
            type: 'thinking',
            show
        });
    }
    /**
     * Clear conversation
     */
    clearConversation() {
        this.conversationHistory = [];
        this.postMessage({ type: 'clearConversation' });
    }
    /**
     * Send context usage update
     */
    updateContextUsage(used, total) {
        this.postMessage({
            type: 'contextUsage',
            used,
            total
        });
    }
}
exports.AgentPanel = AgentPanel;
//# sourceMappingURL=AgentPanel.js.map