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
const PlanningAgent_1 = require("./agents/planning/PlanningAgent");
const FileService_1 = require("./services/file/FileService");
const ContextBuilder_1 = require("./services/workflow/ContextBuilder");
const ConversationService_1 = require("./services/conversation/ConversationService");
const StartRecordingCommand_1 = require("./commands/StartRecordingCommand");
const StopRecordingCommand_1 = require("./commands/StopRecordingCommand");
const ManageAgentsCommand_1 = require("./commands/ManageAgentsCommand");
const RecordingStatus_1 = require("./ui/statusBar/RecordingStatus");
const AgentPanel_1 = require("./ui/panels/AgentPanel");
const SidebarProvider_1 = require("./ui/panels/SidebarProvider");
const EnhancedSidebarProvider_1 = require("./ui/panels/EnhancedSidebarProvider");
let logger;
let configService;
let llmService;
let agentRegistry;
let fileService;
let recordingStatus;
let agentPanel;
let sidebarProvider;
let conversationService;
let currentConversationId = null;
async function activate(context) {
    try {
        // Initialize services
        logger = new logger_1.Logger('Verno');
        logger.show(); // Auto-show logs on startup for debugging
        configService = new ConfigService_1.ConfigService();
        fileService = new FileService_1.FileService();
        agentRegistry = new agents_1.AgentRegistry();
        llmService = new llm_1.LLMService();
        recordingStatus = new RecordingStatus_1.RecordingStatus();
        agentPanel = new AgentPanel_1.AgentPanel(context);
        logger.info('Initializing Verno extension...');
        // Initialize ConversationService for persistence
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
        if (workspaceRoot) {
            conversationService = new ConversationService_1.ConversationService(workspaceRoot);
            logger.info('ConversationService initialized for persistence');
        }
        // Wire Context Updates from LLM to UI
        llmService.setContextUsageCallback((used, total) => {
            agentPanel?.updateContextUsage(used, total);
        });
        // Register sidebar provider and connect AgentPanel when view is resolved
        sidebarProvider = new SidebarProvider_1.SidebarProvider(context, logger, llmService, (webviewView) => {
            agentPanel.setWebviewView(webviewView);
            // Load existing conversation when sidebar is opened
            if (conversationService && currentConversationId) {
                const conv = conversationService.getConversation(currentConversationId);
                if (conv && conv.messages.length > 0) {
                    agentPanel.displayConversation(conv.messages.map(m => ({
                        role: m.role,
                        content: m.content,
                        timestamp: new Date(m.timestamp).toISOString()
                    })));
                    logger.info(`Loaded ${conv.messages.length} messages from conversation ${currentConversationId}`);
                }
            }
        });
        context.subscriptions.push(vscode.window.registerWebviewViewProvider(SidebarProvider_1.SidebarProvider.viewType, sidebarProvider));
        logger.info('Sidebar provider registered');
        // Register Enhanced Sidebar for Dashboard
        const enhancedSidebar = new EnhancedSidebarProvider_1.EnhancedSidebarProvider(workspaceRoot);
        context.subscriptions.push(vscode.window.registerWebviewViewProvider(EnhancedSidebarProvider_1.EnhancedSidebarProvider.viewType, enhancedSidebar));
        logger.info('Enhanced Sidebar provider registered');
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
        // show output channel command
        const showOutputCmd = vscode.commands.registerCommand('verno.showOutput', async () => {
            logger.show();
        });
        // Register processing command that accepts apiKey, input, mode, and model from webview
        const processWithData = vscode.commands.registerCommand('verno.processInputWithData', async (apiKey, input, mode = 'code', model) => {
            await processUserInput(context, apiKey, input, mode, { fromWebview: true, model });
        });
        // Register load conversation command
        const loadConversationCmd = vscode.commands.registerCommand('verno.loadConversation', async (conversationId) => {
            await loadConversation(conversationId);
        });
        // Register new task command
        const newTaskCmd = vscode.commands.registerCommand('verno.newTask', async () => {
            logger.info('New task requested');
            currentConversationId = null;
            logger.info('Ready for new task');
        });
        // Register MCP install command
        const mcpInstallCmd = vscode.commands.registerCommand('verno.mcpInstall', async (serverId, scope) => {
            logger.info(`MCP server install requested: ${serverId} (scope: ${scope})`);
            vscode.window.showInformationMessage(`MCP server "${serverId}" installed (${scope}).`);
        });
        // List conversations command - sends list to webview
        const listConvsCmd = vscode.commands.registerCommand('verno.listConversations', async () => {
            if (!conversationService) {
                return;
            }
            const convs = conversationService.getAllConversations();
            const list = convs.map(c => ({
                id: c.id,
                title: c.title,
                mode: c.mode || 'chat',
                updatedAt: c.updatedAt,
                messageCount: c.messages.length
            }));
            agentPanel.postMessage({ type: 'conversationList', conversations: list });
        });
        // Delete conversation command
        const deleteConvCmd = vscode.commands.registerCommand('verno.deleteConversation', async (conversationId) => {
            if (!conversationService) {
                return;
            }
            conversationService.deleteConversation(conversationId);
            if (currentConversationId === conversationId) {
                currentConversationId = null;
            }
            logger.info(`Deleted conversation: ${conversationId}`);
            // Refresh the list
            await vscode.commands.executeCommand('verno.listConversations');
        });
        // Voice conversation complete command — receives summary from voice overlay and feeds it to the pipeline
        const voiceConvCmd = vscode.commands.registerCommand('verno.voiceConversationComplete', async (summary, transcript) => {
            if (!summary) {
                logger.warn('Voice conversation produced no summary');
                return;
            }
            logger.info(`Voice conversation complete. Summary length: ${summary.length}, turns: ${transcript?.length || 0}`);
            agentPanel.addMessage('system', '🎙️ Voice conversation captured. Processing your request...');
            // Try to find an API key from configured providers
            // The webview state isn't accessible from the extension, so prompt if needed
            const apiKey = await vscode.window.showInputBox({
                prompt: 'Enter your API key to process the voice conversation summary',
                password: true,
                ignoreFocusOut: true,
                placeHolder: 'API key (Gemini: AIza... or Groq)'
            });
            if (apiKey) {
                await processUserInput(context, apiKey, summary, 'plan', { fromWebview: false });
            }
            else {
                agentPanel.addMessage('system', 'No API key provided. Your voice summary has been added to the chat. You can send it manually using the Send button.');
            }
        });
        context.subscriptions.push(processCommand, processWithData, showOutputCmd, recordingStatus, loadConversationCmd, newTaskCmd, mcpInstallCmd, listConvsCmd, deleteConvCmd, voiceConvCmd);
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
    if (apiKey.startsWith('AIza')) {
        return new llm_1.GeminiProvider();
    }
    else {
        return new llm_1.GroqProvider();
    }
}
function registerAllAgents() {
    // Register Planning Agent for plan mode conversations
    const planningAgent = new PlanningAgent_1.PlanningAgent(logger, llmService);
    agentRegistry.register('planning', planningAgent);
    // Register Orchestrator (Planner) for code mode pipeline
    const orchestrator = new agents_1.OrchestratorAgent(logger, agentRegistry, llmService, fileService);
    agentRegistry.register('orchestrator', orchestrator);
    logger.info('All agents registered successfully');
}
/**
 * Ensure a conversation exists for the current session
 */
function ensureConversation(mode) {
    if (!conversationService) {
        throw new Error('ConversationService not initialized');
    }
    // Check if current conversation still exists (might have been deleted via dashboard)
    if (currentConversationId && !conversationService.getConversation(currentConversationId)) {
        currentConversationId = null;
    }
    // Reuse existing conversation or create new one
    if (!currentConversationId) {
        const convMode = mode === 'plan' ? 'planning' : mode === 'code' ? 'development' : 'chat';
        const title = mode === 'plan' ? 'Planning' : mode === 'code' ? 'Development' : 'Ask';
        currentConversationId = conversationService.createConversation(`${title} Session`, convMode);
        logger.info(`Created new conversation: ${currentConversationId}`);
    }
    return currentConversationId;
}
async function processUserInput(context, apiKeyArg, inputArg, mode = 'code', options = {}) {
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
        logger.info(`Processing user input: ${input} (mode: ${mode}, model: ${options.model || 'auto'})`);
        // Show thinking indicator in UI
        agentPanel.showThinking(true);
        // Add user message to conversation UI
        // If from webview, the message is already displayed optimistically — add silently to history only
        agentPanel.addMessage('user', input, { silent: !!options.fromWebview });
        // Persist user message to disk
        let conversationHistory = '';
        if (conversationService) {
            try {
                const convId = ensureConversation(mode);
                conversationService.addMessage(convId, 'user', input);
                conversationHistory = conversationService.getConversationAsText(convId);
                logger.info(`Persisted user message to conversation ${convId}`);
            }
            catch (convErr) {
                logger.warn(`Conversation persistence error: ${convErr}`);
            }
        }
        // Initialize the appropriate provider based on model selection or API key detection
        let provider;
        const modelName = options.model || '';
        if (modelName === 'groq' || (!modelName && !apiKey.startsWith('AIza'))) {
            provider = new llm_1.GroqProvider();
            logger.info('Using Groq provider');
        }
        else {
            provider = new llm_1.GeminiProvider();
            logger.info('Using Gemini provider');
        }
        await provider.initialize(apiKey);
        llmService.setProvider(provider);
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            vscode.window.showErrorMessage('No workspace folder open');
            agentPanel.showThinking(false);
            return;
        }
        // Build context with conversation history
        const agentContext = new ContextBuilder_1.ContextBuilder()
            .setWorkspaceRoot(workspaceRoot)
            .setMetadata({
            userRequest: input,
            conversationHistory,
            mode,
            timestamp: new Date().toISOString()
        })
            .build();
        // Route to appropriate agent based on mode
        let result;
        if (mode === 'ask') {
            // Ask mode: simple direct LLM call without orchestration
            logger.info('Ask mode: sending directly to LLM');
            result = await llmService.generateText(`You are a helpful coding assistant. The user is asking about their project.\n\nUser question: ${input}\n\nProvide a clear, concise answer.`);
        }
        else if (mode === 'plan') {
            // Plan mode: generate plan + run non-coding agents
            const orchestrator = agentRegistry.get('orchestrator');
            if (!orchestrator) {
                throw new Error('Orchestrator agent not found');
            }
            logger.info('Routing to Orchestrator.executePlan() for planning phase');
            result = await orchestrator.executePlan(agentContext);
        }
        else {
            // Code mode: run pending coding agents or detect workspace state
            const orchestrator = agentRegistry.get('orchestrator');
            if (!orchestrator) {
                throw new Error('Orchestrator agent not found');
            }
            logger.info('Routing to Orchestrator.executeCode() for code generation');
            result = await orchestrator.executeCode(agentContext);
        }
        // Add result to conversation UI
        agentPanel.addMessage('assistant', result || 'Task completed successfully!');
        agentPanel.showThinking(false);
        // Persist assistant response to disk
        if (conversationService && currentConversationId) {
            try {
                conversationService.addMessage(currentConversationId, 'assistant', result || 'Task completed successfully!');
                logger.info('Persisted assistant response to conversation');
            }
            catch (convErr) {
                logger.warn(`Failed to persist assistant response: ${convErr}`);
            }
        }
        logger.info(`Processing complete in ${mode} mode`);
        agentPanel.notifyProcessingComplete();
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error('Error processing input', error);
        // Show error in conversation
        agentPanel.addMessage('system', `Error: ${errorMsg}`);
        agentPanel.showThinking(false);
        // Persist error to conversation
        if (conversationService && currentConversationId) {
            try {
                conversationService.addMessage(currentConversationId, 'system', `Error: ${errorMsg}`);
            }
            catch (convErr) {
                // ignore
            }
        }
        vscode.window.showErrorMessage(`Processing failed: ${errorMsg}`);
    }
}
function deactivate() {
    recordingStatus.dispose();
    logger.info('Verno extension deactivated');
    logger.dispose();
}
/**
 * Load a conversation into the agent panel
 */
async function loadConversation(conversationId) {
    if (!conversationService || !agentPanel) {
        return;
    }
    const conv = conversationService.getConversation(conversationId);
    if (!conv) {
        vscode.window.showErrorMessage(`Conversation ${conversationId} not found`);
        return;
    }
    // Set as current
    currentConversationId = conversationId;
    conversationService.setCurrentConversation(conversationId);
    // Display in UI
    agentPanel.displayConversation(conv.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp).toISOString()
    })));
    logger.info(`Loaded conversation: ${conversationId}`);
    vscode.window.showInformationMessage(`Loaded conversation: ${conv.title || 'Untitled Session'}`);
}
//# sourceMappingURL=extension.js.map