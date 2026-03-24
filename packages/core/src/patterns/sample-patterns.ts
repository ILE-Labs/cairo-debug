export const sampleErrors = [
  {
    id: 1,
    category: "SyscallResultTrait mismatch",
    example_error: "Trait not implemented for return type",
    why_cairo_specific:
      "Cairo separates syscall returns from regular returns — different unwrap methods",
    severity: "HIGH",
    concrete_fix:
      "Implement the required trait or use the correct unwrap method for syscall results.",
    code_example:
      "let result = my_syscall().unwrap(); // Use proper unwrap for syscall",
  },
  {
    id: 2,
    category: "Missing #[abi(embed_v0)]",
    example_error: "Function not exposed as external entrypoint",
    why_cairo_specific:
      "Cairo requires explicit ABI embedding unlike Solidity's public keyword",
    severity: "HIGH",
    concrete_fix:
      "Add #[abi(embed_v0)] above your function to expose it externally",
    code_example: "#[abi(embed_v0)]\nfunc my_func() { ... }",
  },
];
