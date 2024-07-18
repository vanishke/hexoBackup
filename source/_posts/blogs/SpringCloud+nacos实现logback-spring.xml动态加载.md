---
title: SpringCloud+Nacos实现logback-spring.xml动态加载
categories:
	- SpringCloud
tags: 
	- SpringCloud
	- Java
	- Nacos
	
date: 2024-06-21 17:25:20
updated: 2024-06-21 17:25:20
---
<!-- toc -->
# <span id="inline-blue">背景</span>
SpringCloud微服务模块日志框架采用logback-spring.xml控制，模块配置文件由nacos配置中心下发，集成完成后发现修改logback-spring.xml文件日志级别无法生效，必须手动重启服务
# <span id="inline-blue">实现</span>
模块启动配置文件bootstrap.properties通过nacos指定扩展文件加载logback-spring.xml，application-{spring.profiles.active}.properties指定日志配置参数logging.config
bootstarp.properties内容如下：
```properties
spring.cloud.nacos.discovery.username=${nacos-username}
spring.cloud.nacos.discovery.password=${nacos-password}
spring.cloud.nacos.config.file-extension=properties
spring.cloud.nacos.config.refresh-enabled=true
spring.cloud.nacos.config.prefix=ffcs-gateway
spring.cloud.nacos.config.group=DEFAULT_GROUP
spring.cloud.nacos.discovery.server-addr=${nacos-addr}
spring.cloud.nacos.config.server-addr=${nacos-addr}
spring.cloud.nacos.config.namespace=${nacos-namespace}
spring.cloud.nacos.discovery.namespace=${nacos-namespace}
#扩展文件logback的id
spring.cloud.nacos.config.extension-configs[1].data-id=logback-spring.xml
#扩展文件所在的组，默认为DEFAULT_GROUP
spring.cloud.nacos.config.extension-configs[1].group=DEFAULT_GROUP
#是否实时刷新
spring.cloud.nacos.config.extension-configs[1].refresh=true
```

application-{spring.profiles.active}.properties内容相关配置如下：
```properties
logging.config=http://${spring.cloud.nacos.config.server-addr}/nacos/v1/cs/configs?group=DEFAULT_GROUP&tenant=${spring.cloud.nacos.config.namespace}&username=${spring.cloud.nacos.discovery.username}&password=${spring.cloud.nacos.discovery.password}&dataId=logback-spring.xml 
```