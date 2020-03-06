const extOs = require('yyl-os')
const util = require('yyl-util')
const { PROJECT_PATH } = require('../lib/const')
const { queryDockerLogList } = require('../lib/util')
const chalk = require('chalk')

module.exports = async function () {
  print.fn.cost.start()
  const logStr = await extOs.runCMD('docker ps', PROJECT_PATH, false)
  const ids = queryDockerLogList(logStr).map((arr) => arr[0])

  if (!ids.length) {
    print.log.success('stop finished, no repository is running')
  } else {
    await util.forEach(ids, async (id) => {
      const cmd = `docker stop ${id}`
      print.log.info(`run cmd: ${chalk.yellow.bold(cmd)}`)

      await extOs.runCMD(cmd, PROJECT_PATH)
    })
    print.fn.cost.end()
    print.log.success(
      // eslint-disable-next-line max-len
      `stop finished, total ${chalk.yellow(ids.length)}, cost ${chalk.green.bold(print.fn.cost.format())}`
    )
  }
  return ids
}