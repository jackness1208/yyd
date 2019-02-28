#!/usr/bin/env node
const print = require('yyl-print');
const iArgv = process.argv.splice(2);

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:\n', err.stack);
});

const cmd = require('../index.js');
cmd.run(iArgv).catch((err) => {
  print.log.error(err);
  process.exit(1);
});
