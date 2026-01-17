# TypeScript PS Starter for LeetCode

A local TypeScript environment that mirrors LeetCode's runtime with opinionated formatting and a **built-in problem + test case generator**.

## 💡 Why

LeetCode's TypeScript runtime can be inconvenient to reproduce locally. This template provides:

- A consistent local runtime that matches LeetCode's assumptions
- A single flow from generation → solution → test run
- One file per problem, so there is no extra fixture or boilerplate management

## ⚡ Quick Start

### 1) Install

```bash
git clone https://github.com/moonseob/ts-ps-template-leetcode
pnpm install # or your preferred package manager
```

If you use pnpm, you can easily align Node with `.node-version` using:

```bash
pnpm use-version
```

The `node` version is pinned in `package.json` to match LeetCode's runtime.
If you do not use pnpm, set the Node version with your preferred tool (nvm, fnm, asdf, etc.)
and verify with `node -v` that you are on Node 22.

### 2) Generate a problem file

```bash
# slug
pnpm new -- two-sum

# full URL (quote to avoid shell parsing issues)
pnpm new -- "https://leetcode.com/problems/two-sum/"

# omit `--` if your package manager supports it
pnpm new two-sum

# override output directory
pnpm new -- two-sum --out src/notes

# overwrite existing file
pnpm new -- two-sum --force
```

The generator creates `src/problems/<slug>.ts`.

Options:

- `--out <dir>`: override the output directory (default: `src/problems`)
- `--force`: overwrite if the file already exists

### 3) Solve and run tests

```bash
pnpm watch -- src/problems/<slug>.ts
```

The generated file includes:

- The problem statement as [JSDoc](https://jsdoc.app)
- Example tests using [`node:assert`](https://nodejs.org/api/assert.html) (best-effort parsing)
- A solution function stub

**Tests re-run on every save, significantly reducing the time from implementation to verification.**

Below is an example generated for [two-sum](https://leetcode.com/problems/two-sum/).

```ts
import assert from "node:assert";

/**
 * # Two Sum (#1)
 * https://leetcode.com/problems/two-sum/
 *
 * Given an array of integers `nums` and an integer `target`, return _indices of the two numbers such that they add up
 * to `target`_.
 *
 * You may assume that each input would have **_exactly_ one solution**, and you may not use the _same_ element twice.
 *
 * You can return the answer in any order.
 *
 * **Constraints:**
 *
 * - `2 <= nums.length <= 104`
 * - `-109 <= nums[i] <= 109`
 * - `-109 <= target <= 109`
 * - **Only one valid answer exists.**
 *
 * **Follow-up:** Can you come up with an algorithm that is less than `O(n2)` time complexity?
 */
function twoSum(nums: number[], target: number): number[] {

};

/**
 * Example 1
 * Input: `nums = [2,7,11,15], target = 9`
 * Output: `[0,1]`
 * Explanation: `Because nums[0] + nums[1] == 9, we return [0, 1].`
 */
assert.deepStrictEqual(twoSum([2,7,11,15], 9), [0,1]);

/**
 * Example 2
 * Input: `nums = [3,2,4], target = 6`
 * Output: `[1,2]`
 */
assert.deepStrictEqual(twoSum([3,2,4], 6), [1,2]);

/**
 * Example 3
 * Input: `nums = [3,3], target = 6`
 * Output: `[0,1]`
 */
assert.deepStrictEqual(twoSum([3,3], 6), [0,1]);

```

## ⚙️ Configuration

- Biome
- EditorConfig
- Dependencies aligned to LeetCode's TypeScript runtime

## 🧰 VS Code Workspace Settings

The workspace `.vscode/settings.json` keeps local editing behavior aligned with the tooling in this repo:

- `editor.defaultFormatter: "biomejs.biome"` - always format with Biome so the editor matches the CLI.
- `editor.formatOnPaste` / `editor.formatOnSave`: true - run Biome format automatically when pasting or saving.
- `editor.codeActionsOnSave.source.fixAll.biome: "explicit"` - apply Biome's fix-all rules on manual saves without surprising changes on auto-save.
- `editor.codeActionsOnSave.source.organizeImports.biome: "explicit"` - reorder/remove imports on save while still requiring an explicit save action.
- `editor.rulers: [120]` - soft guide at 120 characters, matching the preferred line length for problems and tests.
- `search.useIgnoreFiles: false` - include `.gitignore`d files (such as generated `src/problems`) in workspace search results.

## 📚 Datastructures Quick Guide

Use these packages when a problem benefits from a specific data structure:

- `@datastructures-js/queue` / `@datastructures-js/deque` - BFS, sliding window
- `@datastructures-js/priority-queue` / `@datastructures-js/heap` - shortest paths, greedy
- `@datastructures-js/stack` - monotonic stack, parsing
- `@datastructures-js/trie` - prefix search, word dictionary
- `@datastructures-js/graph` - explicit graph modeling
- `@datastructures-js/binary-search-tree` - ordered set/map

Note: For Binary Search Tree, Trie, and Graph, import manually only when needed because their names can conflict with LeetCode problem types.

### Quick Examples

Queue (BFS):

```ts
import { Queue } from "@datastructures-js/queue";

const queue = new Queue<number>();
queue.enqueue(1);
queue.enqueue(2);
while (!queue.isEmpty()) {
    const node = queue.dequeue();
    // process node
}
```

Priority Queue (min-heap):

```ts
import { MinPriorityQueue } from "@datastructures-js/priority-queue";

const pq = new MinPriorityQueue<number>({ priority: (value) => value });
pq.enqueue(3);
pq.enqueue(1);
pq.enqueue(2);
const smallest = pq.dequeue().element;
```

Trie (prefix lookup):

```ts
import { Trie } from "@datastructures-js/trie";

const trie = new Trie();
trie.insert("apple");
trie.insert("app");
const hasApp = trie.search("app");
```
