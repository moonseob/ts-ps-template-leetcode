# TypeScript PS Template

A lightweight template for solving programming problems with TypeScript.
Runs with `tsx`, so `.ts` files execute without a build step.

## Setup

```bash
npm install
# or: pnpm install
# or: yarn install
```

## Run

```bash
npm run watch src/leetcode.com/problems/maximum-average-subarray-i.ts
# or: pnpm run watch src/leetcode.com/problems/maximum-average-subarray-i.ts
# or: yarn run watch src/leetcode.com/problems/maximum-average-subarray-i.ts
```

## Structure

- `src/` solutions
- `src/template.ts` stdin/stdout template
- `scripts/watch.js` auto re-run on save

## Notes

- Use `src/template.ts` as a starting point for stdin handling.
- `tsconfig.json` contains minimal TypeScript defaults.
