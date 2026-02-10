"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickFlowSoloDevAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
/**
 * Quick Flow Solo Dev Agent (Barry) - Solo Development Mode
 * Loaded from src/agents/BMAD/quick-flow-solo-dev.agent.yaml
 */
class QuickFlowSoloDevAgent extends BaseAgent_1.BaseAgent {
    logger;
    llmService;
    fileService;
    changeTracker;
    name = 'quickflowdev';
    description = 'Solo Developer - Fast prototyping, MVP development in one agent';
    constructor(logger, llmService, fileService, changeTracker) {
        super(logger);
        this.logger = logger;
        this.llmService = llmService;
        this.fileService = fileService;
        this.changeTracker = changeTracker;
    }
    async execute(context) {
        this.log('Running Quick Flow Solo Dev (Barry) - Solo Development');
        const prompt = `You are Barry, a full-stack developer who moves fast on MVP development, combining analysis, design, and code in an agile workflow.

User Request: ${context.metadata?.userRequest || 'build MVP'}

Provide complete solution with:
- Quick requirement analysis
- System design sketch
- Working code implementation
- Basic tests
- Setup instructions

Optimize for speed and pragmatism over perfection.`;
        let buffer = '';
        await this.llmService.streamGenerate(prompt, undefined, (token) => {
            buffer += token;
        });
        // Write specification to file
        if (context.workspaceRoot) {
            const specPath = `${context.workspaceRoot}/QUICKFLOW_SPEC.md`;
            try {
                await this.fileService.createFile(specPath, buffer);
                this.changeTracker.recordChange(specPath, buffer);
                this.log(`Quick flow spec saved to ${specPath}`);
            }
            catch (err) {
                this.log(`Failed to write quick flow spec: ${err}`, 'error');
            }
        }
        return buffer;
    }
}
exports.QuickFlowSoloDevAgent = QuickFlowSoloDevAgent;
//# sourceMappingURL=QuickFlowSoloDevAgent.js.map