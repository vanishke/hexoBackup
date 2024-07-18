---
title: Oracle启动与停止
categories: 
	- Oracle
tags: 
	- Oracle

date: 2020-11-17 11:11:20
updated: 2020-11-17 11:11:20
---

<!-- toc -->

## <span id="inline-blue">启动</span>

```shell
$ su – oracle 
$ sqlplus /nolog 
sql> conn / as sysdba 
sql> startup (一般不需要加参数，只要设置好环境变量） 
sql> quit (退出sql模式) 
$ lsnrctl start (启动监听器）关闭oracle 
$ lsnrctl status
$ lsnrctl stop(关闭监听器，在这之前，应该先关闭应用程序） 
```



​	

## <span id="inline-blue">停止</span>

```shell
su - oracle
$lsnrctl stop;
$ sqlplus /nolog 
sql> conn / as sysdba 
sql> shutdown immediate
```

