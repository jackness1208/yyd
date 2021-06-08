# 历史信息
## 0.5.0 (2020-03-09)
* feat: 新增 `yyd doctor` 用于环境检查

## 0.4.1(2020-03-09)
* fix: yyd man bugfix

## 0.4.0(2020-03-08)
* feat: push 命令改造， 支持自动登录 docker

## 0.3.1 (2020-03-08)
* feat: log 调整

## 0.3.0 (2020-03-08)
* feat: yyd 改造
* feat: 新增 `yyd run dockername:tag` 方法
* del: 去掉 config.commands 参数

## 0.2.3 (2019-06-16)
* fix: 修复 在配置 `config.port` 情况下 macos 执行 `yyd r` 会报错 `/sbin/init is not a directory` 的问题

## 0.2.2 (2019-03-28)
* fix: 修复 `yyd run` `clean cache` 逻辑查询 cache 失败问题

## 0.2.1 (2019-03-21)
* fix: 修复 `yyd run` `config.portMap` 没配置会报错问题
* fix: 修复 `yyd run` 不需要暴露端口的， 拆分为单独函数

## 0.2.0 (2019-03-20)
* [EDIT] `yyd run` 重复执行时不会重新跑 `docker run` 命令
* [EDIT] 兼容 `win 7` 系统的 docker 端口检查 命令

## 0.1.1-beta1 (2019-03-19)
* fix: 修复 `yyd --config` 时， `config.volume` 路径 不对问题

## 0.1.0 (2019-03-07)
* feat: `yyd init`
* feat: `yyd b`
* feat: `yyd build`
* feat: `yyd p`
* feat: `yyd push`
* feat: `yyd p --tag beta`
* feat: `yyd push --tag beta`
* feat: `yyd man`
* feat: `yyd -v`
* feat: `yyd --version`
* feat: `yyd -h`
* feat: `yyd --help`
* feat: `yyd stop`
* feat: `yyd clean`
* feat: `config.repository`
* feat: `config.tag`
* feat: `config.pushHost`
* feat: `config.pushPrefix`
* feat: `config.rewriteHistory`
* feat: `config.portMap`
* feat: `config.volume`
* feat: `config.commands`

## 0.0.1 (2019-02-28)
* feat: 先占个坑


