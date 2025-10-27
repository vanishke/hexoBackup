---
title: Maven项目本地依赖打包无效的解决办法
categories:
	- Maven
tags: 
	- Maven
	
date: 2025-10-17 15:11:23
updated: 2025-10-17 15:11:23
---
<!-- toc -->
# <span id="inline-blue">环境</span>
java: 1.8
maven: 3.8.9


# <span id="inline-blue">现象</span>
maven 执行clean install之后生成的war没有把本地依赖的jar包拷贝到WEB-INF/lib目录下，启动应用程序提示相应的class缺失。

# <span id="inline-blue">解决办法</span>
模块对应pom.xml文件添加maven-dependency-plugin插件，在prepare-package阶段拷贝jar包，配置如下：
```xml
<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-dependency-plugin</artifactId>
				<version>3.3.0</version>
				<executions>
					<execution>
						<id>copy-system-dependencies</id>
						<phase>prepare-package</phase>
						<goals>
							<goal>copy-dependencies</goal>
						</goals>
						<configuration>
							<includeScope>system</includeScope>
							<outputDirectory>${project.build.directory}/${project.build.finalName}/WEB-INF/lib</outputDirectory>
						</configuration>
					</execution>
				</executions>
			</plugin>
```

