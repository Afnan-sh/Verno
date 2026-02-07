"use strict";
/**
 * Debug agent for debugging assistance
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
class DebugAgent extends BaseAgent_1.BaseAgent {
    name = 'DebugAgent';
    description = 'Provides debugging assistance and analysis';
    validateInput(context) {
        return this.validateContext(context) && !!context.fileContent;
    }
    async preProcess(context) {
        this.log('Pre-processing debug request');
        return context;
    }
    async execute(context) {
        if (!this.validateInput(context)) {
            throw new Error('Invalid input for debugging');
        }
        this.log('Analyzing code for debugging');
        const debugInfo = {
            breakpoints: 0,
            watchExpressions: [],
            callStack: [],
            variables: {}
        };
        // TODO: Implement debugging logic
        return JSON.stringify(debugInfo);
    }
    async postProcess(output) {
        this.log('Post-processing debug information');
        return output;
    }
}
exports.DebugAgent = DebugAgent;
//# sourceMappingURL=DebugAgent.js.map