"use strict";
/**
 * Orchestrator agent that manages multi-agent workflows
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
const CodeGeneratorAgent_1 = require("../specialized/CodeGeneratorAgent");
const DocumentationAgent_1 = require("../specialized/DocumentationAgent");
const TestGeneratorAgent_1 = require("../specialized/TestGeneratorAgent");
class OrchestratorAgent extends BaseAgent_1.BaseAgent {
    logger;
    agentRegistry;
    llmService;
    fileService;
    name = 'OrchestratorAgent';
    description = 'Manages and coordinates multi-agent workflows';
    constructor(logger, agentRegistry, llmService, fileService) {
        super(logger);
        this.logger = logger;
        this.agentRegistry = agentRegistry;
        this.llmService = llmService;
        this.fileService = fileService;
        this.registerSpecializedAgents();
    }
    registerSpecializedAgents() {
        const codeGenerator = new CodeGeneratorAgent_1.CodeGeneratorAgent(this.logger, this.llmService, this.fileService);
        const documentationAgent = new DocumentationAgent_1.DocumentationAgent(this.logger, this.llmService, this.fileService);
        const testGenerator = new TestGeneratorAgent_1.TestGeneratorAgent(this.logger, this.llmService, this.fileService);
        this.agentRegistry.register('codeGenerator', codeGenerator);
        this.agentRegistry.register('documentationAgent', documentationAgent);
        this.agentRegistry.register('testGenerator', testGenerator);
    }
    async execute(context) {
        if (!this.validateContext(context)) {
            throw new Error('Invalid context provided to OrchestratorAgent');
        }
        this.log('Starting orchestrator workflow division');
        try {
            const userRequest = context.metadata?.userRequest;
            if (!userRequest) {
                throw new Error('No user request found in context');
            }
            this.log(`Processing request: ${userRequest}`);
            // Generate workflow plan by analyzing the request
            const planPrompt = `You are a software architect. Analyze this user request and create a detailed step-by-step workflow plan. Return ONLY a JSON array with this exact structure:
[
  { "step": 1, "name": "Analyze Requirements", "description": "Break down the user request" },
  { "step": 2, "name": "Generate Code", "description": "Create the implementation" },
  { "step": 3, "name": "Generate Documentation", "description": "Create API docs and guides" },
  { "step": 4, "name": "Generate Tests", "description": "Create unit and integration tests" }
]

User Request: ${userRequest}`;
            const workflowPlan = await this.llmService.generateText(planPrompt);
            this.log(`Workflow plan generated: ${workflowPlan}`);
            // Return the workflow plan as a JSON string
            return workflowPlan;
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.log(`Orchestrator error: ${errorMsg}`, 'error');
            throw error;
        }
    }
}
exports.OrchestratorAgent = OrchestratorAgent;
//# sourceMappingURL=OrchestratorAgent.js.map