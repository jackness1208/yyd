const extOs = require('yyl-os')
const print = require('yyl-print')
const inquirer = require('inquirer')
const { queryDockerLogList } = require('../lib/util')
const { PROJECT_PATH } = require('../lib/const')
const LANG = require('../lang/index')
const chalk = require('chalk')

module.exports = async function ({ config }) {
  const curName = config.repository
  const curTag = config.tag
  let curId = ''

  const logStr = await extOs.runCMD('docker image list', PROJECT_PATH, false)
  const noneList = queryDockerLogList(logStr, '<none>', 0).map((arr) => arr[2])
  const curNames = queryDockerLogList(logStr, curName, 0)
  const cleanMap = {}

  if (curName && curTag) {
    curNames.forEach((arr) => {
      const iName = arr[0]
      const iTag = arr[1]
      const iId = arr[2]
      if (curTag === iTag) {
        curId = iId
      } else {
        if (!cleanMap[iId]) {
          cleanMap[iId] = []
        }
        cleanMap[iId].push(`${iName}:${iTag}`)
      }
    })
  }

  if (curId && cleanMap[curId]) {
    delete cleanMap[curId]
  }

  const cleanNames = []
  Object.keys(cleanMap).forEach((key) => {
    cleanMap[key].forEach((name) => {
      cleanNames.push(chalk.yellow.bold(name))
    })
  })

  const cleanIds = Object.keys(cleanMap).concat(noneList)

  if (!cleanIds.length) {
    print.log.success(LANG.CLEAN.NO_REPOSITORY)
  } else {
    const cmd = `docker rmi -f ${cleanIds.join(' ')}`

    let infoLog = `${LANG.CLEAN.STRAT} ${cleanNames.join(', ')}${cleanNames.length ? ' and ' : ''}`
    infoLog = `${infoLog}<none> repository ${chalk.yellow.bold(noneList.length)} files`
    print.log.info(infoLog)

    const prompt = inquirer.createPromptModule()
    const d = await prompt([{
      name: 'ok',
      message: 'ok?',
      type: 'confirm'
    }])

    if (d.ok) {
      print.log.cmd(`${LANG.RUN.RUN_CMD}: ${chalk.yellow.bold(cmd)}`)
      await extOs.runCMD(cmd, PROJECT_PATH)
      print.log.success(LANG.CLEAN.FINISHED)
    }
  }

  return cleanIds
}