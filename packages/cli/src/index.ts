#!/usr/bin/env node

import { explainError } from "@cairo-debug/core";
import chalk from "chalk";

async function readStdin(): Promise<string> {
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
  } else {
    printExplanation(message);
  }
}

function printExplanation(errorMessage: string) {
  const result = explainError(errorMessage);

  console.log(chalk.red.bold(`Error: ${result.title}`));
  console.log(chalk.white(`\n${result.explanation}\n`));
  console.log(chalk.green(`Fix: ${result.fix}\n`));
}

main();
