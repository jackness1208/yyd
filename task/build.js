const print = require('yyl-print')
const util = require('yyl-util')
const chalk = require('chalk')
const extOs = require('yyl-os')

const { PROJECT_PATH } = require('../lib/const')
const { updateDockfile } = require('../lib/util')

module.exports = async function({ env, config }) {
  if (!config.repository) {
    throw 'config.repository must have value'
  }

  if (!config.tag) {
    throw 'config.tag must have value'
  }

  updateDockfile()

  let extend = ''
  if (Object.keys(env)) {
    extend = ` ${util.envStringify(env)}`
  }

  const cmd = `docker image build ./ -t ${config.repository}:${config.tag}${extend}`

  print.log.info(`run cmd: ${chalk.yellow.bold(cmd)}`)
  await extOs.runCMD(cmd, PROJECT_PATH)

  print.log.success('build finished')
  return cmd
}