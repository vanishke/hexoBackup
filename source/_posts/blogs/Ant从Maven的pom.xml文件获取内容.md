---
title: Ant从Maven的pom.xml文件获取内容
categories:
	- Maven

date: 2023-03-03 11:25:20
tags: 
	- Maven
---
<!-- toc -->

# <span id="inline-blue">build.xml读取pom.xml版本信息</span>
```ant
#引入pom.xml文件，以xml方式读取文件内容，节点属性以pom.project开始
<xmlproperty file="pom.xml" prefix="pom" />
<echo>The version is ${pom.project.version}</echo>
```
读取pom.xml文件中properties节点下的log4j-version信息
pom.xml文件中的内容如下
```xml
<properties>
  		<java-version>1.8</java-version>
  		<!-- maven打包忽略 test目录编译、不执行测试用例-->
  		<maven.test.skip>true</maven.test.skip>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
		<org.springframework-version>3.0.5.RELEASE</org.springframework-version>
		<org.apache.struts-version>2.3.32</org.apache.struts-version>
		<log4j-version>1.2.16</log4j-version>
  </properties>
```
ant的构建文件build.xml用法如下：
```xml
<xmlproperty file="pom.xml" prefix="pom" />
<echo>The version is ${pom.project.properties.log4j-version}</echo>
```
# <span id="inline-blue">验证</span>
![ant读取pom文件信息](/images/Maven/Maven_20230303_001.png)



