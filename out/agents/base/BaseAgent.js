"use strict";
/**
 * Abstract base class for all agents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
class BaseAgent {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    log(message, level = 'info') {
        this.logger[level](`[${this.name}] ${message}`);
    }
    validateContext(context) {
        if (!context.workspaceRoot) {
            this.log('Missing workspaceRoot in context', 'error');
            return false;
        }
        return true;
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=BaseAgent.js.map