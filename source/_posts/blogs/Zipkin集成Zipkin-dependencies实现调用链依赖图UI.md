---
title: Zipkin集成Zipkin-dependencies实现调用链依赖图UI
tags:
	- Java
	- SpringCloud
	- Sleuth
	- Zipkin
	- Zipkin-dependencies
categories: 
	- SpringCloud
	
date: 2024-06-14 11:10:20
updated: 2024-06-14 11:10:20
---
## <span id="inline-blue">环境</span>
Java: 1.8
SpringBoot: 2.2.6.Release
SpringCloud: 2021.0.5
Sleuth: 2.2.8.RELEASE
Zipkin：2.2.8.RELEASE
### <span id="inline-blue">背景</span>
SpringCloud集成Zipkin-server，持久化存储采用Elasticsearch之后，发现模块调用链依赖图没有数据展示，原因是需要单独部署zipkin-dependencies工具
![Zipkin-dependencies调用依赖](/images/Zipkin-dependencies/Zipkin-dependencies_20240614_001.png)
### <span id="inline-blue">Zipkin-dependencies部署</span>
github地址：https://github.com/openzipkin/zipkin-dependencies
Zipkin-dependencies-3.0.0版本启动需要JDK11支持.

start_elasticsearch.sh脚本内容如下：
```shell
#!/bin/bash
pid=$(ps -ef | grep zipkin-dependencies-3.0.0.jar | grep -v grep | awk '{print $2}')
kill -9 $pid
STORAGE_TYPE=elasticsearch ES_HOSTS=http://10.9.216.12:9200 nohup /usr/local/java/jdk-11.0.18/bin/java  -jar zipkin-dependencies-3.0.0.jar >> ./info.log 2>&1 &

```

### <span id="inline-blue">依赖分析验证</span>
![Zipkin-dependencies依赖分析](/images/Zipkin-dependencies/Zipkin-dependencies_20240614_002.png)

