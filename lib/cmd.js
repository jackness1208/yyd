const util = require('yyl-util');
const print = require('yyl-print');
const extOs = require('yyl-os');
const extFs = require('yyl-fs');
const rp = require('yyl-replacer');
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
        'init': 'init docker files',
        'man' : 'docker commons commands'
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
    // TODO
  },
  man() {
    // TODO
  },
  async init(iEnv) {
    print.log.silent(iEnv.silent === true);

    print.fn.cost.start();
    const RENDER_FILES = [
      'Dockerfile',
      'README.md',
      'yyd.config.js'
    ].map((name) => util.path.resolve(INIT_PATH, name));

    const RENAME_MAP = {
      '.ignore': '.gitignore'
    };

    const SPICAL_FILES = Object.keys(RENAME_MAP).map((name) => util.path.resolve(INIT_PATH, name));

    const copyMap = {};
    const r = [];

    const files = await extFs.readFilePaths(INIT_PATH, (iPath) => {
      const tPath = util.path.join(iPath);
      if (RENDER_FILES.indexOf(tPath) !== -1) {
        return false;
      } else if (SPICAL_FILES.indexOf(tPath) !== -1) {
        return false;
      }
      return true;
    });

    const getToPath = (iPath) => {
      return path.resolve(PROJECT_PATH, path.relative(INIT_PATH, iPath));
    };

    // copy 普通文件
    files.forEach((iPath) => {
      copyMap[iPath] = getToPath(iPath);
    });

    const copyLog = await extFs.copyFiles(copyMap);
    copyLog.add.forEach((iPath) => {
      print.log.add(iPath);
      r.push(iPath);
    });

    copyLog.update.forEach((iPath) => {
      print.log.update(iPath);
      r.push(iPath);
    });

    const dirname = PROJECT_PATH.split(path.sep).pop();
    const tag = dirname.replace(/^docker-/, '');

    // copy rename files
    const copyMap2 = {};
    Object.keys(RENAME_MAP).forEach((key) => {
      copyMap2[path.join(INIT_PATH, key)] = path.join(PROJECT_PATH, RENAME_MAP[key]);
    });

    const copyLog2 = await extFs.copyFiles(copyMap2);

    copyLog2.add.forEach((iPath) => {
      print.log.add(iPath);
      r.push(iPath);
    });

    copyLog2.update.forEach((iPath) => {
      print.log.update(iPath);
      r.push(iPath);
    });

    // copy render files
    const data = {
      tag
    };
    RENDER_FILES.forEach((iPath) => {
      const toPath = getToPath(iPath);
      const cnt = fs.readFileSync(iPath).toString();
      fs.writeFileSync(toPath, rp.dataRender(cnt, data));
      print.log.add(toPath);
      r.push(iPath);
    });

    print.fn.cost.end();
    print.log.success(`init finished. cost ${chalk.green.bold(print.fn.cost.format())}`);
    return r;
  },
  start() {
    // TODO
  },
  build() {
    // TODO
  },
  release() {
    // TODO
  }
};

module.exports = async (argv) => {
  const iEnv = util.envParse(argv);
  const ctx = argv[0];

  PROJECT_PATH = process.cwd();
  const CONFIG_PATH = path.join(PROJECT_PATH, 'yyd.config.js');
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      config = require(CONFIG_PATH);
    } catch (er) {
      print.log.warn(`config parse error: ${chalk.yellow(CONFIG_PATH)}`);
      print.log.warn(er);
    }
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

    case 'man':
      return await task.man(iEnv);

    case '--help':
    case '-h':
      return await task.help(iEnv);


    default:
      return await task.help(iEnv);
  }
};
