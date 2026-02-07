import * as vscode from 'vscode';
import { Logger } from './utils/logger';
import { ConfigService } from './config/ConfigService';
import { LLMService, OpenAIProvider, AnthropicProvider } from './services/llm';
import { AgentRegistry, OrchestratorAgent } from './agents';
import { FileService } from './services/file/FileService';
import { ContextBuilder } from './services/workflow/ContextBuilder';
import { StartRecordingCommand } from './commands/StartRecordingCommand';
import { StopRecordingCommand } from './commands/StopRecordingCommand';
import { ManageAgentsCommand } from './commands/ManageAgentsCommand';
import { RecordingStatus } from './ui/statusBar/RecordingStatus';
import { AgentPanel } from './ui/panels/AgentPanel';

let logger: Logger;
let configService: ConfigService;
let llmService: LLMService;
let agentRegistry: AgentRegistry;
let fileService: FileService;
let recordingStatus: RecordingStatus;
let agentPanel: AgentPanel;

export async function activate(context: vscode.ExtensionContext) {
	try {
		// Initialize services
		logger = new Logger('Verno');
		configService = new ConfigService();
		fileService = new FileService();
		agentRegistry = new AgentRegistry();
		llmService = new LLMService();
		recordingStatus = new RecordingStatus();
		agentPanel = new AgentPanel(context);

		logger.info('Initializing Verno extension...');

		// Initialize LLM provider
		const llmProvider = configService.get<string>('llmProvider') || 'openai';
		const apiKey = await vscode.window.showInputBox({
			prompt: `Enter your ${llmProvider.toUpperCase()} API key`,
			password: true,
			ignoreFocusOut: true
		});

		if (!apiKey) {
			logger.warn('No API key provided. Extension features will be limited.');
		} else {
			if (llmProvider === 'anthropic') {
				const provider = new AnthropicProvider();
				await provider.initialize(apiKey);
				llmService.setProvider(provider);
			} else {
				const provider = new OpenAIProvider();
				await provider.initialize(apiKey);
				llmService.setProvider(provider);
			}
			logger.info(`LLM Provider initialized: ${llmProvider}`);
		}

		// Register all agents
		registerAllAgents();

		// Register commands
		StartRecordingCommand.register(context);
		StopRecordingCommand.register(context);
		ManageAgentsCommand.register(context);

		// Register main processing command
		const processCommand = vscode.commands.registerCommand('verno.processInput', async () => {
			await processUserInput(context);
		});

		context.subscriptions.push(processCommand, recordingStatus);

		logger.info('Verno extension activated successfully');
		vscode.window.showInformationMessage('Verno extension is ready!');
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		logger.error('Failed to activate extension', error as Error);
		vscode.window.showErrorMessage(`Verno activation failed: ${errorMsg}`);
	}
}

function registerAllAgents(): void {
	const mockLogger = logger;

	// Register core agents
	const orchestrator = new OrchestratorAgent(mockLogger, agentRegistry, llmService, fileService);
	agentRegistry.register('orchestrator', orchestrator);

	logger.info('All agents registered successfully');
}

async function processUserInput(context: vscode.ExtensionContext): Promise<void> {
	try {
		const input = await vscode.window.showInputBox({
			prompt: 'Enter your request (e.g., "Create a REST API with user authentication")',
			ignoreFocusOut: true
		});

		if (!input) {
			return;
		}

		logger.info(`Processing user input: ${input}`);
		vscode.window.showInformationMessage('Processing your request...');

		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspaceRoot) {
			vscode.window.showErrorMessage('No workspace folder open');
			return;
		}

		// Build context
		const agentContext = new ContextBuilder()
			.setWorkspaceRoot(workspaceRoot)
			.setMetadata({
				userRequest: input,
				timestamp: new Date().toISOString()
			})
			.build();

		// Execute orchestrator
		const orchestrator = agentRegistry.get('orchestrator');
		if (!orchestrator) {
			throw new Error('Orchestrator agent not found');
		}

		const result = await orchestrator.execute(agentContext);
		logger.info(`Processing complete: ${result}`);
		vscode.window.showInformationMessage('Request processed successfully!');
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		logger.error('Error processing input', error as Error);
		vscode.window.showErrorMessage(`Processing failed: ${errorMsg}`);
	}
}

export function deactivate() {
	recordingStatus.dispose();
	logger.info('Verno extension deactivated');
	logger.dispose();
}
