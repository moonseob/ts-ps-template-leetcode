import { spawn } from "node:child_process";
import path from "node:path";

const DEFAULT_TIMEOUT_MS = 3000;

const color = {
    reset: "\u001b[0m",
    green: "\u001b[32m",
    red: "\u001b[31m",
    yellow: "\u001b[33m",
    cyan: "\u001b[36m",
};

const paint = (text: string, c: keyof typeof color) => `${color[c]}${text}${color.reset}`;

const usage = `Usage:
  pnpm solve -- <problem-file-or-slug> [--timeout <ms>]

Examples:
  pnpm solve -- two-sum
  pnpm solve -- src/problems/two-sum.ts
  pnpm solve -- src/problems/two-sum.ts --timeout 5000
`;

const parseArgs = (args: string[]) => {
    let target: string | null = null;
    let timeoutMs = DEFAULT_TIMEOUT_MS;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--help" || arg === "-h") {
            return { help: true, target, timeoutMs };
        }
        if (arg === "--timeout" || arg === "-t") {
            const raw = args[i + 1];
            const value = Number(raw);
            if (!raw || Number.isNaN(value) || value <= 0) {
                throw new Error("Invalid timeout value. Use a positive integer in milliseconds.");
            }
            timeoutMs = value;
            i += 1;
            continue;
        }
        if (!arg.startsWith("-") && !target) {
            target = arg;
        }
    }

    return { help: false, target, timeoutMs };
};

const parseSlugFromUrl = (value: string) => {
    try {
        const url = new URL(value);
        const match = url.pathname.match(/\/problems\/([^/]+)(?:\/|$)/);
        return match?.[1] ?? null;
    } catch {
        return null;
    }
};

const resolveProblemTarget = (target: string) => {
    const trimmed = target.trim();
    const slugFromUrl = parseSlugFromUrl(trimmed);
    const candidate = slugFromUrl ?? trimmed;

    const looksLikePath =
        candidate.endsWith(".ts") || candidate.includes("/") || candidate.includes("\\") || candidate.startsWith(".");

    if (looksLikePath) {
        return path.resolve(candidate);
    }

    return path.resolve("src/problems", `${candidate}.ts`);
};

const main = async () => {
    const { help, target, timeoutMs } = parseArgs(process.argv.slice(2));

    if (help) {
        console.log(usage);
        return;
    }

    if (!target) {
        console.error("Missing problem file path.");
        console.error(usage.trimEnd());
        process.exit(1);
    }

    const resolvedTarget = resolveProblemTarget(target);
    const relativeTarget = path.relative(process.cwd(), resolvedTarget) || target;

    console.log(`${paint("RUN", "cyan")} ${relativeTarget} (timeout=${timeoutMs}ms)`);

    const child = spawn("pnpm", ["-s", "tsx", "--tsconfig", "tsconfig.json", "--import", "setup.ts", resolvedTarget], {
        stdio: "inherit",
        env: process.env,
    });

    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
        child.kill("SIGKILL");
        console.error(`\n${paint("TIMEOUT", "red")} exceeded ${timeoutMs}ms (${relativeTarget})`);
        process.exitCode = 124;
    }, timeoutMs);

    child.on("error", (error) => {
        clearTimeout(timer);
        console.error(`${paint("ERROR", "red")} Failed to execute runner: ${error.message}`);
        process.exit(1);
    });

    child.on("exit", (code, signal) => {
        clearTimeout(timer);

        if (timedOut) {
            process.exit(124);
        }

        if (signal) {
            console.error(`${paint("ERROR", "red")} process terminated by signal: ${signal}`);
            process.exit(1);
        }

        process.exit(code ?? 1);
    });
};

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${paint("ERROR", "red")} ${message}`);
    process.exit(1);
});
