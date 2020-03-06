module.exports = {
  DESCRIPTION: {
    PATH: '显示 并打开 yyd 工具所在路径',
    VERSION: '显示 yyd 版本',
    SILENT: '静默输出',
    LOG_LEVEL: 'log 类型: 0|1|2',
    INIT: '初始化 yyd 项目',
    BUILD: '构建 docker',
    CLEAN: '清空当前项目镜像和临时文件',
    MAN: '显示有用的信息',
    PUSH: '推送到服务器',
    RUN: '运行 docker',
    STOP: '停止所有正在运行的 docker',
    HELP: '显示帮助信息'
  },
  RUN: {
    RUN_MANUAL: '手动运行此命令',
    CLIPED: '命令已复制到剪贴板',
    REPOSITORY_NULL: 'config.repository 值为空',
    TAG_NULL: 'config.tag 值为空',
    CHECK_IMAGE_STATUS: '检查 docker 镜像运行状态',
    IMAGE_IS_RUNNING: '镜像正在运行, 下一步',
    IMAGE_NOT_RUNNING: '镜像不在运行, 检查缓存',
    REMOVE_CACHE_ID: '移除缓存中镜像 id',
    NO_IAMGE_CACHE: '不存在缓存',
    PORT_OCCUPIED: '端口被占用, 请检查',
    RUN_CMD: '运行命令',
    FIND_RUNNIN_IMAGE: '查找运行中的镜像，名字为',
    NOT_FOUND: '没找到',
    DOCKER_MAC_IP: 'docker 物理 ip 地址'
  }
}