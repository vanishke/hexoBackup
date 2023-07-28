---
title: SpringCloud微服务打包排除指定配置文件
categories:
	- Maven

date: 2023-07-18 16:38:20
tags: 
	- Maven
---
<!-- toc -->
# <span id="inline-blue">背景</span>
Maven: 3.5.4
微服务打成jar通过nacos下发配置，本地配置文件配置项冲突导致nacos配置中心配置被覆盖


# <span id="inline-blue">解决办法</span>
排除项目src/main/resources路径下application-${spring.profiles.active}.properties文件
```xml
<build>
		<finalName>ffcs-admin-biz</finalName>
		<resources>
			<resource>
				<filtering>true</filtering>
				<directory>src/main/resources</directory>
				<excludes>
					<exclude>application-*.properties</exclude>
				</excludes>
			</resource>
		</resources>
	</build>
```

