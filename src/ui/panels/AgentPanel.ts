/**
 * VS Code sidebar panel for agent status
 */

import * as vscode from 'vscode';

export class AgentPanel {
  private webviewView: vscode.WebviewView | null = null;

  constructor(private context: vscode.ExtensionContext) {}

  /**
   * Set the webview view from the sidebar provider
   */
  setWebviewView(webviewView: vscode.WebviewView): void {
    this.webviewView = webviewView;
  }

  /**
   * Send a message to the sidebar webview
   */
  postMessage(message: any): void {
    if (this.webviewView) {
      this.webviewView.webview.postMessage(message);
    }
  }

  /**
   * Notify that recording has started
   */
  notifyRecordingStarted(): void {
    this.postMessage({ type: 'recordingStarted' });
  }

  /**
   * Notify that recording has stopped
   */
  notifyRecordingStopped(): void {
    this.postMessage({ type: 'recordingStopped' });
  }

  /**
   * Notify that processing has started
   */
  notifyProcessingStarted(): void {
    this.postMessage({ type: 'processingStarted' });
  }

  /**
   * Notify that processing is complete
   */
  notifyProcessingComplete(): void {
    this.postMessage({ type: 'processingComplete' });
  }

  /**
   * Update agent status (legacy method for compatibility)
   */
  updateStatus(agentName: string, status: string): void {
    // Status updates are handled through notification methods
  }
}
