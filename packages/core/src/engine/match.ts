import { patterns } from "../patterns";
import { normalizeError } from "../parser/normalize";
import { scorePattern } from "./score";
import chalk from "chalk";

export function explainError(raw: string) {
  const input = normalizeError(raw);
  let bestMatch = null,
    bestScore = 0;

  for (const pattern of patterns) {
    const score = scorePattern(pattern, input);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = pattern;
    }
  }

  if (!bestMatch || bestScore === 0) {
    // Should return a default error
    return null;
  }

  return {
    category: bestMatch.category,
    severity: bestMatch.severity,
    what_happened: bestMatch.what_happened,
    why_cairo_specific: bestMatch.why_cairo_specific,
    fix: bestMatch.fix,
    example: bestMatch.example,
  };
}
