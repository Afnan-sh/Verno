"use strict";
/**
 * TODO Service: Manages agent TODO lists and task tracking
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
exports.TodoService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Service for managing agent TODO lists
 */
class TodoService {
    workspaceRoot;
    todosDir;
    todoLists = new Map();
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this.todosDir = path.join(workspaceRoot, '.verno', 'todos');
        this.ensureDirectoryExists();
        this.loadAllTodoLists();
    }
    /**
     * Create a TODO list for an agent
     */
    createTodoList(agentName, tasks) {
        const todoList = {
            agentName,
            tasks: tasks.map((task, index) => ({
                ...task,
                id: `task-${agentName}-${Date.now()}-${index}`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            })),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        this.todoLists.set(agentName, todoList);
        this.saveTodoList(todoList);
        return todoList;
    }
    /**
     * Add a task to an agent's TODO list
     */
    addTask(agentName, task) {
        let todoList = this.todoLists.get(agentName);
        if (!todoList) {
            todoList = {
                agentName,
                tasks: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            this.todoLists.set(agentName, todoList);
        }
        const newTask = {
            ...task,
            id: `task-${agentName}-${Date.now()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        todoList.tasks.push(newTask);
        todoList.updatedAt = Date.now();
        this.saveTodoList(todoList);
        return newTask;
    }
    /**
     * Update a task's status
     */
    updateTaskStatus(agentName, taskId, status) {
        const todoList = this.todoLists.get(agentName);
        if (!todoList) {
            throw new Error(`TODO list for agent ${agentName} not found`);
        }
        const task = todoList.tasks.find(t => t.id === taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }
        task.status = status;
        task.updatedAt = Date.now();
        if (status === 'completed') {
            task.completedAt = Date.now();
        }
        todoList.updatedAt = Date.now();
        this.saveTodoList(todoList);
    }
    /**
     * Get TODO list for an agent
     */
    getTodoList(agentName) {
        return this.todoLists.get(agentName) || null;
    }
    /**
     * Get all TODO lists
     */
    getAllTodoLists() {
        return Array.from(this.todoLists.values());
    }
    /**
     * Get pending tasks for an agent
     */
    getPendingTasks(agentName) {
        const todoList = this.todoLists.get(agentName);
        if (!todoList) {
            return [];
        }
        return todoList.tasks.filter(t => t.status === 'pending' || t.status === 'in-progress');
    }
    /**
     * Get completed tasks for an agent
     */
    getCompletedTasks(agentName) {
        const todoList = this.todoLists.get(agentName);
        if (!todoList) {
            return [];
        }
        return todoList.tasks.filter(t => t.status === 'completed');
    }
    /**
     * Clear all tasks for an agent
     */
    clearTodoList(agentName) {
        const todoList = this.todoLists.get(agentName);
        if (todoList) {
            todoList.tasks = [];
            todoList.updatedAt = Date.now();
            this.saveTodoList(todoList);
        }
    }
    /**
     * Delete a TODO list
     */
    deleteTodoList(agentName) {
        const filePath = this.getTodoListFilePath(agentName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        this.todoLists.delete(agentName);
    }
    /**
     * Generate TODO summary
     */
    getTodoSummary() {
        let summary = '# TODO Summary\n\n';
        for (const todoList of this.todoLists.values()) {
            const pending = todoList.tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
            const completed = todoList.tasks.filter(t => t.status === 'completed').length;
            const total = todoList.tasks.length;
            summary += `## ${todoList.agentName}\n`;
            summary += `- Total Tasks: ${total}\n`;
            summary += `- Pending: ${pending}\n`;
            summary += `- Completed: ${completed}\n`;
            summary += `- Progress: ${total > 0 ? Math.round((completed / total) * 100) : 0}%\n\n`;
        }
        return summary;
    }
    /**
     * Save a TODO list to disk
     */
    saveTodoList(todoList) {
        try {
            const filePath = this.getTodoListFilePath(todoList.agentName);
            fs.writeFileSync(filePath, JSON.stringify(todoList, null, 2), 'utf-8');
        }
        catch (err) {
            console.error(`Failed to save TODO list for ${todoList.agentName}:`, err);
        }
    }
    /**
     * Load all TODO lists from disk
     */
    loadAllTodoLists() {
        try {
            if (!fs.existsSync(this.todosDir)) {
                return;
            }
            const files = fs.readdirSync(this.todosDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(this.todosDir, file);
                    const data = fs.readFileSync(filePath, 'utf-8');
                    const todoList = JSON.parse(data);
                    this.todoLists.set(todoList.agentName, todoList);
                }
            }
        }
        catch (err) {
            console.error('Failed to load TODO lists:', err);
        }
    }
    /**
     * Ensure todos directory exists
     */
    ensureDirectoryExists() {
        if (!fs.existsSync(this.todosDir)) {
            fs.mkdirSync(this.todosDir, { recursive: true });
        }
    }
    /**
     * Get file path for a TODO list
     */
    getTodoListFilePath(agentName) {
        return path.join(this.todosDir, `${agentName}.json`);
    }
}
exports.TodoService = TodoService;
//# sourceMappingURL=TodoService.js.map