# TypeScript PS Starter for LeetCode

A local TypeScript environment that mirrors LeetCode's runtime with a built-in problem and test-case generator.

## Usage

### 1. Install

```bash
git clone https://github.com/moonseob/ts-ps-template-leetcode
cd ts-ps-template-leetcode
npm install
```

This project targets Node `22`.

### 2. Generate a problem file

```bash
npm run new -- two-sum

# You can also pass the full problem URL.
npm run new -- "https://leetcode.com/problems/two-sum/"
```

### 3. Solve and run

```bash
# run once
npm run solve -- two-sum

# rerun automatically on save
npm run watch -- two-sum
```

`solve` and `watch` both accept:
- slug: `two-sum`
- URL: `https://leetcode.com/problems/two-sum/`
- file path: `src/problems/two-sum.ts`

Optional flag:
- `--timeout <ms>` (default: `3000`)

### Output examples

Correct:

```diff
RUN src/problems/two-sum.ts (timeout=3000ms)
PASS 3/3 assertions (12ms)
```

Wrong answer:

```diff
ASSERTION FAILED #2 (deepStrictEqual)
expected: [ 1, 2 ]
actual:   [ 2, 1 ]
FAIL 2/3 assertions passed (9ms)
```

Run time exceeded:

```diff
RUN src/problems/some-problem.ts (timeout=3000ms)
TIMEOUT exceeded 3000ms (src/problems/some-problem.ts)
```

## Command Matrix

| Package manager | New | Solve | Watch |
| --- | --- | --- | --- |
| npm | `npm run new -- <slug>` | `npm run solve -- <slug>` | `npm run watch -- <slug>` |
| pnpm | `pnpm new -- <slug>` | `pnpm solve -- <slug>` | `pnpm watch -- <slug>` |
| yarn | `yarn new <slug>` | `yarn solve <slug>` | `yarn watch <slug>` |
| bun | `bun run new -- <slug>` | `bun run solve -- <slug>` | `bun run watch -- <slug>` |

## Reference

For editor settings and data-structure package guidance, see [`docs/reference.md`](./docs/reference.md).
