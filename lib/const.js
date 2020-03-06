const path = require('path')

const PROJECT_PATH = process.cwd()
const CONFIG_PATH = path.join(PROJECT_PATH, 'yyd.config.js')
const HISTORY_PATH = path.join(PROJECT_PATH, 'history.md')
const PKG_VERSION = require('../package.json').version
const INIT_PATH = path.join(__dirname, '../init')

module.exports.PROJECT_PATH = PROJECT_PATH
module.exports.CONFIG_PATH = CONFIG_PATH
module.exports.HISTORY_PATH = HISTORY_PATH
module.exports.PKG_VERSION = PKG_VERSION
module.exports.INIT_PATH = INIT_PATH