# 历史信息
## 0.2.1 (2019-03-21)
* [FIX] 修复 `yyd run` `config.portMap` 没配置会报错问题
* [FIX] 修复 `yyd run` 不需要暴露端口的， 拆分为单独函数

## 0.2.0 (2019-03-20)
* [EDIT] `yyd run` 重复执行时不会重新跑 `docker run` 命令
* [EDIT] 兼容 `win 7` 系统的 docker 端口检查 命令

## 0.1.1-beta1 (2019-03-19)
* [FIX] 修复 `yyd --config` 时， `config.volume` 路径 不对问题

## 0.1.0 (2019-03-07)
* [ADD] `yyd init`
* [ADD] `yyd b`
* [ADD] `yyd build`
* [ADD] `yyd p`
* [ADD] `yyd push`
* [ADD] `yyd p --tag beta`
* [ADD] `yyd push --tag beta`
* [ADD] `yyd man`
* [ADD] `yyd -v`
* [ADD] `yyd --version`
* [ADD] `yyd -h`
* [ADD] `yyd --help`
* [ADD] `yyd stop`
* [ADD] `yyd clean`
* [ADD] `config.repository`
* [ADD] `config.tag`
* [ADD] `config.pushHost`
* [ADD] `config.pushPrefix`
* [ADD] `config.rewriteHistory`
* [ADD] `config.portMap`
* [ADD] `config.volume`
* [ADD] `config.commands`

## 0.0.1 (2019-02-28)
* [ADD] 先占个坑


