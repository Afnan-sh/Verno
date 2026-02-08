/**
 * Orchestrator agent that manages multi-agent workflows
 */

import { BaseAgent } from '../base/BaseAgent';
import { IAgentContext } from '../../types';
import { AgentRegistry } from '../base/AgentRegistry';
import { LLMService } from '../../services/llm';
import { FileService } from '../../services/file/FileService';
import { CodeGeneratorAgent } from '../specialized/CodeGeneratorAgent';
import { DocumentationAgent } from '../specialized/DocumentationAgent';
import { TestGeneratorAgent } from '../specialized/TestGeneratorAgent';

export class OrchestratorAgent extends BaseAgent {
  name = 'OrchestratorAgent';
  description = 'Manages and coordinates multi-agent workflows';

  constructor(
    protected logger: any,
    private agentRegistry: AgentRegistry,
    private llmService: LLMService,
    private fileService: FileService
  ) {
    super(logger);
    this.registerSpecializedAgents();
  }

  private registerSpecializedAgents(): void {
    const codeGenerator = new CodeGeneratorAgent(this.logger, this.llmService, this.fileService);
    const documentationAgent = new DocumentationAgent(this.logger, this.llmService, this.fileService);
    const testGenerator = new TestGeneratorAgent(this.logger, this.llmService, this.fileService);

    this.agentRegistry.register('codeGenerator', codeGenerator);
    this.agentRegistry.register('documentationAgent', documentationAgent);
    this.agentRegistry.register('testGenerator', testGenerator);
  }

  async execute(context: IAgentContext): Promise<string> {
    if (!this.validateContext(context)) {
      throw new Error('Invalid context provided to OrchestratorAgent');
    }

    this.log('Starting orchestrator workflow division');
    
    try {
      const userRequest = context.metadata?.userRequest as string;
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.log(`Orchestrator error: ${errorMsg}`, 'error');
      throw error;
    }
  }
}
