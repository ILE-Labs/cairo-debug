import { spawn } from "node:child_process";

export function collectScarbErrors(projectPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let output = "";
        const proc = spawn("scarb", ["build"], { cwd: projectPath });

        proc.stdout.on("data", (data) => {
            output += data.toString();
        })

        proc.stderr.on("data", (data) => {
            output += data.toString();
        })

        proc.on("close", () => {
            resolve(output)
        })

        proc.on("error", reject);
    })
}