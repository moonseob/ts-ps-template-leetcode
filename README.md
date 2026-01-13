# TypeScript PS Template for LeetCode

A local TypeScript environment that mirrors LeetCode's runtime with opinionated formatting rules.

## Why

LeetCode's TypeScript runtime can be inconvenient to reproduce locally. This template provides a
consistent environment to solve problems with the same runtime assumptions.

## Prerequisites

- Node.js `22.14.0` (see `.node-version`)
- pnpm (recommended)

## Setup

```bash
pnpm install
```

If you're using pnpm, run this to align Node with `.node-version`:

```bash
pnpm use-version
```

## Usage

```bash
pnpm watch -- src/your-problem.ts
```

## Create Problem

```bash
pnpm new
```

- Outputs a new file in `src/problems/<slug>.ts`
- The script prompts for a LeetCode URL or slug
- Example asserts are generated on a best-effort basis

## Project Structure

- `src/` - problem solutions
- `tools/` - LeetCode helpers and generator script
- `.node-version` - pinned Node version
- `biome.json` - formatter settings
- `.editorconfig` - editor consistency

## Scripts

- `pnpm format` - format with Biome (includes organize imports)
- `pnpm watch -- <file>` - run a problem file with hot reload

## Configuration

- Biome
- EditorConfig
- Dependencies aligned to LeetCode's TypeScript runtime

## Datastructures Quick Guide

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
