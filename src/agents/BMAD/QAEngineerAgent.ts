import { BaseAgent } from '../base/BaseAgent';
import { IAgentContext } from '../../types';
import { LLMService } from '../../services/llm';
import { FileService } from '../../services/file/FileService';
import { FileChangeTracker } from '../../services/file/FileChangeTracker';
import { FeedbackService, IssueSeverity } from '../../services/feedback';

/**
 * Enhanced QA Engineer Agent with Feedback Capabilities
 * Generates test plans, test cases, and quality assurance strategies
 */
export class QAEngineerAgent extends BaseAgent {
  name = 'qa';
  description = 'QA Engineer - Test strategy, test case development, quality assurance';
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
    this.log('Running QA Engineer (Oliver) - Quality Assurance');

    // Initialize feedback service
    if (context.workspaceRoot) {
      this.feedbackService = new FeedbackService(context.workspaceRoot);
    }

    const completedTasks: string[] = [];
    const issues: Array<{ severity: IssueSeverity; description: string; context: string }> = [];

    const previousOutputs = (context.metadata?.previousOutputs || {}) as Record<string, string>;
    const implementation = previousOutputs['developer'] || '';

    const prompt = `You are Oliver, a senior QA engineer specializing in test strategy, test case development, and quality assurance.

User Request: ${context.metadata?.userRequest || 'create test plan'}

CONTEXT FROM DEVELOPER:
${implementation.substring(0, 8000)}

Provide comprehensive quality assurance including:
- Test strategy and approach
- Unit test cases
- Integration test scenarios
- End-to-end test plans
- Performance and security test considerations
- Test data requirements

Format output as markdown with test cases.`;

    let buffer = '';
    try {
      await this.llmService.streamGenerate(prompt, undefined, (token: string) => {
        buffer += token;
      });
      completedTasks.push('Developed test strategy');
      completedTasks.push('Created test cases');
    } catch (error) {
      issues.push({
        severity: 'critical',
        description: 'Test plan generation failed',
        context: `Error: ${error}`
      });
    }

    // Write QA plan to file
    if (context.workspaceRoot) {
      const qaPath = `${context.workspaceRoot}/QA_PLAN.md`;
      try {
        await this.fileService.createFile(qaPath, buffer);
        this.changeTracker.recordChange(qaPath, buffer);
        this.log(`QA plan saved to ${qaPath}`);
        completedTasks.push(`Saved QA plan to ${qaPath}`);
      } catch (err) {
        this.log(`Failed to write QA plan: ${err}`, 'error');
        issues.push({
          severity: 'high',
          description: 'Failed to write QA plan file',
          context: `Error: ${err}`
        });
      }
    }

    // Generate feedback
    if (this.feedbackService) {
      this.feedbackService.createFeedback(
        'QAEngineerAgent',
        completedTasks,
        ['Execute test cases', 'Set up CI/CD pipeline'],
        issues,
        ['Add automated regression tests', 'Implement test coverage tracking'],
        ['Execute tests', 'Report results to team']
      );
    }

    return buffer;
  }
}
