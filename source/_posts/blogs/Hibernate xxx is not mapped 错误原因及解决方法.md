---
title: Hibernate xxx is not mapped 错误原因及解决方法
categories:
	- Hibernate
tags: 
	- Hibernate
	
date: 2024-07-08 16:10:20	
---

<!-- toc -->
# 背景
SpringMVC项目改造为maven项目之后打包部署启动一直报错Hibernate xxx is not mapped

# 问题原因
错误提示信息应该是hql语句中查询语句使用的表名称和实体类不一致导致，检查之后发现不是这个原因，问题的原因是src/main/java目录中包含hibernate配置文件，打包的时候没有被包含进去。

# 解决方案
pom.xml文件build节点中添加如下内容
```xml
<resources>
			<resource>
				<directory>src/main/java</directory>
				<excludes>
					<exclude>**/*.java</exclude>
				</excludes>
			</resource>
			<resource>
				<directory>src/main/resources</directory>
			</resource>
</resources>
```
