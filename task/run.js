const print = require('yyl-print')
const path = require('path')
const util = require('yyl-util')
const chalk = require('chalk')
const fs = require('fs')
const extOs = require('yyl-os')

const { CONFIG_PATH, PROJECT_PATH } = require('../lib/const')
const { queryDockerLogList, checkDockerPort } = require('../lib/util')

async function runSimple({ config }) {
  const volumeArr = []
  if (config.volume) {
    Object.keys(config.volume).forEach((key) => {
      const fPath = util.path.resolve(path.dirname(CONFIG_PATH), key)
      let rootPath = ''
      if (fs.existsSync(fPath)) {
        rootPath = fPath.replace(/^(\w):\//i, (str, $1) => {
          return `//${$1.toLowerCase()}/`
        })
      } else {
        rootPath = key
      }
      volumeArr.push(`-v ${rootPath}:${config.volume[key]}`)
    })
  }
  const cmd = `docker run -t -i ${volumeArr.join(' ')} ${config.repository}:${config.tag} /bin/bash`
  print.log.info(`run this cmd manual: ${chalk.yellow.bold(cmd)}`)
  await extOs.clip(cmd)
  print.log.success('the manual cmd already in clipboard')
}

async function run ({ config }) {
  if (!config.repository) {
    throw 'config.repository must have value'
  }
  if (!config.tag) {
    throw 'config.tag must have value'
  }

  const iName = `${config.repository}_${config.tag}`

  if (!config.portMap) {
    return await runSimple({ config })
  }

  // step 01
  print.log.info(`${chalk.cyan('step 1')}, check docker ${chalk.yellow(iName)} status`)
  const runningId = queryDockerLogList(
    await extOs.runCMD('docker ps', PROJECT_PATH, false),
    iName,
    6
  ).map((arr) => arr[0])[0]
  if (runningId) {
    print.log.info('running, next step')
  } else {
    print.log.info('not exists, check cache start')

    const cacheId = queryDockerLogList(
      await extOs.runCMD('docker ps -a', PROJECT_PATH, false),
      iName
    ).map((arr) => arr[0])[0]
    if (cacheId) {
      print.log.info(`remove the cache id: ${chalk.yellow(cacheId)}`)
      await extOs.runCMD(`docker rm ${cacheId}`)
    } else {
      print.log.info('no cache')
    }

    if (config.portMap) {
      await util.forEach(Object.keys(config.portMap), async (key) => {
        const canUse = await checkDockerPort(key)
        if (!canUse) {
          throw `port ${key} was occupied, please check`
        }
      })
    }

    const volumeArr = []
    if (config.volume) {
      Object.keys(config.volume).forEach((key) => {
        const fPath = util.path.resolve(path.dirname(CONFIG_PATH), key)
        let rootPath = ''
        if (fs.existsSync(fPath)) {
          rootPath = fPath.replace(/^(\w):\//i, (str, $1) => {
            return `//${$1.toLowerCase()}/`
          })
        } else {
          rootPath = key
        }
        volumeArr.push(`-v ${rootPath}:${config.volume[key]}`)
      })
    }

    const portArgv = []
    if (config.portMap) {
      Object.keys(config.portMap).forEach((key) => {
        portArgv.push(`-p ${key}:${config.portMap[key]}`)
      })
    }

    const extV = '-v /sys/fs/cgroup:/sys/fs/cgroup:ro'
    const cmd01 = `docker run --privileged --name ${iName} -d -ti ${extV} ${portArgv.join(' ')} ${volumeArr.join(' ')} ${config.repository}:${config.tag}`
    print.log.info(`run cmd: ${chalk.yellow.bold(cmd01)}`)
    try {
      await extOs.runCMD(cmd01, PROJECT_PATH)
    } catch (er) {
      print.log.error(er)
    }
  }

  // step 02
  const cmd02 = 'docker ps'
  print.log.info(`${chalk.cyan('step 2')}, find the running imageid which name = ${iName}`)
  print.log.info(`run cmd: ${chalk.yellow.bold(cmd02)}`)
  const logStr = await extOs.runCMD(cmd02, PROJECT_PATH, false)
  const curId = queryDockerLogList(logStr, iName, 6).map((arr) => arr[0])[0]

  if (!curId) {
    print.log.warn(`${iName} not found in ${chalk.yellow(cmd02)}`)
    return
  }

  // step 03
  const cmd03 = `docker exec -it ${curId} /bin/bash`
  print.log.info(`${chalk.cyan('step 3')}`)
  if (extOs.IS_WINDOWS) {
    const ipStr = await extOs.runCMD('docker-machine ip', PROJECT_PATH, false)
    const ip = ipStr
      .replace(/^.*(\d+\.\d+\.\d+\.\d+).*$/, '$1')
      .replace(/[\r\n]+/g, '')
    print.log.info(`docker machine IP: ${chalk.yellow.bold(ip)}`)
  }
  print.log.info(`run this cmd manual: ${chalk.yellow.bold(cmd03)}`)
  await extOs.clip(cmd03)
  print.log.success('the manual cmd already in clipboard')
  return cmd03
}

module.exprots = run