---
title: 应用程序兼容DM8数据库
categories:
	- DM8

date: 2024-07-08 15:10:20
tags: 
	- DM8
---
<!-- toc -->
# <span id="inline-blue">背景</span>
ORACLE数据库迁移DM8，应用程序需要做出相应的兼容设置

# <span id="inline-blue">添加DM8依赖</span>
```shell
<dependency>
    <groupId>com.dameng</groupId>
    <artifactId>DmJdbcDriver18</artifactId>
    <version>8.1.3.140</version>
</dependency>
```
# <span id="inline-blue">数据库连接驱动设置</span>
```shell
<property name="driverClassName" value="dm.jdbc.driver.DmDriver"></property>
<property name="url" value="jdbc:dm://10.9.216.12:5236"></property>
<property name="username" value="SDP_CMS_HRB"></property>
<property name="password" value="SDP_CMS_HRB"></property>
```