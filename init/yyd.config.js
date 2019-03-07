module.exports = {
  // docker 名称
  repository: '__data("repository")',
  // tag
  tag: '0.1.0',
  // 推送的
  pushHost: 'harbor.yy.com',
  pushHostPrefix: 'front_end',
  // 自动 更新 history
  rewriteHistory: true,
  // 加速地址
  registryMirror: 'registry.docker-cn.com'
};
