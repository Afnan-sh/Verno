/**
 * Test generator agent for creating unit and integration tests
 */

import { BaseAgent } from '../base/BaseAgent';
import { IAgentContext } from '../../types';
import { ISpecializedAgent } from '../../types/agents';
import { LLMService } from '../../services/llm';
import { FileService } from '../../services/file/FileService';
import * as path from 'path';

export class TestGeneratorAgent extends BaseAgent implements ISpecializedAgent {
  name = 'TestGeneratorAgent';
  description = 'Generates unit and integration tests for code';

  constructor(
    protected logger: any,
    private llmService: LLMService,
    private fileService: FileService
  ) {
    super(logger);
  }

  validateInput(context: IAgentContext): boolean {
    return this.validateContext(context) && (!!context.fileContent || !!context.metadata?.codeAnalysis);
  }

  async preProcess(context: IAgentContext): Promise<IAgentContext> {
    this.log('Pre-processing test generation request');
    return context;
  }

  async execute(context: IAgentContext): Promise<string> {
    if (!this.validateInput(context)) {
      throw new Error('Invalid input for test generation');
    }

    this.log('Generating tests');
    
    try {
      const codeAnalysis = context.metadata?.codeAnalysis as string;
      const workspaceRoot = context.workspaceRoot;

      // Generate unit tests
      const unitTestPrompt = `Generate comprehensive unit tests for this specification: ${codeAnalysis}. Use Jest framework and return only the test code.`;
      const unitTests = await this.llmService.generateText(unitTestPrompt);
      
      const unitTestPath = path.join(workspaceRoot, 'generated', 'index.test.ts');
      await this.fileService.createFile(unitTestPath, unitTests);
      this.log(`Unit tests created: ${unitTestPath}`);

      // Generate integration tests
      const integrationTestPrompt = `Generate integration tests for this specification: ${codeAnalysis}. Return only the test code.`;
      const integrationTests = await this.llmService.generateText(integrationTestPrompt);
      
      const integrationTestPath = path.join(workspaceRoot, 'generated', 'integration.test.ts');
      await this.fileService.createFile(integrationTestPath, integrationTests);
      this.log(`Integration tests created: ${integrationTestPath}`);

      return await this.postProcess('Test generation complete');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.log(`Test generation error: ${errorMsg}`, 'error');
      throw error;
    }
  }

  async postProcess(output: string): Promise<string> {
    this.log('Post-processing generated tests');
    return output;
  }
}
