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
const assert = __importStar(require("assert"));
const AgentRegistry_1 = require("../../../agents/base/AgentRegistry");
const MultiAgentManager_1 = require("../../../agents/MultiAgentManager");
const BrainstormAgent_1 = require("../../../agents/BMAD/BrainstormAgent");
const ModelAgent_1 = require("../../../agents/BMAD/ModelAgent");
const DecideAgent_1 = require("../../../agents/BMAD/DecideAgent");
const ActAgent_1 = require("../../../agents/BMAD/ActAgent");
const llm_1 = require("../../../services/llm");
const FileService_1 = require("../../../services/file/FileService");
suite('BMAD Flow Tests', () => {
    test('MultiAgentManager runs stages and returns outputs', async () => {
        const mockLogger = { info: () => { }, warn: () => { }, error: () => { } };
        const registry = new AgentRegistry_1.AgentRegistry();
        const llm = new llm_1.LLMService();
        // Provide a mock provider that returns canned responses
        const mockProvider = {
            initialize: async () => { },
            generateText: async (prompt) => `response for: ${prompt}`,
            streamGenerate: async (prompt, opts, onToken) => {
                onToken(`part1:${prompt}`);
                onToken(`part2:${prompt}`);
            },
            getModelInfo: () => ({})
        };
        llm.setProvider(mockProvider);
        const fileService = new FileService_1.FileService();
        const manager = new MultiAgentManager_1.MultiAgentManager(mockLogger, registry, llm, fileService);
        // register agents directly
        registry.register('brainstorm', new BrainstormAgent_1.BrainstormAgent(mockLogger, llm));
        registry.register('model', new ModelAgent_1.ModelAgent(mockLogger, llm));
        registry.register('decide', new DecideAgent_1.DecideAgent(mockLogger, llm));
        registry.register('act', new ActAgent_1.ActAgent(mockLogger, llm));
        const context = { workspaceRoot: process.cwd(), metadata: { userRequest: 'test request' } };
        const outputs = await manager.runPipeline(context);
        assert.ok(outputs.brainstorm?.includes('part1') || outputs.brainstorm?.includes('response for'));
        assert.ok(outputs.model);
        assert.ok(outputs.decide);
        assert.ok(outputs.act);
    });
});
//# sourceMappingURL=BMADFlow.test.js.map