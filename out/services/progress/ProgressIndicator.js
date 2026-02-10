"use strict";
/**
 * Progress Indicator Service: Tracks agent pipeline execution progress
 * Emits events for UI updates
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
exports.ProgressIndicator = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Service for tracking and reporting agent pipeline progress
 */
class ProgressIndicator {
    currentState;
    listeners = [];
    stageStartTimes = new Map();
    stageDurations = new Map();
    constructor() {
        this.currentState = {
            currentStage: '',
            currentAgent: '',
            totalStages: 0,
            completedStages: 0,
            percentage: 0,
            status: 'idle',
        };
    }
    /**
     * Initialize progress tracking for a pipeline
     * @param stages Array of stage names
     */
    initialize(stages) {
        this.currentState = {
            currentStage: '',
            currentAgent: '',
            totalStages: stages.length,
            completedStages: 0,
            percentage: 0,
            status: 'idle',
        };
        this.stageStartTimes.clear();
        this.notifyListeners();
    }
    /**
     * Start a new stage
     * @param stageName Name of the stage
     * @param agentName Name of the agent executing the stage
     */
    startStage(stageName, agentName) {
        this.currentState.currentStage = stageName;
        this.currentState.currentAgent = agentName;
        this.currentState.status = 'running';
        this.stageStartTimes.set(stageName, Date.now());
        this.updatePercentage();
        this.calculateEstimatedTime();
        this.notifyListeners();
        // Show VSCode progress notification
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Verno: ${agentName}`,
            cancellable: false,
        }, async (progress) => {
            progress.report({ message: `Running stage: ${stageName}` });
            // Progress notification will auto-close when stage completes
        });
    }
    /**
     * Complete the current stage
     */
    completeStage() {
        const stageName = this.currentState.currentStage;
        if (stageName && this.stageStartTimes.has(stageName)) {
            const duration = Date.now() - this.stageStartTimes.get(stageName);
            this.stageDurations.set(stageName, duration);
        }
        this.currentState.completedStages++;
        this.updatePercentage();
        this.calculateEstimatedTime();
        this.notifyListeners();
    }
    /**
     * Mark pipeline as completed
     */
    complete() {
        this.currentState.status = 'completed';
        this.currentState.percentage = 100;
        this.currentState.estimatedTimeRemaining = 0;
        this.notifyListeners();
        vscode.window.showInformationMessage('Verno: Pipeline completed successfully!');
    }
    /**
     * Mark pipeline as failed
     * @param error Error message
     */
    error(error) {
        this.currentState.status = 'error';
        this.notifyListeners();
        vscode.window.showErrorMessage(`Verno: Pipeline failed - ${error}`);
    }
    /**
     * Get current progress state
     */
    getState() {
        return { ...this.currentState };
    }
    /**
     * Add a progress listener
     * @param listener Callback function
     */
    addListener(listener) {
        this.listeners.push(listener);
    }
    /**
     * Remove a progress listener
     * @param listener Callback function to remove
     */
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
    /**
     * Reset progress state
     */
    reset() {
        this.currentState = {
            currentStage: '',
            currentAgent: '',
            totalStages: 0,
            completedStages: 0,
            percentage: 0,
            status: 'idle',
        };
        this.stageStartTimes.clear();
        this.stageDurations.clear();
        this.notifyListeners();
    }
    /**
     * Update percentage completion
     */
    updatePercentage() {
        if (this.currentState.totalStages === 0) {
            this.currentState.percentage = 0;
            return;
        }
        this.currentState.percentage = Math.round((this.currentState.completedStages / this.currentState.totalStages) * 100);
    }
    /**
     * Calculate estimated time remaining based on completed stage durations
     */
    calculateEstimatedTime() {
        if (this.stageDurations.size === 0) {
            this.currentState.estimatedTimeRemaining = undefined;
            return;
        }
        // Calculate average stage duration
        const totalDuration = Array.from(this.stageDurations.values()).reduce((a, b) => a + b, 0);
        const avgDuration = totalDuration / this.stageDurations.size;
        // Estimate remaining time
        const remainingStages = this.currentState.totalStages - this.currentState.completedStages;
        this.currentState.estimatedTimeRemaining = Math.round(avgDuration * remainingStages / 1000); // Convert to seconds
    }
    /**
     * Notify all listeners of state change
     */
    notifyListeners() {
        for (const listener of this.listeners) {
            try {
                listener(this.currentState);
            }
            catch (err) {
                console.error('Error in progress listener:', err);
            }
        }
    }
    /**
     * Format time for display
     * @param seconds Time in seconds
     * @returns Formatted string
     */
    static formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }
}
exports.ProgressIndicator = ProgressIndicator;
//# sourceMappingURL=ProgressIndicator.js.map