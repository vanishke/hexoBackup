---
title: Linux 实现网络共享NFS
categories:
	- Linux
tags: 
	- Linux
	
date: 2024-07-29 17:55:20	
updated: 2024-07-29 17:55:20
---
<!-- toc -->
# <span id="inline-blue">环境</span>
centos:7.9
# <span id="inline-blue">背景</span>
项目部署Linux服务器发现磁盘空间不足，采用网络挂载的方式扩容存储。
# <span id="inline-blue">实现</span>
挂载服务器：10.9.216.170
挂载客户端：10.9.216.12

NFS：
网络文件系统(NFS)允许远程主机通过网络挂载文件系统，并像它们是本地挂载的文件系统一样与它们进行交互。这使系统管理员能够将资源整合到网络上的集中式服务器上

## <span id="inline-blue">安装依赖nfs-utis、rpcbind</span>
```shell
yum install nfs-utils.x86_64
yum install rpcbind.x86_64
```

## <span id="inline-blue">启动NFS/rpcbind</span>
```shell
systemctl start rpcbind.service
systemctl start nfs.service
```

## <span id="inline-blue">挂载命令</span>
挂载服务器：
```shell
vim /etc/fctab
/home 10.9.216*(rw,no_root_squash,sync)
```
ro: 只读
rw: 读写
root_squash: NFS客户端以root用户访问，映射为匿名用户
no_root_squash: NFS客户端以root用户访问，映射为服务端管理员账号
all_squash: 无论NFS客户端以什么账号访问，均映射为NFS服务端匿名用户
sync: 同步写入，直接写入磁盘
async: 异步写入，先写内存在写磁盘，可能导致数据丢失

挂载客户端：
```shell
#创建挂载点
mkdir /mount_home
#挂载
sudo mount -t nfs -o rw,atime -l 10.9.216.170:/home /mount_home
```
## <span id="inline-blue">问题总结</span>

### <span id="inline-blue">mount: 文件系统类型错误、选项错误、缺少代码页或助手程序，或其他错误</span>
挂载客户端未安装启动NFS服务

### <span id="inline-blue">找不到portmap依赖</span>
安装NFS过程中参考文档一直提示需要安装portmap依赖，其实该依赖自从CentOS 6版本系统之后已被rpcbind依赖替代，并且默认已经安装启动

### <span id="inline-blue">挂载之后发现没有写入权限</span>
执行挂载命令需要加上sudo,提升用户权限
