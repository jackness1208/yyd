# docker-test

## 构建信息
* 本项目使用 `yyd` 进行构建

## 安装 yyd
```
npm install yyd -g
```

## 相关命令
```
# 启动 本地 docker-test 镜像
yyd start

# 开始打包 docker-test 镜像
yyd build

# 发布 __('tag') 镜像 同时 发布 __('tag'):release
yyd release

# 发布 __('tag') 镜像 同时 发布 __('tag'):beta
yyd release --tag beta
```
