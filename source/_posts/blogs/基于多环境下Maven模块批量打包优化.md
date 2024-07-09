---
title: 基于多环境下Maven模块批量打包优化
categories:
	- Maven

date: 2023-12-07 16:21:20
tags: 
	- Maven
---
<!-- toc -->

# <span id="inline-blue">环境</span>
SpringBoot: 2.2.6.RELEASE
SpringCloud: 2021.0.5
nacos: nacos-2.1.1
mybatis-plus: 3.3.1
Java： 1.8
# <span id="inline-blue">背景</span>
 微服务模块使用nacos作为注册中心和配置中心，在多环境下批量打包需要逐个更改对应模块的bootstrap.properties文件很耗时，实现通过根模块pom统一设置环境变量，只更改一次便可以实现所有模块nacos命令空间和生产环境变更。

# <span id="inline-blue">实现</span>
根模块定义nacos所需要的命令空间和生产环境相关变量
```xml
 <nacos-addr>10.26.0.19:8848</nacos-addr>
 <nacos-namespace>6aa33a42-b841-480f-850d-d805a75ed17b</nacos-namespace>
 <profile-env>prodtest</profile-env>
```
Maven打包pom.xml添加资源占位符替换支持
```xml
<build>
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
</build>
```
<filtering>true</filtering>控制在打包阶段pom.xml文件定义的propertiess变量能够通过占位符替换

子模块application.properties配置如下：
```properties
spring.profiles.active=${profile-env}
```

子模块bootstrap.properties配置如下：
```properties
spring.cloud.nacos.discovery.username=nacos
spring.cloud.nacos.discovery.password=nacos
spring.cloud.nacos.discovery.server-addr=${nacos-addr}
spring.cloud.nacos.config.server-addr=${nacos-addr}
spring.cloud.nacos.config.namespace=${nacos-namespace}
spring.cloud.nacos.discovery.namespace=${nacos-namespace}
spring.cloud.nacos.config.file-extension=properties
spring.cloud.nacos.config.refresh-enabled=true
spring.cloud.nacos.config.prefix=ffcs-admin
spring.cloud.nacos.config.group=DEFAULT_GROUP
#扩展文件的id
spring.cloud.nacos.config.extension-configs[0].data-id=logback-spring.xml
#扩展文件所在的组，默认为DEFAULT_GROUP
spring.cloud.nacos.config.extension-configs[0].group=DEFAULT_GROUP
#是否实时刷新
spring.cloud.nacos.config.extension-configs[0].refresh=true
spring.main.allow-bean-definition-overriding=true
spring.application.name=ffcs-admin
```
