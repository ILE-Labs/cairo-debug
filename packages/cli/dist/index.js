#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@cairo-debug/core");
const chalk_1 = __importDefault(require("chalk"));
const node_fs_1 = __importDefault(require("node:fs"));
// Reads piped input (scarb build output)
async function readStdin() {
    if (process.stdin.isTTY)
        return null;
    return new Promise((resolve) => {
        let data = "";
        process.stdin.on("data", (chunk) => (data += chunk));
        process.stdin.on("end", () => resolve(data.trim()));
    });
}
function fallbackExplanation(error) {
    return {
        category: "Unknown Cairo error",
        severity: "UNKNOWN",
        what_happened: "This error is not yet recognized by cairo-debug.",
        why_cairo_specific: "Cairo compiler errors can vary across versions and patterns. This one is not yet in the knowledge base.",
        fix: "Review the raw error message and consult Cairo documentation or add this pattern to the knowledge base.",
        example: error.slice(0, 200),
    };
}
function extractErrors(raw) {
    const lines = raw.split("\n");
    const errors = [];
    let currentError = [];
    for (const line of lines) {
        if (line.startsWith("error[")) {
            if (currentError.length > 0) {
                errors.push(currentError.join("\n"));
                currentError = [];
            }
        }
        if (line.trim() !== "") {
            currentError.push(line);
        }
    }
    if (currentError.length > 0) {
        errors.push(currentError.join("\n"));
    }
    return errors.filter((e) => e.includes("error[") || e.includes("error:"));
}
function extractLocation(errorBlock) {
    const match = errorBlock.match(/--> (.*):(\d+):(\d+)/);
    if (!match)
        return null;
    return {
        file: match[1],
        line: Number(match[2]),
        column: Number(match[3]),
    };
}
function getErrorKey(errorBlock) {
    const codeMatch = errorBlock.match(/error\[(E\d+)\]/);
    const messageMatch = errorBlock.match(/error\[E\d+\]: (.*)/);
    const code = codeMatch?.[1] || "UNKNOWN";
    const message = messageMatch?.[1]?.toLowerCase().trim() || "";
    return `${code}:${message}`;
}
function groupErrors(errors) {
    const map = new Map();
    for (const err of errors) {
        const key = getErrorKey(err);
        if (!map.has(key)) {
            map.set(key, []);
        }
        map.get(key).push(err);
    }
    return map;
}
function printPretty(result, index) {
    if (index !== undefined) {
        console.log(chalk_1.default.yellow(`Error ${index + 1}`));
    }
    const locationPreview = result.locations
        .slice(0, 2)
        .map((l) => `${l.file.split("/").pop()}:${l.line}`)
        .join(", ");
    console.log(chalk_1.default.red.bold(`[ERROR] ${result.explanation.category} (${result.occurrences} occurrences)`));
    console.log(chalk_1.default.gray(`Locations: ${locationPreview}`));
    console.log(chalk_1.default.white(`\nWhat happened:\n ${result.explanation.what_happened}`));
    console.log(chalk_1.default.white(`\nWhy this happens in Cairo:\n ${result.explanation.why_cairo_specific}`));
    console.log(chalk_1.default.green(`\nFix:\n ${result.explanation.fix}`));
    console.log(chalk_1.default.gray("\n----------------------------------------\n"));
}
function printHelp() {
    console.log(`
cairo-debug CLI

Usage:
  cairo-debug explain <file | error string>

Examples:
  cairo-debug explain ./src/contract.cairo
  scarb build 2>&1 | cairo-debug explain
  cairo-debug explain "Trait has no implementation"
  cairo-debug explain ./file.cairo --json
`);
}
async function handleExplain(args) {
    const isJson = args.includes("--json");
    // remove --json flag
    const cleanArgs = args.filter((arg) => arg !== "--json");
    let input = null;
    const stdin = await readStdin();
    if (stdin) {
        input = stdin;
    }
    else if (cleanArgs[0] && node_fs_1.default.existsSync(cleanArgs[0])) {
        input = node_fs_1.default.readFileSync(cleanArgs[0], "utf-8");
    }
    else if (cleanArgs.length > 0) {
        input = cleanArgs.join(" ");
    }
    if (!input) {
        console.error(chalk_1.default.red("No error message provided. Please provide an error message as an argument or via stdin."));
        process.exit(1);
    }
    const extractedErrors = extractErrors(input);
    if (extractedErrors.length === 0) {
        console.log(chalk_1.default.yellow("No Cairo errors detected."));
        return;
    }
    const grouped = groupErrors(extractedErrors);
    const results = Array.from(grouped.entries()).map(([key, group]) => {
        const explanation = (0, core_1.explainError)(group[0]) || fallbackExplanation(group[0]);
        const locations = group.map((err) => extractLocation(err)).filter(Boolean);
        return {
            explanation,
            occurrences: group.length,
            locations,
        };
    });
    if (results.length === 0) {
        console.log(chalk_1.default.yellow("No matching Cairo error patterns found."));
        return;
    }
    if (isJson) {
        console.log(JSON.stringify(results, null, 2));
    }
    else {
        console.log(chalk_1.default.gray("\n> cairo-debug v1.0.0 | ILE Labs\n"));
        results.forEach((result, index) => printPretty(result, index));
    }
}
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    if (command === "explain") {
        await handleExplain(args.slice(1));
    }
    else {
        printHelp();
    }
}
main();
