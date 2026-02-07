"use strict";
/**
 * Code generator agent for generating code from specifications
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
exports.CodeGeneratorAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
const path = __importStar(require("path"));
class CodeGeneratorAgent extends BaseAgent_1.BaseAgent {
    logger;
    llmService;
    fileService;
    name = 'CodeGeneratorAgent';
    description = 'Generates code based on specifications and requirements';
    constructor(logger, llmService, fileService) {
        super(logger);
        this.logger = logger;
        this.llmService = llmService;
        this.fileService = fileService;
    }
    validateInput(context) {
        return this.validateContext(context) && !!context.metadata?.specification;
    }
    async preProcess(context) {
        this.log('Pre-processing code generation request');
        return context;
    }
    async execute(context) {
        if (!this.validateInput(context)) {
            throw new Error('Invalid input for code generation');
        }
        this.log('Generating code files');
        try {
            const specification = context.metadata?.specification;
            const workspaceRoot = context.workspaceRoot;
            // Generate main code file
            const codePrompt = `Generate production-ready TypeScript code based on this specification: ${specification}. Return only the code without explanations.`;
            const generatedCode = await this.llmService.generateText(codePrompt);
            const codeFilePath = path.join(workspaceRoot, 'generated', 'index.ts');
            await this.fileService.createFile(codeFilePath, generatedCode);
            this.log(`Code file created: ${codeFilePath}`);
            // Generate interfaces/types
            const typesPrompt = `Generate TypeScript interfaces and types for this specification: ${specification}. Return only the type definitions.`;
            const generatedTypes = await this.llmService.generateText(typesPrompt);
            const typesFilePath = path.join(workspaceRoot, 'generated', 'types.ts');
            await this.fileService.createFile(typesFilePath, generatedTypes);
            this.log(`Types file created: ${typesFilePath}`);
            return await this.postProcess(`Generated code files for: ${specification}`);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.log(`Code generation error: ${errorMsg}`, 'error');
            throw error;
        }
    }
    async postProcess(output) {
        this.log('Post-processing generated code');
        return output;
    }
}
exports.CodeGeneratorAgent = CodeGeneratorAgent;
//# sourceMappingURL=CodeGeneratorAgent.js.map