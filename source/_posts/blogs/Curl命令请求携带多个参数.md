---
title: Curl命令请求携带多个参数
categories:
	- Linux
tags: 
	- Linux
	- Curl
	
date: 2024-08-12 16:37:05	
---

<!-- toc -->
# 环境
MySQL: Red Hat Enterprise Linux Server release 6.5 (Santiago)
# 背景
使用curl命令测试http接口，接口提示必填参数缺失，但实际上连接上有对应参数信息
# 原因
curl命令后面的http请求链接如果有多个参数，但链接没有用双引号引起来的情况下，curl只能截取到&标识符后面的第一个参数
正确的用法如下：
```shell
curl "http://10.9.219.2:28888/ulms/logicInfoList?smartCard=00072514986612787444&stbCode=30320&version=950&flag=2"
```
# 验证
![Cur接口测试](/images/linux/Linux_20240812_001.png)
