const util = require('yyl-util');
const print = require('yyl-print');
const extOs = require('yyl-os');
const path = require('path');
const chalk = require('chalk');
const pkg = require('../package.json');
const fs = require('fs');

let PROJECT_PATH = process.cwd();
const INIT_PATH = path.join(__dirname, '../init');
let config = {};

print.log.init({
  type: {
    ver: {
      name: 'YYD>',
      color: 'white',
      bgColor: 'bgBlue'
    }
  }
});

const task = {
  help(iEnv) {
    const h = {
      usage: 'yyt',
      commands: {
        'build': 'build docker with pkg.version',
        'release': 'build and publish docker image to server',
        'init': 'init docker files'
      },
      options: {
        '-h, --help': 'print usage information',
        '-v, --version': 'print version',
        '-p': 'show yyd path'
      }
    };
    if (!iEnv.silent) {
      print.help(h);
    }
    return Promise.resolve(h);
  },
  path(iEnv) {
    const r = path.join(__dirname, '../');
    if (!iEnv.silent) {
      print.log.info(`yyd path: ${chalk.yellow.bold(r)}`);
      extOs.openPath(r);
    }
    return Promise.resolve(r);
  },
  async version(iEnv) {
    if (!iEnv.silent) {
      const logArr = await print.borderBox([
        'docker cli',
        `yyd ${chalk.yellow.bold(pkg.version)}`
      ]);
      console.log(logArr.join('\n'));
    }
    return pkg.version;
  },
  clean() {

  }
};

module.exports = async (argv) => {
  const iEnv = util.envParse(argv);
  const ctx = argv[0];

  PROJECT_PATH = process.cwd();
  const CONFIG_PATH = path.join(PROJECT_PATH, 'yyd.config.js');
  if (fs.existsSync(CONFIG_PATH)) {
    config = require(CONFIG_PATH);
  }


  switch (ctx) {
    case '--version':
    case '-v':
      return await task.version(iEnv);

    case '--path':
    case '-p':
      return await task.path(iEnv);

    case 'init':
      return await task.init(iEnv);

    case 'start':
      return await task.start(iEnv);

    case 'build':
      return await task.build(iEnv);

    case 'release':
      return await task.release(iEnv);

    case 'clean':
      return await task.clean(iEnv);

    case '--help':
    case '-h':
      return await task.help(iEnv);

    default:
      return await task.help(iEnv);
  }
};
