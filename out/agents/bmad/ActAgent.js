"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
class ActAgent extends BaseAgent_1.BaseAgent {
    logger;
    llmService;
    name = 'act';
    description = 'Act - Execute actions';
    constructor(logger, llmService) {
        super(logger);
        this.logger = logger;
        this.llmService = llmService;
    }
    async execute(context) {
        this.log('Running Act Agent');
        const prompt = `Execute action for: ${context.metadata?.userRequest || 'project'}`;
        return await this.llmService.generateText(prompt);
    }
}
exports.ActAgent = ActAgent;
//# sourceMappingURL=ActAgent.js.map