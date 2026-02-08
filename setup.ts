import assert, { AssertionError } from "node:assert";
import util from "node:util";
import _ from "lodash";

globalThis._ = _;

type RunnerState = {
    startedAt: number;
    total: number;
    passed: number;
    failed: number;
    runtimeError: boolean;
    finalized: boolean;
};

const STATE_KEY = Symbol.for("leetcode.cli.runner.state");
const PATCHED_KEY = Symbol.for("leetcode.cli.runner.assert.patched");

const globalSymbols = globalThis as Record<symbol, RunnerState | boolean | undefined>;

const state =
    (globalSymbols[STATE_KEY] as RunnerState | undefined) ??
    ({
        startedAt: Date.now(),
        total: 0,
        passed: 0,
        failed: 0,
        runtimeError: false,
        finalized: false,
    } satisfies RunnerState);
globalSymbols[STATE_KEY] = state;

const color = {
    reset: "\u001b[0m",
    green: "\u001b[32m",
    red: "\u001b[31m",
    yellow: "\u001b[33m",
    cyan: "\u001b[36m",
};

const paint = (text: string, c: keyof typeof color) => `${color[c]}${text}${color.reset}`;

const formatValue = (value: unknown) =>
    util.inspect(value, {
        depth: 6,
        compact: true,
        breakLength: Number.POSITIVE_INFINITY,
        maxArrayLength: 100,
        maxStringLength: 300,
        sorted: true,
    });

const toError = (error: unknown) => (error instanceof Error ? error : new Error(String(error)));

const getSourceLine = (stack: string | undefined) => {
    if (!stack) return null;
    const lines = stack.split("\n").map((line) => line.trim());
    const sourceLine = lines.find((line) => line.includes("src/problems/"));
    return sourceLine ?? lines[1] ?? null;
};

const printSummary = () => {
    if (state.finalized) return;
    state.finalized = true;

    const elapsed = Date.now() - state.startedAt;
    if (state.runtimeError) {
        const status = paint("RUNTIME ERROR", "red");
        console.error(`${status} assertions=${state.passed}/${state.total} (${elapsed}ms)`);
        return;
    }

    if (state.failed > 0) {
        const status = paint("FAIL", "red");
        console.error(`${status} ${state.passed}/${state.total} assertions passed (${elapsed}ms)`);
        return;
    }

    if (state.total === 0) {
        const status = paint("DONE", "yellow");
        console.log(`${status} 0 assertions (${elapsed}ms)`);
        return;
    }

    const status = paint("PASS", "green");
    console.log(`${status} ${state.passed}/${state.total} assertions (${elapsed}ms)`);
};

const printAssertionFailure = (methodName: string, actual: unknown, expected: unknown, message?: string) => {
    const index = state.total;
    const header = paint(`ASSERTION FAILED #${index}`, "red");
    console.error(`\n${header} (${methodName})`);
    if (message) {
        console.error(`message:  ${message}`);
    }
    console.error(`expected: ${formatValue(expected)}`);
    console.error(`actual:   ${formatValue(actual)}`);
};

const patchAssert = () => {
    if (globalSymbols[PATCHED_KEY]) return;
    globalSymbols[PATCHED_KEY] = true;

    const patchMethod = (methodName: "strictEqual" | "deepStrictEqual") => {
        const original = assert[methodName].bind(assert) as (
            actual: unknown,
            expected: unknown,
            message?: string | Error,
        ) => void;

        assert[methodName] = ((actual: unknown, expected: unknown, message?: string | Error) => {
            state.total += 1;
            try {
                original(actual, expected, message);
                state.passed += 1;
            } catch (error) {
                if (error instanceof AssertionError) {
                    state.failed += 1;
                    const messageText =
                        typeof message === "string" ? message : message instanceof Error ? message.message : undefined;
                    printAssertionFailure(methodName, actual, expected, messageText);
                    process.exitCode = 1;
                    return;
                }
                throw error;
            }
        }) as (typeof assert)[typeof methodName];
    };

    patchMethod("strictEqual");
    patchMethod("deepStrictEqual");
};

patchAssert();

process.on("uncaughtException", (error) => {
    state.runtimeError = true;
    const err = toError(error);
    console.error(`\n${paint("ERROR", "red")} ${err.name}: ${err.message}`);
    const sourceLine = getSourceLine(err.stack);
    if (sourceLine) {
        console.error(`at ${sourceLine.replace(/^at\s+/, "")}`);
    }
    process.exitCode = 1;
});

process.on("unhandledRejection", (reason) => {
    state.runtimeError = true;
    const err = toError(reason);
    console.error(`\n${paint("ERROR", "red")} ${err.name}: ${err.message}`);
    const sourceLine = getSourceLine(err.stack);
    if (sourceLine) {
        console.error(`at ${sourceLine.replace(/^at\s+/, "")}`);
    }
    process.exitCode = 1;
});

process.on("beforeExit", () => {
    printSummary();
});
