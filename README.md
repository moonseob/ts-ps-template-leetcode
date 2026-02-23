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

```log
RUN src/problems/two-sum.ts (timeout=3000ms)
PASS 3/3 assertions (12ms)
```

Wrong answer:

```log
ASSERTION FAILED #2 (deepStrictEqual)
expected: [ 1, 2 ]
actual:   [ 2, 1 ]
FAIL 2/3 assertions passed (9ms)
```

Run time exceeded:

```log
RUN src/problems/some-problem.ts (timeout=3000ms)
TIMEOUT exceeded 3000ms (src/problems/some-problem.ts)
```

Generated question example:

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
 * - `2 <= nums.length <= 10^4`
 * - `-10^9 <= nums[i] <= 10^9`
 * - `-10^9 <= target <= 10^9`
 * - **Only one valid answer exists.**
 *
 * **Follow-up:** Can you come up with an algorithm that is less than `O(n^2)` time complexity?
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

## Command Matrix

| Package manager | New | Solve | Watch |
| --- | --- | --- | --- |
| npm | `npm run new -- <slug>` | `npm run solve -- <slug>` | `npm run watch -- <slug>` |
| pnpm | `pnpm new -- <slug>` | `pnpm solve -- <slug>` | `pnpm watch -- <slug>` |
| yarn | `yarn new <slug>` | `yarn solve <slug>` | `yarn watch <slug>` |
| bun | `bun run new -- <slug>` | `bun run solve -- <slug>` | `bun run watch -- <slug>` |

## Reference

For editor settings and data-structure package guidance, see [`docs/reference.md`](./docs/reference.md).
