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
pnpm new
```

You will be prompted for a LeetCode URL or slug. The generator creates
`src/problems/<slug>.ts`.

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
/**
 * Two Sum (#1)
 * https://leetcode.com/problems/two-sum/
 *
 * Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
 *
 * You may assume that each input would have exactly one solution, and you may not use the same element twice.
 *
 * You can return the answer in any order.
 *
 * Constraints:
 *
 * 	- 2 <= nums.length <= 104
 * - -109 <= nums[i] <= 109
 * - -109 <= target <= 109
 * - Only one valid answer exists.
 *
 * Follow-up: Can you come up with an algorithm that is less than O(n2) time complexity?
 */

import assert from "node:assert";

function twoSum(nums: number[], target: number): number[] { }

// Example 1
assert.deepStrictEqual(twoSum([2, 7, 11, 15], 9), [0, 1]);
// Example 2
assert.deepStrictEqual(twoSum([3, 2, 4], 6), [1, 2]);
// Example 3
assert.deepStrictEqual(twoSum([3, 3], 6), [0, 1]);
```

## ⚙️ Configuration

- Biome
- EditorConfig
- Dependencies aligned to LeetCode's TypeScript runtime

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
