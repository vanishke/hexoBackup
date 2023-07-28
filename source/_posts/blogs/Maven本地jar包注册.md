---
title: Maven本地jar包注册
categories:
	- Maven

date: 2023-05-18 16:15:20
tags: 
	- Maven
---
<!-- toc -->

# <span id="inline-blue">原因</span>
maven项目加载依赖出现jar在中央仓库访问正常，但本地下载失败，导致项目一直爆红。
# <span id="inline-blue">解决办法</span>
```mvn
mvn install:install-file -Dfile=C:\Users\909754\Downloads\maven_jar\spring-boot-configuration-processor-2.2.6.RELEASE.jar    -DgroupId=org.springframework.boot -DartifactId=spring-boot-configuration-processor  -Dversion=2.2.6.RELEASE -Dpackaging=jar
```
参数说明：
install:install-file：jar包注册命令
-Dfile: 指定主车道本地仓库的绝对路径地址
-DgroupId：groupId
-DartifactId：artifactId
-Dversion：版本号
-Dpackaging：打包方式(pom、war、jar)


