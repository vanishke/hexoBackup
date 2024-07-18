---
title: SpringCloud微服务集成Sleuth+Zipkin实现链路追踪
tags:
	- Java
	- SpringCloud
	- Sleuth
	- Zipkin
categories: 
	- SpringCloud
	
date: 2024-06-14 9:45:20
updated: 2024-06-14 9:45:20
---
## <span id="inline-blue">环境</span>
Java: 1.8
SpringBoot: 2.2.6.Release
SpringCloud: 2021.0.5
Sleuth: 2.2.8.RELEASE
Zipkin：2.2.8.RELEASE
### <span id="inline-blue">背景</span>
SpringCloud集群部署之后，线上问题的排查和分析变得异常繁琐，通过日志定位问题原因总是花费不少时间，于是想要通过集成链路追踪的插件实现调用链路的实时分析，集成Sleuth+Zipkin.
Sleuth:
sleuth 是一个 Go 库，它提供无主对等自动发现和位于同一网络上的 HTTP 服务之间的 RPC。它以最低配置运行，并提供一种机制，既可以作为不提供服务的客户端加入本地网络，也可以作为使用 HTTP 的任何服务加入本地网络。它的主要用例是同一网络上相互调用的微服务。
Sleuth 提供了以下功能：
链路追踪：通过 Sleuth 可以很清楚的看出一个请求都经过了那些服务，可以很方便的理清服务间的调用关系等。
性能分析：通过 Sleuth 可以很方便的看出每个采样请求的耗时，分析哪些服务调用比较耗时，当服务调用的耗时随着请求量的增大而增大时， 可以对服务的扩容提供一定的提醒。
数据分析：对于频繁调用一个服务，或并行调用等，可以针对业务做一些优化措施。
可视化错误：对于程序未捕获的异常，可以配合 Zipkin 查看。

Zipkin:
zipkin是一个分布式追踪系统，能够收集服务间调用的时序数据，提供调用链路的追踪，在微服务架构下，十分方便地用于服务响应延迟等问题的定位。
zipkin每一个调用链路通过一个trace id来串联起来，只要你有一个trace id，就能够直接定位到这次调用链路，并且可以根据服务名、标签、响应时间等进行查询，过滤那些耗时比较长的链路节点。

### <span id="inline-blue">实现</span>
模块增加依赖如下：
```xml
		<dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-zipkin</artifactId>
                <version>2.2.8.RELEASE</version>
            </dependency>
```
这个依赖同时包含了Sleuth+Zipkin

模块配置文件application-xxx.properties增加如下配置：
```properties
#sleuth+zipkin
#将其作为服务注册到nacos
spring.sleuth.web.client.enabled=true
#调用链采样百分比，采样比例为0.1(10%),参数值在0.1-1.0之间，1.0表示采样所有的调用链
spring.sleuth.sampler.probability=1.0
spring.zipkin.enabled=true
#zipkin的服务端控制台管理地址
spring.zipkin.base-url=http://10.9.216.12:9411/
#关闭模块sleuth自动发现zipkin服务端机制，由spring.zipkin.base-url参数直接指定
spring.zipkin.discoveryClientEnabled=false
#消息上报采用http方式
spring.zipkin.sender.type=web
```

### <span id="inline-blue">Zipkin部署</span>
github地址：https://github.com/openzipkin/zipkin
为了后续集成Elasticsearch8.x版本,部署使用zipkin-server-2.26.0-exec.jar
Maven仓库地址：https://mvnrepository.com/artifact/io.zipkin/zipkin-server/2.26.0
Zipkin-2.26.0版本的启动需要JDK11.
Zipkin采集数据的存储方式主要支持内存、MySQL、Elasticsearch、Cassandra，下面主要介绍内存、MySQL、Elasticsearch三种方式的部署。
#### <span id="inline-blue">内存模式</span>
start.sh脚本内容如下：
```shell
#!/bin/bash
pid=$(ps -ef | grep zipkin-server-2.26.0-exec.jar | grep -v grep | awk '{print $2}')
kill -9 $pid
nohup /usr/local/java/jdk-11.0.18/bin/java  -jar zipkin-server-2.26.0-exec.jar  > ./info.log &
```

#### <span id="inline-blue">MySQL模式</span>
MySQL服务器新建数据库Zipkin，数据库版本要求5.6+
导入如下脚本内容：
```sql
CREATE TABLE IF NOT EXISTS zipkin_spans (
  `trace_id_high` BIGINT NOT NULL DEFAULT 0 COMMENT 'If non zero, this means the trace uses 128 bit traceIds instead of 64 bit',
  `trace_id` BIGINT NOT NULL,
  `id` BIGINT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `remote_service_name` VARCHAR(255),
  `parent_id` BIGINT,
  `debug` BIT(1),
  `start_ts` BIGINT COMMENT 'Span.timestamp(): epoch micros used for endTs query and to implement TTL',
  `duration` BIGINT COMMENT 'Span.duration(): micros used for minDuration and maxDuration query',
  PRIMARY KEY (`trace_id_high`, `trace_id`, `id`)
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED CHARACTER SET=utf8 COLLATE utf8_general_ci;

ALTER TABLE zipkin_spans ADD INDEX(`trace_id_high`, `trace_id`) COMMENT 'for getTracesByIds';
ALTER TABLE zipkin_spans ADD INDEX(`name`) COMMENT 'for getTraces and getSpanNames';
ALTER TABLE zipkin_spans ADD INDEX(`remote_service_name`) COMMENT 'for getTraces and getRemoteServiceNames';
ALTER TABLE zipkin_spans ADD INDEX(`start_ts`) COMMENT 'for getTraces ordering and range';

CREATE TABLE IF NOT EXISTS zipkin_annotations (
  `trace_id_high` BIGINT NOT NULL DEFAULT 0 COMMENT 'If non zero, this means the trace uses 128 bit traceIds instead of 64 bit',
  `trace_id` BIGINT NOT NULL COMMENT 'coincides with zipkin_spans.trace_id',
  `span_id` BIGINT NOT NULL COMMENT 'coincides with zipkin_spans.id',
  `a_key` VARCHAR(255) NOT NULL COMMENT 'BinaryAnnotation.key or Annotation.value if type == -1',
  `a_value` BLOB COMMENT 'BinaryAnnotation.value(), which must be smaller than 64KB',
  `a_type` INT NOT NULL COMMENT 'BinaryAnnotation.type() or -1 if Annotation',
  `a_timestamp` BIGINT COMMENT 'Used to implement TTL; Annotation.timestamp or zipkin_spans.timestamp',
  `endpoint_ipv4` INT COMMENT 'Null when Binary/Annotation.endpoint is null',
  `endpoint_ipv6` BINARY(16) COMMENT 'Null when Binary/Annotation.endpoint is null, or no IPv6 address',
  `endpoint_port` SMALLINT COMMENT 'Null when Binary/Annotation.endpoint is null',
  `endpoint_service_name` VARCHAR(255) COMMENT 'Null when Binary/Annotation.endpoint is null'
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED CHARACTER SET=utf8 COLLATE utf8_general_ci;

ALTER TABLE zipkin_annotations ADD UNIQUE KEY(`trace_id_high`, `trace_id`, `span_id`, `a_key`, `a_timestamp`) COMMENT 'Ignore insert on duplicate';
ALTER TABLE zipkin_annotations ADD INDEX(`trace_id_high`, `trace_id`, `span_id`) COMMENT 'for joining with zipkin_spans';
ALTER TABLE zipkin_annotations ADD INDEX(`trace_id_high`, `trace_id`) COMMENT 'for getTraces/ByIds';
ALTER TABLE zipkin_annotations ADD INDEX(`endpoint_service_name`) COMMENT 'for getTraces and getServiceNames';
ALTER TABLE zipkin_annotations ADD INDEX(`a_type`) COMMENT 'for getTraces and autocomplete values';
ALTER TABLE zipkin_annotations ADD INDEX(`a_key`) COMMENT 'for getTraces and autocomplete values';
ALTER TABLE zipkin_annotations ADD INDEX(`trace_id`, `span_id`, `a_key`) COMMENT 'for dependencies job';

CREATE TABLE IF NOT EXISTS zipkin_dependencies (
  `day` DATE NOT NULL,
  `parent` VARCHAR(255) NOT NULL,
  `child` VARCHAR(255) NOT NULL,
  `call_count` BIGINT,
  `error_count` BIGINT,
  PRIMARY KEY (`day`, `parent`, `child`)
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED CHARACTER SET=utf8 COLLATE utf8_general_ci;
```
start_mysql.sh脚本内容如下：
```shell
#!/bin/bash
pid=$(ps -ef | grep zipkin-server-2.26.0-exec.jar | grep -v grep | awk '{print $2}')
kill -9 $pid
nohup /usr/local/java/jdk-11.0.18/bin/java  -jar zipkin-server-2.26.0-exec.jar --STORAGE_TYPE=mysql --MYSQL_HOST=10.9.216.12 --MYSQL_TCP_PORT=3306 --MYSQL_USER=root --MYSQL_PASS=coship --MYSQL_DB=zipkin > ./info.log &
```
#### <span id="inline-blue">Elasticsearch模式</span>
start_elasticsearch.sh脚本内容如下：
```shell
#!/bin/bash
pid=$(ps -ef | grep zipkin-server-2.26.0-exec.jar | grep -v grep | awk '{print $2}')
kill -9 $pid
nohup /usr/local/java/jdk-11.0.18/bin/java  -jar zipkin-server-2.26.0-exec.jar  --STORAGE_TYPE=elasticsearch --ES_HOSTS=http://10.9.216.12:9200 > ./info.log &
```

### <span id="inline-blue">链路分析验证</span>
链路信息：
![Zipkin链路](/images/Zipkin/Zipkin_20240614_001.png)
请求耗时分析：
![Zipkin请求耗时](/images/Zipkin/Zipkin_20240614_002.png)
