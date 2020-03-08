const cmder = require('commander')
const print = require('yyl-print')
const chalk = require('chalk')
const { initConfig, formatEnv } = require('../lib/util')
const { PKG_VERSION } = require('../lib/const')
const LANG = require('../lang/index')
const task = require('../index')

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

/** option */
cmder
  .option('-p, --path', LANG.DESCRIPTION.PATH)
  .on('option:path', (cmder) => {
    const env = formatEnv(cmder)
    task.path({ env })
  })

cmder
  .option('-v, --version', LANG.DESCRIPTION.VERSION)
  .on('option:version', (cmder) => {
    const env = formatEnv(cmder)
    task.version({ env })
  })

cmder
  .option('-q, --silent', LANG.DESCRIPTION.SILENT, () => {
    print.log.silent(true)
    return true
  })
  .option('--logLevel <number>', LANG.DESCRIPTION.LOG_LEVEL, (level) => {
    print.log.setLogLevel(level)
    return level
  })

/** build */
cmder
  .command('build')
  .alias('b')
  .allowUnknownOption(true)
  .description(LANG.DESCRIPTION.BUILD)
  .action((cmder) => {
    const env = formatEnv(cmder)
    printHeader({ env })
    const config = initConfig()
    task.build({ config, env }).catch((er) => {
      print.log.error(env.logLevel === 2 ? er : er.message)
    })
  })

/** clean */
cmder
  .command('clean')
  .option('--force', LANG.DESCRIPTION.FORCE)
  .description(LANG.DESCRIPTION.CLEAN)
  .action((cmder) => {
    const env = formatEnv(cmder)
    const config = initConfig()
    task.clean({ config }).catch((er) => {
      print.log.error(env.logLevel === 2 ? er : er.message)
    })
  })

/** init */
cmder
  .command('init')
  .description(LANG.DESCRIPTION.INIT)
  .action((cmder) => {
    const env = formatEnv(cmder)
    printHeader({ env })
    task.init({ env }).catch((er) => {
      print.log.error(env.logLevel === 2 ? er : er.message)
    })
  })

/** man */
cmder
  .command('man')
  .description(LANG.DESCRIPTION.MAN)
  .action((cmder) => {
    const env = formatEnv(cmder)
    const config = initConfig()
    print.cleanScreen()
    task.man({ env, config }).catch((er) => {
      print.log.error(env.logLevel === 2 ? er : er.message)
    })
  })

/** push */
cmder
  .command('push')
  .alias('p')
  .description(LANG.DESCRIPTION.PUSH)
  .option('-t, --tag <tagName>', LANG.DESCRIPTION.TAG)
  .option('-m, --mode <mode>', LANG.DESCRIPTION.MODE)
  .option('-p, --password <pwd>', LANG.DESCRIPTION.PASSWORD)
  .option('-u, --username <usr>', LANG.DESCRIPTION.USERNAME)
  .action((cmder) => {
    const env = formatEnv(cmder)
    console.log(env)
    const config = initConfig()
    task.push({ env, config }).catch((er) => {
      print.log.error(env.logLevel === 2 ? er : er.message)
    })
  })

/** run */
cmder
  .command('run [name]')
  .alias('r')
  .description(LANG.DESCRIPTION.RUN)
  .action((name, cmder) => {
    const env = formatEnv(cmder)
    let config = {}
    if (!name) {
      config = initConfig()
    }
    task.run({ env, config, name }).catch((er) => {
      print.log.error(env.logLevel === 2 ? er : er.message)
    })
  })

/** stop */
cmder
  .command('stop')
  .description(LANG.DESCRIPTION.STOP)
  .action((cmder) => {
    const env = formatEnv(cmder)
    const config = initConfig()
    task.stop({ env, config }).catch((er) => {
      print.log.error(env.logLevel === 2 ? er : er.message)
    })
  })



cmder.parse(process.argv)
cmder.name('yyd')

cmder
  .command('*')
  .action(() => {
    print.cleanScreen()
    cmder.outputHelp()
  })