"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explainError = explainError;
const patterns_1 = require("../patterns");
const normalize_1 = require("../parser/normalize");
function explainError(raw) {
    const input = (0, normalize_1.normalizeError)(raw);
    for (const pattern of patterns_1.patterns) {
        if (pattern.match(input)) {
            return pattern.explain(input);
        }
    }
    return {
        title: "Unknown Error",
        explanation: "We couldn't recognize this Cairo error yet.",
        fix: "Check the raw error output."
    };
}
