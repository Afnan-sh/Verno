"use strict";
/**
 * Project Analyzer: Analyzes repository structure and provides context
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
exports.ProjectAnalyzer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Service for analyzing project structure
 */
class ProjectAnalyzer {
    workspaceRoot;
    ignorePatterns = [
        'node_modules',
        '.git',
        '.vscode',
        'out',
        'dist',
        'build',
        '.verno',
        '.next',
        'coverage',
    ];
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
    }
    /**
     * Analyze the project structure
     */
    async analyzeProject() {
        const filesByLanguage = new Map();
        let totalFiles = 0;
        let totalDirectories = 0;
        // Scan directory
        this.scanDirectory(this.workspaceRoot, filesByLanguage, { files: () => totalFiles++, dirs: () => totalDirectories++ });
        // Determine main language
        const mainLanguage = this.getMainLanguage(filesByLanguage);
        // Detect frameworks
        const frameworks = await this.detectFrameworks();
        // Get dependencies
        const dependencies = await this.getDependencies();
        // Generate structure
        const structure = this.generateStructure();
        return {
            rootPath: this.workspaceRoot,
            totalFiles,
            totalDirectories,
            filesByLanguage,
            mainLanguage,
            frameworks,
            dependencies,
            structure,
        };
    }
    /**
     * Get project context for agents
     */
    async getProjectContext() {
        const analysis = await this.analyzeProject();
        let context = '# Project Context\n\n';
        context += `**Root Path**: ${analysis.rootPath}\n`;
        context += `**Main Language**: ${analysis.mainLanguage}\n`;
        context += `**Total Files**: ${analysis.totalFiles}\n`;
        context += `**Total Directories**: ${analysis.totalDirectories}\n\n`;
        if (analysis.frameworks.length > 0) {
            context += `**Frameworks**: ${analysis.frameworks.join(', ')}\n\n`;
        }
        if (analysis.dependencies.length > 0) {
            context += `**Key Dependencies** (showing first 10):\n`;
            analysis.dependencies.slice(0, 10).forEach(dep => {
                context += `- ${dep}\n`;
            });
            context += '\n';
        }
        context += `**Project Structure**:\n\`\`\`\n${analysis.structure}\n\`\`\`\n`;
        return context;
    }
    /**
     * Check if project is new or existing
     */
    isNewProject() {
        const codeExtensions = new Set(['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.go', '.rs']);
        const ignoreDirs = new Set(['node_modules', '.git', '.vscode', 'out', 'dist', 'build', '.verno', '.next', 'coverage']);
        const hasCodeFile = (dir, depth = 0) => {
            if (depth > 3) {
                return false;
            } // Don't scan too deep
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    if (ignoreDirs.has(entry.name)) {
                        continue;
                    }
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isFile() && codeExtensions.has(path.extname(entry.name))) {
                        return true;
                    }
                    if (entry.isDirectory() && hasCodeFile(fullPath, depth + 1)) {
                        return true;
                    }
                }
            }
            catch {
                // Skip inaccessible dirs
            }
            return false;
        };
        return !hasCodeFile(this.workspaceRoot);
    }
    /**
     * Scan directory recursively
     */
    scanDirectory(dirPath, filesByLanguage, counters) {
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                if (this.shouldIgnore(entry.name)) {
                    continue;
                }
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    counters.dirs();
                    this.scanDirectory(fullPath, filesByLanguage, counters);
                }
                else if (entry.isFile()) {
                    counters.files();
                    const ext = path.extname(entry.name);
                    if (ext) {
                        const count = filesByLanguage.get(ext) || 0;
                        filesByLanguage.set(ext, count + 1);
                    }
                }
            }
        }
        catch (err) {
            // Ignore errors for inaccessible directories
        }
    }
    /**
     * Get main programming language
     */
    getMainLanguage(filesByLanguage) {
        const languageMap = {
            '.ts': 'TypeScript',
            '.tsx': 'TypeScript',
            '.js': 'JavaScript',
            '.jsx': 'JavaScript',
            '.py': 'Python',
            '.java': 'Java',
            '.go': 'Go',
            '.rs': 'Rust',
            '.cpp': 'C++',
            '.c': 'C',
            '.cs': 'C#',
        };
        let maxCount = 0;
        let mainLang = 'Unknown';
        for (const [ext, count] of filesByLanguage.entries()) {
            if (count > maxCount && languageMap[ext]) {
                maxCount = count;
                mainLang = languageMap[ext];
            }
        }
        return mainLang;
    }
    /**
     * Detect frameworks
     */
    async detectFrameworks() {
        const frameworks = [];
        const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                const allDeps = {
                    ...packageJson.dependencies,
                    ...packageJson.devDependencies,
                };
                if (allDeps['react'])
                    frameworks.push('React');
                if (allDeps['vue'])
                    frameworks.push('Vue');
                if (allDeps['angular'])
                    frameworks.push('Angular');
                if (allDeps['next'])
                    frameworks.push('Next.js');
                if (allDeps['express'])
                    frameworks.push('Express');
                if (allDeps['nestjs'])
                    frameworks.push('NestJS');
                if (allDeps['vscode'])
                    frameworks.push('VSCode Extension');
            }
            catch (err) {
                // Ignore JSON parse errors
            }
        }
        return frameworks;
    }
    /**
     * Get project dependencies
     */
    async getDependencies() {
        const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                return Object.keys(packageJson.dependencies || {});
            }
            catch (err) {
                return [];
            }
        }
        return [];
    }
    /**
     * Generate project structure tree
     */
    generateStructure(dirPath = this.workspaceRoot, prefix = '') {
        let structure = '';
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true })
                .filter(e => !this.shouldIgnore(e.name))
                .sort((a, b) => {
                if (a.isDirectory() && !b.isDirectory())
                    return -1;
                if (!a.isDirectory() && b.isDirectory())
                    return 1;
                return a.name.localeCompare(b.name);
            });
            entries.forEach((entry, index) => {
                const isLast = index === entries.length - 1;
                const connector = isLast ? '└── ' : '├── ';
                const fullPath = path.join(dirPath, entry.name);
                structure += `${prefix}${connector}${entry.name}${entry.isDirectory() ? '/' : ''}\n`;
                if (entry.isDirectory() && prefix.split('│').length < 3) {
                    const newPrefix = prefix + (isLast ? '    ' : '│   ');
                    structure += this.generateStructure(fullPath, newPrefix);
                }
            });
        }
        catch (err) {
            // Ignore errors
        }
        return structure;
    }
    /**
     * Check if path should be ignored
     */
    shouldIgnore(name) {
        return this.ignorePatterns.some(pattern => name.includes(pattern));
    }
}
exports.ProjectAnalyzer = ProjectAnalyzer;
//# sourceMappingURL=ProjectAnalyzer.js.map