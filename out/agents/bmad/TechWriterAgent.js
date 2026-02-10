"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechWriterAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
/**
 * Tech Writer Agent (Paige) - Technical Documentation
 * Loaded from src/agents/BMAD/tech-writer.agent.yaml
 */
class TechWriterAgent extends BaseAgent_1.BaseAgent {
    logger;
    llmService;
    fileService;
    changeTracker;
    name = 'techwriter';
    description = 'Tech Writer - API docs, user guides, architecture documentation';
    constructor(logger, llmService, fileService, changeTracker) {
        super(logger);
        this.logger = logger;
        this.llmService = llmService;
        this.fileService = fileService;
        this.changeTracker = changeTracker;
    }
    async execute(context) {
        this.log('Running Tech Writer (Paige) - Documentation');
        const prompt = `You are Paige, a technical writer specializing in API documentation, user guides, and architectural documentation.

User Request: ${context.metadata?.userRequest || 'create documentation'}

Provide comprehensive documentation with:
- API reference and examples
- User guides and tutorials
- Architecture overview
- Troubleshooting guides

Format as markdown with code examples.`;
        let buffer = '';
        await this.llmService.streamGenerate(prompt, undefined, (token) => {
            buffer += token;
        });
        // Write documentation to file
        if (context.workspaceRoot) {
            const docPath = `${context.workspaceRoot}/DOCUMENTATION.md`;
            try {
                await this.fileService.createFile(docPath, buffer);
                this.changeTracker.recordChange(docPath, buffer);
                this.log(`Documentation saved to ${docPath}`);
            }
            catch (err) {
                this.log(`Failed to write documentation: ${err}`, 'error');
            }
        }
        return buffer;
    }
}
exports.TechWriterAgent = TechWriterAgent;
//# sourceMappingURL=TechWriterAgent.js.map