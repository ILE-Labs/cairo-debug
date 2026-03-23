"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explainError = explainError;
const sample_patterns_1 = require("../patterns/sample-patterns");
function explainError(raw) {
    const match = sample_patterns_1.sampleErrors.find((e) => e.pattern.test(raw));
    console.log({ match });
    if (!match) {
        return {
            title: "Unknown Error",
            explanation: raw,
            fix: "Refer to Cairo documentation or check syntax carefully."
        };
    }
    return {
        title: match.title,
        explanation: match.explanation,
        fix: match.fix
    };
}
