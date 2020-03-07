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

  let { pushHost, pushPrefix, repository, tag } = config

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
    history.add(tag)
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

  await util.forEach(cmds, async (cmd) => {
    print.log.info(`${LANG.RUN.RUN_CMD}: ${cmd}`)
    await extOs.runCMD(cmd, __dirname)
  })
  print.fn.cost.end()
  print.log.success(`${LANG.PUSH.FINISHED}, cost ${print.fn.cost.format()}`)
}