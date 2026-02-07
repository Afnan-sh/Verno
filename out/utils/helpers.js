"use strict";
/**
 * General helper utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = delay;
exports.debounce = debounce;
exports.throttle = throttle;
exports.capitalize = capitalize;
exports.generateId = generateId;
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function generateId() {
    return Math.random().toString(36).substring(2, 11);
}
//# sourceMappingURL=helpers.js.map