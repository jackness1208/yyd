const print = require('yyl-print')
const util = require('yyl-util')
const extOs = require('yyl-os')

const build = require('./build')
const { history } = require('../lib/history')
const LANG = require('../lang/index')

module.exports = async function({ config, env }) {
  print.fn.cost.start()
  if (!config.repository) {
    throw new Error(LANG.RUN.REPOSITORY_NULL)
  }

  if (!config.tag) {
    throw new Error(LANG.RUN.TAG_NULL)
  }

  await build({ env, config })
  if (!config.push) {
    throw new Error(LANG.RUN.PUSH_NULL)
  }

  let modes = Object.keys(config.push)

  if (!modes.length) {
    throw new Error(LANG.RUN.PUSH_LENGTH_0)
  }

  if (env.mode) {
    if (modes.indexOf(env.mode) === -1) {
      throw new Error(`${env.mode} ${LANG.PUSH.MODE_NOT_EXISTS}: ${modes.join('|')}`)
    }

    modes = [env.mode]
  }

  await util.forEach(modes, async (key) => {
    const { repository, tag } = config
    const { host, prefix } = config.push[key]

    let pushPrefix = prefix
    let pushHost = host || ''

    if (pushPrefix) {
      pushPrefix = `${pushPrefix.replace(/(^[\\/])|([\\/]$)/g, '')}/`
    } else {
      pushPrefix = ''
    }

    let remoteTag = env.tag
    if (!remoteTag) {
      remoteTag = 'latest'
    }

    if (config.rewriteHistory) {
      history.add({ tag, config })
    }

    let cmds = []
    let tagAddr = `${pushPrefix}${repository}:${tag}`
    let remoteAddr = `${pushPrefix}${repository}:${remoteTag}`
    if (pushHost) {
      tagAddr = `${pushHost}/${tagAddr}`
      remoteAddr = `${pushHost}/${remoteAddr}`
    }

    cmds = [
      `docker image tag ${repository}:${tag} ${tagAddr}`,
      `docker push ${tagAddr}`,
      `docker image tag ${repository}:${tag} ${remoteAddr}`,
      `docker push ${remoteAddr}`
    ]

    // 登录 docker
    if (env.username) {
      if (!env.passowrd) {
        throw new Error(`${LANG.PUSH.PWD_NULL}: ${env.username}`)
      }
      cmds.unshift(`docker login ${pushHost} --username ${env.username} --password ${env.passowrd}`)
    }

    await util.forEach(cmds, async (cmd) => {
      let printCMD = cmd
      const pwdReg = /(--passowrd) ([^ ]+)/
      if (printCMD.match(pwdReg)) { // 隐藏密码
        printCMD = printCMD.replace(pwdReg, '$1 ********')
      }
      print.log.info(`${LANG.RUN.RUN_CMD}: ${printCMD}`)
      await extOs.runCMD(cmd, __dirname).catch((er) => {
        throw new Error(er)
      })
    })
  })

  print.fn.cost.end()
  print.log.success(`${LANG.PUSH.FINISHED}, cost ${print.fn.cost.format()}`)
}