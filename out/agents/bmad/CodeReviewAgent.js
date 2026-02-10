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
exports.CodeReviewAgent = void 0;
const BaseAgent_1 = require("../base/BaseAgent");
const feedback_1 = require("../../services/feedback");
const childProcess = __importStar(require("child_process"));
const util = __importStar(require("util"));
const fs = __importStar(require("fs"));
const exec = util.promisify(childProcess.exec);
/**
 * Code Review Agent — runs after DeveloperAgent to validate generated code.
 *
 * Checks for:
 *  - Skeleton / stub code (empty bodies, TODO comments, placeholder logic)
 *  - Structural quality via LLM review
 *  - TypeScript compilation errors (if applicable)
 *  - Test execution (if test script exists)
 *
 * Produces a CODE_REVIEW.md report and returns a structured verdict.
 */
class CodeReviewAgent extends BaseAgent_1.BaseAgent {
    logger;
    llmService;
    fileService;
    changeTracker;
    name = 'codereview';
    description = 'Code Reviewer — validates generated code for completeness, correctness, and quality';
    feedbackService;
    constructor(logger, llmService, fileService, changeTracker) {
        super(logger);
        this.logger = logger;
        this.llmService = llmService;
        this.fileService = fileService;
        this.changeTracker = changeTracker;
    }
    async execute(context) {
        this.log('Running Code Review Agent — validating generated code');
        if (context.workspaceRoot) {
            this.feedbackService = new feedback_1.FeedbackService(context.workspaceRoot);
        }
        const completedTasks = [];
        const issues = [];
        const suggestions = [];
        // Get the developer's output
        const previousOutputs = (context.metadata?.previousOutputs || {});
        const developerOutput = previousOutputs['developer'] || '';
        if (!developerOutput) {
            const msg = 'No developer output found to review.';
            this.log(msg, 'warn');
            return msg;
        }
        // ── 1. Parse code files from developer output ──
        const files = this.parseCodeFiles(developerOutput);
        this.log(`Parsed ${files.length} files from developer output`);
        completedTasks.push(`Parsed ${files.length} files for review`);
        // ── 2. Static skeleton detection ──
        const skeletonIssues = this.detectSkeletonCode(files);
        if (skeletonIssues.length > 0) {
            for (const issue of skeletonIssues) {
                issues.push(issue);
            }
            this.log(`Found ${skeletonIssues.length} skeleton code issues`, 'warn');
        }
        else {
            completedTasks.push('No skeleton code detected — all functions have implementations');
        }
        // ── 3. LLM-based quality review ──
        const llmReview = await this.llmQualityReview(files, context.metadata?.userRequest);
        completedTasks.push('Completed LLM quality review');
        // ── 4. Compilation & test checks (if workspace exists) ──
        let compilationResult = '';
        let testResult = '';
        if (context.workspaceRoot) {
            compilationResult = await this.checkCompilation(context.workspaceRoot, completedTasks, issues);
            testResult = await this.checkTests(context.workspaceRoot, completedTasks, issues);
        }
        // ── 5. Determine verdict ──
        const hasCritical = issues.some(i => i.severity === 'critical' || i.severity === 'high');
        const hasSkeletons = skeletonIssues.length > 0;
        const verdict = hasSkeletons ? 'FAIL — Skeleton code detected' :
            hasCritical ? 'NEEDS FIXES — Critical issues found' :
                'PASS — Code looks complete and functional';
        // ── 6. Build report ──
        const report = this.buildReport(files, skeletonIssues, llmReview, compilationResult, testResult, verdict, issues);
        // Save report
        if (context.workspaceRoot) {
            const reportPath = `${context.workspaceRoot}/CODE_REVIEW.md`;
            try {
                await this.fileService.createFile(reportPath, report);
                this.changeTracker.recordChange(reportPath, report);
                this.log(`Review report saved to ${reportPath}`);
                completedTasks.push('Saved code review report');
            }
            catch (err) {
                this.log(`Failed to write review report: ${err}`, 'error');
                issues.push({
                    severity: 'medium',
                    description: 'Failed to save review report',
                    context: `Error: ${err}`
                });
            }
        }
        // Generate feedback
        if (this.feedbackService && context.workspaceRoot) {
            const nextSteps = hasSkeletons
                ? ['Re-run DeveloperAgent with review feedback to fix skeleton code']
                : hasCritical
                    ? ['Fix critical issues and re-run quality checks']
                    : ['Code is ready for deployment', 'Consider additional manual testing'];
            this.feedbackService.createFeedback('CodeReviewAgent', completedTasks, hasSkeletons ? ['Fix skeleton code'] : [], issues, suggestions, nextSteps);
        }
        return report;
    }
    // ════════════════════════════════════════════
    // Skeleton Detection
    // ════════════════════════════════════════════
    /**
     * Statically detect skeleton / stub code patterns in generated files.
     */
    detectSkeletonCode(files) {
        const issues = [];
        const placeholderPatterns = [
            /\/\/\s*TODO/i,
            /\/\/\s*implement/i,
            /\/\/\s*add\s+(your\s+)?logic/i,
            /\/\/\s*code\s+for\s+handling/i,
            /\/\/\s*\.\.\./,
            /\/\/\s*complete\s+implementation/i,
            /\/\/\s*add\s+here/i,
            /\/\/\s*placeholder/i,
            /\/\/\s*stub/i,
        ];
        // Pattern for empty function bodies: => { }, () { }, { \n  }
        const emptyBodyPatterns = [
            /=>\s*\{\s*\}/, // arrow fn: => { }
            /\)\s*\{\s*\}/, // regular fn: ) { }
            /=>\s*\{\s*\n\s*\}/, // multiline arrow: => {\n  }
            /\)\s*\{\s*\n\s*\}/, // multiline regular: ) {\n  }
        ];
        for (const file of files) {
            // Check placeholders
            for (const pattern of placeholderPatterns) {
                const match = file.content.match(pattern);
                if (match) {
                    issues.push({
                        severity: 'critical',
                        description: `Skeleton code in ${file.name}: placeholder comment found`,
                        context: `Pattern matched: "${match[0]}" — file should contain real implementation, not placeholders`
                    });
                }
            }
            // Check empty bodies
            for (const pattern of emptyBodyPatterns) {
                if (pattern.test(file.content)) {
                    issues.push({
                        severity: 'critical',
                        description: `Skeleton code in ${file.name}: empty function body detected`,
                        context: 'Function has empty body {} — must contain real implementation logic'
                    });
                }
            }
            // Check for very short files (likely stubs)
            const lines = file.content.split('\n').filter(l => l.trim().length > 0);
            if (lines.length < 3 && !file.name.endsWith('.json') && !file.name.endsWith('.env')) {
                issues.push({
                    severity: 'high',
                    description: `Suspiciously short file: ${file.name} (${lines.length} non-empty lines)`,
                    context: 'File may be a stub — expected more substantial implementation'
                });
            }
        }
        return issues;
    }
    // ════════════════════════════════════════════
    // LLM Quality Review
    // ════════════════════════════════════════════
    async llmQualityReview(files, userRequest) {
        if (files.length === 0) {
            return 'No files to review.';
        }
        const filesSummary = files.map(f => `### ${f.name}\n\`\`\`\n${f.content.substring(0, 3000)}\n\`\`\``).join('\n\n');
        const prompt = `You are a senior code reviewer. Review the following generated code files for quality and correctness.

User's original request: ${userRequest || 'Not specified'}

## Generated Files:
${filesSummary.substring(0, 12000)}

## Review Checklist:
1. Does each function have a REAL implementation (not empty bodies or placeholder comments)?
2. Are imports correct and used?
3. Is error handling present and meaningful?
4. Do route handlers actually process requests (parse body, call models, return responses)?
5. Are models/schemas complete with field definitions?
6. Would this code actually run without errors?
7. Are there any logical bugs or missing pieces?

Provide a concise review with:
- ISSUES: specific problems found (if any)
- VERDICT: PASS, NEEDS_FIXES, or FAIL
- SUGGESTIONS: improvements to consider

Be direct and specific. If the code is just skeleton/template code with empty bodies, say FAIL clearly.`;
        try {
            const review = await this.llmService.generateText(prompt);
            return review;
        }
        catch (error) {
            this.log(`LLM quality review failed: ${error}`, 'warn');
            return `LLM review unavailable: ${error}`;
        }
    }
    // ════════════════════════════════════════════
    // Compilation & Test Checks
    // ════════════════════════════════════════════
    async checkCompilation(workspaceRoot, completedTasks, issues) {
        try {
            const tsconfigExists = fs.existsSync(`${workspaceRoot}/tsconfig.json`);
            if (!tsconfigExists) {
                return 'TypeScript compilation skipped — no tsconfig.json found';
            }
            this.log('Running TypeScript compilation check...');
            const { stdout, stderr } = await exec('npx tsc --noEmit', {
                cwd: workspaceRoot,
                timeout: 30000
            });
            completedTasks.push('TypeScript compilation passed');
            return 'TypeScript compilation: PASSED';
        }
        catch (error) {
            const errMsg = error.message?.substring(0, 500) || String(error);
            issues.push({
                severity: 'high',
                description: 'TypeScript compilation failed',
                context: errMsg
            });
            return `TypeScript compilation: FAILED\n${errMsg}`;
        }
    }
    async checkTests(workspaceRoot, completedTasks, issues) {
        try {
            const packageJsonPath = `${workspaceRoot}/package.json`;
            if (!fs.existsSync(packageJsonPath)) {
                return 'Test execution skipped — no package.json found';
            }
            const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(packageJsonContent);
            if (!packageJson.scripts?.test) {
                return 'Test execution skipped — no test script in package.json';
            }
            this.log('Running tests...');
            const { stdout } = await exec('npm test', {
                cwd: workspaceRoot,
                timeout: 60000
            });
            completedTasks.push('All tests passed');
            return `Tests: PASSED\n${stdout.substring(0, 500)}`;
        }
        catch (error) {
            const errMsg = error.message?.substring(0, 500) || String(error);
            issues.push({
                severity: 'high',
                description: 'Tests failed',
                context: errMsg
            });
            return `Tests: FAILED\n${errMsg}`;
        }
    }
    // ════════════════════════════════════════════
    // Report Builder
    // ════════════════════════════════════════════
    buildReport(files, skeletonIssues, llmReview, compilationResult, testResult, verdict, allIssues) {
        let report = `# 🔍 Code Review Report\n\n`;
        report += `**Verdict: ${verdict}**\n\n`;
        report += `**Files Reviewed:** ${files.length}\n`;
        report += `**Issues Found:** ${allIssues.length}\n`;
        report += `**Critical/High:** ${allIssues.filter(i => i.severity === 'critical' || i.severity === 'high').length}\n\n`;
        report += `---\n\n`;
        // Skeleton detection results
        report += `## 1. Skeleton Code Detection\n\n`;
        if (skeletonIssues.length === 0) {
            report += `✅ **No skeleton code detected.** All functions appear to have real implementations.\n\n`;
        }
        else {
            report += `❌ **${skeletonIssues.length} skeleton code issue(s) found:**\n\n`;
            for (const issue of skeletonIssues) {
                report += `- 🔴 **${issue.description}**\n  ${issue.context}\n\n`;
            }
        }
        // LLM review
        report += `## 2. Quality Review (AI)\n\n${llmReview}\n\n`;
        // Compilation
        if (compilationResult) {
            report += `## 3. Compilation\n\n${compilationResult}\n\n`;
        }
        // Tests
        if (testResult) {
            report += `## 4. Tests\n\n${testResult}\n\n`;
        }
        // Files reviewed
        report += `## 5. Files Reviewed\n\n`;
        for (const file of files) {
            const lineCount = file.content.split('\n').length;
            report += `- \`${file.name}\` (${lineCount} lines)\n`;
        }
        report += '\n';
        return report;
    }
    // ════════════════════════════════════════════
    // Utility
    // ════════════════════════════════════════════
    parseCodeFiles(content) {
        const files = [];
        const fileRegex = /```FILE:\s*([^\n]+)\n([\s\S]*?)```/g;
        let match;
        while ((match = fileRegex.exec(content)) !== null) {
            const filename = match[1].trim();
            const filecontent = match[2].trim();
            files.push({ name: filename, content: filecontent });
        }
        return files;
    }
}
exports.CodeReviewAgent = CodeReviewAgent;
//# sourceMappingURL=CodeReviewAgent.js.map