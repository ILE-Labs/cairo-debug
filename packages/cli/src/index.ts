#!/usr/bin/env node

import { explainError } from "@cairo-debug/core";
import chalk from "chalk";
import fs from "node:fs";

// Reads piped input (scarb build output)
async function readStdin(): Promise<string | null> {
  if (process.stdin.isTTY) return null;

  return new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data.trim()));
  });
}

function extractErrors(raw: string): string[] {
  const lines = raw.split("\n");

  const errors: string[] = [];
  let currentError: string[] = [];

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

function extractLocation(errorBlock: string) {
  const match = errorBlock.match(/--> (.*):(\d+):(\d+)/);

  if (!match) return null;

  return {
    file: match[1],
    line: Number(match[2]),
    column: Number(match[3]),
  };
}

function printPretty(result: any, index?: number) {
  console.log(chalk.gray("\n> cairo-debug v1.0.0 | ILE Labs\n"));

  if (index !== undefined) {
    console.log(chalk.yellow(`Error ${index + 1}`));
  }

  const location = result.location
    ? `${result.location.file.split("/").pop()}:${result.location.line}`
    : "unknown location";
  console.log(
    chalk.red.bold(
      `[ERROR] ${result.category} -- ${location} (${result.severity})`,
    ),
  );

  console.log(chalk.white(`\nWhat happened:\n ${result.what_happened}`));

  console.log(
    chalk.white(`\nWhy this happens in Cairo:\n ${result.why_cairo_specific}`),
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

  const extractedErrors = extractErrors(input);

  if (extractedErrors.length === 0) {
    console.log(chalk.yellow("No Cairo errors detected."));
    return;
  }

  const results = extractedErrors
    .map((err) => {
      const explanation = explainError(err);
      const location = extractLocation(err);

      if (!explanation) return null;

      return {
        ...explanation,
        location,
      };
    })
    .filter(Boolean);

  if (results.length === 0) {
    console.log(chalk.yellow("No matching Cairo error patterns found."));
    return;
  }

  if (isJson) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    results.forEach((result, index) => printPretty(result, index));
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
