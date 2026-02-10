"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalystAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
const feedback_1 = require("../../services/feedback");
/**
 * Enhanced Analyst Agent with Feedback Capabilities
 * Generates business analysis and provides feedback on completed work
 */
class AnalystAgent extends BaseAgent_1.BaseAgent {
    logger;
    llmService;
    fileService;
    changeTracker;
    name = 'analyst';
    description = 'Business Analyst - Market research, competitive analysis, requirements elicitation';
    feedbackService;
    constructor(logger, llmService, fileService, changeTracker) {
        super(logger);
        this.logger = logger;
        this.llmService = llmService;
        this.fileService = fileService;
        this.changeTracker = changeTracker;
    }
    async execute(context) {
        this.log('Running analyst (Mary) - Business Analysis');
        // Initialize feedback service
        if (context.workspaceRoot) {
            this.feedbackService = new feedback_1.FeedbackService(context.workspaceRoot);
        }
        const prompt = `You are Mary, a senior business analyst.
User Request: ${context.metadata?.userRequest || 'analyze project'}

Provide a CONCISE, HIGH-SIGNAL business analysis in markdown.
Focus on:
- Core Features & Requirements (Must-haves)
- Technical Constraints
- Critical Success Factors

DO NOT provide generic market research, obvious definitions, or fluff.
DO NOT use phrases like "In the current digital landscape" or "Market research indicates".
Get straight to the point. Bullet points are preferred.`;
        let buffer = '';
        const completedTasks = [];
        const issues = [];
        try {
            await this.llmService.streamGenerate(prompt, undefined, (token) => {
                buffer += token;
            });
            completedTasks.push('Completed business analysis');
            completedTasks.push('Identified key requirements');
            // Write analysis to file
            if (context.workspaceRoot) {
                const analysisPath = `${context.workspaceRoot}/ANALYSIS.md`;
                try {
                    await this.fileService.createFile(analysisPath, buffer);
                    this.changeTracker.recordChange(analysisPath, buffer);
                    this.log(`Analysis saved to ${analysisPath}`);
                    completedTasks.push(`Saved analysis to ${analysisPath}`);
                }
                catch (err) {
                    this.log(`Failed to write analysis: ${err}`, 'error');
                    issues.push({
                        severity: 'high',
                        description: 'Failed to write analysis file',
                        context: `Error: ${err}`
                    });
                }
            }
        }
        catch (error) {
            issues.push({
                severity: 'critical',
                description: 'LLM generation failed',
                context: `Error: ${error}`
            });
        }
        // Generate feedback
        if (this.feedbackService) {
            this.feedbackService.createFeedback('AnalystAgent', completedTasks, ['Architecture review', 'Requirement validation'], issues, ['Consider competitive analysis depth', 'Add market sizing'], ['Proceed to architecture phase', 'Validate requirements with stakeholders']);
        }
        return buffer;
    }
}
exports.AnalystAgent = AnalystAgent;
//# sourceMappingURL=AnalystAgent.js.map