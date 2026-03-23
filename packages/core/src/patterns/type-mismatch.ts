import { ErrorPattern } from "../types";

export const typeMismatch: ErrorPattern = {
  id: "TYPE_MISMATCH",

  match: (input) =>
    input.includes("mismatched types") ||
    (input.includes("expected") && input.includes("found")),

  explain: () => ({
    title: "Type Mismatch Error",
    explanation:
      "You're passing a value of the wrong type. Cairo enforces strict typing, so values must match expected types exactly.",
    fix: "Check the function or variable type definition and ensure your value matches it. You may need to convert or adjust types.",
  }),
};
