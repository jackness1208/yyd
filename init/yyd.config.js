const pkg = require('./package.json');
module.exports = {
  // docker 名称
  repository: '__data("repository")',
  // tag
  tag: pkg.version,

  push: {
    default: {
      host: '',
      prefix: ''
    }
  },
  // 自动 更新 history
  rewriteHistory: true

  // port 映射
  // portMap: {
  //   80:80
  // },

  // 挂载设置 [本地目录:docker 目录]
  // volume: {
  //   './autorun': '/autorun'
  // },
};
