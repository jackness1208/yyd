const chalk = require('chalk')
const extOs = require('yyl-os')
const path = require('path')
const print = require('yyl-print')

module.exports = function ({ env }) {
  const r = path.join(__dirname, '../')
  if (!env.silent) {
    print.log.info(`yyd path: ${chalk.yellow.bold(r)}`)
    extOs.openPath(r)
  }
  return Promise.resolve(r)
}