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
  rewriteHistory: true
};
