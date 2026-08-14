---
title: Linux tar.xz格式压缩文件解压命令
categories:
	- Linux
tags: 
	- Linux
	
date: 2023-08-01 11:35:20
---

<!-- toc -->
# 目的
	tar.xz格式的压缩包和tar.gz格式解压命令不一样，记录一下
# 解压
压缩文件名：glibc-2.27.tar.xz
```shell
#进行两次解压
#先解压xz
xz -d glibc-2.27.tar.xz
#在解压tar格式
tar -xvf glibc-2.27.tar
```
