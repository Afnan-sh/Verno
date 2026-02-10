import { BaseAgent } from '../base/BaseAgent';
import { IAgentContext } from '../../types';
import { LLMService } from '../../services/llm';
import { FileService } from '../../services/file/FileService';
import { FileChangeTracker } from '../../services/file/FileChangeTracker';
import { FeedbackService, IssueSeverity } from '../../services/feedback';

/**
 * Enhanced Architect Agent with Feedback Capabilities
 * Generates system architecture and provides feedback on design decisions
 */
export class ArchitectAgent extends BaseAgent {
  name = 'architect';
  description = 'System Architect - Technical design, architecture decisions, system scalability';
  private feedbackService?: FeedbackService;

  constructor(
    protected logger: any,
    private llmService: LLMService,
    private fileService: FileService,
    private changeTracker: FileChangeTracker
  ) {
    super(logger);
  }

  async execute(context: IAgentContext): Promise<string> {
    this.log('Running Architect (Winston) - System Design');

    // Initialize feedback service
    if (context.workspaceRoot) {
      this.feedbackService = new FeedbackService(context.workspaceRoot);
    }

    const completedTasks: string[] = [];
    const issues: Array<{ severity: IssueSeverity; description: string; context: string }> = [];

    const previousOutputs = (context.metadata?.previousOutputs || {}) as Record<string, string>;
    const analysis = previousOutputs['analyst'] || '';

    const prompt = `You are Winston, a senior system architect.
User Request: ${context.metadata?.userRequest || 'design system architecture'}

CONTEXT:
${analysis.substring(0, 8000)}

Provide a CONCISE, HIGH-LEVEL architecture design in markdown.
Focus on:
- System Modules & Responsibilities
- Tech Stack Recommendation (Why?)
- Data Flow (Briefly)

DO NOT generate generic explanations of what "scalability" means.
DO NOT use large ASCII art unless critical.
Keep it technical and dense.`;

    let buffer = '';
    try {
      await this.llmService.streamGenerate(prompt, undefined, (token: string) => {
        buffer += token;
      });
      completedTasks.push('Completed system architecture design');
      completedTasks.push('Evaluated technology stack');
    } catch (error) {
      issues.push({
        severity: 'critical',
        description: 'Architecture generation failed',
        context: `Error: ${error}`
      });
    }

    // Write architecture to file
    if (context.workspaceRoot) {
      const archPath = `${context.workspaceRoot}/ARCHITECTURE.md`;
      try {
        await this.fileService.createFile(archPath, buffer);
        this.changeTracker.recordChange(archPath, buffer);
        this.log(`Architecture saved to ${archPath}`);
        completedTasks.push(`Saved architecture to ${archPath}`);
      } catch (err) {
        this.log(`Failed to write architecture: ${err}`, 'error');
        issues.push({
          severity: 'high',
          description: 'Failed to write architecture file',
          context: `Error: ${err}`
        });
      }
    }

    // Generate feedback
    if (this.feedbackService) {
      this.feedbackService.createFeedback(
        'ArchitectAgent',
        completedTasks,
        ['UX design review', 'Security audit'],
        issues,
        ['Consider microservices for scalability', 'Add caching layer'],
        ['Proceed to UX design', 'Review with security team']
      );
    }

    return buffer;
  }
}
