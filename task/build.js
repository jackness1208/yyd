const print = require('yyl-print')
const util = require('yyl-util')
const chalk = require('chalk')
const extOs = require('yyl-os')

const { PROJECT_PATH } = require('../lib/const')
const { updateDockfile } = require('../lib/util')
const LANG = require('../lang/index')

module.exports = async function({ env, config }) {
  if (!config.repository) {
    throw new Error(LANG.RUN.REPOSITORY_NULL)
  }

  if (!config.tag) {
    throw new Error(LANG.RUN.TAG_NULL)
  }

  updateDockfile({ config })

  let extend = ''
  const rEnv = Object.assign({}, env)
  delete rEnv.logLevel
  if (Object.keys(rEnv)) {
    extend = ` ${util.envStringify(rEnv)}`
  }

  const cmd = `docker image build ./ -t ${config.repository}:${config.tag}${extend}`

  print.log.info(`${LANG.RUN.RUN_CMD}: ${chalk.yellow.bold(cmd)}`)
  await extOs.runCMD(cmd, PROJECT_PATH)

  print.log.success(LANG.BUILD.FINISHED)
  return cmd
}