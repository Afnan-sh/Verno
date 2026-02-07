"use strict";
/**
 * Agent registry for managing available agents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRegistry = void 0;
class AgentRegistry {
    agents = new Map();
    register(name, agent) {
        this.agents.set(name, agent);
    }
    unregister(name) {
        return this.agents.delete(name);
    }
    get(name) {
        return this.agents.get(name);
    }
    getAll() {
        return new Map(this.agents);
    }
    exists(name) {
        return this.agents.has(name);
    }
    list() {
        return Array.from(this.agents.keys());
    }
}
exports.AgentRegistry = AgentRegistry;
//# sourceMappingURL=AgentRegistry.js.map