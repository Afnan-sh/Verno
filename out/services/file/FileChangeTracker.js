"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileChangeTracker = void 0;
/**
 * Tracks file changes made by agents for diff viewing
 */
class FileChangeTracker {
    changes = [];
    recordChange(filePath, newContent, oldContent) {
        const operation = oldContent ? 'update' : 'create';
        this.changes.push({
            filePath,
            operation,
            oldContent,
            newContent,
            timestamp: Date.now()
        });
    }
    recordDelete(filePath, oldContent) {
        this.changes.push({
            filePath,
            operation: 'delete',
            oldContent,
            timestamp: Date.now()
        });
    }
    getChanges() {
        return [...this.changes];
    }
    getDiffSummary() {
        let summary = '';
        for (const change of this.changes) {
            summary += `${change.operation.toUpperCase()}: ${change.filePath}\n`;
            if (change.operation === 'create' || change.operation === 'update') {
                const lines = change.newContent?.split('\n').length || 0;
                summary += `  Lines: ${lines}\n`;
            }
        }
        return summary;
    }
    getDiffForFile(filePath) {
        const change = this.changes.find(c => c.filePath === filePath);
        if (!change)
            return null;
        return {
            before: change.oldContent || '',
            after: change.newContent || ''
        };
    }
    clear() {
        this.changes = [];
    }
}
exports.FileChangeTracker = FileChangeTracker;
//# sourceMappingURL=FileChangeTracker.js.map