"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeError = normalizeError;
/**
 * Formats the error message into human-friendly text
 *
 * @param input The raw error message from compilation
 * @returns The normalized error message
 */
function normalizeError(input) {
    return input
        .toLowerCase()
        .replaceAll(/[\n\r]/g, " ")
        .replaceAll(/[^a-z0-9\s]/g, " ")
        .replaceAll(/\s+/g, " ")
        .trim();
}
