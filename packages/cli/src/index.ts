#!/usr/bin/env node

import { explainError } from "@cairo-debug/core";
import chalk from "chalk";
import fs from "node:fs";

async function readStdin(): Promise<string | null> {
  if (process.stdin.isTTY) return null;

  return new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data.trim()));
  });
}

function printPretty(result: any) {
  console.log(chalk.gray("\n> cairo-debug v1.0.0 | ILE Labs\n"));

  console.log(
    chalk.red.bold(`[ERROR] ${result.category} -- ${result.severity}`),
  );

  console.log(chalk.white(`\nWhat happened:\n ${result.what_happened}`));

  console.log(
    chalk.white(`\nWhy this happens in Cairo:\n ${result.why_cair_specific}`),
  );

  console.log(chalk.green(`\nFix:\n ${result.fix}`));

  console.log(chalk.blue(`\nExample:\n ${result.example}`));
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

async function handleExplain(args: string[]) {
  const isJson = args.includes("--json");

  // remove --json flag
  const cleanArgs = args.filter((arg) => arg !== "--json");
  let input: string | null = null;

  const stdin = await readStdin();
  if (stdin) {
    input = stdin;
  } else if (cleanArgs[0] && fs.existsSync(cleanArgs[0])) {
    input = fs.readFileSync(cleanArgs[0], "utf-8");
  } else if (cleanArgs.length > 0) {
    input = cleanArgs.join(" ");
  }

  if (!input) {
    console.error(
      chalk.red(
        "No error message provided. Please provide an error message as an argument or via stdin.",
      ),
    );
    process.exit(1);
  }

  const result = explainError(input);
  if (!result) return;

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printPretty(result);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "explain") {
    await handleExplain(args.slice(1));
  } else {
    printHelp();
  }
}

main();
