"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeError = normalizeError;
function normalizeError(input) {
    return input
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}
