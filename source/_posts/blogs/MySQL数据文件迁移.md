---
title: MySQL数据文件迁移
categories:
	- MySQL
tags: 
	- Linux
	- MySQL
	
date: 2023-07-10 16:23:20
updated: 2023-07-10 16:23:20
---
<!-- toc -->

# <span id="inline-blue">背景</span>
一次更新服务器内核之后导致服务器挂掉，在多次尝试无法恢复的情况下选择重装系统，但服务器上的安装的服务MySQL数据需要进行备份，数据文件通过镜像挂载的方式备份到本地，包括MySQL配置文件/etc/my.cnf
原始MySQL版本: 5.5.60
重装MySQL版本: 5.7.33

原始数据目录所在位置/home/mysql/data
重装数据目录所在位置/home/mysql/data
# <span id="inline-blue">迁移步骤</span>
1. 数据文件上传至重装后的MySQL数据目录
采用/bin/cp原生命令可避免cp命令别名导致的交互式确认删除的问题。
```shell
cd /usr/local/bak/mysql
/bin/cp -rf * /home/mysql/data
```

2. 重新给拷贝后的数据文件目录赋予MySQL用户权限
```shell
cd /home/mysql/data
chown -R mysql:mysql mysql
```

3. 重启MySQL服务
```shell
service mysqld restart
```
 
