"use strict";
/**
 * Feedback Service: Manages agent feedback collection and aggregation
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
exports.FeedbackService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Service for managing agent feedback
 */
class FeedbackService {
    workspaceRoot;
    feedbackDir;
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this.feedbackDir = path.join(workspaceRoot, '.verno', 'feedback');
        this.ensureDirectoryExists();
    }
    /**
     * Create feedback for an agent
     */
    createFeedback(agentName, completedTasks, remainingWork, issuesEncountered, suggestions, nextSteps) {
        const feedback = {
            agentName,
            timestamp: Date.now(),
            completedTasks,
            remainingWork,
            issuesEncountered,
            suggestions,
            nextSteps,
        };
        this.saveFeedback(feedback);
        return feedback;
    }
    /**
     * Get the latest feedback for an agent
     */
    getLatestFeedback(agentName) {
        const agentDir = path.join(this.feedbackDir, agentName);
        if (!fs.existsSync(agentDir)) {
            return null;
        }
        const files = fs.readdirSync(agentDir)
            .filter(f => f.endsWith('.json'))
            .sort()
            .reverse();
        if (files.length === 0) {
            return null;
        }
        const filePath = path.join(agentDir, files[0]);
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    }
    /**
     * Get all feedback for an agent
     */
    getAllFeedback(agentName) {
        const agentDir = path.join(this.feedbackDir, agentName);
        if (!fs.existsSync(agentDir)) {
            return [];
        }
        const files = fs.readdirSync(agentDir)
            .filter(f => f.endsWith('.json'))
            .sort()
            .reverse();
        return files.map(file => {
            const filePath = path.join(agentDir, file);
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        });
    }
    /**
     * Get feedback from all agents
     */
    getAllAgentsFeedback() {
        const feedbackMap = new Map();
        if (!fs.existsSync(this.feedbackDir)) {
            return feedbackMap;
        }
        const agentDirs = fs.readdirSync(this.feedbackDir)
            .filter(f => {
            const stat = fs.statSync(path.join(this.feedbackDir, f));
            return stat.isDirectory();
        });
        for (const agentName of agentDirs) {
            const feedback = this.getAllFeedback(agentName);
            if (feedback.length > 0) {
                feedbackMap.set(agentName, feedback);
            }
        }
        return feedbackMap;
    }
    /**
     * Get aggregated feedback summary
     */
    getFeedbackSummary() {
        let summary = '# Feedback Summary\n\n';
        const allFeedback = this.getAllAgentsFeedback();
        for (const [agentName, feedbackList] of allFeedback.entries()) {
            const latest = feedbackList[0];
            if (!latest)
                continue;
            summary += `## ${agentName}\n`;
            summary += `Last Updated: ${new Date(latest.timestamp).toLocaleString()}\n\n`;
            summary += `### Completed Tasks\n`;
            latest.completedTasks.forEach(task => {
                summary += `- ✓ ${task}\n`;
            });
            summary += '\n';
            summary += `### Remaining Work\n`;
            latest.remainingWork.forEach(work => {
                summary += `- [ ] ${work}\n`;
            });
            summary += '\n';
            if (latest.issuesEncountered.length > 0) {
                summary += `### Issues Encountered\n`;
                latest.issuesEncountered.forEach(issue => {
                    const icon = this.getSeverityIcon(issue.severity);
                    summary += `- ${icon} **${issue.severity.toUpperCase()}**: ${issue.description}\n`;
                    summary += `  Context: ${issue.context}\n`;
                });
                summary += '\n';
            }
            if (latest.suggestions.length > 0) {
                summary += `### Suggestions\n`;
                latest.suggestions.forEach(suggestion => {
                    summary += `- 💡 ${suggestion}\n`;
                });
                summary += '\n';
            }
            if (latest.nextSteps.length > 0) {
                summary += `### Next Steps\n`;
                latest.nextSteps.forEach(step => {
                    summary += `- ➡️ ${step}\n`;
                });
                summary += '\n';
            }
            summary += '---\n\n';
        }
        return summary;
    }
    /**
     * Get critical issues from all agents
     */
    getCriticalIssues() {
        const allFeedback = this.getAllAgentsFeedback();
        const criticalIssues = [];
        for (const feedbackList of allFeedback.values()) {
            const latest = feedbackList[0];
            if (latest) {
                const critical = latest.issuesEncountered.filter(issue => issue.severity === 'critical' || issue.severity === 'high');
                criticalIssues.push(...critical);
            }
        }
        return criticalIssues;
    }
    /**
     * Clear all feedback for an agent
     */
    clearAgentFeedback(agentName) {
        const agentDir = path.join(this.feedbackDir, agentName);
        if (fs.existsSync(agentDir)) {
            fs.rmSync(agentDir, { recursive: true, force: true });
        }
    }
    /**
     * Clear all feedback
     */
    clearAllFeedback() {
        if (fs.existsSync(this.feedbackDir)) {
            fs.rmSync(this.feedbackDir, { recursive: true, force: true });
            this.ensureDirectoryExists();
        }
    }
    /**
     * Save feedback to disk
     */
    saveFeedback(feedback) {
        try {
            const agentDir = path.join(this.feedbackDir, feedback.agentName);
            if (!fs.existsSync(agentDir)) {
                fs.mkdirSync(agentDir, { recursive: true });
            }
            const filename = `feedback-${feedback.timestamp}.json`;
            const filePath = path.join(agentDir, filename);
            fs.writeFileSync(filePath, JSON.stringify(feedback, null, 2), 'utf-8');
        }
        catch (err) {
            console.error(`Failed to save feedback for ${feedback.agentName}:`, err);
        }
    }
    /**
     * Ensure feedback directory exists
     */
    ensureDirectoryExists() {
        if (!fs.existsSync(this.feedbackDir)) {
            fs.mkdirSync(this.feedbackDir, { recursive: true });
        }
    }
    /**
     * Get severity icon
     */
    getSeverityIcon(severity) {
        switch (severity) {
            case 'critical':
                return '🔴';
            case 'high':
                return '🟠';
            case 'medium':
                return '🟡';
            case 'low':
                return '🟢';
            default:
                return '⚪';
        }
    }
}
exports.FeedbackService = FeedbackService;
//# sourceMappingURL=FeedbackService.js.map