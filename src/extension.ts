import * as vscode from 'vscode';
import { Logger } from './utils/logger';
import { ConfigService } from './config/ConfigService';
import { LLMService, GeminiProvider, GroqProvider } from './services/llm';
import { AgentRegistry, OrchestratorAgent } from './agents';
import { FileService } from './services/file/FileService';
import { ContextBuilder } from './services/workflow/ContextBuilder';
import { StartRecordingCommand } from './commands/StartRecordingCommand';
import { StopRecordingCommand } from './commands/StopRecordingCommand';
import { ManageAgentsCommand } from './commands/ManageAgentsCommand';
import { RecordingStatus } from './ui/statusBar/RecordingStatus';
import { AgentPanel } from './ui/panels/AgentPanel';
import { SidebarProvider } from './ui/panels/SidebarProvider';

let logger: Logger;
let configService: ConfigService;
let llmService: LLMService;
let agentRegistry: AgentRegistry;
let fileService: FileService;
let recordingStatus: RecordingStatus;
let agentPanel: AgentPanel;
let sidebarProvider: SidebarProvider;

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

		// Register sidebar provider and connect AgentPanel when view is resolved
		sidebarProvider = new SidebarProvider(context, logger, (webviewView) => {
			agentPanel.setWebviewView(webviewView);
		});
		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider(
				SidebarProvider.viewType,
				sidebarProvider
			)
		);
		logger.info('Sidebar provider registered');
	

		// Register all agents
		registerAllAgents();

		// Register commands
		StartRecordingCommand.register(context);
		StopRecordingCommand.register(context);
		ManageAgentsCommand.register(context);

		// Register main processing command (prompts in popup if no args)
		const processCommand = vscode.commands.registerCommand('verno.processInput', async () => {
			await processUserInput(context);
		});

		// Register processing command that accepts apiKey and input from webview
		const processWithData = vscode.commands.registerCommand('verno.processInputWithData', async (apiKey: string, input: string) => {
			await processUserInput(context, apiKey, input);
		});

		context.subscriptions.push(processCommand, processWithData, recordingStatus);

		logger.info('Verno extension activated successfully');
		vscode.window.showInformationMessage('Verno extension is ready!');
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		logger.error('Failed to activate extension', error as Error);
		vscode.window.showErrorMessage(`Verno activation failed: ${errorMsg}`);
	}
}

function detectAndCreateProvider(apiKey: string): GeminiProvider | GroqProvider {
	// Detect provider based on API key format
	if (apiKey.startsWith('AIza')) {
		return new GeminiProvider();
	} else {
		return new GroqProvider();
	}
}

function registerAllAgents(): void {
	const mockLogger = logger;

	// Register core agents
	const orchestrator = new OrchestratorAgent(mockLogger, agentRegistry, llmService, fileService);
	agentRegistry.register('orchestrator', orchestrator);

	logger.info('All agents registered successfully');
}

async function processUserInput(context: vscode.ExtensionContext, apiKeyArg?: string, inputArg?: string): Promise<void> {
	try {
		let apiKey = apiKeyArg;
		let input = inputArg;

		if (!apiKey) {
			apiKey = await vscode.window.showInputBox({
				prompt: 'Enter your API key (Gemini: AIza... or Groq)',
				password: true,
				ignoreFocusOut: true
			});

			if (!apiKey) {
				logger.warn('No API key provided');
				return;
			}
		}

		if (!input) {
			input = await vscode.window.showInputBox({
				prompt: 'Enter your request (e.g., "Create a REST API with user authentication")',
				ignoreFocusOut: true
			});

			if (!input) {
				return;
			}
		}

		logger.info(`Processing user input: ${input}`);
		vscode.window.showInformationMessage('Processing your request...');

		// Detect and initialize the appropriate provider based on API key format
		const provider = detectAndCreateProvider(apiKey);
		await provider.initialize(apiKey);
		llmService.setProvider(provider);

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

		// notify sidebar processing started
		try {
			agentPanel.postMessage({ type: 'processingStarted' });
		} catch (e) {
			// ignore
		}

		const result = await orchestrator.execute(agentContext);
		logger.info(`Processing complete: ${result}`);

		// Parse workflow plan and send to sidebar
		try {
			const workflowSteps = JSON.parse(result);
			logger.info(`Workflow steps: ${JSON.stringify(workflowSteps)}`);
			agentPanel.postMessage({ type: 'workflowSteps', steps: workflowSteps });
		} catch (parseErr) {
			logger.warn(`Failed to parse workflow result: ${parseErr}`);
			agentPanel.postMessage({ type: 'processingResult', result });
		}

		vscode.window.showInformationMessage('Workflow plan created successfully!');

		// notify sidebar if available with completion
		try {
			agentPanel.notifyProcessingComplete();
		} catch (e) {
			// ignore
		}
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		logger.error('Error processing input', error as Error);
		vscode.window.showErrorMessage(`Processing failed: ${errorMsg}`);
		try {
			agentPanel.postMessage({ type: 'error', message: errorMsg });
		} catch (e) {
			// ignore
		}
	}
}

export function deactivate() {
	recordingStatus.dispose();
	logger.info('Verno extension deactivated');
	logger.dispose();
}
