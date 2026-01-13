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
pnpm run setup
```

## Usage

```bash
pnpm watch -- src/your-problem.ts
```

## Project Structure

- `src/` - problem solutions
- `.node-version` - pinned Node version
- `biome.json` - formatter settings
- `.editorconfig` - editor consistency

## Scripts

- `pnpm setup` - use the Node version from `.node-version`
- `pnpm format` - format with Biome
- `pnpm watch -- <file>` - run a problem file with hot reload

## Configuration

- Biome
- EditorConfig
- Dependencies aligned to LeetCode's TypeScript runtime
