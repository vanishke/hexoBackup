---
title: MySQL在线备份表
tags: 
	- MySQL
categories: 
	- MySQL

date: 2024-10-09 14:18:23	
---

# 背景 
项目上线后发现容器启动缓存加载数据库表内容，表记录过大大致缓存加载失败，接口请求获取不到数据

# 解决方案 
通过将数据库表记录过多的表项在线备份，减少缓存的加载数据量，从而缓解内存的压力，验证是否缓存导致的应用加载异常

# 实现 

## 备份原始表 

```mysql
rename table source to source_bak
```
## 新建原始表 

```mysql
#like语法仅复制表结构，忽略表数据
create table source like source_bak
```
备份完成之后，source_bak是备份表，新建的source可以继续实现业务数据写入。
