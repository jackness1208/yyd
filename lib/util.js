const util = require('yyl-util')
const path = require('path')
const extOs = require('yyl-os')
const fs = require('fs')
const print = require('yyl-print')

const { PROJECT_PATH, CONFIG_PATH, DOCKER_PATH } = require('./const')

const REG = {
  DOCKER_LIST_LINE_SPLIT: /[\r\n]+/,
  DOCKER_LIST_ITEM_SPLIT: /[\t\n ]{3,}/g
}

module.exports.formatEnv = function (cmder) {
  const getEnv = function (cmder) {
    let r = {}
    Object.keys(cmder).forEach((key) => {
      if (/^_/.test(key)) {
        return false
      } else if ([
        'options',
        'commands',
        'Command',
        'Option',
        'CommanderError',
        'rawArgs',
        'args'
      ].indexOf(key) !== -1) {
        return false
      } else if (key === 'parent') {
        r = Object.assign(r, getEnv(cmder.parent)) 
      } else {
        r[key] = cmder[key]
      }
    })
    return r
  }
  return getEnv(cmder)
}

module.exports.initConfig = function () {
  let config = {}
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      config = require(CONFIG_PATH)
    } catch (er) {
      print.log.warn(er)
      print.log.info('use default config: {}')
    }
  } else {
    print.log.warn(`config not exists: ${CONFIG_PATH}`)
    print.log.info('use default config: {}')
  }

  // 兼容旧版
  if (config.pushHost || config.pushPrefix) {
    if (!config.push) {
      config.push = {}
    }
    config.push.default = {
      host: config.pushHost,
      prefix: config.pushPrefix
    }
    delete config.pushHost
    delete config.pushPrefix
  }
  return config
}

module.exports.checkDockerPort = async function (port) {
  if (extOs.IS_WINDOWS_7) {
    const logStr = await extOs.runCMD(
      `docker-machine ssh default "netstat -an | grep ${port}"`,
      PROJECT_PATH,
      false
    )
    const r = queryDockerLogList(logStr, `0 :::${port}`, 2, true)
    return r.length === 0
  } else {
    return await extOs.checkPort(port)
  }
}

/**
 * 搜索 log list 中的 关键字对应的那行数据
 * @param  {String}  logStr    log 字段
 * @param  {String}  key       关键字
 * @param  {Number}  index     关键字所在列数
 * @param  {Boolean} headless  是否不带表头
 * @return {Array}   r         查找结果
 *
 */
const queryDockerLogList = function (logStr, key, index, headless) {
  // 去掉表头
  const logArr = logStr.split(REG.DOCKER_LIST_LINE_SPLIT)
  if (!headless) {
    logArr.splice(0, 1)
  }
  // format form
  const r = []

  logArr.forEach((str) => {
    const arr = str.split(REG.DOCKER_LIST_ITEM_SPLIT)
    if (arr.length < 3) {
      return
    }
    let searchRange = []
    if (typeof index === 'number') {
      searchRange = [arr[index]]
    } else {
      searchRange = arr
    }

    if (typeof key === 'string') {
      if (searchRange.indexOf(key) !== -1) {
        r.push(arr)
      }
    } else {
      r.push(arr)
    }
  })

  return r
}
module.exports.queryDockerLogList = queryDockerLogList

module.exports.isPath = function (ctx) {
  if (typeof ctx === 'string') {
    const rPath = path.resolve(process.cwd(), ctx)
    if (fs.existsSync(rPath)) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

module.exports.relativeIt = function (iPath) {
  return util.path.relative(PROJECT_PATH, iPath)
}

module.exports.updateDockfile = function ({ config }) {
  if (!fs.existsSync(DOCKER_PATH)) {
    print.log.warn(`update Dockerfile fail, not existsSync: ${DOCKER_PATH}`)
  } else {
    let cnt = fs.readFileSync(DOCKER_PATH).toString()
    if (!config.repository || !config.tag) {
      print.log.warn('update Dockerfile fail, (config.repository && config.tag) === false');
    } else {
      const {repository, tag} = config
      cnt = cnt.split(new RegExp(`${repository}@[^ ]+`)).join(`${repository}@${tag}`)
      fs.writeFileSync(DOCKER_PATH, cnt)
      print.log.success('Dockerfile updated')
    }
  }
}
