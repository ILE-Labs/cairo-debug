export declare function explainError(raw: string): {
    category: string;
    severity: string;
    what_happened: string;
    why_cairo_specific: string;
    fix: string;
    example: string;
} | null;
