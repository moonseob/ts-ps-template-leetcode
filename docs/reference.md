# Reference

## VS Code Workspace Settings

Source: `.vscode/settings.json`

| Setting | Value | Why it exists |
| --- | --- | --- |
| `editor.defaultFormatter` | `"biomejs.biome"` | Keeps formatting consistent with CLI and CI. |
| `editor.formatOnPaste` | `true` | Normalizes pasted snippets immediately. |
| `editor.formatOnSave` | `true` | Ensures every save keeps style consistent. |
| `editor.codeActionsOnSave.source.fixAll.biome` | `"explicit"` | Applies safe Biome fixes only on explicit saves. |
| `editor.codeActionsOnSave.source.organizeImports.biome` | `"explicit"` | Reorders/removes imports during explicit saves. |
| `editor.rulers` | `[120]` | Matches preferred line width used in this repo. |
| `search.useIgnoreFiles` | `false` | Includes generated problem files in workspace search. |

## Data Structures Quick Guide

| Package | Typical use | Minimal import |
| --- | --- | --- |
| `@datastructures-js/queue` | BFS traversal, level-order processing | `import { Queue } from "@datastructures-js/queue";` |
| `@datastructures-js/deque` | Sliding window, bidirectional queue ops | `import { Deque } from "@datastructures-js/deque";` |
| `@datastructures-js/priority-queue` | Greedy selection, Dijkstra, top-k | `import { MinPriorityQueue } from "@datastructures-js/priority-queue";` |
| `@datastructures-js/heap` | Custom heap behavior when queue abstraction is too high-level | `import { MinHeap } from "@datastructures-js/heap";` |
| `@datastructures-js/stack` | Monotonic stack, parser-like state | `import { Stack } from "@datastructures-js/stack";` |
| `@datastructures-js/trie` | Prefix matching and dictionary search | `import { Trie } from "@datastructures-js/trie";` |
| `@datastructures-js/graph` | Explicit graph construction/manipulation | `import { DirectedGraph } from "@datastructures-js/graph";` |
| `@datastructures-js/binary-search-tree` | Ordered set/map style operations | `import { BinarySearchTree } from "@datastructures-js/binary-search-tree";` |
| `@datastructures-js/set` | Set helpers with utility APIs | `import { Set } from "@datastructures-js/set";` |
| `@datastructures-js/linked-list` | Linked-list helper operations | `import { SinglyLinkedList } from "@datastructures-js/linked-list";` |

## Quick Examples

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

## Notes

| Topic | Detail |
| --- | --- |
| Type name collisions | For BST/Trie/Graph, import only when needed because problem statements may use similar type names. |
| Runtime scope | Keep solution code LeetCode-compatible first, and use helper packages when they improve clarity or complexity. |
