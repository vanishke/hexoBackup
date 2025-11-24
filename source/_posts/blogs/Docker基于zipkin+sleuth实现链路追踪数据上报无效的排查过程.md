---
title: Docker基于zipkin+sleuth实现链路追踪数据上报无效的排查过程
categories:
	- Docker
tags: 
	- Docker
	- Zipkin

date: 2025-11-24 16:21:20
updated: 2025-11-24 16:21:20
---
<!-- toc -->

# <span id="inline-blue">问题描述</span>

SpringCloud微服务基于zipkin+sleuth实现链路追踪，zipkin的上报数据指定存储在Elasticsearch,最近想看下微服务之间的调用耗时，在nacos更改了zipkin相关配置，发现没有效果，查看微服务的日志打印和zipkin管理后台，日志没有zipkin上报数据格式的日志信息，zipkin后台查询不到调用记录，最后查看Elasticsearch的索引信息，没有生成zipkin-span和zipkin-dependency索引信息


# <span id="inline-blue">问题分析</span>

## <span id="inline-blue">检查配置和依赖</span>

出现上述问题第一时间检查了nacos上zipkin对应的配置内容，确认上报开关开启，项目模块中maven依赖是否包含zipkin+sleuth，两者都没有问题

zipkin配置如下：

```yml
spring:
  sleuth:
    sampler:
      probability: 1.0
    web:
      client:
        enabled: true
  zipkin:
    base-url: http://photoframe-zipkin:9411/
    discoveryClientEnabled: false
    enabled: true
    sender:
      type: web
```


maven依赖如下：

```xml
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-zipkin</artifactId>
        </dependency>
```

## <span id="inline-blue">分析zipkin日志</span>

通过docker logs -f 容器id 命令查看zipkin容器的日志输出，发现除了启动日志之后没有其他有用的信息，日志信息如下：

```shell
[root@iZ0xiitmphpxjiek7z1aybZ zipkin]# docker logs -f 853a
[INFO  wait] --------------------------------------------------------
[INFO  wait]  docker-compose-wait 2.12.1
[INFO  wait] ---------------------------
[DEBUG wait] Starting with configuration:
[DEBUG wait]  - Hosts to be waiting for: [photoframe-elasticsearch:9200]
[DEBUG wait]  - Paths to be waiting for: []
[DEBUG wait]  - Timeout before failure: 180 seconds 
[DEBUG wait]  - TCP connection timeout before retry: 5 seconds 
[DEBUG wait]  - Sleeping time before checking for hosts/paths availability: 0 seconds
[DEBUG wait]  - Sleeping time once all hosts/paths are available: 0 seconds
[DEBUG wait]  - Sleeping time between retries: 1 seconds
[DEBUG wait] --------------------------------------------------------
[INFO  wait] Checking availability of host [photoframe-elasticsearch:9200]
[INFO  wait] Host [photoframe-elasticsearch:9200] is now available!
[INFO  wait] --------------------------------------------------------
[INFO  wait] docker-compose-wait - Everything's fine, the application can now start!
[INFO  wait] --------------------------------------------------------

                  oo
                 oooo
                oooooo
               oooooooo
              oooooooooo
             oooooooooooo
           ooooooo  ooooooo
          oooooo     ooooooo
         oooooo       ooooooo
        oooooo   o  o   oooooo
       oooooo   oo  oo   oooooo
     ooooooo  oooo  oooo  ooooooo
    oooooo   ooooo  ooooo  ooooooo
   oooooo   oooooo  oooooo  ooooooo
  oooooooo      oo  oo      oooooooo
  ooooooooooooo oo  oo ooooooooooooo
      oooooooooooo  oooooooooooo
          oooooooo  oooooooo
              oooo  oooo

     ________ ____  _  _____ _   _
    |__  /_ _|  _ \| |/ /_ _| \ | |
      / / | || |_) | ' / | ||  \| |
     / /_ | ||  __/| . \ | || |\  |
    |____|___|_|   |_|\_\___|_| \_|

:: version 2.26.0 :: commit 147feaa ::

2025-11-24 11:43:13.635  INFO [/] 8 --- [oss-http-*:9411] c.l.a.s.Server                           : Serving HTTP at /0:0:0:0:0:0:0:0%0:9411 - http://127.0.0.1:9411/
```

## <span id="inline-blue">tcpdump抓包</span>

在尝试过上述方法都没有效果的情况下选择通过tcpdump命令抓包，抓取微服务向zipkin上报链路调用的交互过程，同时抓取zipkin数据写入Elasticsearch的请求和相应。

微服务的抓包命令如下：

```shell
tcpdump -i eth0 port 9411 -s 0 -vv -w ./zipkin.cap

```

zipkin请求Elasticsearch写入数据的请求抓包命令如下：

```shell
tcpdump -i eth0 port 9200 -s 0 -vv -w ./elasticsearch.cap
```

| 参数         | 功能描述                                                                 |
|--------------|--------------------------------------------------------------------------|
| -i    | 指定监听的网卡为 `eth0`（需确保网卡名称正确）；若需监听所有网卡，可替换为 `-i any` |
| port   | 过滤条件：仅抓取目标端口为 9200（Elasticsearch 默认通信端口）的网络数据包       |
| -s        | 设置数据包抓取长度为完整长度（`0` 表示不截断，抓取整个数据包内容）             |
| -vv        | 开启二级详细输出模式，会显示更多数据包细节（如TCP标志位、校验和、TTL等）       |
| -w  | 将抓取的数据包保存到指定文件（当前目录下的 `elasticsearch.cap`），而非终端打印 |


可以通过docker cp拷贝抓包输出的文件到宿主机，在使用XFtp工具传输到本地，使用Wireshark工具打开查看对应的请求信息，将请求报文对应转换为可查看的内容的方式为：
选中请求报文右键->追踪流->http,实际请求报文如下所示：
![微服务上报zipkin_01](/images/Zipkin/Zipkin_20251124_001.png)
![微服务上报zipkin_02](/images/Zipkin/Zipkin_20251124_002.png)

上述报文内容显示微服务上报模块调用数据到zipkin已经被正常接收，说明微服务的上报没有问题，接下来检查Zipkin向Elasticsearch的请求过程。

![zipkin写入Elasticsearch_01](/images/Zipkin/Zipkin_20251124_003.png)

上述zipkin向Elasticsearch写入数据报错，报错信息如下：

```json
{"took":0,"errors":true,"items":[{"index":{"_index":"zipkin-span-2025-11-24","_id":"e3c3091391c60d30-1e2ad834f6564a9bdcfa828a21dad453","status":400,"error":{"type":"validation_exception","reason":"Validation Failed: 1: this action would add [10] shards, but this cluster currently has [995]/[1000] maximum normal shards open;"}}},{"index":{"_index":"zipkin-span-2025-11-24","_id":"e3c3091391c60d30-8f132b315b9e2421cfe88d204c7a654f","status":400,"error":{"type":"validation_exception","reason":"Validation Failed: 1: this action would add [10] shards, but this cluster currently has [995]/[1000] maximum normal shards open;"}}},{"index":{"_index":"zipkin-span-2025-11-24","_id":"e3c3091391c60d30-225dd10183b89731fc0e428be9baec26","status":400,"error":{"type":"validation_exception","reason":"Validation Failed: 1: this action would add [10] shards, but this cluster currently has [995]/[1000] maximum normal shards open;"}}}]}
```

上述错误表明Elasticsearch节点默认1000分片，当前已经使用995分片，当前写入操作需要创建10个分片，现有分片不满足需求，数据写入失败了。


## <span id="inline-blue">解决办法</span>

更改Elasticsearch数据节点分片大小。

```shell
PUT http://47.89.174.246:9200/_cluster/settings

{
  "persistent":
    {
      "cluster.max_shards_per_node": 5000
    }
}
```

## <span id="inline-blue">验证</span>
![Zipkin数据上报](/images/Zipkin/Zipkin_20251124_004.png)


参考：https://blog.csdn.net/u010383467/article/details/134702660