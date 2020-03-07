const print = require('yyl-print')
const path = require('path')
const util = require('yyl-util')
const chalk = require('chalk')
const fs = require('fs')
const extOs = require('yyl-os')
const LANG = require('../lang/index')

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
  print.log.info(`${LANG.RUN.RUN_MANUAL}: ${chalk.yellow.bold(cmd)}`)
  await extOs.clip(cmd)
  print.log.success(LANG.RUN.CLIPED)
}

async function runImage({ name, env }) {
  const cmd = `docker run -i -t ${name} ${util.envStringify(env)} /bin/bash`
  await extOs.clip(cmd)
  print.log.info(`${LANG.RUN.RUN_MANUAL}: ${chalk.yellow.bold(cmd)}`)
  print.log.success(LANG.RUN.CLIPED)
}

async function run ({ config, name, env }) {
  if (name) {
    return await runImage({ name, env })
  }
  if (!config.repository) {
    throw new Error(LANG.RUN.REPOSITORY_NULL)
  }
  if (!config.tag) {
    throw new Error(LANG.RUN.TAG_NULL)
  }

  const iName = `${config.repository}_${config.tag}`

  if (!config.portMap) {
    return await runSimple({ config })
  }

  // step 01
  print.log.info(`${chalk.cyan('step 1')} - ${LANG.RUN.CHECK_IMAGE_STATUS}: ${chalk.yellow(iName)}`)
  const runningId = queryDockerLogList(
    await extOs.runCMD('docker ps', PROJECT_PATH, false),
    iName,
    6
  ).map((arr) => arr[0])[0]
  if (runningId) {
    print.log.info(LANG.RUN.IMAGE_IS_RUNNING)
  } else {
    print.log.info(LANG.RUN.IMAGE_NOT_RUNNING)

    const cacheId = queryDockerLogList(
      await extOs.runCMD('docker ps -a', PROJECT_PATH, false),
      iName
    ).map((arr) => arr[0])[0]
    if (cacheId) {
      print.log.info(`${LANG.RUN.REMOVE_CACHE_ID}: ${chalk.yellow(cacheId)}`)
      await extOs.runCMD(`docker rm ${cacheId}`)
    } else {
      print.log.info(LANG.RUN.NO_IAMGE_CACHE)
    }

    if (config.portMap) {
      await util.forEach(Object.keys(config.portMap), async (key) => {
        const canUse = await checkDockerPort(key)
        if (!canUse) {
          throw new Error(`${LANG.RUN.PORT_OCCUPIED}: ${key}`)
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
    print.log.info(`${LANG.RUN.RUN_CMD}: ${chalk.yellow.bold(cmd01)}`)
    try {
      await extOs.runCMD(cmd01, PROJECT_PATH)
    } catch (er) {
      print.log.error(er)
    }
  }

  // step 02
  const cmd02 = 'docker ps'
  print.log.info(`${chalk.cyan('step 2')} - ${LANG.RUN.FIND_RUNNIN_IMAGE}: ${iName}`)
  print.log.info(`${LANG.RUN.RUN_CMD}: ${chalk.yellow.bold(cmd02)}`)
  const logStr = await extOs.runCMD(cmd02, PROJECT_PATH, false)
  const curId = queryDockerLogList(logStr, iName, 6).map((arr) => arr[0])[0]

  if (!curId) {
    print.log.warn(`${iName} ${LANG.RUN.NOT_FOUND}: ${chalk.yellow(cmd02)}`)
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
    print.log.info(`${LANG.RUN.DOCKER_MAC_IP}: ${chalk.yellow.bold(ip)}`)
  }
  print.log.info(`${LANG.RUN.RUN_MANUAL}: ${chalk.yellow.bold(cmd03)}`)
  await extOs.clip(cmd03)
  print.log.success(LANG.RUN.CLIPED)
  return cmd03
}

module.exports = run