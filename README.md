# yyd
提供 docker 一系列操作的 脚手架

## api

### yyd init 初始化

```
# 初始化 docker 项目，并以文件夹名称作为 tag
yyd init

# 初始化 docker 项目，并 设置 repository = yyl, tag = 0.1.0
yyd init --repository yyl --tag 0.1.0
```

### yyd build 构建

```
# 开始根据 当前目录中的 yyd.config.js 中的 config.repository, config.tag,
# 构建 docker
yyd build
yyd b
```

### yyd run

```
# 开始根据 当前目录中的 yyd.config.js 中的 config.repository, config.tag,
# 运行对应的 docker
yyd run
yyd r
```

### yyd stop
```
# 停止所有正在运行的 docker
yyd stop
```

### yyd push

```
# 开始根据 当前目录中的 yyd.config.js 中的 config.repository, config.tag,
# 发布镜像到 remote 并且 发布 ${config.repository}:latest 版本
yyd push

# 发布镜像到 remote 并且 发布 ${config.repository}:beta 版本
yyd push --tag beta
```

### yyd clean
```
# 清除 docker 中 ${config.repository}:${config.tag} 以外的其他 ${config.repository} 镜像
# 并且 清除 匿名镜像
yyd clean
```

### yyd man
```
显示 常用 的 docker 操作命令
yyd man
```
