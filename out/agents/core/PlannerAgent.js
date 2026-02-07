"use strict";
/**
 * Planner agent that creates execution plans
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
class PlannerAgent extends BaseAgent_1.BaseAgent {
    name = 'PlannerAgent';
    description = 'Creates detailed execution plans for complex tasks';
    async execute(context) {
        if (!this.validateContext(context)) {
            throw new Error('Invalid context provided to PlannerAgent');
        }
        this.log('Creating execution plan');
        const plan = {
            steps: [],
            estimatedDuration: 0,
            agents: []
        };
        // TODO: Implement plan generation logic
        return JSON.stringify(plan);
    }
}
exports.PlannerAgent = PlannerAgent;
//# sourceMappingURL=PlannerAgent.js.map