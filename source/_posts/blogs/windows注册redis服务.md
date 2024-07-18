---
title: windows注册Redis服务
categories: 
	- Redis

tags: 
	- Redis
	- Windows
		
date: 2020-12-31 17:32:20
updated: 2020-12-31 17:32:20
---
<!-- toc -->

# <span id="inline-blue">环境</span>
windows 7 
Redis-x64-3.2.100

# <span id="inline-blue">Redis下载</span>

[下载地址](https://github.com/microsoftarchive/redis/releases)
笔者使用的Redis-x64-3.2.100版本

# <span id="inline-blue">Redis注册</span>

1.运行windows cmd命令，进入Redis安装目录D:\redis_3.2.100\Redis-x64-3.2.100

2.执行注册服务命令 redis-server --service-install redis.windows-service.conf 

3.如果需要卸载Redis服务，执行redis-server --service-uninstall

# <span id="inline-blue">Redis服务自启动设置</span>

![Redis服务设置](/images/redis/20210104_01.png)

# <span id="inline-blue">Redis服务验证</span>

![Redis服务验证](/images/redis/20210104_02.png)
