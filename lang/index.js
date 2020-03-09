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
    HELP: '显示帮助信息',
    FORCE: '跳过二次确认执行',
    TAG: '版本标签, 默认是当前版本 + latest',
    MODE: '推送模式，默认为 default',
    PASSWORD: '密码',
    USERNAME: '用户名',
    DOCTOR: '检查当前 docker 环境状况'
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
  },
  BUILD: {
    FINISHED: 'docker 镜像构建完成'
  },
  CLEAN: {
    NO_REPOSITORY: '清理完成，没啥(repository)可清的',
    STRAT: '开始清理',
    FINISHED: '清理完成'
  },
  INIT: {
    JUMP_EXISTS_FILE: '文件已存在，跳过',
    FINISHED: '初始化完成'
  },
  PUSH: {
    PUSH_NULL: '未设置 config.push',
    PUSH_LENGTH_0: '请至少设置1个 push type 如 config.push.default: { host?: string, prefix?: string}',
    MODE_NOT_EXISTS: '不存在于列表',
    PWD_NULL: '请配置登录密码',
    FINISHED: '推送完成'
  },
  STOP: {
    FINISHED: '停止完成'
  },
  DOCTOR: {
    CHECKING_LIST: '运行环境检查',
    DEAMON_NOT_RUN: '未启动',
    ALL_PASS: '检查完成，没啥问题'
  }
}