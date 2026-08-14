---
title: Nginx常用启动命令
categories: 
	- Nginx
tags: 
	- Nginx
	- Linux

date: 2020-12-24 10:11:20
---

<!-- toc -->

# 启动
```bash
./nginx 
./nginx -c dir(指定配置文件所在路径)
```

# 停止
```bash
./nginx -s quit /nginx处理完任务后停止
./nginx -s stop /强制停止nginx进程

```

# 重新加载
```bash
./nginx -s reload /重新加载nginx.cnf配置文件
```
