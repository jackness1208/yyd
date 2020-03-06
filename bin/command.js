const cmder = require('commander')
const print = require('yyl-print')
const chalk = require('chalk')
const util = require('yyl-util')
const { initConfig } = require('../lib/util')
const { PKG_VERSION } = require('../lib/const')
const LANG = require('../lang/index')
const task = require('../index')

const env = util.envParse(process.argv)

function printHeader({ env }) {
  if (env.silent) {
    return
  }
  print.log.ver(`init-me ${chalk.yellow.bold(PKG_VERSION)}`)

  let keyIndex = -1
  process.argv.forEach((str, index) => {
    if (str.match(/bin[/\\]init$/)) {
      keyIndex = index
    }
  })
  if (keyIndex != -1) {
    const cmds = process.argv.slice(keyIndex + 1)
    print.log.cmd(`yyd ${cmds.join(' ')}`)
  }
}

/** path */
cmder.options('-p, --path', LANG.DESCRIPTION.PATH, () => {
  task.path({ env })
})

/** version */
cmder.options('-v, --version', LANG.DESCRIPTION.VERSION, () => {
  task.version({ env })
})

/** options */
cmder
  .option('-q, --silent', LANG.DESCRIPTION.SILENT)
  .option('--logLevel <level>', LANG.DESCRIPTION.LOG_LEVEL)

/** build */
cmder
  .command('build')
  .alias('b')
  .description(LANG.DESCRIPTION.BUILD)
  .action(() => {
    printHeader({ env })
    const config = initConfig()
    task.build({ config, env }).catch((er) => {
      print.log.error(env.logLevel === 2 ? er : er.message)
    })
  })

/** clean */
cmder
  .command('clean')
  .description(LANG.DESCRIPTION.CLEAN)
  .action(() => {
    const config = initConfig()
    task.clean({ config }).catch((er) => {
      print.log.error(env.logLevel === 2 ? er : er.message)
    })
  })

/** init */
cmder
  .command('init')
  .description(LANG.DESCRIPTION.INIT)
  .action(() => {
    printHeader({ env })
    task.init({ env }).catch((er) => {
      print.log.error(env.logLevel === 2 ? er : er.message)
    })
  })

/** man */
cmder
  .command('man')
  .description(LANG.DESCRIPTION.MAN)
  .action(() => {
    const config = initConfig()
    task.man({ env, config }).catch((er) => {
      print.log.error(env.logLevel === 2 ? er : er.message)
    })
  })

/** push */
cmder
  .command('push')
  .alias('p')
  .description(LANG.DESCRIPTION.PUSH)
  .action(() => {
    const config = initConfig()
    task.push({ env, config }).catch((er) => {
      print.log.error(env.logLevel === 2 ? er : er.message)
    })
  })

/** run */
cmder
  .command('run')
  .alias('r')
  .description(LANG.DESCRIPTION.RUN)
  .action(() => {
    const config = initConfig()
    task.run({ env, config }).catch((er) => {
      print.log.error(env.logLevel === 2 ? er : er.message)
    })
  })

/** stop */
cmder
  .command('stop')
  .description(LANG.DESCRIPTION.STOP)
  .action(() => {
    const config = initConfig()
    task.stop({ env, config }).catch((er) => {
      print.log.error(env.logLevel === 2 ? er : er.message)
    })
  })
