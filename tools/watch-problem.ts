import { spawn } from "node:child_process";
import { watch } from "node:fs";
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
  npm run watch -- <problem-file-or-slug> [--timeout <ms>]

Examples:
  npm run watch -- two-sum
  npm run watch -- src/problems/two-sum.ts
  npm run watch -- src/problems/two-sum.ts --timeout 5000
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

const runOnce = (target: string, timeoutMs: number) =>
    new Promise<number>((resolve) => {
        const child = spawn(
            process.execPath,
            ["--import", "tsx", "tools/run-problem.ts", target, "--timeout", String(timeoutMs)],
            {
                stdio: "inherit",
                env: process.env,
            },
        );

        child.on("error", () => resolve(1));
        child.on("exit", (code) => resolve(code ?? 1));
    });

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
    const watchDir = path.dirname(resolvedTarget);
    const watchBase = path.basename(resolvedTarget);

    console.log(`${paint("WATCH", "cyan")} ${relativeTarget}`);

    let running = false;
    let rerunRequested = false;
    let debounceTimer: NodeJS.Timeout | null = null;

    const execute = async () => {
        if (running) {
            rerunRequested = true;
            return;
        }

        running = true;
        const code = await runOnce(resolvedTarget, timeoutMs);
        running = false;
        process.exitCode = code;

        if (rerunRequested) {
            rerunRequested = false;
            void execute();
        }
    };

    await execute();

    watch(watchDir, (eventType, filename) => {
        if (!filename || filename !== watchBase) return;
        if (eventType !== "change" && eventType !== "rename") return;

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
            console.log(`\n${paint("CHANGED", "yellow")} ${relativeTarget}`);
            void execute();
        }, 80);
    });
};

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${paint("ERROR", "red")} ${message}`);
    process.exit(1);
});
