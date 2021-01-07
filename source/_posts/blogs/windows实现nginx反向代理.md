---
title: windows实现nginx反向代理
categories: nginx
date: 2021-01-06 17:32:20
tags: nginx,windows
---
<!-- toc -->

# 环境
windows 7 
nginx-1.16.1

# nginx下载

[官方下载地址](http://nginx.org/en/download.html)
笔者使用的nginx-1.16.1版本

# nginx代理设置
```bash
# http下server子节点设置
server {
        listen       8089; #nginx监听访问端口号
        server_name  10.9.212.55; #监听访问IP

        charset gbk,utf-8; #编码设置

        access_log  logs/host.access.log ; #访问日志存放位置

        location / {
			charset gbk,utf-8;
			autoindex on; #开启目录浏览功能
            root  H:/home/report_cd/; #代理本地FTP用户访问路径
			proxy_connect_timeout 1;
            index  index.html index.htm;
        }
	}
```
# 反向代理验证
![nginx反向代理验证](/images/nginx/nginx_20210107_05.png)

