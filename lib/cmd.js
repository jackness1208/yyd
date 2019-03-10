const util = require('yyl-util');
const print = require('yyl-print');
const extOs = require('yyl-os');
const extFs = require('yyl-fs');
const rp = require('yyl-replacer');
const path = require('path');
const chalk = require('chalk');
const pkg = require('../package.json');
const inquirer = require('inquirer');
const fs = require('fs');

print.log.init({
  type: {
    ver: {
      name: 'YYD>',
      color: chalk.white.bgRed
    },
    man: {
      name: 'MAN>',
      color: chalk.white.bgBlack
    }
  }
});

const INIT_PATH = path.join(__dirname, '../init');

let PROJECT_PATH = '';
let HISTORY_PATH = '';
let CONFIG_PATH = '';
let DOCKER_PATH = '';
let config = {};

let HISTORY_TITLE_TMPL = '## {$tag} ({$date})';

const HISTORY_ITEM_TMPL = '* 同步 `{$repository}@{$tag}` 版本';
const HISTORY_TMPL = [
  '# 版本信息',
  '由构建工具生成，请勿更改',
  '{$list}'
].join('\r\n');

const REG = {
  MD_H2: /^#{2}\s+([^\s].*$)/,
  MD_LIST: /^\*\s+([^\s].*$)/,
  MD_TL_VER: /^([^\s]+)\s*\(.+$/,
  MD_TL_DATE: /.+\(([^)]+)\)$/,

  DOCKER_LIST_LINE_SPLIT: /[\r\n]+/,
  DOCKER_LIST_ITEM_SPLIT: /[\t\n ]{2,}/g
};

const fn = {
  relativeIt(iPath) {
    return util.path.relative(PROJECT_PATH, iPath);
  },

  updateDockfile() {
    if (!fs.existsSync(DOCKER_PATH)) {
      print.log.warn(`update Dockerfile fail, not existsSync: ${DOCKER_PATH}`);
    } else {
      let cnt = fs.readFileSync(DOCKER_PATH).toString();
      if (!config.repository || !config.tag) {
        print.log.warn('update Dockerfile fail, (config.repository && config.tag) === false');
      } else {
        const {repository, tag} = config;
        cnt = cnt.split(new RegExp(`${repository}@[^ ]+`)).join(`${repository}@${tag}`);
        fs.writeFileSync(DOCKER_PATH, cnt);
        print.log.success('Dockerfile updated');
      }
    }
  }
};


const history = {
  source: null,
  init() {
    const self = this;
    if (!fs.existsSync(HISTORY_PATH)) {
      fs.writeFileSync(HISTORY_PATH, HISTORY_TMPL.replace('{$list}', ''));
      print.log.warn('history.md not exists, build it');
      print.log.add(HISTORY_PATH);
    }

    const cnt = fs.readFileSync(HISTORY_PATH).toString();
    const cntArr = cnt.split(/[\r\n]+/);
    const r = {};
    let curPoint = null;
    cntArr.forEach((str) => {
      if (str.match(REG.MD_H2)) {
        const title = str.replace(REG.MD_H2, '$1');
        const obj = {
          title,
          date: new Date(title.replace(REG.MD_TL_DATE, '$1')),
          tag: title.replace(REG.MD_TL_VER, '$1'),
          content: []
        };

        r[obj.tag] = obj;
        curPoint = obj;
      } else if (str.match(REG.MD_LIST) && curPoint) {
        curPoint.content.push(str);
      }
    });

    self.source = r;
    return r;
  },
  get() {
    const self = this;
    if (!self.source) {
      self.init();
    }
    return Object.keys(self.source).sort((a, b) => {
      return -util.compareVersion(a, b);
    });
  },
  add(tag) {
    const self = this;
    if (!self.source) {
      self.init();
    }

    const now = new Date();
    self.source[tag] = {
      title: HISTORY_TITLE_TMPL.replace('{$tag}', tag).replace('{$date}', print.fn.dateFormat(now)),
      date: now,
      tag: tag,
      content: [HISTORY_ITEM_TMPL.replace('{$tag}', tag).replace('{$repository}', config.repository)]
    };

    self.save();
  },
  save() {
    const self = this;
    const vers = self.get();

    const r = HISTORY_TMPL.replace('{$list}', (() => {
      const arr = [];
      vers.forEach((ver) => {
        const item = self.source[ver];
        if (item) {
          arr.push(HISTORY_TITLE_TMPL.replace('{$tag}', item.tag).replace('{$date}', print.fn.dateFormat(item.date)));
          arr.push(HISTORY_ITEM_TMPL.replace('{$tag}', item.tag).replace('{$repository}', config.repository));
        }
      });
      return arr.join('\r\n');
    })());

    fs.writeFileSync(HISTORY_PATH, r);
    print.log.success('history.md updated');
  }
};



const task = {
  help(iEnv) {
    const h = {
      usage: 'yyd',
      commands: {
        'build, b': 'start build docker image with Dockerfile',
        'push, p': 'package and push docker image to remote, add latest tag',
        'init': 'init yyd project',
        'man' : 'docker cmd index'
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
  async clean() {
    const curName = config.repository;
    const curTag = config.tag;
    let curId = '';

    const logStr = await extOs.runCMD('docker image list', PROJECT_PATH, false);
    const logArr = logStr.split(REG.DOCKER_LIST_LINE_SPLIT).slice(1);
    const cleanMap = {};
    const noneList = [];

    logArr.forEach((str) => {
      const arr = str.split(REG.DOCKER_LIST_ITEM_SPLIT);
      if (arr.length < 3) {
        return;
      }
      const iName = arr[0];
      const iTag = arr[1];
      const iId = arr[2];

      // 未命名的 统统去掉
      if (iName === '<none>') {
        noneList.push(iId);
      }

      // 查询 相同 name 下 其余的 tag，并且加入 清除列表
      if (curName && curTag) {
        if (curName === iName) {
          if (curTag === iTag) {
            curId = iId;
          } else {
            if (!cleanMap[iId]) {
              cleanMap[iId] = [];
            }
            cleanMap[iId].push(`${iName}:${iTag}`);
          }
        }
      }
    });

    if (curId && cleanMap[curId]) {
      delete cleanMap[curId];
    }

    const cleanNames = [];
    Object.keys(cleanMap).forEach((key) => {
      cleanMap[key].forEach((name) => {
        cleanNames.push(chalk.yellow.bold(name));
      });
    });

    const cleanIds = Object.keys(cleanMap).concat(noneList);

    if (!cleanIds.length) {
      print.log.success('clean finished, no repository can be remove');
    } else {
      const cmd = `docker rmi -f ${cleanIds.join(' ')}`;

      let infoLog = `start clean ${cleanNames.join(', ')}${cleanNames.length ? ' and ' : ''}`;
      infoLog = `${infoLog}<none> repository ${chalk.yellow.bold(noneList.length)} files`;
      print.log.info(infoLog);

      const prompt = inquirer.createPromptModule();
      const d = await prompt([{
        name: 'ok',
        message: 'ok?',
        type: 'confirm'
      }]);

      if (d.ok) {
        print.log.cmd(`run cmd ${chalk.yellow.bold(cmd)}`);
        await extOs.runCMD(cmd, PROJECT_PATH);
        print.log.success('clean finished');
      }
    }
    return cleanIds;
  },
  async stop() {
    print.fn.cost.start();
    const logStr = await extOs.runCMD('docker ps', PROJECT_PATH, false);
    const logArr = logStr.split(REG.DOCKER_LIST_LINE_SPLIT).slice(1);
    const ids = [];
    logArr.forEach((str) => {
      const arr = str.split(REG.DOCKER_LIST_ITEM_SPLIT);
      if (arr.length < 3) {
        return;
      }
      ids.push(arr[0]);
    });

    if (!ids.length) {
      print.log.success('stop finished, no repository is running');
    } else {
      await util.forEach(ids, async (id) => {
        const cmd = `docker stop ${id}`;
        print.log.info(`run cmd: ${chalk.yellow.bold(cmd)}`);

        await extOs.runCMD(cmd, PROJECT_PATH);
      });
      print.fn.cost.end();
      print.log.success(`stop finished, total ${chalk.yellow(ids.length)}, cost ${chalk.green.bold(print.fn.cost.format())}`);
    }
    return ids;
  },
  man(iEnv) {
    let name = '[:repository]:[:tag]';

    if (config.repository && config.tag) {
      name = `${config.repository}:${config.tag}`;
    }

    let manPush = [];
    const iPrefix = config.pushPrefix ? `${config.pushPrefix}/` : '';
    if (config.pushHost) {
      const remoteTag = `${config.pushHost}${iPrefix ? `/${iPrefix}`: ''}${name}`;
      manPush = [
        ` ${chalk.white('# push')}`,
        ` ${chalk.gray('## step 1: login')}`,
        ` ${chalk.yellow.bold(`docker login ${config.pushHost}`)}`,
        ` ${chalk.gray('## step 2: link')}`,
        ` ${chalk.yellow.bold(`docker docker tag ${name} ${remoteTag}`)}`,
        ` ${chalk.gray('## step 3: push')}`,
        ` ${chalk.yellow(`docker push ${remoteTag}`)}`
      ];
    } else {
      manPush = [
        ` ${chalk.white('# push')}`,
        ` ${chalk.gray('## step 1: login')}`,
        ` ${chalk.yellow.bold('docker login')}`,
        ` ${chalk.gray('## step 2: push')}`,
        ` ${chalk.yellow.bold(`docker push  ${iPrefix}${name}`)}`
      ];
    }

    const manBuild = [
      ` ${chalk.white('# build')}`,
      ` ${chalk.yellow.bold(`docker image build ./ -t ${name}`)}`,
      ` ${chalk.yellow.bold(`docker image build ./ -t ${name} --no-cache`)}`
    ];

    const manRun = [
      ` ${chalk.white('# run')}`,
      ` ${chalk.yellow.bold(`docker run -i -t ${name} /bin/bash`)}`
    ];

    const manRemove = [
      ` ${chalk.white('# remove')}`,
      ` ${chalk.yellow.bold('docker rmi -f [:imageid]')}`
    ];


    const logArr = ['']
      .concat(manBuild)
      .concat([''])
      .concat(manRun)
      .concat([''])
      .concat(manPush)
      .concat([''])
      .concat(manRemove)
      .concat(['']);

    if (!iEnv.silent) {
      console.log(logArr.join('\r\n'));
    }

    return Promise.resolve(logArr);
  },
  async init(iEnv) {
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
      print.log.add(fn.relativeIt(iPath));
      r.push(iPath);
    });

    copyLog.update.forEach((iPath) => {
      print.log.update(fn.relativeIt(iPath));
      r.push(iPath);
    });

    let repository;
    if (iEnv.repository) {
      repository = iEnv.repository;
    } else {
      const dirname = PROJECT_PATH.split(path.sep).pop();
      repository = dirname.replace(/^docker-/, '');
    }


    // copy rename files
    const copyMap2 = {};
    Object.keys(RENAME_MAP).forEach((key) => {
      copyMap2[path.join(INIT_PATH, key)] = path.join(PROJECT_PATH, RENAME_MAP[key]);
    });

    const copyLog2 = await extFs.copyFiles(copyMap2);

    copyLog2.add.forEach((iPath) => {
      print.log.add(fn.relativeIt(iPath));
      r.push(iPath);
    });

    copyLog2.update.forEach((iPath) => {
      print.log.update(fn.relativeIt(iPath));
      r.push(iPath);
    });

    // copy render files
    const data = {
      repository,
      tag: '0.1.0'
    };
    RENDER_FILES.forEach((iPath) => {
      const toPath = getToPath(iPath);
      const cnt = fs.readFileSync(iPath).toString();
      fs.writeFileSync(toPath, rp.dataRender(cnt, data));
      print.log.add(fn.relativeIt(toPath));
      r.push(toPath);
    });

    // pkg 处理
    const PKG_PATH = path.join(PROJECT_PATH, 'package.json');
    if (!fs.existsSync(PKG_PATH)) {
      fs.writeFileSync(PKG_PATH, JSON.stringify({
        name: data.repository,
        version: data.tag
      }, null, 2));
    }


    print.fn.cost.end();
    print.log.success(`init finished. cost ${chalk.green.bold(print.fn.cost.format())}`);
    return r;
  },
  async run() {
    if (!config.repository) {
      throw 'config.repository must have value';
    }
    if (!config.tag) {
      throw 'config.tag must have value';
    }

    const volumeArr = [];
    if (config.volume) {
      Object.keys(config.volume).forEach((key) => {
        const rootPath = path.resolve(key);
        volumeArr.push(`-v ${rootPath}:${config.volume[key]}`);
      });
    }

    let commands = [];

    if (config.commands.length) {
      commands = config.commands;
    }

    if (config.portMap) {
      const portArgv = [];
      Object.keys(config.portMap).forEach((key) => {
        portArgv.push(`-p ${key}:${config.portMap[key]}`);
      });

      const iName = `${config.repository}_${config.tag}_${+new Date()}`;

      const cmd01 = `docker run --privileged --name ${iName} -d -ti -v /sys/fs/cgroup:/sys/fs/cgroup:ro ${portArgv.join(' ')} ${volumeArr.join(' ')} ${config.repository}:${config.tag} /sbin/init`;

      // step 01
      print.log.info(`${chalk.cyan('step 1')}, start docker at background`);
      print.log.info(`run cmd: ${chalk.yellow.bold(cmd01)}`);
      await extOs.runCMD(cmd01, PROJECT_PATH);

      // step 02
      const cmd02 = 'docker ps';
      let curId = '';
      print.log.info(`${chalk.cyan('step 2')}, find the running imageid which name = ${iName}`);
      print.log.info(`run cmd: ${chalk.yellow.bold(cmd02)}`);
      const logStr = await extOs.runCMD(cmd02, PROJECT_PATH, false);
      const logArr = logStr.split(REG.DOCKER_LIST_LINE_SPLIT).slice(1);
      logArr.forEach((str) => {
        const arr = str.split(REG.DOCKER_LIST_ITEM_SPLIT);
        if (arr.length < 7) {
          return;
        }
        const iId = arr[0];
        const name = arr[6];
        if (name === iName) {
          curId = iId;
        }
      });

      if (!curId) {
        print.log.warn(`can not find ${iName} in ${chalk.yellow(cmd02)}`);
        return;
      }

      // step 03
      const cmd03 = `docker exec -it ${curId} /bin/bash ${commands.join(' ')}`;
      print.log.info(`${chalk.cyan('step 3')}`);
      print.log.info(`run this cmd manual: ${chalk.yellow.bold(cmd03)}`);
      return cmd03;
    } else {
      const cmd = `docker run -i -t ${config.repository}:${config.tag} ${volumeArr.join(' ')} /bin/bash ${commands.join(' ')}`;
      print.log.info(`run this cmd manual: ${chalk.yellow.bold(cmd)}`);
      print.log.info('done');

      return cmd;
    }
  },
  async build(iEnv) {
    if (!config.repository) {
      throw 'config.repository must have value';
    }

    if (!config.tag) {
      throw 'config.tag must have value';
    }

    fn.updateDockfile();

    let extend = '';
    if (Object.keys(iEnv)) {
      extend = ` ${util.envStringify(iEnv)}`;
    }

    const cmd = `docker image build ./ -t ${config.repository}:${config.tag}${extend}`;

    print.log.info(`run cmd: ${chalk.yellow.bold(cmd)}`);
    await extOs.runCMD(cmd, PROJECT_PATH);

    print.log.success('build finished');
    return cmd;
  },
  async push(iEnv) {
    print.fn.cost.start();
    if (!config.repository) {
      throw 'config.repository must have value';
    }

    if (!config.tag) {
      throw 'config.tag must have value';
    }

    await this.build(iEnv);

    let { pushHost, pushPrefix, repository, tag } = config;

    if (pushPrefix) {
      pushPrefix = `${pushPrefix.replace(/(^[\\/])|([\\/]$)/g, '')}/`;
    } else {
      pushPrefix = '';
    }

    let remoteTag = iEnv.tag;
    if (!remoteTag) {
      remoteTag = 'latest';
    }

    if (config.rewriteHistory) {
      history.add(tag);
    }

    let cmds = [];
    let tagAddr = `${pushPrefix}${repository}:${tag}`;
    let remoteAddr = `${pushPrefix}${repository}:${remoteTag}`;
    if (pushHost) {
      tagAddr = `${pushHost}/${tagAddr}`;
      remoteAddr = `${pushHost}/${remoteAddr}`;
    }

    cmds = [
      `docker image tag ${repository}:${tag} ${tagAddr}`,
      `docker push ${tagAddr}`,
      `docker image tag ${repository}:${tag} ${remoteAddr}`,
      `docker push ${remoteAddr}`
    ];

    await util.forEach(cmds, async (cmd) => {
      print.log.info(`run cmd: ${cmd}`);
      await extOs.runCMD(cmd, __dirname);
    });
    print.fn.cost.end();
    print.log.success(`push finished, cost ${print.fn.cost.format()}`);
  }
};

module.exports = async (argv) => {
  const iEnv = util.envParse(argv);
  const ctx = argv[0];

  print.log.silent(iEnv.silent === true);

  if (!iEnv.silent) {
    print.cleanScreen();
  }

  PROJECT_PATH = process.cwd();
  DOCKER_PATH = path.join(PROJECT_PATH, 'Dockerfile');
  HISTORY_PATH = path.join(HISTORY_PATH, 'history.md');
  CONFIG_PATH = path.join(PROJECT_PATH, 'yyd.config.js');

  if (iEnv.config) {
    CONFIG_PATH = path.resolve(PROJECT_PATH, iEnv.config);
  }

  print.log.ver(`ver ${chalk.yellow.bold(pkg.version)}`);
  print.log.cmd(`yyd ${argv.join(' ')}`);

  if (fs.existsSync(CONFIG_PATH)) {
    try {
      config = require(CONFIG_PATH);
    } catch (er) {
      print.log.warn(er);
      print.log.info('use default config: {}');
    }
  } else {
    print.log.warn(`config not exists: ${CONFIG_PATH}`);
    print.log.info('use default config: {}');
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

    case 'run':
    case 'r':
      return await task.run(iEnv);

    case 'build':
    case 'b':
      return await task.build(iEnv);

    case 'push':
    case 'p':
      return await task.push(iEnv);

    case 'clean':
      return await task.clean(iEnv);

    case 'stop':
      return await task.stop(iEnv);

    case 'man':
      return await task.man(iEnv);

    case '--help':
    case '-h':
      return await task.help(iEnv);

    default:
      return await task.help(iEnv);
  }
};
