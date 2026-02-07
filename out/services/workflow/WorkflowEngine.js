"use strict";
/**
 * Workflow execution engine
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngine = void 0;
class WorkflowEngine {
    agentRegistry;
    constructor(agentRegistry) {
        this.agentRegistry = agentRegistry;
    }
    async executeWorkflow(workflow) {
        const results = [];
        for (const step of workflow.steps) {
            const agent = this.agentRegistry.get(step.agentName);
            if (!agent) {
                throw new Error(`Agent '${step.agentName}' not found in registry`);
            }
            const result = await agent.execute(workflow.context);
            results.push(result);
        }
        return results;
    }
}
exports.WorkflowEngine = WorkflowEngine;
//# sourceMappingURL=WorkflowEngine.js.map