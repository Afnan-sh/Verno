"use strict";
/**
 * Agent context builder
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextBuilder = void 0;
class ContextBuilder {
    context = {};
    setWorkspaceRoot(root) {
        this.context.workspaceRoot = root;
        return this;
    }
    setSelectedText(text) {
        this.context.selectedText = text;
        return this;
    }
    setFilePath(filePath) {
        this.context.filePath = filePath;
        return this;
    }
    setFileContent(content) {
        this.context.fileContent = content;
        return this;
    }
    setMetadata(metadata) {
        this.context.metadata = metadata;
        return this;
    }
    build() {
        if (!this.context.workspaceRoot) {
            throw new Error('Workspace root is required');
        }
        return {
            workspaceRoot: this.context.workspaceRoot,
            selectedText: this.context.selectedText,
            filePath: this.context.filePath,
            fileContent: this.context.fileContent,
            metadata: this.context.metadata
        };
    }
}
exports.ContextBuilder = ContextBuilder;
//# sourceMappingURL=ContextBuilder.js.map