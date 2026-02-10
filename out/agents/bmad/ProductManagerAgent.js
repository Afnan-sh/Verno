"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductManagerAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
const feedback_1 = require("../../services/feedback");
/**
 * Product Manager Agent (John) - PRD & Product Planning
 * Loaded from src/agents/BMAD/pm.agent.yaml
 */
class ProductManagerAgent extends BaseAgent_1.BaseAgent {
    logger;
    llmService;
    fileService;
    changeTracker;
    name = 'pm';
    description = 'Product Manager - Product strategy, roadmap, prioritization, stakeholder management';
    feedbackService;
    constructor(logger, llmService, fileService, changeTracker) {
        super(logger);
        this.logger = logger;
        this.llmService = llmService;
        this.fileService = fileService;
        this.changeTracker = changeTracker;
    }
    async execute(context) {
        this.log('Running Product Manager (Peter) - Product Strategy');
        if (context.workspaceRoot) {
            this.feedbackService = new feedback_1.FeedbackService(context.workspaceRoot);
        }
        const prompt = `You are John, a product manager with 8+ years launching B2B and consumer products.

User Request: ${context.metadata?.userRequest || 'create product requirements'}

Provide product planning with:
- User interviews & needs analysis
- Product requirements document (PRD)
- Feature prioritization
- Success metrics

Format output as markdown.`;
        let buffer = '';
        await this.llmService.streamGenerate(prompt, undefined, (token) => {
            buffer += token;
        });
        // Write PRD to file
        if (context.workspaceRoot) {
            const prdPath = `${context.workspaceRoot}/PRD.md`;
            try {
                await this.fileService.createFile(prdPath, buffer);
                this.changeTracker.recordChange(prdPath, buffer);
                this.log(`PRD saved to ${prdPath}`);
            }
            catch (err) {
                this.log(`Failed to write PRD: ${err}`, 'error');
            }
        }
        return buffer;
    }
}
exports.ProductManagerAgent = ProductManagerAgent;
//# sourceMappingURL=ProductManagerAgent.js.map