import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const GRAPHQL_ENDPOINT = "https://leetcode.com/graphql";
const COLOR = {
    reset: "\u001b[0m",
    bold: "\u001b[1m",
    green: "\u001b[32m",
    yellow: "\u001b[33m",
    red: "\u001b[31m",
    cyan: "\u001b[36m",
};
const icon = {
    ok: `${COLOR.green}✔${COLOR.reset}`,
    warn: `${COLOR.yellow}⚠${COLOR.reset}`,
    info: `${COLOR.cyan}ℹ${COLOR.reset}`,
};

type CodeSnippet = { langSlug: string; code: string };
type QuestionData = {
    questionId: string;
    title: string;
    titleSlug: string;
    content: string;
    codeSnippets: CodeSnippet[];
    metaData: string;
    exampleTestcases: string;
};

type ParamMeta = { name: string; type: string };
type MetaData = { params?: ParamMeta[]; return?: { type: string } };

const decodeHtml = (input: string) =>
    input
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ");

const htmlToText = (html: string) => {
    let text = html;
    text = text.replace(/<\/p>\s*/gi, "\n\n");
    text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<li>\s*/gi, "- ");
    text = text.replace(/<\/li>\s*/gi, "\n");
    text = text.replace(/<pre>[\s\S]*?<\/pre>/gi, "");
    text = text.replace(/<[^>]+>/g, "");
    text = decodeHtml(text);
    text = text.replace(/\r/g, "");
    text = text
        .split("\n")
        .map((line) => line.replace(/\s+$/g, ""))
        .filter((line) => !/^Example\s+\d+:\s*$/.test(line.trim()))
        .join("\n");
    text = text.replace(/[ \t]+\n/g, "\n");
    text = text.replace(/\n{3,}/g, "\n\n");
    return text.trim();
};

const stripTags = (html: string) => decodeHtml(html.replace(/<[^>]+>/g, ""));

const parseSlug = (raw: string) => {
    if (!raw) return null;
    try {
        const url = new URL(raw);
        const match = url.pathname.match(/\/problems\/([^/]+)(?:\/|$)/);
        return match?.[1] ?? null;
    } catch {
        return raw.trim() || null;
    }
};

const parseArgs = (rawArgs: string[]) => {
    const options: {
        outDir: string;
        force: boolean;
        help: boolean;
        target: string | null;
    } = {
        outDir: "src/problems",
        force: false,
        help: false,
        target: null,
    };

    for (let i = 0; i < rawArgs.length; i++) {
        const arg = rawArgs[i];
        if (arg === "--help" || arg === "-h") {
            options.help = true;
            continue;
        }
        if (arg === "--out" || arg === "-o") {
            const value = rawArgs[i + 1];
            if (value && !value.startsWith("-")) {
                options.outDir = value;
                i++;
            }
            continue;
        }
        if (arg === "--force" || arg === "-f") {
            options.force = true;
            continue;
        }
        if (!arg.startsWith("-") && !options.target) {
            options.target = arg;
        }
    }

    return options;
};

const USAGE = `Usage:
  pnpm new -- <url-or-slug> [--out <dir>] [--force]

Options:
  -o, --out <dir>   Override output directory (default: src/problems)
  -f, --force       Overwrite existing file
  -h, --help        Show this help message
`;

const fetchQuestion = async (slug: string): Promise<QuestionData> => {
    const query = `
        query questionData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                questionId
                title
                titleSlug
                content
                codeSnippets {
                    langSlug
                    code
                }
                metaData
                exampleTestcases
            }
        }
    `;

    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { titleSlug: slug } }),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch problem data (${response.status})`);
    }

    const json = (await response.json()) as { data?: { question?: QuestionData } };
    if (!json.data?.question) {
        throw new Error("Problem not found or response malformed.");
    }
    return json.data.question;
};

const parseMeta = (metaData: string): MetaData => {
    if (!metaData) return {};
    try {
        return JSON.parse(metaData) as MetaData;
    } catch {
        return {};
    }
};

const parseValue = (raw: string, expectedType?: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return { ok: false as const, value: null };

    if (trimmed === "null") return { ok: true as const, value: null };
    if (trimmed === "true") return { ok: true as const, value: true };
    if (trimmed === "false") return { ok: true as const, value: false };

    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
        return { ok: true as const, value: trimmed.slice(1, -1).replace(/\\'/g, "'") };
    }

    if (/^[-]?\d+(\.\d+)?$/.test(trimmed)) {
        return { ok: true as const, value: Number(trimmed) };
    }

    const looksJson =
        trimmed.startsWith("[") || trimmed.startsWith("{") || trimmed.startsWith('"') || trimmed.startsWith("'"); // handled above, but keep for completeness

    if (looksJson) {
        try {
            return { ok: true as const, value: JSON.parse(trimmed) };
        } catch {
            // continue
        }
    }

    if (expectedType?.includes("string")) {
        return { ok: true as const, value: trimmed };
    }

    return { ok: false as const, value: null };
};

const valueToCode = (value: unknown) => {
    if (typeof value === "string") return JSON.stringify(value);
    if (value === null) return "null";
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return JSON.stringify(value);
};

const pickFunctionName = (code: string) => {
    const patterns = [
        /function\s+([A-Za-z0-9_]+)\s*\(/,
        /const\s+([A-Za-z0-9_]+)\s*=\s*function\s*\(/,
        /const\s+([A-Za-z0-9_]+)\s*=\s*\(/,
    ];
    for (const pattern of patterns) {
        const match = code.match(pattern);
        if (match) return match[1];
    }
    return null;
};

const extractOutputs = (content: string) => {
    const outputs: string[] = [];
    const blocks = [...content.matchAll(/<pre>([\s\S]*?)<\/pre>/gi)].map((m) => m[1]);
    for (const block of blocks) {
        const text = stripTags(block).replace(/\r/g, "");
        const match = text.match(/Output:\s*([^\n]+)/i);
        if (match) outputs.push(match[1].trim());
    }
    return outputs;
};

const chunk = <T>(arr: T[], size: number) => {
    const chunks: T[][] = [];
    for (let i = 0; i + size <= arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
};

const ensureDir = async (dir: string) => {
    try {
        const info = await stat(dir);
        if (!info.isDirectory()) throw new Error(`${dir} exists and is not a directory`);
    } catch {
        await mkdir(dir, { recursive: true });
    }
};

const isListNodeType = (type: string) => type.includes("ListNode");
const isTreeNodeType = (type: string) => type.includes("TreeNode");
const hasClassDefinition = (code: string, className: string) =>
    new RegExp(`^\\s*class\\s+${className}\\b`, "m").test(code);
const includesTypeName = (code: string, typeName: string) => new RegExp(`\\b${typeName}\\b`).test(code);
const getFunctionParamCount = (code: string, functionName: string | null) => {
    if (!functionName) return null;
    const patterns = [
        new RegExp(`function\\s+${functionName}\\s*\\(([^)]*)\\)`),
        new RegExp(`const\\s+${functionName}\\s*=\\s*\\(([^)]*)\\)\\s*=>`),
        new RegExp(`const\\s+${functionName}\\s*=\\s*function\\s*\\(([^)]*)\\)`),
    ];
    for (const pattern of patterns) {
        const match = code.match(pattern);
        if (!match) continue;
        const raw = match[1].trim();
        if (!raw) return 0;
        return raw
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean).length;
    }
    return null;
};

const generateAsserts = (
    functionName: string | null,
    examples: string[][],
    outputs: string[],
    params: ParamMeta[],
    returnType: string,
    listCyclePair: boolean,
) => {
    const helpersUsed = new Set<string>();
    if (!functionName) {
        return {
            code: "// TODO: Add asserts for class-based or custom API problems.",
            helpersUsed,
        };
    }

    const paramTypes = params.map((param) => param.type);
    const returnIsListNode = isListNodeType(returnType);
    const returnIsTreeNode = isTreeNodeType(returnType);

    const lines: string[] = [];
    const exampleCount = Math.min(examples.length, outputs.length);
    for (let i = 0; i < exampleCount; i++) {
        lines.push(`// Example ${i + 1}`);
        const rawInputs = examples[i];

        let argsList: string[] = [];
        if (listCyclePair && paramTypes.length >= 1 && isListNodeType(paramTypes[0])) {
            const listValue = parseValue(rawInputs[0] ?? "", paramTypes[0]);
            const posValue = parseValue(rawInputs[1] ?? "", "number");
            if (
                !listValue.ok ||
                !posValue.ok ||
                !Array.isArray(listValue.value) ||
                typeof posValue.value !== "number"
            ) {
                lines.push(`// TODO: Unable to parse example input ${i + 1}.`);
                continue;
            }
            helpersUsed.add("buildListWithCycle");
            argsList = [`buildListWithCycle(${valueToCode(listValue.value)}, ${posValue.value})`];
        } else {
            const parsedInputs = rawInputs.map((raw, idx) => parseValue(raw, params[idx]?.type ?? ""));
            if (parsedInputs.some((input) => !input.ok)) {
                lines.push(`// TODO: Unable to parse example input ${i + 1}.`);
                continue;
            }

            const mappedArgs = parsedInputs.map((input, idx) => {
                const type = params[idx]?.type ?? "";
                if (isListNodeType(type)) {
                    if (input.value === null) return "null";
                    if (!Array.isArray(input.value)) return null;
                    helpersUsed.add("buildList");
                    return `buildList(${valueToCode(input.value)})`;
                }
                if (isTreeNodeType(type)) {
                    if (input.value === null) return "null";
                    if (!Array.isArray(input.value)) return null;
                    helpersUsed.add("buildTree");
                    return `buildTree(${valueToCode(input.value)})`;
                }
                return valueToCode(input.value);
            });

            if (mappedArgs.some((arg) => arg === null)) {
                lines.push(`// TODO: Unable to parse example input ${i + 1}.`);
                continue;
            }
            argsList = mappedArgs as string[];
        }

        const outputValue = parseValue(outputs[i], returnType);
        if (!outputValue.ok) {
            lines.push(`// TODO: Unable to parse example output ${i + 1}.`);
            continue;
        }

        const args = argsList.join(", ");
        if (returnIsListNode) {
            const normalized = outputValue.value === null ? [] : outputValue.value;
            const expected = valueToCode(normalized);
            helpersUsed.add("listToArray");
            lines.push(`assert.deepStrictEqual(listToArray(${functionName}(${args})), ${expected});`);
            continue;
        }

        if (returnIsTreeNode) {
            const normalized = outputValue.value === null ? [] : outputValue.value;
            const expected = valueToCode(normalized);
            helpersUsed.add("treeToArray");
            lines.push(`assert.deepStrictEqual(treeToArray(${functionName}(${args})), ${expected});`);
            continue;
        }

        const expected = valueToCode(outputValue.value);
        const useDeep = typeof outputValue.value === "object" || Array.isArray(outputValue.value);
        const assertFn = useDeep ? "deepStrictEqual" : "strictEqual";
        lines.push(`assert.${assertFn}(${functionName}(${args}), ${expected});`);
    }

    if (lines.length === 0) {
        return { code: "// TODO: Add asserts for examples.", helpersUsed };
    }
    return { code: lines.join("\n"), helpersUsed };
};

const formatJSDoc = (title: string, id: string, description: string, url: string) => {
    const lines = [`${title} (#${id})`, url, "", ...description.split("\n")];
    const body = lines.map((line) => (line ? ` * ${line}` : " *")).join("\n");
    return `/**\n${body}\n */`;
};

const main = async () => {
    const { outDir, force, help, target } = parseArgs(process.argv.slice(2));
    if (help) {
        console.log(USAGE);
        process.exit(0);
    }
    if (!target) {
        console.error("Missing LeetCode URL or slug.");
        console.error(USAGE.trimEnd());
        process.exit(1);
    }

    const slug = parseSlug(target);
    if (!slug) {
        console.error("Unable to parse the LeetCode slug.");
        process.exit(1);
    }

    const outPath = path.join(outDir, `${slug}.ts`);
    try {
        await stat(outPath);
        if (!force) {
            console.error(`${icon.warn} File already exists: ${outPath}`);
            console.error(
                `${icon.info} Use --force to overwrite (e.g. pnpm new -- ${slug} --force)`,
            );
            process.exit(1);
        }
    } catch {
        // ok
    }

    const question = await fetchQuestion(slug);
    const snippet = question.codeSnippets.find((item) => item.langSlug === "typescript")?.code;
    if (!snippet) {
        console.error("TypeScript snippet not found.");
        process.exit(1);
    }

    const meta = parseMeta(question.metaData);
    const params = meta.params ?? [];
    const returnType = meta.return?.type ?? "";
    const paramCount = params.length || 1;
    const rawExampleLines = question.exampleTestcases
        ? question.exampleTestcases.split("\n").map((line) => line.trim())
        : [];
    const exampleLines = rawExampleLines.filter((line) => line.length > 0);
    const outputs = extractOutputs(question.content);
    const functionName = pickFunctionName(snippet);

    const functionParamCount = getFunctionParamCount(snippet, functionName);
    const inferredParamCount = functionParamCount ?? paramCount;
    const usesListNode =
        params.some((param) => isListNodeType(param.type)) ||
        isListNodeType(returnType) ||
        includesTypeName(snippet, "ListNode");
    const usesTreeNode =
        params.some((param) => isTreeNodeType(param.type)) ||
        isTreeNodeType(returnType) ||
        includesTypeName(snippet, "TreeNode");
    const listCyclePair =
        usesListNode && inferredParamCount === 1 && outputs.length > 0 && exampleLines.length === outputs.length * 2;
    const inputExamples = chunk(exampleLines, listCyclePair ? 2 : inferredParamCount);

    const description = htmlToText(question.content);
    const jsdoc = formatJSDoc(
        question.title,
        question.questionId,
        description,
        `https://leetcode.com/problems/${question.titleSlug}/`,
    );
    const { code: asserts, helpersUsed } = generateAsserts(
        functionName,
        inputExamples,
        outputs,
        params,
        returnType,
        listCyclePair,
    );

    const importLines = ['import assert from "node:assert";'];
    const helperImportPath = "@/tools/leetcode-helpers";
    const usesListNodeValue = /\bnew\s+ListNode\b/.test(snippet);
    const usesTreeNodeValue = /\bnew\s+TreeNode\b/.test(snippet);
    const helperValueImports = Array.from(helpersUsed);
    if (usesListNodeValue && !helperValueImports.includes("ListNode")) {
        helperValueImports.push("ListNode");
    }
    if (usesTreeNodeValue && !helperValueImports.includes("TreeNode")) {
        helperValueImports.push("TreeNode");
    }
    if (helperValueImports.length > 0) {
        importLines.push(`import { ${helperValueImports.join(", ")} } from "${helperImportPath}";`);
    }
    const helperTypeImports: string[] = [];
    if (usesListNode && !usesListNodeValue && !helperValueImports.includes("ListNode")) {
        helperTypeImports.push("ListNode");
    }
    if (usesTreeNode && !usesTreeNodeValue && !helperValueImports.includes("TreeNode")) {
        helperTypeImports.push("TreeNode");
    }
    if (helperTypeImports.length > 0) {
        importLines.push(`import type { ${helperTypeImports.join(", ")} } from "${helperImportPath}";`);
    }
    const contentParts = [jsdoc, "", ...importLines, "", snippet.trim(), "", asserts, ""];
    const content = contentParts.join("\n");

    await ensureDir(outDir);
    await writeFile(outPath, content, "utf8");
    console.log(`${icon.ok} Created: ${outPath}`);
    console.log(`${icon.info} Run: pnpm watch -- ${outPath}`);
};

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
