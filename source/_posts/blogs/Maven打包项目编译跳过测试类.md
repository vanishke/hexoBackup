---
title: Maven打包项目编译跳过测试类
categories:
	- Maven
tags: 
	- Maven
	- Java
	
date: 2022-08-26 16:24:20
updated: 2022-08-26 16:24:20
---
<!-- toc -->

# <span id="inline-blue">编译忽略测试类</span>

## 插件依赖选项控制
编译插件依赖项添加<skipTests>true</skipTests>条目
```xml
<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-compiler-plugin</artifactId>
				<configuration>
					<skipTests>true</skipTests>
					<source>${java-version}</source>
					<target>${java-version}</target>
					<encoding>${project.encoding}</encoding>
				</configuration>
			</plugin>
```
此方法不执行测试用例，但会编译测试用例类，生成的class文件保存在target/test-classes下。
## properties配置项
<properties>节点新增<maven.test.skip>true</maven.test.skip>条目
```xml
 <properties>
  		<java-version>1.8</java-version>
  		<!-- maven打包忽略 test目录编译、不执行测试用例-->
  		<maven.test.skip>true</maven.test.skip>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<org.springframework-version>3.0.5.RELEASE</org.springframework-version>
		<org.apache.struts-version>2.2.1</org.apache.struts-version>
		<log4j-version>1.2.16</log4j-version>
  </properties>
```
此方法不执行测试用例，也不编译测试用例类。