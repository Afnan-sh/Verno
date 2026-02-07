"use strict";
/**
 * Test generator agent for creating unit and integration tests
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
exports.TestGeneratorAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
const path = __importStar(require("path"));
class TestGeneratorAgent extends BaseAgent_1.BaseAgent {
    logger;
    llmService;
    fileService;
    name = 'TestGeneratorAgent';
    description = 'Generates unit and integration tests for code';
    constructor(logger, llmService, fileService) {
        super(logger);
        this.logger = logger;
        this.llmService = llmService;
        this.fileService = fileService;
    }
    validateInput(context) {
        return this.validateContext(context) && (!!context.fileContent || !!context.metadata?.codeAnalysis);
    }
    async preProcess(context) {
        this.log('Pre-processing test generation request');
        return context;
    }
    async execute(context) {
        if (!this.validateInput(context)) {
            throw new Error('Invalid input for test generation');
        }
        this.log('Generating tests');
        try {
            const codeAnalysis = context.metadata?.codeAnalysis;
            const workspaceRoot = context.workspaceRoot;
            // Generate unit tests
            const unitTestPrompt = `Generate comprehensive unit tests for this specification: ${codeAnalysis}. Use Jest framework and return only the test code.`;
            const unitTests = await this.llmService.generateText(unitTestPrompt);
            const unitTestPath = path.join(workspaceRoot, 'generated', 'index.test.ts');
            await this.fileService.createFile(unitTestPath, unitTests);
            this.log(`Unit tests created: ${unitTestPath}`);
            // Generate integration tests
            const integrationTestPrompt = `Generate integration tests for this specification: ${codeAnalysis}. Return only the test code.`;
            const integrationTests = await this.llmService.generateText(integrationTestPrompt);
            const integrationTestPath = path.join(workspaceRoot, 'generated', 'integration.test.ts');
            await this.fileService.createFile(integrationTestPath, integrationTests);
            this.log(`Integration tests created: ${integrationTestPath}`);
            return await this.postProcess('Test generation complete');
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.log(`Test generation error: ${errorMsg}`, 'error');
            throw error;
        }
    }
    async postProcess(output) {
        this.log('Post-processing generated tests');
        return output;
    }
}
exports.TestGeneratorAgent = TestGeneratorAgent;
//# sourceMappingURL=TestGeneratorAgent.js.map