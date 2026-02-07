"use strict";
/**
 * Router agent that directs requests to appropriate specialized agents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
class RouterAgent extends BaseAgent_1.BaseAgent {
    name = 'RouterAgent';
    description = 'Routes user requests to the most appropriate specialized agent';
    async execute(context) {
        if (!this.validateContext(context)) {
            throw new Error('Invalid context provided to RouterAgent');
        }
        this.log('Routing request to appropriate agent');
        // TODO: Implement routing logic based on context and user intent
        return 'Routing complete';
    }
}
exports.RouterAgent = RouterAgent;
//# sourceMappingURL=RouterAgent.js.map