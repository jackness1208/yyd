const print = require('yyl-print')
const { PKG_VERSION } = require('../lib/const')
const chalk = require('chalk')

module.exports = function version ({ env }) {
  if (!env.silent) {
    print.borderBox([
      'docker cli',
      `yyd ${chalk.yellow.bold(PKG_VERSION)}`
    ])
  }
  return Promise.resolve(PKG_VERSION)
}