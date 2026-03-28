"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explainError = explainError;
const patterns_1 = require("../patterns");
const normalize_1 = require("../parser/normalize");
const score_1 = require("./score");
function explainError(raw) {
    const input = (0, normalize_1.normalizeError)(raw);
    let bestMatch = null, bestScore = 0;
    for (const pattern of patterns_1.patterns) {
        const score = (0, score_1.scorePattern)(pattern, input);
        if (score > bestScore) {
            bestScore = score;
            bestMatch = pattern;
        }
    }
    if (!bestMatch || bestScore === 0) {
        // Should return a default error
        return null;
    }
    return {
        category: bestMatch.category,
        severity: bestMatch.severity,
        what_happened: bestMatch.what_happened,
        why_cairo_specific: bestMatch.why_cairo_specific,
        fix: bestMatch.fix,
        example: bestMatch.example,
    };
}
