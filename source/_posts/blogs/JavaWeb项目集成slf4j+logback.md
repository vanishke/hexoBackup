---
title: JavaWeb项目集成slf4j+logback.md
categories:
	- Slf4j
tags: 
	- Slf4j
	- logback
	
date: 2025-09-26 16:30:02
updated: 2025-09-26 16:30:02
---
<!-- toc -->
# <span id="inline-blue">环境</span>
Spring: 4.3.20.RELEASE
Java: 1.8

# <span id="inline-blue">背景</span>
项目模块集成log4j实现日志输出，最近在后台管理批量处理相关操作下发现耗时特别严重，通过jstack -l pid命令抓取进程堆栈，发现阻塞在log4j相关实现上，于是进行升级，将日志实现改造为slf4j+logback实现。
```shell
"pool-5-thread-23" #928 prio=5 os_prio=0 tid=0x00007fd93405a000 nid=0x4ca16 waiting for monitor entry [0x00007fd83afed000]
   java.lang.Thread.State: BLOCKED (on object monitor)
	at org.apache.log4j.Category.callAppenders(Category.java:204)
	- waiting to lock <0x00000005d0a50bd8> (a org.apache.log4j.spi.RootLogger)
	at org.apache.log4j.Category.forcedLog(Category.java:391)
	at org.apache.log4j.Category.log(Category.java:856)
	at org.slf4j.impl.Log4jLoggerAdapter.debug(Log4jLoggerAdapter.java:209)
	at org.apache.ibatis.logging.slf4j.Slf4jImpl.debug(Slf4jImpl.java:47)
	at org.mybatis.spring.SqlSessionUtils.closeSqlSession(SqlSessionUtils.java:165)
	at org.mybatis.spring.SqlSessionTemplate$SqlSessionInterceptor.invoke(SqlSessionTemplate.java:372)
	at com.sun.proxy.$Proxy31.selectOne(Unknown Source)
	at org.mybatis.spring.SqlSessionTemplate.selectOne(SqlSessionTemplate.java:160)
```
# <span id="inline-blue">实现</span>
项目pom.xml添加slf4j+logback依赖，排除log4j相关依赖
```
	<properties>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<java-version>1.8</java-version>
		<org.slf4j-version>1.7.32</org.slf4j-version>
		<logback-version>1.2.11</logback-version>
	</properties>
    <!-- Logback 核心 -->
    <dependency>
      <groupId>ch.qos.logback</groupId>
      <artifactId>logback-core</artifactId>
      <version>${logback-version}</version>
    </dependency>
    <!-- Logback 经典（实现SLF4J接口） -->
    <dependency>
      <groupId>ch.qos.logback</groupId>
      <artifactId>logback-classic</artifactId>
      <version>${logback-version}</version>
    </dependency>
    <!-- SLF4J API -->
    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>slf4j-api</artifactId>
      <version>${org.slf4j-version}</version>
    </dependency>
```