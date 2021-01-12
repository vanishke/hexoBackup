---
title: windows注册nginx服务
categories: nginx
date: 2020-12-31 17:32:20
tags: nginx,windows
---
<!-- toc -->

# <span id="inline-blue">环境</span>
windows 7
nginx-1.16.1
winsw-2.0.2-bin.exe

# <span id="inline-blue">nginx下载</span>

[官方下载地址](http://nginx.org/en/download.html)
笔者使用的nginx-1.16.1版本

# <span id="inline-blue">注册工具</span>
```bash
官方下载地址：http://repo.jenkins-ci.org/releases/com/sun/winsw/winsw/
笔者使用的2.0.2版本
```
# <span id="inline-blue">nginx注册</span>

1.将nginx解压至指定安装位置,D:\nginx-1.16.1\nginx-1.16.1
![nginx安装目录](/images/nginx/nginx_20201231_01.png)

2.将winsw-2.0.2-bin.exe复制到nginx目录：D:\nginx-1.16.1\nginx-1.16.1,并将其改成nginx-service.exe 

3.新建一个xml文件nginx-service.xml,内容如下,注意里面目录对应关系
```xml
<service>
  <id>nginx</id>
  <name>Nginx Service</name>
  <description>High Performance Nginx Service</description>
  <logpath>D:\nginx-1.16.1\nginx-1.16.1\logs</logpath>
  <log mode="roll-by-size">
    <sizeThreshold>10240</sizeThreshold>
    <keepFiles>8</keepFiles>
  </log>
  <executable>D:\nginx-1.16.1\nginx-1.16.1\nginx.exe</executable>
  <startarguments>-p D:\nginx-1.16.1\nginx-1.16.1\Nginx</startarguments>
  <stopexecutable>D:\nginx-1.16.1\nginx-1.16.1\nginx.exe</stopexecutable>
  <stoparguments>-p D:\nginx-1.16.1\nginx-1.16.1\Nginx -s stop</stoparguments>
</service>
```
4.运行windows cmd命令，进入nginx安装目录，执行nginx注册服务命令nginx-service.exe install，如果注册没有成功需要执行nginx卸载命令：nginx-service.exe uninstall

# <span id="inline-blue">环境调试</span>

1.如果nginx启动没有成功，需要根据nginx启动日志定位错误信息，日志文件所在位置D:\nginx-1.16.1\nginx-1.16.1\logs,大部分情况下是端口和配置文件目录设置问题。

# <span id="inline-blue">nginx服务自启动设置</span>

运行windows cmd命令，找到nginx服务，右键属性可配置nginx启动方式。
![nginx服务验证](/images/nginx/nginx_20201231_02.png)
![nginx服务验证](/images/nginx/nginx_20201231_03.png)

# <span id="inline-blue">nginx服务验证</span>
![nginx服务验证](/images/nginx/nginx_20201231_04.png)
