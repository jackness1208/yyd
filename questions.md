# 常见问题整理

## windows7下遇到：cgroups: cannot find cgroup mount destination: unknown
解决方法:
```
docker-machine.exe ssh default sudo mkdir /sys/fs/cgroup/systemd
docker-machine.exe ssh default sudo mount -t cgroup -o none,name=systemd cgroup /sys/fs/cgroup/systemd
```

## centos7 安装 docker
```
yum update
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
```
如出现安装异常， 请卸载旧包
```
# 异常信息
Transaction check error:
  file /usr/bin/docker from install of docker-ce-17.12.0.ce-1.el7.centos.x86_64 conflicts with file from package docker-common-2:1.12.6-68.gitec8512b.el7.centos.x86_64
  file /usr/bin/docker-containerd from install of docker-ce-17.12.0.ce-1.el7.centos.x86_64 conflicts with file from package docker-common-2:1.12.6-68.gitec8512b.el7.centos.x86_64
  file /usr/bin/docker-containerd-shim from install of docker-ce-17.12.0.ce-1.el7.centos.x86_64 conflicts with file from package docker-common-2:1.12.6-68.gitec8512b.el7.centos.x86_64
  file /usr/bin/dockerd from install of docker-ce-17.12.0.ce-1.el7.centos.x86_64 conflicts with file from package docker-common-2:1.12.6-68.gitec8512b.el7.centos.x86_64
```

```
卸载旧版本包
sudo yum erase docker-common-2:1.12.6-68.gitec8512b.el7.centos.x86_64
```
