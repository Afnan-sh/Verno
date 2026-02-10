"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
class ModelAgent extends BaseAgent_1.BaseAgent {
    logger;
    llmService;
    name = 'model';
    description = 'Model - Create models and designs';
    constructor(logger, llmService) {
        super(logger);
        this.logger = logger;
        this.llmService = llmService;
    }
    async execute(context) {
        this.log('Running Model Agent');
        const prompt = `Create a model for: ${context.metadata?.userRequest || 'project'}`;
        return await this.llmService.generateText(prompt);
    }
}
exports.ModelAgent = ModelAgent;
//# sourceMappingURL=ModelAgent.js.map