"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecideAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
class DecideAgent extends BaseAgent_1.BaseAgent {
    logger;
    llmService;
    name = 'decide';
    description = 'Decide - Make decisions';
    constructor(logger, llmService) {
        super(logger);
        this.logger = logger;
        this.llmService = llmService;
    }
    async execute(context) {
        this.log('Running Decide Agent');
        const prompt = `Make a decision for: ${context.metadata?.userRequest || 'project'}`;
        return await this.llmService.generateText(prompt);
    }
}
exports.DecideAgent = DecideAgent;
//# sourceMappingURL=DecideAgent.js.map