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
        this.log('Starting orchestrator workflow');
        try {
            const userRequest = context.metadata?.userRequest;
            if (!userRequest) {
                throw new Error('No user request found in context');
            }
            this.log(`Processing request: ${userRequest}`);
            // Step 1: Analyze request with LLM
            const analysisPrompt = `Analyze this request and determine what files and code need to be generated. Return a JSON object with the structure needed.\n\nRequest: ${userRequest}`;
            const analysis = await this.llmService.generateText(analysisPrompt);
            this.log(`Analysis complete: ${analysis}`);
            // Step 2: Generate code files
            const codeGenerator = this.agentRegistry.get('codeGenerator');
            if (codeGenerator) {
                const codeContext = { ...context, metadata: { ...context.metadata, specification: analysis } };
                await codeGenerator.execute(codeContext);
                this.log('Code generation complete');
            }
            // Step 3: Generate documentation
            const docAgent = this.agentRegistry.get('documentationAgent');
            if (docAgent) {
                const docContext = { ...context, metadata: { ...context.metadata, codeAnalysis: analysis } };
                await docAgent.execute(docContext);
                this.log('Documentation generation complete');
            }
            // Step 4: Generate tests
            const testAgent = this.agentRegistry.get('testGenerator');
            if (testAgent) {
                const testContext = { ...context, metadata: { ...context.metadata, codeAnalysis: analysis } };
                await testAgent.execute(testContext);
                this.log('Test generation complete');
            }
            return `Workflow completed successfully for request: ${userRequest}`;
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