const cmd = require('./lib/cmd.js');

const r = {
  run: async (ctx, cwd) => {
    let iArgv = '';
    if (typeof ctx === 'string') {
      iArgv = ctx.split(/\s+/);
    } else {
      iArgv = ctx;
    }


    if (iArgv[0] == 'yyd') {
      iArgv = iArgv.slice(1);
    }

    if (cwd) {
      process.chdir(cwd);
    }
    return await cmd(iArgv);
  }
};

module.exports = r;
