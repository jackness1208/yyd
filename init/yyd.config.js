const pkg = require('./package.json');
module.exports = {
  // docker 名称
  repository: '__data("repository")',
  // tag
  tag: pkg.version,
  // 推送的
  pushHost: '',
  pushPrefix: '',
  // 自动 更新 history
  rewriteHistory: true,

  // port 映射
  // portMap: {
  //   80:80
  // },

  // 挂载设置 [本地目录:docker 目录]
  // volume: {
  //   './autorun': '/autorun'
  // },

  // run or exec 后需要执行的 命令
  // commands: [
  //   '/autorun/init.sh'
  // ]
};
