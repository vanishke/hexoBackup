---
title: Maven打包resource排除不生效的解决办法
categories:
	- Maven
tags: 
	- Maven
	
date: 2023-12-08 18:21:37
updated: 2023-12-08 18:21:37
---
<!-- toc -->

# <span id="inline-blue">环境</span>
SpringBoot: 2.2.6.RELEASE
SpringCloud: 2021.0.5
nacos: nacos-2.1.1
mybatis-plus: 3.3.1
Java： 1.8
# <span id="inline-blue">背景</span>
微服务生产环境配置文件统一由nacos下发，部署服务模块发现jar内的配置文件没有被排除，导致nacos配置没有生效，pom.xml文件里面文件排除定义如下：
```properties
		<finalName>ffcs-admin-biz</finalName>
		<resources>
			<resource>
				<filtering>true</filtering>
				<directory>src/main/resources</directory>
				<excludes>
					<exclude>application-*.properties</exclude>
					<exclude>**/logback-spring.xml</exclude>
				</excludes>
			</resource>
		</resources>
```
# <span id="inline-blue">实现</span>
通过增加maven-jar-plugin插件，实现打包生成的jar里面排除掉对应的配置文件，新增插件配置如下：
```xml
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-jar-plugin</artifactId>
       <configuration>
          <excludes>
              <exclude>**/application-*.properties</exclude>
              <exclude>**/logback-spring.xml</exclude>
          </excludes>
       </configuration>
</plugin>
```
