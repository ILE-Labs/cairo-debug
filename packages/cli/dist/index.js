#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@cairo-debug/core");
const chalk_1 = __importDefault(require("chalk"));
async function readStdin() {
    return new Promise((resolve) => {
        let data = "";
        process.stdin.on("data", (chunk) => {
            data += chunk;
        });
        process.stdin.on("end", () => resolve(data));
    });
}
async function main() {
    const args = process.argv.slice(2);
    let message = args.join(" ");
    const stdin = process.stdin;
    if (!stdin.isTTY) {
        let data = "";
        stdin.on("data", (chunk) => (data += chunk));
        stdin.on("end", () => {
            message = data.trim();
            printExplanation(message);
        });
    }
    else {
        printExplanation(message);
    }
}
function printExplanation(errorMessage) {
    const result = (0, core_1.explainError)(errorMessage);
    console.log(chalk_1.default.red.bold(`Error: ${result.title}`));
    console.log(chalk_1.default.white(`\n${result.explanation}\n`));
    console.log(chalk_1.default.green(`Fix: ${result.fix}\n`));
}
main();
