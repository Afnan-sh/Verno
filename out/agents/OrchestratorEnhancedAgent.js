"use strict";
/**
 * Orchestrator Agent Enhancement: TODO and Project Analysis
 * Extends orchestrator with TODO generation and project reading capabilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorEnhancedAgent = void 0;
const todo_1 = require("../services/todo");
const project_1 = require("../services/project");
const feedback_1 = require("../services/feedback");
class OrchestratorEnhancedAgent {
    workspaceRoot;
    logger;
    todoService = null;
    projectAnalyzer = null;
    feedbackService = null;
    constructor(workspaceRoot, logger) {
        this.workspaceRoot = workspaceRoot;
        this.logger = logger;
        this.initializeServices();
    }
    /**
     * Initialize services
     */
    initializeServices() {
        this.todoService = new todo_1.TodoService(this.workspaceRoot);
        this.projectAnalyzer = new project_1.ProjectAnalyzer(this.workspaceRoot);
        this.feedbackService = new feedback_1.FeedbackService(this.workspaceRoot);
    }
    /**
     * Analyze project and generate TODOs
     */
    async analyzeAndGenerateTodos(userRequest) {
        if (!this.projectAnalyzer || !this.todoService) {
            throw new Error('Services not initialized');
        }
        // Analyze project
        const analysis = await this.projectAnalyzer.analyzeProject();
        const isNew = this.projectAnalyzer.isNewProject();
        this.logger.info(`Project analysis: ${analysis.mainLanguage}, ${isNew ? 'new' : 'existing'}`);
        // Generate TODOs based on analysis
        const todos = this.generateTodosFromAnalysis(userRequest, analysis, isNew);
        // Create TODO list for Orchestrator
        this.todoService.createTodoList('Orchestrator', todos);
    }
    /**
     * Generate TODOs from project analysis
     */
    generateTodosFromAnalysis(userRequest, analysis, isNew) {
        const todos = [];
        if (isNew) {
            // New project TODOs
            todos.push({
                title: 'Initialize Project Structure',
                description: `Set up ${analysis.mainLanguage || 'project'} structure and configuration`,
                assignedAgent: 'ArchitectAgent',
                status: 'pending',
                dependencies: [],
                priority: 'high',
            });
            todos.push({
                title: 'Implement Core Features',
                description: `Develop core functionality for: ${userRequest}`,
                assignedAgent: 'DeveloperAgent',
                status: 'pending',
                dependencies: ['Initialize Project Structure'],
                priority: 'high',
            });
        }
        else {
            // Existing project TODOs
            todos.push({
                title: 'Analyze Existing Codebase',
                description: 'Review current implementation and identify integration points',
                assignedAgent: 'AnalystAgent',
                status: 'pending',
                dependencies: [],
                priority: 'high',
            });
            todos.push({
                title: 'Implement Requested Features',
                description: userRequest,
                assignedAgent: 'DeveloperAgent',
                status: 'pending',
                dependencies: ['Analyze Existing Codebase'],
                priority: 'high',
            });
        }
        // Common TODOs
        todos.push({
            title: 'Write Tests',
            description: 'Create unit and integration tests',
            assignedAgent: 'QAEngineerAgent',
            status: 'pending',
            dependencies: ['Implement Core Features', 'Implement Requested Features'],
            priority: 'medium',
        });
        todos.push({
            title: 'Update Documentation',
            description: 'Write/update technical documentation',
            assignedAgent: 'TechWriterAgent',
            status: 'pending',
            dependencies: ['Implement Core Features', 'Implement Requested Features'],
            priority: 'medium',
        });
        return todos;
    }
    /**
     * Get project context for agents
     */
    async getProjectContext() {
        if (!this.projectAnalyzer) {
            throw new Error('Project analyzer not initialized');
        }
        return await this.projectAnalyzer.getProjectContext();
    }
    /**
     * Get TODO summary
     */
    getTodoSummary() {
        if (!this.todoService) {
            return 'TODO service not available';
        }
        return this.todoService.getTodoSummary();
    }
    /**
     * Get feedback summary
     */
    getFeedbackSummary() {
        if (!this.feedbackService) {
            return 'Feedback service not available';
        }
        return this.feedbackService.getFeedbackSummary();
    }
    /**
     * Update TODO status
     */
    updateTodoStatus(agentName, taskId, status) {
        if (!this.todoService) {
            throw new Error('TODO service not initialized');
        }
        this.todoService.updateTaskStatus(agentName, taskId, status);
    }
}
exports.OrchestratorEnhancedAgent = OrchestratorEnhancedAgent;
//# sourceMappingURL=OrchestratorEnhancedAgent.js.map