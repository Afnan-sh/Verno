"use strict";
/**
 * Input validation utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = isValidEmail;
exports.isValidUrl = isValidUrl;
exports.isValidPath = isValidPath;
exports.isValidJson = isValidJson;
exports.isNonEmpty = isNonEmpty;
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
function isValidPath(filePath) {
    return filePath.length > 0 && !filePath.includes('\x00');
}
function isValidJson(jsonString) {
    try {
        JSON.parse(jsonString);
        return true;
    }
    catch {
        return false;
    }
}
function isNonEmpty(value) {
    return value.trim().length > 0;
}
//# sourceMappingURL=validators.js.map