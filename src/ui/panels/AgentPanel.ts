/**
 * VS Code sidebar panel for agent status
 */

import * as vscode from 'vscode';

export class AgentPanel {
  private panel: vscode.WebviewPanel | null = null;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  show(): void {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      'agentPanel',
      'Agent Status',
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'ui', 'webviews')]
      }
    );

    // TODO: Set webview HTML content
    this.panel.onDidDispose(() => {
      this.panel = null;
    });
  }

  updateStatus(agentName: string, status: string): void {
    if (this.panel) {
      // TODO: Update webview content
    }
  }
}
