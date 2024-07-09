---
title: Hibernate xxx is not mapped 错误原因及解决方法
categories:
	- Hibernate

date: 2024-07-08 16:10:20
tags: 
	- Hibernate
---
<!-- toc -->
# <span id="inline-blue">背景</span>
SpringMVC项目改造为maven项目之后打包部署启动一直报错Hibernate xxx is not mapped

# <span id="inline-blue">问题原因</span>
错误提示信息应该是hql语句中查询语句使用的表名称和实体类不一致导致，检查之后发现不是这个原因，问题的原因是src/main/java目录中包含hibernate配置文件，打包的时候没有被包含进去。

# <span id="inline-blue">解决方案</span>
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