"use strict";
/**
 * Code generator agent tests
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
const assert = __importStar(require("assert"));
const CodeGeneratorAgent_1 = require("../../../agents/specialized/CodeGeneratorAgent");
const llm_1 = require("../../../services/llm");
const FileService_1 = require("../../../services/file/FileService");
suite('CodeGeneratorAgent Tests', () => {
    let agent;
    let mockLogger;
    let mockLLMService;
    let mockFileService;
    setup(() => {
        mockLogger = {
            info: () => { },
            warn: () => { },
            error: () => { },
            debug: () => { }
        };
        mockLLMService = new llm_1.LLMService();
        mockFileService = new FileService_1.FileService();
        agent = new CodeGeneratorAgent_1.CodeGeneratorAgent(mockLogger, mockLLMService, mockFileService);
    });
    test('Agent should have correct name', () => {
        assert.strictEqual(agent.name, 'CodeGeneratorAgent');
    });
    test('Agent should have description', () => {
        assert.ok(agent.description.length > 0);
    });
    // TODO: Add more comprehensive tests
});
//# sourceMappingURL=CodeGenerator.test.js.map