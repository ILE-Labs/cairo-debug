#!/usr/bin/env node

import { explainError } from "@cairo-debug/core";
import chalk from "chalk";
import fs from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

function isCairoFile(file: string) {
  return file.endsWith(".cairo");
}

function runScarbFromFile(file: string): string {
  const projectRoot = path.dirname(file);

  try {
    execSync("scarb build", {
      cwd: projectRoot,
      stdio: "pipe",
    });
    return "";
  } catch (err: any) {
    return err.stderr?.toString() || err.stdout?.toString() || "";
  }
}

// Reads piped input (scarb build output)
async function readStdin(): Promise<string | null> {
  if (process.stdin.isTTY) return null;

  return new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data.trim()));
  });
}

function fallbackExplanation(error: string) {
  return {
    category: "Unknown Cairo error",
    severity: "UNKNOWN",
    what_happened: "This error is not yet recognized by cairo-debug.",
    why_cairo_specific:
      "Cairo compiler errors can vary across versions and patterns. This one is not yet in the knowledge base.",
    fix: "Review the raw error message and consult Cairo documentation or add this pattern to the knowledge base.",
    example: error.slice(0, 200),
  };
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

function getErrorKey(errorBlock: string) {
  const codeMatch = errorBlock.match(/error\[(E\d+)\]/);
  const messageMatch = errorBlock.match(/error\[E\d+\]: (.*)/);

  const code = codeMatch?.[1] || "UNKNOWN";
  const message = messageMatch?.[1]?.toLowerCase().trim() || "";

  return `${code}:${message}`;
}

function groupErrors(errors: string[]) {
  const map = new Map<string, string[]>();

  for (const err of errors) {
    const key = getErrorKey(err);

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key)!.push(err);
  }

  return map;
}

function printPretty(result: any, index?: number) {
  if (index !== undefined) {
    console.log(chalk.yellow(`Error ${index + 1}`));
  }

  const locationPreview = result.locations
    .slice(0, 2)
    .map((l: any) => `${l.file.split("/").pop()}:${l.line}`)
    .join(", ");

  console.log(
    chalk.red.bold(
      `[ERROR] ${result.explanation.category} (${result.occurrences} occurrences)`,
    ),
  );

  console.log(chalk.gray(`Locations: ${locationPreview}`));

  console.log(
    chalk.white(`\nWhat happened:\n ${result.explanation.what_happened}`),
  );

  console.log(
    chalk.white(
      `\nWhy this happens in Cairo:\n ${result.explanation.why_cairo_specific}`,
    ),
  );

  console.log(chalk.green(`\nFix:\n ${result.explanation.fix}`));

  console.log(chalk.gray("\n----------------------------------------\n"));
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
    const file = cleanArgs[0];

    if (isCairoFile(file)) {
      input = runScarbFromFile(file);
    } else {
      input = fs.readFileSync(cleanArgs[0], "utf-8");
    }
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

  const grouped = groupErrors(extractedErrors);

  const results = Array.from(grouped.entries()).map(([key, group]) => {
    const explanation = explainError(group[0]) || fallbackExplanation(group[0]);
    const locations = group.map((err) => extractLocation(err)).filter(Boolean);

    return {
      explanation,
      occurrences: group.length,
      locations,
    };
  });

  if (results.length === 0) {
    console.log(chalk.yellow("No matching Cairo error patterns found."));
    return;
  }

  if (isJson) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(chalk.gray("\n> cairo-debug v1.0.0 | ILE Labs\n"));
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
