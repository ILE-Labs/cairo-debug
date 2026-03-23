import { patterns } from "../patterns";
import { normalizeError } from "../parser/normalize";
import { sampleErrors } from "../patterns/sample-patterns";

export function explainError(raw: string) {
  const match = sampleErrors.find((e) => e.pattern.test(raw));
  
  if (!match) {
    return {
        title: "Unknown Error",
        explanation: raw,
        fix: "Refer to Cairo documentation or check syntax carefully."
    }
  }

  return {
     title: match.title,
    explanation: match.explanation,
    fix: match.fix
  };
}