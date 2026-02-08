"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const logger_1 = require("./utils/logger");
const ConfigService_1 = require("./config/ConfigService");
const llm_1 = require("./services/llm");
const agents_1 = require("./agents");
const FileService_1 = require("./services/file/FileService");
const ContextBuilder_1 = require("./services/workflow/ContextBuilder");
const StartRecordingCommand_1 = require("./commands/StartRecordingCommand");
const StopRecordingCommand_1 = require("./commands/StopRecordingCommand");
const ManageAgentsCommand_1 = require("./commands/ManageAgentsCommand");
const RecordingStatus_1 = require("./ui/statusBar/RecordingStatus");
const AgentPanel_1 = require("./ui/panels/AgentPanel");
const SidebarProvider_1 = require("./ui/panels/SidebarProvider");
let logger;
let configService;
let llmService;
let agentRegistry;
let fileService;
let recordingStatus;
let agentPanel;
let sidebarProvider;
async function activate(context) {
    try {
        // Initialize services
        logger = new logger_1.Logger('Verno');
        configService = new ConfigService_1.ConfigService();
        fileService = new FileService_1.FileService();
        agentRegistry = new agents_1.AgentRegistry();
        llmService = new llm_1.LLMService();
        recordingStatus = new RecordingStatus_1.RecordingStatus();
        agentPanel = new AgentPanel_1.AgentPanel(context);
        logger.info('Initializing Verno extension...');
        // Register sidebar provider and connect AgentPanel when view is resolved
        sidebarProvider = new SidebarProvider_1.SidebarProvider(context, logger, (webviewView) => {
            agentPanel.setWebviewView(webviewView);
        });
        context.subscriptions.push(vscode.window.registerWebviewViewProvider(SidebarProvider_1.SidebarProvider.viewType, sidebarProvider));
        logger.info('Sidebar provider registered');
        // Register all agents
        registerAllAgents();
        // Register commands
        StartRecordingCommand_1.StartRecordingCommand.register(context);
        StopRecordingCommand_1.StopRecordingCommand.register(context);
        ManageAgentsCommand_1.ManageAgentsCommand.register(context);
        // Register main processing command (prompts in popup if no args)
        const processCommand = vscode.commands.registerCommand('verno.processInput', async () => {
            await processUserInput(context);
        });
        // Register processing command that accepts apiKey and input from webview
        const processWithData = vscode.commands.registerCommand('verno.processInputWithData', async (apiKey, input) => {
            await processUserInput(context, apiKey, input);
        });
        context.subscriptions.push(processCommand, processWithData, recordingStatus);
        logger.info('Verno extension activated successfully');
        vscode.window.showInformationMessage('Verno extension is ready!');
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error('Failed to activate extension', error);
        vscode.window.showErrorMessage(`Verno activation failed: ${errorMsg}`);
    }
}
function detectAndCreateProvider(apiKey) {
    // Detect provider based on API key format
    if (apiKey.startsWith('AIza')) {
        return new llm_1.GeminiProvider();
    }
    else {
        return new llm_1.GroqProvider();
    }
}
function registerAllAgents() {
    const mockLogger = logger;
    // Register core agents
    const orchestrator = new agents_1.OrchestratorAgent(mockLogger, agentRegistry, llmService, fileService);
    agentRegistry.register('orchestrator', orchestrator);
    logger.info('All agents registered successfully');
}
async function processUserInput(context, apiKeyArg, inputArg) {
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
        const agentContext = new ContextBuilder_1.ContextBuilder()
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
        }
        catch (e) {
            // ignore
        }
        const result = await orchestrator.execute(agentContext);
        logger.info(`Processing complete: ${result}`);
        // Parse workflow plan and send to sidebar
        try {
            const workflowSteps = JSON.parse(result);
            logger.info(`Workflow steps: ${JSON.stringify(workflowSteps)}`);
            agentPanel.postMessage({ type: 'workflowSteps', steps: workflowSteps });
        }
        catch (parseErr) {
            logger.warn(`Failed to parse workflow result: ${parseErr}`);
            agentPanel.postMessage({ type: 'processingResult', result });
        }
        vscode.window.showInformationMessage('Workflow plan created successfully!');
        // notify sidebar if available with completion
        try {
            agentPanel.notifyProcessingComplete();
        }
        catch (e) {
            // ignore
        }
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error('Error processing input', error);
        vscode.window.showErrorMessage(`Processing failed: ${errorMsg}`);
        try {
            agentPanel.postMessage({ type: 'error', message: errorMsg });
        }
        catch (e) {
            // ignore
        }
    }
}
function deactivate() {
    recordingStatus.dispose();
    logger.info('Verno extension deactivated');
    logger.dispose();
}
//# sourceMappingURL=extension.js.map