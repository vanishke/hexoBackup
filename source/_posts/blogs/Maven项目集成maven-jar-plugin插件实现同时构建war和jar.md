---
title: Maven项目集成maven-jar-plugin插件实现同时构建war和jar
categories:
	- Maven
tags: 
	- Maven
	
date: 2025-09-26 17:31:45
updated: 2025-09-26 17:31:45
---
<!-- toc -->
# <span id="inline-blue">环境</span>
Spring: 4.3.20.RELEASE
Java: 1.8

# <span id="inline-blue">背景</span>
maven项目指定打包格式为	<packaging>war</packaging>,但是其他模块同时引用当前项目作为jar包依赖，现在需要实现在执行clean install命令自动构建war和jar，使得应用war包通过jetty部署，jar包可以直接给其他模块依赖使用。
# <span id="inline-blue">实现</span>
当前模块pom.xml文件增加maven-jar-plugin插件配置，使用分类器实现打包同时构建jar输出。
```xml
<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-jar-plugin</artifactId>
				<version>3.2.0</version>
				<executions>
					<execution>
						<id>create-classes-jar</id>
						<phase>package</phase>
						<goals>
							<goal>jar</goal>
						</goals>
						<configuration>
							<!-- 指定分类器，用于区分此jar包 -->
							<classifier>classes</classifier>
							<!-- 打包class文件和resources目录下的配置文件 -->
							<includes>
								<include>**/*.class</include>
								<include>ApplicationResources_system_en_US.properties</include>
								<include>ApplicationResources_system_zh_CN.properties</include>
							</includes>
						</configuration>
					</execution>
				</executions>
</plugin>
```

其他模块引用当前依赖方式：
```xml
<dependency>
			<groupId>com.example</groupId>
			<artifactId>test</artifactId>
			<version>V100R001B010</version>
			<classifier>classes</classifier>
			<type>jar</type>
		</dependency>
```