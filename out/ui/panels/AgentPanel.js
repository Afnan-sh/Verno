"use strict";
/**
 * VS Code sidebar panel for agent status
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPanel = void 0;
class AgentPanel {
    context;
    webviewView = null;
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
}
exports.AgentPanel = AgentPanel;
//# sourceMappingURL=AgentPanel.js.map