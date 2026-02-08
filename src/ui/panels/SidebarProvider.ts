import * as vscode from 'vscode';
import { Logger } from '../../utils/logger';

export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'verno.agentPanel';
    private logger: Logger;
    private onResolve?: (view: vscode.WebviewView) => void;

    constructor(
        private readonly context: vscode.ExtensionContext,
        logger: Logger,
        onResolve?: (view: vscode.WebviewView) => void
    ) {
        this.logger = logger;
        this.onResolve = onResolve;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'out'),
                vscode.Uri.joinPath(this.context.extensionUri, 'media')
            ]
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        this.logger?.info('SidebarProvider resolved');

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            this.logger.info(`Message received: ${data.type}`);
            switch (data.type) {
                case 'startRecording':
                    await vscode.commands.executeCommand('verno.startRecording');
                    break;
                case 'stopRecording':
                    await vscode.commands.executeCommand('verno.stopRecording');
                    break;
                case 'processInputSubmit':
                    // Send data to your command handler
                    await vscode.commands.executeCommand('verno.processInputWithData', data.apiKey, data.input);
                    break;
                case 'manageAgents':
                    await vscode.commands.executeCommand('verno.manageAgents');
                    break;
            }
        });

        this.onResolve?.(webviewView);
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const nonce = getNonce();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <style>
                body { padding: 12px; font-family: var(--vscode-font-family); color: var(--vscode-foreground); background-color: var(--vscode-sideBar-background); }
                .page { display: none; }
                .page.active { display: flex; flex-direction: column; gap: 12px; }
                h3 { font-size: 11px; text-transform: uppercase; opacity: 0.8; margin: 0; }
                input, textarea { background: var(--vscode-input-background); color: var(--vscode-foreground); border: 1px solid var(--vscode-sideBar-border); padding: 8px; border-radius: 4px; }
                .row { display: flex; gap: 8px; }
                button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 6px 12px; cursor: pointer; border-radius: 2px; }
                button:hover { background: var(--vscode-button-hoverBackground); }
                button.secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
                .output { font-size: 11px; padding: 8px; background: var(--vscode-input-background); border-radius: 4px; min-height: 20px; }
            </style>
        </head>
        <body>
            <div id="page-api" class="page active">
                <h3>Setup Gemini</h3>
                <input id="apiKey" type="password" placeholder="Enter API Key..." />
                <button id="saveApi">Connect</button>
            </div>

            <div id="page-api-confirm" class="page">
                <h3>API Key Found</h3>
                <p style="font-size: 12px; color: var(--vscode-descriptionForeground); margin: 8px 0;">You have a saved API key. Would you like to use it?</p>
                <div class="row">
                    <button id="useExistingApi">Use Existing</button>
                    <button id="changeApi" class="secondary">Enter New Key</button>
                </div>
            </div>

            <div id="page-mode" class="page">
                <h3>Select Input</h3>
                <div class="row">
                    <button id="textMode">Keyboard</button>
                    <button id="voiceMode" class="secondary">Voice</button>
                </div>
            </div>

            <div id="page-text" class="page">
                <h3>Request</h3>
                <textarea id="textInput" rows="4" placeholder="What should I build?"></textarea>
                <div class="row">
                    <button id="textSubmit">Submit</button>
                    <button id="textBack" class="secondary">Back</button>
                </div>
                <div id="textOutput" class="output">Ready</div>
            </div>

            <div id="page-voice" class="page">
                <h3>Voice Control</h3>
                <div id="voiceStatus" class="output">Idle</div>
                <div class="row">
                    <button id="voiceStart">Start</button>
                    <button id="voiceStop" class="secondary" disabled>Stop</button>
                    <button id="voiceBack" class="secondary">Back</button>
                </div>
            </div>

            <div id="page-workflow" class="page">
                <h3>Workflow Plan</h3>
                <div id="workflowSteps" class="output" style="white-space: pre-wrap; overflow-y: auto; max-height: 300px;"></div>
                <div class="row">
                    <button id="workflowBack" class="secondary">Back</button>
                </div>
            </div>

            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                let state = vscode.getState() || {};

                function show(pageId) {
                    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                    document.getElementById(pageId).classList.add('active');
                }

                // Restore state - show confirmation if key exists
                if (state.apiKey) {
                    show('page-api-confirm');
                }

                // Page Navigation & Actions
                document.getElementById('saveApi').addEventListener('click', () => {
                    const key = document.getElementById('apiKey').value;
                    if (key) {
                        state.apiKey = key;
                        vscode.setState(state);
                        show('page-mode');
                    }
                });

                document.getElementById('useExistingApi').addEventListener('click', () => {
                    show('page-mode');
                });

                document.getElementById('changeApi').addEventListener('click', () => {
                    document.getElementById('apiKey').value = '';
                    show('page-api');
                });

                document.getElementById('textMode').addEventListener('click', () => show('page-text'));
                document.getElementById('voiceMode').addEventListener('click', () => show('page-voice'));
                document.getElementById('textBack').addEventListener('click', () => show('page-mode'));
                document.getElementById('voiceBack').addEventListener('click', () => show('page-mode'));
                document.getElementById('workflowBack').addEventListener('click', () => show('page-mode'));

                document.getElementById('textSubmit').addEventListener('click', () => {
                    const input = document.getElementById('textInput').value;
                    document.getElementById('textOutput').textContent = 'Processing...';
                    vscode.postMessage({ type: 'processInputSubmit', apiKey: state.apiKey, input });
                });

                document.getElementById('voiceStart').addEventListener('click', () => {
                    vscode.postMessage({ type: 'startRecording' });
                    document.getElementById('voiceStart').disabled = true;
                    document.getElementById('voiceStop').disabled = false;
                    document.getElementById('voiceStatus').textContent = 'Listening...';
                });

                document.getElementById('voiceStop').addEventListener('click', () => {
                    vscode.postMessage({ type: 'stopRecording' });
                    document.getElementById('voiceStart').disabled = false;
                    document.getElementById('voiceStop').disabled = true;
                    document.getElementById('voiceStatus').textContent = 'Stopped';
                });

                window.addEventListener('message', event => {
                    const msg = event.data;
                    if (msg.type === 'processingComplete') {
                        document.getElementById('textOutput').textContent = 'Done!';
                    } else if (msg.type === 'workflowSteps') {
                        const steps = msg.steps;
                        let stepsHtml = '';
                        if (Array.isArray(steps)) {
                            steps.forEach(step => {
                                stepsHtml += 'Step ' + step.step + ': ' + step.name + '\\n' + step.description + '\\n\\n';
                            });
                        } else {
                            stepsHtml = JSON.stringify(steps, null, 2);
                        }
                        document.getElementById('workflowSteps').textContent = stepsHtml;
                        show('page-workflow');
                    }
                });
            </script>
        </body>
        </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}