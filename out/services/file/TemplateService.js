"use strict";
/**
 * File template service for code generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
class TemplateService {
    templates = new Map();
    registerTemplate(name, template) {
        this.templates.set(name, template);
    }
    getTemplate(name) {
        return this.templates.get(name);
    }
    renderTemplate(name, variables) {
        const template = this.getTemplate(name);
        if (!template) {
            throw new Error(`Template '${name}' not found`);
        }
        let rendered = template;
        for (const [key, value] of Object.entries(variables)) {
            rendered = rendered.replace(`{{${key}}}`, value);
        }
        return rendered;
    }
}
exports.TemplateService = TemplateService;
//# sourceMappingURL=TemplateService.js.map