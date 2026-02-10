"use strict";
/**
 * Planning Agent: Dedicated agent for structured project planning
 * Uses LangChain for conversation-based iterative planning
 */
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
exports.PlanningAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
const LangChainService_1 = require("../../services/llm/LangChainService");
const PlanningService_1 = require("../../services/planning/PlanningService");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Planning Agent for generating detailed project plans
 */
class PlanningAgent extends BaseAgent_1.BaseAgent {
    llmService;
    name = 'PlanningAgent';
    description = 'Generates structured project plans with requirements, architecture, and milestones';
    langChainService = null;
    planningService = null;
    apiKey; // API key field for initialization
    constructor(logger, llmService // Accept LLMService for compatibility
    ) {
        super(logger);
        this.llmService = llmService;
    }
    /**
     * Initialize the planning agent with LangChain
     */
    async initialize(apiKey, providerType = 'gemini') {
        this.apiKey = apiKey;
        this.langChainService = new LangChainService_1.LangChainService();
        await this.langChainService.initializeProvider(providerType, apiKey);
        this.log('Planning agent initialized with LangChain');
    }
    /**
     * Execute planning agent to generate project plan
     */
    async execute(context) {
        if (!this.validateContext(context)) {
            throw new Error('Invalid context for PlanningAgent');
        }
        this.log('Starting planning phase');
        // Initialize PlanningService
        if (!this.planningService) {
            this.planningService = new PlanningService_1.PlanningService(context.workspaceRoot);
        }
        const userRequest = String(context.metadata?.userRequest || '');
        const planningConversation = String(context.metadata?.planningConversation || '');
        // Generate structured plan
        const plan = await this.generatePlan(userRequest, planningConversation);
        // Save plan to workspace
        if (context.workspaceRoot) {
            await this.savePlanToFile(context.workspaceRoot, plan);
        }
        this.log('Planning phase completed');
        return plan;
    }
    /**
     * Generate structured project plan using LLM (LangChain or direct llmService)
     */
    async generatePlan(userRequest, conversationHistory) {
        const planningPrompt = this.buildPlanningPrompt(userRequest, conversationHistory || '');
        // Use LangChain if initialized, otherwise fall back to llmService
        if (this.langChainService) {
            const sessionId = this.langChainService.createSession();
            return await this.langChainService.chat(planningPrompt, sessionId);
        }
        else if (this.llmService && typeof this.llmService.generateText === 'function') {
            // Direct fallback to llmService
            this.log('Using llmService directly (LangChain not initialized)');
            return await this.llmService.generateText(planningPrompt);
        }
        else {
            throw new Error('No LLM service available. Ensure the extension is configured with an API key.');
        }
    }
    /**
     * Stream plan generation with real-time updates
     */
    async streamPlan(userRequest, conversationHistory = '', onToken) {
        if (!this.langChainService) {
            throw new Error('Planning agent not initialized. Call initialize() first.');
        }
        const sessionId = this.langChainService.createSession();
        const planningPrompt = this.buildPlanningPrompt(userRequest, conversationHistory);
        await this.langChainService.streamChat(planningPrompt, sessionId, onToken);
    }
    /**
     * Continue planning conversation interactively
     */
    async continueConversation(sessionId, userMessage) {
        if (!this.langChainService) {
            throw new Error('Planning agent not initialized');
        }
        return await this.langChainService.chat(userMessage, sessionId);
    }
    /**
     * Build planning prompt with structured requirements
     */
    buildPlanningPrompt(userRequest, conversationHistory) {
        return `You are an expert software planning and architecture consultant. Your goal is to create a comprehensive, actionable project plan based on the user's requirements.

Generate a detailed project plan that includes:

1. **Project Overview**
   - High-level summary of the project
   - Primary objectives and goals
   - Target users/audience

2. **Requirements Analysis**
   - Functional requirements (what the system should do)
   - Non-functional requirements (performance, security, scalability, etc.)
   - Constraints and assumptions

3. **Architecture Decisions**
   - Technology stack recommendations with justification
   - System architecture (monolithic, microservices, serverless, etc.)
   - Database design approach
   - Key architectural patterns to use

4. **Implementation Milestones**
   - Phase 1: Foundation/MVP features
   - Phase 2: Core functionality
   - Phase 3: Advanced features
   - Phase 4: Optimization and polish
   - Each phase should have clear deliverables and estimated timeline

5. **Dependencies and Risks**
   - External dependencies (APIs, services, libraries)
   - Technical risks and mitigation strategies
   - Potential blockers and how to address them

6. **Development Workflow**
   - Recommended development practices
   - Testing strategy
   - Deployment approach

User Request:
${userRequest}

${conversationHistory ? `\nPrevious Planning Conversation:\n${conversationHistory}` : ''}

Provide a comprehensive plan in markdown format with clear sections and actionable details.`;
    }
    /**
     * Save plan to workspace file
     */
    async savePlanToFile(workspaceRoot, plan) {
        try {
            const planningDir = path.join(workspaceRoot, '.verno');
            if (!fs.existsSync(planningDir)) {
                fs.mkdirSync(planningDir, { recursive: true });
            }
            const planPath = path.join(planningDir, 'PROJECT_PLAN.md');
            fs.writeFileSync(planPath, plan, 'utf-8');
            this.log(`Plan saved to ${planPath}`);
        }
        catch (err) {
            this.log(`Failed to save plan: ${err}`, 'error');
        }
    }
}
exports.PlanningAgent = PlanningAgent;
//# sourceMappingURL=PlanningAgent.js.map