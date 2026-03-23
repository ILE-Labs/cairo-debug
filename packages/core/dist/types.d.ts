export type Explanation = {
    title: string;
    explanation: string;
    fix: string;
};
export type ErrorPattern = {
    id: string;
    match: (input: string) => boolean;
    explain: (input: string) => Explanation;
};
