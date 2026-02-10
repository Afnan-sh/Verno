"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrainstormAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
class BrainstormAgent extends BaseAgent_1.BaseAgent {
    logger;
    llmService;
    name = 'brainstorm';
    description = 'Brainstorm - Initial idea generation';
    constructor(logger, llmService) {
        super(logger);
        this.logger = logger;
        this.llmService = llmService;
    }
    async execute(context) {
        this.log('Running Brainstorm Agent');
        const prompt = `Generate initial ideas for: ${context.metadata?.userRequest || 'project'}`;
        return await this.llmService.generateText(prompt);
    }
}
exports.BrainstormAgent = BrainstormAgent;
//# sourceMappingURL=BrainstormAgent.js.map