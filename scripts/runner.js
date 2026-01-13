#!/usr/bin/env node

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const resolveTarget = candidate => {
  const resolved = path.resolve(process.cwd(), candidate);
  if (fs.existsSync(resolved)) {
    return candidate;
  }
  if (!path.extname(candidate)) {
    const tsCandidate = `${candidate}.ts`;
    const tsResolved = path.resolve(process.cwd(), tsCandidate);
    if (fs.existsSync(tsResolved)) {
      return tsCandidate;
    }
    const jsCandidate = `${candidate}.js`;
    const jsResolved = path.resolve(process.cwd(), jsCandidate);
    if (fs.existsSync(jsResolved)) {
      return jsCandidate;
    }
  }
  return null;
};

const run = ({ mode, file, args }) => {
  if (!file) {
    const usage = 'Usage: npm|pnpm|yarn run watch <path-to-ts-or-js-file>';
    console.error(usage);
    process.exit(1);
  }

  const targetFile = resolveTarget(file);

  if (!targetFile) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }

  const tsxArgs = mode === 'watch' ? ['watch', targetFile, ...args] : [targetFile, ...args];
  const child = spawn('tsx', tsxArgs, {
    stdio: 'inherit',
  });

  child.on('exit', code => {
    process.exit(code ?? 0);
  });
};

module.exports = { run };
