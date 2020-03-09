const extOs = require('yyl-os')
const chalk = require('chalk')
const LANG = require('../lang/index')

async function getDockerVersion () {
  let dockerVerStr = ''
  try {
    dockerVerStr = await extOs.runCMD('docker -v', __dirname, false)
  } catch (er) {}
  if (dockerVerStr) {
    return dockerVerStr.replace(/[\r\n]/g, '').replace(/^.+version ([0-9.]+).*$/, '$1')
  } else {
    return null
  }
}

async function checkDaemonUsage() {
  let r = ''
  try {
    r = await extOs.runCMD('docker image list', __dirname, false)
  } catch (er) {}

  if (r) {
    return true
  } else {
    return false
  }
}

module.exports = async function ({ env }) {
  let pass = true
  let dockerStr = await getDockerVersion()
  if (!dockerStr) {
    pass = false
    dockerStr = chalk.red.bold('not found')
  } else {
    dockerStr = chalk.green.bold(dockerStr)
  }

  let deamonStr = ''
  if (await checkDaemonUsage()) {
    deamonStr = chalk.green('pass')
  } else {
    pass = false
    deamonStr = chalk.red.bold(LANG.DOCTOR.DEAMON_NOT_RUN)
  }

  if (!env.silent) {
    console.log([
      '',
      ` ${chalk.yellow.bold('docker')} ${LANG.DOCTOR.CHECKING_LIST}:`,
      '',
      ` ${chalk.yellow('version')} : ${dockerStr}`,
      ` ${chalk.yellow('daemon ')} : ${deamonStr}`,
      ''
    ].join('\n'))
    if (pass) {
      console.log([
        ` ${chalk.green.bold(LANG.DOCTOR.ALL_PASS)}`,
        ''
      ].join('\n'))
    }
  }
}
