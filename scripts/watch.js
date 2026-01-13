#!/usr/bin/env node

const { run } = require('./runner');

const cliArgs = process.argv.slice(2).filter(arg => arg !== '--');
const [file, ...args] = cliArgs;

run({ mode: 'watch', file, args });
