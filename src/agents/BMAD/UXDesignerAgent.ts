import { BaseAgent } from '../base/BaseAgent';
import { IAgentContext } from '../../types';
import { LLMService } from '../../services/llm';
import { FileService } from '../../services/file/FileService';
import { FileChangeTracker } from '../../services/file/FileChangeTracker';

/**
 * UX Designer Agent (Sally) - User Experience & UI Design
 * Loaded from src/agents/BMAD/ux-designer.agent.yaml
 */
export class UXDesignerAgent extends BaseAgent {
  name = 'uxdesigner';
  description = 'UX Designer - User research, interaction design, UI/UX prototyping';

  constructor(
    protected logger: any,
    private llmService: LLMService,
    private fileService: FileService,
    private changeTracker: FileChangeTracker
  ) {
    super(logger);
  }

  async execute(context: IAgentContext): Promise<string> {
    this.log('Running UX Designer (Sally) - User Experience Design');
    const prompt = `You are Sally, a senior UX designer.
User Request: ${context.metadata?.userRequest || 'design user experience'}

Provide a CONCISE UX design in markdown.
Focus on:
- 1-2 Key User Flows (Step-by-step)
- Layout Structure (Header, Sidebar, Content)
- Critical UI Elements

DO NOT write long persona biographies (e.g., "John is a 34 year old man...").
DO NOT provide generic "accessibility is important" text.
Keep it practical and actionable for developers.`;

    let buffer = '';
    await this.llmService.streamGenerate(prompt, undefined, (token: string) => {
      buffer += token;
    });

    // Write UX design to file
    if (context.workspaceRoot) {
      const uxPath = `${context.workspaceRoot}/UX_DESIGN.md`;
      try {
        await this.fileService.createFile(uxPath, buffer);
        this.changeTracker.recordChange(uxPath, buffer);
        this.log(`UX design saved to ${uxPath}`);
      } catch (err) {
        this.log(`Failed to write UX design: ${err}`, 'error');
      }
    }

    return buffer;
  }
}
