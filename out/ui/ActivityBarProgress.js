"use strict";
/**
 * Progress Display Component for Activity Bar
 * Shows real-time agent progress in VSCode activity bar
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
exports.ActivityBarProgress = void 0;
const vscode = __importStar(require("vscode"));
class ActivityBarProgress {
    statusBarItem;
    progressIndicator;
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.text = '$(pulse) Verno Ready';
        this.statusBarItem.show();
    }
    /**
     * Attach to a progress indicator
     */
    attachProgressIndicator(progressIndicator) {
        this.progressIndicator = progressIndicator;
        // Listen to progress updates
        this.progressIndicator.addListener((state) => {
            this.updateDisplay(state);
        });
    }
    /**
     * Update progress manually
     */
    updateProgress(stage, percentage) {
        const agentName = stage.replace('Agent', '');
        this.statusBarItem.text = `$(sync~spin) ${agentName}: ${percentage}%`;
        this.statusBarItem.tooltip = `Processing: ${stage}`;
    }
    /**
     * Mark as complete
     */
    complete() {
        this.statusBarItem.text = '$(check) Verno Complete';
        this.statusBarItem.tooltip = 'Task completed successfully';
        // Reset to ready state after 3 seconds
        setTimeout(() => {
            this.statusBarItem.text = '$(pulse) Verno Ready';
            this.statusBarItem.tooltip = undefined;
        }, 3000);
    }
    /**
     * Update the status bar display
     */
    updateDisplay(state) {
        if (state.status === 'idle') {
            this.statusBarItem.text = '$(pulse) Verno Ready';
            this.statusBarItem.tooltip = 'No active agents';
        }
        else if (state.status === 'running') {
            const percentage = Math.round(state.percentage);
            const timeRemaining = state.estimatedTimeRemaining
                ? ` (~${Math.round(state.estimatedTimeRemaining / 1000)}s remaining)`
                : '';
            this.statusBarItem.text = `$(sync~spin) ${state.currentAgent}: ${percentage}%`;
            this.statusBarItem.tooltip = `Stage: ${state.currentStage}\n${state.completedStages}/${state.totalStages} stages complete${timeRemaining}`;
        }
        else if (state.status === 'completed') {
            this.complete();
        }
        else if (state.status === 'error') {
            this.statusBarItem.text = '$(error) Verno Error';
            this.statusBarItem.tooltip = 'An error occurred during execution';
        }
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.ActivityBarProgress = ActivityBarProgress;
//# sourceMappingURL=ActivityBarProgress.js.map