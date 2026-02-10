import { BaseAgent } from '../base/BaseAgent';
import { IAgentContext } from '../../types';
import { LLMService } from '../../services/llm';
import { FileService } from '../../services/file/FileService';
import { FileChangeTracker } from '../../services/file/FileChangeTracker';

/**
 * Tech Writer Agent (Paige) - Technical Documentation
 * Loaded from src/agents/BMAD/tech-writer.agent.yaml
 */
export class TechWriterAgent extends BaseAgent {
  name = 'techwriter';
  description = 'Tech Writer - API docs, user guides, architecture documentation';

  constructor(
    protected logger: any,
    private llmService: LLMService,
    private fileService: FileService,
    private changeTracker: FileChangeTracker
  ) {
    super(logger);
  }

  async execute(context: IAgentContext): Promise<string> {
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
    await this.llmService.streamGenerate(prompt, undefined, (token: string) => {
      buffer += token;
    });

    // Write documentation to file
    if (context.workspaceRoot) {
      const docPath = `${context.workspaceRoot}/DOCUMENTATION.md`;
      try {
        await this.fileService.createFile(docPath, buffer);
        this.changeTracker.recordChange(docPath, buffer);
        this.log(`Documentation saved to ${docPath}`);
      } catch (err) {
        this.log(`Failed to write documentation: ${err}`, 'error');
      }
    }

    return buffer;
  }
}
