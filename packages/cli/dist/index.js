#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@cairo-debug/core");
const chalk_1 = __importDefault(require("chalk"));
const node_fs_1 = __importDefault(require("node:fs"));
async function readStdin() {
    if (process.stdin.isTTY)
        return null;
    return new Promise((resolve) => {
        let data = "";
        process.stdin.on("data", (chunk) => (data += chunk));
        process.stdin.on("end", () => resolve(data.trim()));
    });
}
function printPretty(result) {
    console.log(chalk_1.default.gray("\n> cairo-debug v1.0.0 | ILE Labs\n"));
    console.log(chalk_1.default.red.bold(`[ERROR] ${result.category} -- ${result.severity}`));
    console.log(chalk_1.default.white(`\nWhat happened:\n ${result.what_happened}`));
    console.log(chalk_1.default.white(`\nWhy this happens in Cairo:\n ${result.why_cair_specific}`));
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
    const result = (0, core_1.explainError)(input);
    if (!result)
        return;
    if (isJson) {
        console.log(JSON.stringify(result, null, 2));
    }
    else {
        printPretty(result);
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
