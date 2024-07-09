---
title: 解决Nginx错误：Upstream prematurely closed connection
categories:
	- Nginx

date: 2024-01-03 9:50:20
tags: 
	- Nginx
---
<!-- toc -->

# <span id="inline-blue">环境</span>
linux : CentOS Linux release 7.7.1908 (Core)
nginx : 1.18.1
# <span id="inline-blue">现象</span>

一共部署了四台用于前端进行代理下载nginx,两台用于进行回源的源服务nginx，接口大量并发下载的情况下，nginx请求日志抛错
```shell
Upstream prematurely closed connection while reading response header from upstream
```
nginx代理端口下载链接1500~2000左右，大量出现CLOSE_WAIT状态
源nginx报错
![nginx报错信息](/images/nginx/nginx_20240103_001.png)


# <span id="inline-blue">解决办法</span>
升级系统发布新应用，客户端大量并发请求升级接口，但因为4台代理下载应用压缩包的服务器还未缓存刚发布的应用，导致所有的请求都被转发到了nginx源服务器进行请求下载，最终2台源服务器因为并发压力过高导致抛出too many files错误信息，造成回源nginx缓存异常，nginx代理服务器内存和cpu占用过高
调整服务器打开文件数配置
![nginx更改文件打开数](/images/nginx/nginx_20240103_002.png)
配置完成后，重启服务器生效，如果不想重启服务器，则在当前开启的session会话窗口执行
```shell
ulimit –HSn 65535
```
kill掉nginx进程，重新启动即可