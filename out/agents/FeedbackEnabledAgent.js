"use strict";
/**
 * Enhanced Base Agent with Feedback Support
 * Extension module for adding feedback generation to existing agents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackEnabledAgent = void 0;
const BaseAgent_1 = require("./base/BaseAgent");
const feedback_1 = require("../services/feedback");
/**
 * Agent with feedback capabilities
 */
class FeedbackEnabledAgent extends BaseAgent_1.BaseAgent {
    feedbackService = null;
    /**
     * Initialize feedback service
     */
    initializeFeedback(workspaceRoot) {
        this.feedbackService = new feedback_1.FeedbackService(workspaceRoot);
    }
    /**
     * Generate feedback after task execution
     */
    async generateFeedback(params) {
        if (!this.feedbackService) {
            this.logger?.warn('Feedback service not initialized');
            return;
        }
        this.feedbackService.createFeedback(params.agentName, params.completedTasks, params.remainingWork, params.issuesEncountered, params.suggestions, params.nextSteps);
    }
    /**
     * Create issue helper
     */
    createIssue(severity, description, context) {
        return { severity, description, context };
    }
}
exports.FeedbackEnabledAgent = FeedbackEnabledAgent;
//# sourceMappingURL=FeedbackEnabledAgent.js.map