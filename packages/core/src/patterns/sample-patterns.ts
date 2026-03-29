export const SamplePatterns = [
  {
    id: "syscall_trait_mismatch",
    priority: 10,
    match: ["trait", "implementation", "syscall"],
    category: "SyscallResultTrait mismatch",
    severity: "HIGH",
    what_happened:
      "You attempted to use a syscall-specific unwrap method on a value that is not a syscall result.",
    why_cairo_specific:
      "Cairo distinguishes between regular Result<T> and SyscallResult<T>. Each requires a different unwrap method, unlike Solidity where return handling is uniform.",
    fix: "Use .unwrap() for regular Result<T>. Only use .unwrap_syscall() for SyscallResult<T> values returned from syscalls.",
    example:
      "let result: SyscallResult<felt252> = storage_read(key);\nlet value = result.unwrap_syscall();",
  },
  {
    id: "felt_overflow",
    priority: 9,
    match: ["overflow", "felt"],
    category: "Felt252 arithmetic overflow",
    severity: "CRITICAL",
    what_happened:
      "An arithmetic operation exceeded the valid range of felt252.",
    why_cairo_specific:
      "felt252 operates over a finite field (prime field), not 2^256 like Solidity. Values wrap around silently at the field boundary.",
    fix: "Use u256 for large integer arithmetic or explicitly check bounds before operations.",
    example: "let x: u256 = a + b; // safer for large arithmetic",
  },
  {
    id: "caller_vs_contract_confusion",
    priority: 9,
    match: ["get_caller", "get_contract"],
    category: "get_caller vs get_contract confusion",
    severity: "CRITICAL",
    what_happened:
      "You used the wrong function to identify the caller or contract.",
    why_cairo_specific:
      "Cairo separates contract address and caller address explicitly, unlike Solidity's msg.sender and address(this). Mixing them can break access control.",
    fix: "Use get_caller_address() for access control checks and get_contract_address() when referring to the contract itself.",
    example:
      "let caller = get_caller_address();\nassert(caller == owner, 'Not authorized');",
  },
  {
    id: "l1_l2_type_mismatch",
    priority: 9,
    match: ["address", "range", "felt"],
    category: "L1/L2 type mismatch",
    severity: "CRITICAL",
    what_happened:
      "An address or value exceeds the valid range when passed between L1 and L2.",
    why_cairo_specific:
      "Ethereum addresses are uint160, but Cairo uses felt252. Improper conversions can lead to invalid or truncated values in cross-layer communication.",
    fix: "Ensure proper type conversion and validation when passing addresses between L1 and L2.",
    example: "let addr: felt252 = eth_address.into();",
  },
  {
    id: "zero_contract_address",
    priority: 8,
    match: ["contractaddress", "zero"],
    category: "ContractAddress zero check",
    severity: "HIGH",
    what_happened: "A zero contract address is being used as a valid value.",
    why_cairo_specific:
      "ContractAddress(0) does not behave exactly like Solidity's address(0) and may not trigger expected safety checks.",
    fix: "Explicitly validate that the contract address is non-zero before using it.",
    example: "assert(contract_address != 0, 'Invalid address');",
  },
  {
    id: "unguarded_upgrade",
    priority: 10,
    match: ["replace_class", "syscall"],
    category: "Unprotected replace_class_syscall",
    severity: "CRITICAL",
    what_happened:
      "A contract upgrade function is callable without access control.",
    why_cairo_specific:
      "Cairo allows contract class replacement via syscalls, but does not enforce access control automatically.",
    fix: "Add access control checks (e.g., owner validation) before calling replace_class_syscall.",
    example:
      "assert(get_caller_address() == owner, 'Unauthorized');\nreplace_class_syscall(new_class_hash);",
  },
  {
    id: "reentrancy_dispatcher",
    priority: 9,
    match: ["external", "call", "dispatcher"],
    category: "Reentrancy via dispatcher",
    severity: "HIGH",
    what_happened:
      "An external contract call is made before state updates are finalized.",
    why_cairo_specific:
      "Cairo dispatchers abstract contract calls differently from Solidity, making reentrancy less obvious but still possible.",
    fix: "Update contract state before making external calls or implement reentrancy guards.",
    example: "self.balance -= amount;\nother_contract.transfer(amount);",
  },
  {
    id: "storage_visibility",
    priority: 7,
    match: ["storage", "write", "read"],
    category: "Storage variable visibility",
    severity: "MEDIUM",
    what_happened: "Storage is accessed without proper access control.",
    why_cairo_specific:
      "Cairo uses explicit storage pointers, which can make access control less obvious compared to Solidity mappings.",
    fix: "Ensure that storage reads/writes are protected by proper authorization checks.",
    example:
      "assert(get_caller_address() == owner, 'Unauthorized');\nself.balance.write(value);",
  },
  {
    id: "missing_event",
    priority: 6,
    match: ["event", "emit"],
    category: "Missing event emission",
    severity: "MEDIUM",
    what_happened: "A state-changing operation does not emit an event.",
    why_cairo_specific:
      "Cairo does not enforce event emission, and developers coming from Solidity may forget to emit events for important state changes.",
    fix: "Emit an event after any critical state change.",
    example: "emit Transfer { from: sender, to: recipient, amount: value };",
  },
  {
    id: "invalid_path",
    priority: 10,
    match: ["invalid path"],
    category: "Invalid path / missing import",
    severity: "HIGH",
    what_happened:
      "You are referencing a function, type, or module that Cairo cannot resolve in the current scope.",
    why_cairo_specific:
      "Cairo uses explicit module paths and trait imports. Methods like from_felt252 are only available when the correct trait or module is imported.",
    fix: "Ensure the correct module or trait is imported. Verify that the function exists on the type and is in scope.",
    example:
      "use starknet::storage::StorageAddress;\n\nlet key = StorageAddress::from_felt252(0);",
  },
  {
    id: "unexpected_argument_type",
    priority: 10,
    match: ["unexpected argument type", "expected", "found"],
    category: "Type mismatch (Result vs value)",
    severity: "HIGH",
    what_happened:
      "You passed a value of the wrong type to a variable or function.",
    why_cairo_specific:
      "Cairo enforces strict typing between Result<T, E> and T. Unlike some languages, values must be explicitly unwrapped before use.",
    fix: "Call .unwrap() or handle the Result before assigning it to a plain type.",
    example:
      "let result: Result<felt252, Array<felt252>> = some_call();\nlet value: felt252 = result.unwrap();",
  },
  {
    id: "felt_literal_type_error",
    priority: 10,
    match: [
      "cannot be created from a numeric literal",
      "mismatched types",
      "felt252",
      "numeric literal",
    ],
    category: "Invalid felt252 literal assignment",
    severity: "HIGH",
    what_happened:
      "You attempted to assign a numeric literal or expression to a felt252, but Cairo cannot construct that value from the literal.",
    why_cairo_specific:
      "Cairo has strict compile-time rules for numeric literals. Unlike Solidity, not all expressions (like exponentiation) can be directly inferred or converted into felt252.",
    fix: "Avoid complex numeric expressions for felt252. Use smaller constants, intermediate variables, or explicit conversions where supported.",
    example:
      "let value: felt252 = 10;\n// Avoid: let value: felt252 = 2 ** 251;",
  },
];
