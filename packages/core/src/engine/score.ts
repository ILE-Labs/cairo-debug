export function scorePattern(pattern: any, input: string): number {
  const keywords = pattern.match;

  let matched = 0;
  for (const keyword of keywords) {
    if (input.includes(keyword)) {
      matched++;
    }
  }

  if (matched !== keywords.length) {
    return 0;
  }

  let score = matched;

  // Boost by severity
  if (pattern.severity === "CRITICAL") score += 3;
  if (pattern.severity === "HIGH") score += 2;
  if (pattern.severity === "MEDIUM") score += 1;

  return score;
}
