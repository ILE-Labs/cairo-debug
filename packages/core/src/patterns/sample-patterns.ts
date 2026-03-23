export const sampleErrors = [
  {
    pattern: /mismatched types expected felt252 found u32/i,
    title: "Type Mismatch Error",
    explanation: "Cairo requires strict type matching. You provided a u32 where a felt252 was expected.",
    fix: "Check your variable or function types. Convert u32 to felt252 if needed."
  },
  {
    pattern: /undefined variable '(\w+)'/i,
    title: "Undefined Variable",
    explanation: "You used a variable that has not been declared or is out of scope.",
    fix: "Declare the variable before using it, or check your scope."
  }
];