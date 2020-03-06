const print = require('yyl-print')
const util = require('yyl-util')
const extFs = require('yyl-fs')
const path = require('path')
const chalk = require('chalk')
const fs = require('fs')
const rp = require('yyl-replacer')

const { INIT_PATH, PROJECT_PATH } = require('../lib/const')
const { relativeIt } = require('../lib/util')

module.exports = async function ({ env }) {
  print.fn.cost.start()
  const RENDER_FILES = [
    'Dockerfile',
    'README.md',
    'yyd.config.js'
  ].map((name) => util.path.resolve(INIT_PATH, name))

  const RENAME_MAP = {
    '.ignore': '.gitignore'
  }

  const SPICAL_FILES = Object.keys(RENAME_MAP).map((name) => util.path.resolve(INIT_PATH, name))

  const copyMap = {}
  const r = []

  const files = await extFs.readFilePaths(INIT_PATH, (iPath) => {
    const tPath = util.path.join(iPath)
    if (RENDER_FILES.indexOf(tPath) !== -1) {
      return false
    } else if (SPICAL_FILES.indexOf(tPath) !== -1) {
      return false
    }
    return true
  })

  const getToPath = (iPath) => {
    return path.resolve(PROJECT_PATH, path.relative(INIT_PATH, iPath))
  }

  // copy 普通文件
  files.forEach((iPath) => {
    copyMap[iPath] = getToPath(iPath)
  })

  const copyLog = await extFs.copyFiles(copyMap)
  copyLog.add.forEach((iPath) => {
    print.log.add(relativeIt(iPath))
    r.push(iPath)
  })

  copyLog.update.forEach((iPath) => {
    print.log.update(relativeIt(iPath))
    r.push(iPath)
  })

  let repository
  if (env.repository) {
    repository = env.repository
  } else {
    const dirname = PROJECT_PATH.split(path.sep).pop()
    repository = dirname.replace(/^docker-/, '')
  }


  // copy rename files
  const copyMap2 = {}
  Object.keys(RENAME_MAP).forEach((key) => {
    copyMap2[path.join(INIT_PATH, key)] = path.join(PROJECT_PATH, RENAME_MAP[key])
  })

  const copyLog2 = await extFs.copyFiles(copyMap2)

  copyLog2.add.forEach((iPath) => {
    print.log.add(relativeIt(iPath))
    r.push(iPath)
  })

  copyLog2.update.forEach((iPath) => {
    print.log.update(relativeIt(iPath))
    r.push(iPath)
  })

  // copy render files
  const data = {
    repository,
    tag: '0.1.0'
  }
  RENDER_FILES.forEach((iPath) => {
    const toPath = getToPath(iPath)
    const cnt = fs.readFileSync(iPath).toString()
    if (fs.existsSync(toPath)) {
      print.log.warn(`file exists, keep it: ${chalk.yellow(relativeIt(toPath))}`)
    } else {
      fs.writeFileSync(toPath, rp.dataRender(cnt, data))
      print.log.add(relativeIt(toPath))
      r.push(toPath)
    }
  })

  // pkg 处理
  const PKG_PATH = path.join(PROJECT_PATH, 'package.json')
  if (!fs.existsSync(PKG_PATH)) {
    fs.writeFileSync(PKG_PATH, JSON.stringify({
      name: data.repository,
      version: data.tag
    }, null, 2))
  }


  print.fn.cost.end()
  print.log.success(`init finished. cost ${chalk.green.bold(print.fn.cost.format())}`)
  return r
}