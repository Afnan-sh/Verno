"use strict";
/**
 * Documentation agent for generating API and code documentation
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
exports.DocumentationAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
const path = __importStar(require("path"));
class DocumentationAgent extends BaseAgent_1.BaseAgent {
    logger;
    llmService;
    fileService;
    name = 'DocumentationAgent';
    description = 'Generates comprehensive documentation for code and APIs';
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
        this.log('Pre-processing documentation request');
        return context;
    }
    async execute(context) {
        if (!this.validateInput(context)) {
            throw new Error('Invalid input for documentation generation');
        }
        this.log('Generating documentation');
        try {
            const codeAnalysis = context.metadata?.codeAnalysis;
            const workspaceRoot = context.workspaceRoot;
            // Generate README
            const readmePrompt = `Generate a comprehensive README.md for this project specification: ${codeAnalysis}. Include installation, usage, and API documentation.`;
            const readmeContent = await this.llmService.generateText(readmePrompt);
            const readmePath = path.join(workspaceRoot, 'generated', 'README.md');
            await this.fileService.createFile(readmePath, readmeContent);
            this.log(`README created: ${readmePath}`);
            // Generate API documentation
            const apiDocPrompt = `Generate detailed API documentation for this specification: ${codeAnalysis}. Include all endpoints, parameters, and examples.`;
            const apiDocContent = await this.llmService.generateText(apiDocPrompt);
            const apiDocPath = path.join(workspaceRoot, 'generated', 'API.md');
            await this.fileService.createFile(apiDocPath, apiDocContent);
            this.log(`API documentation created: ${apiDocPath}`);
            return await this.postProcess('Documentation generation complete');
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.log(`Documentation generation error: ${errorMsg}`, 'error');
            throw error;
        }
    }
    async postProcess(output) {
        this.log('Post-processing documentation');
        return output;
    }
}
exports.DocumentationAgent = DocumentationAgent;
//# sourceMappingURL=DocumentationAgent.js.map