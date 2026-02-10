"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UXDesignerAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
/**
 * UX Designer Agent (Sally) - User Experience & UI Design
 * Loaded from src/agents/BMAD/ux-designer.agent.yaml
 */
class UXDesignerAgent extends BaseAgent_1.BaseAgent {
    logger;
    llmService;
    fileService;
    changeTracker;
    name = 'uxdesigner';
    description = 'UX Designer - User research, interaction design, UI/UX prototyping';
    constructor(logger, llmService, fileService, changeTracker) {
        super(logger);
        this.logger = logger;
        this.llmService = llmService;
        this.fileService = fileService;
        this.changeTracker = changeTracker;
    }
    async execute(context) {
        this.log('Running UX Designer (Sally) - User Experience Design');
        const prompt = `You are Sally, a senior UX designer.
User Request: ${context.metadata?.userRequest || 'design user experience'}

Provide a CONCISE UX design in markdown.
Focus on:
- 1-2 Key User Flows (Step-by-step)
- Layout Structure (Header, Sidebar, Content)
- Critical UI Elements

DO NOT write long persona biographies (e.g., "John is a 34 year old man...").
DO NOT provide generic "accessibility is important" text.
Keep it practical and actionable for developers.`;
        let buffer = '';
        await this.llmService.streamGenerate(prompt, undefined, (token) => {
            buffer += token;
        });
        // Write UX design to file
        if (context.workspaceRoot) {
            const uxPath = `${context.workspaceRoot}/UX_DESIGN.md`;
            try {
                await this.fileService.createFile(uxPath, buffer);
                this.changeTracker.recordChange(uxPath, buffer);
                this.log(`UX design saved to ${uxPath}`);
            }
            catch (err) {
                this.log(`Failed to write UX design: ${err}`, 'error');
            }
        }
        return buffer;
    }
}
exports.UXDesignerAgent = UXDesignerAgent;
//# sourceMappingURL=UXDesignerAgent.js.map