/**
 * Logging utility
 */

import * as vscode from 'vscode';

export class Logger {
  private outputChannel: vscode.OutputChannel;

  constructor(channelName: string = 'Verno') {
    this.outputChannel = vscode.window.createOutputChannel(channelName);
  }

  info(message: string): void {
    this.log(message, 'INFO');
  }

  warn(message: string): void {
    this.log(message, 'WARN');
  }

  error(message: string, error?: Error): void {
    this.log(message, 'ERROR');
    if (error) {
      this.outputChannel.appendLine(error.stack || error.message);
    }
  }

  debug(message: string): void {
    this.log(message, 'DEBUG');
  }

  private log(message: string, level: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] [${level}] ${message}`);
  }

  show(): void {
    this.outputChannel.show();
  }

  dispose(): void {
    this.outputChannel.dispose();
  }
}
