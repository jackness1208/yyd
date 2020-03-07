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
  print.log.ver(`yyd ${chalk.yellow.bold(PKG_VERSION)}`)

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

let IS_MATCH = false

/** path */
cmder.option('-p, --path', LANG.DESCRIPTION.PATH, () => {
  task.path({ env })
  IS_MATCH = true
})

/** version */
cmder.option('-v, --version', LANG.DESCRIPTION.VERSION, () => {
  task.version({ env })
  IS_MATCH = true
})

/** options */
cmder
  .option('-q, --silent', LANG.DESCRIPTION.SILENT, () => {
    print.log.silent(true)
  })
  .option('--logLevel <level>', LANG.DESCRIPTION.LOG_LEVEL, (level) => {
    print.log.setLogLevel(level)
  })
  .option('--force', LANG.DESCRIPTION.FORCE)

cmder
  .option('-h, --help', LANG.DESCRIPTION.HELP, () => {
    print.cleanScreen()
    cmder.outputHelp()
    IS_MATCH = true
  })

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
    IS_MATCH = true
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
    IS_MATCH = true
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
    IS_MATCH = true
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
    IS_MATCH = true
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
    IS_MATCH = true
  })

/** run */
cmder
  .command('run [name]')
  .alias('r')
  .description(LANG.DESCRIPTION.RUN)
  .action((name) => {
    let config = {}
    if (!name) {
      config = initConfig()
    }
    task.run({ env, config, name }).catch((er) => {
      print.log.error(env.logLevel === 2 ? er : er.message)
    })
    IS_MATCH = true
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
    IS_MATCH = true
  })

cmder.parse(process.argv)

cmder.name('yyd')

if (!IS_MATCH) {
  print.cleanScreen()
  cmder.outputHelp()
}