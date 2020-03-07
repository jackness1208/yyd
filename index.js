const print = require('yyl-print')
const chalk = require('chalk')

print.log.init({
  keyword: {
    '开始': chalk.cyan,
    '完成': chalk.green,
    '为空': chalk.red,
    '不存在': chalk.red
  },
  type: {
    ver: {
      name: 'YYD>',
      color: 'white',
      bgColor: 'bgBlue'
    },
    cmd: {
      name: 'CMD>',
      color: 'white',
      bgColor: 'bgBlack'
    },
    create: {
      name: 'ADD>',
      color: chalk.bgGreen.white
    },
    del: {
      name: 'DEL>',
      color: chalk.bgWhite.black
    }
  }
})

module.exports.build = require('./task/build')
module.exports.clean = require('./task/clean')
module.exports.init = require('./task/init')
module.exports.man = require('./task/man')
module.exports.path = require('./task/path')
module.exports.push = require('./task/push')
module.exports.stop = require('./task/stop')
module.exports.run = require('./task/run')
module.exports.version = require('./task/version')