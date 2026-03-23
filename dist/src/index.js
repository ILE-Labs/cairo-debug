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
    let input = "";
    if (!process.stdin.isTTY) {
        input = await readStdin();
    }
    else {
        input = process.argv.slice(2).join(" ");
    }
    const result = (0, core_1.explainError)(input);
    console.log(chalk_1.default.red(`\n❌ ${result.title}`));
    console.log(chalk_1.default.yellow(`\n🧠 Explanation:\n${result.explanation}`));
    console.log(chalk_1.default.green(`\n🛠 Fix:\n${result.fix}\n`));
}
