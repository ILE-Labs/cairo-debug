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
function printPretty(result, index) {
    console.log(chalk_1.default.gray("\n> cairo-debug v1.0.0 | ILE Labs\n"));
    if (index !== undefined) {
        console.log(chalk_1.default.yellow(`Error ${index + 1}`));
    }
    const location = result.location
        ? `${result.location.file.split("/").pop()}:${result.location.line}`
        : "unknown location";
    console.log(chalk_1.default.red.bold(`[ERROR] ${result.category} -- ${location} (${result.severity})`));
    console.log(chalk_1.default.white(`\nWhat happened:\n ${result.what_happened}`));
    console.log(chalk_1.default.white(`\nWhy this happens in Cairo:\n ${result.why_cairo_specific}`));
    console.log(chalk_1.default.green(`\nFix:\n ${result.fix}`));
    console.log(chalk_1.default.blue(`\nExample:\n ${result.example}`));
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
    const results = extractedErrors
        .map((err) => {
        const explanation = (0, core_1.explainError)(err);
        const location = extractLocation(err);
        if (!explanation)
            return null;
        return {
            ...explanation,
            location,
        };
    })
        .filter(Boolean);
    if (results.length === 0) {
        console.log(chalk_1.default.yellow("No matching Cairo error patterns found."));
        return;
    }
    if (isJson) {
        console.log(JSON.stringify(results, null, 2));
    }
    else {
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
