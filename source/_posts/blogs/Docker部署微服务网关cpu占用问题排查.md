---
title: Docker部署微服务网关cpu占用问题排查
categories: 
	- Docker
tags: 
	- Docker
	- Java
	- SpringCloud
	- JDK
	- epoll
	
date: 2025-12-09 15:02:32
updated: 2025-12-09 15:02:32
---
<!-- toc -->

# <span id="inline-blue">背景</span>

springCloud微服务网关通过docker部署之后，阿里云服务器经常出现cpu占用156%，但是查看业务请求日志，对应的请求日志很少，并发请求并不高，所以估计是网关服务自身的服务出现了问题。

# <span id="inline-blue">问题分析</span>

## <span id="inline-blue">zipkin上报排查</span>

微服务因为集成zipkin+sleuth实现链路追踪，第一时间感觉可能是zipkin的问题导致cpu占用，所以直接在nacos上将zipkin的相关上报配置给关掉了，zipkin的配置如下：

```yml
spring:
  sleuth:
  #是否启用sleuth
    enabled: false
    sampler:
      probability: 1.0 
    web:
      client:
        enabled: true
  zipkin:
    base-url: http://10.9.216.12:9411/
    discoveryClientEnabled: false
    sender:
      type: web
      web:
	  #是否启用zipkin
        enabled: false
```

修改完上述配置之后在portainer可视化容器管理后台重启了相关的微服务应用，cpu占用短暂下降之后立马就上升到了156%，这下意识到问题不是由zipkin引起的，继续排查。


## <span id="inline-blue">tcpdump抓包</span>

因为应用部署在docker容器，并且容器基于openjdk:8-jre基础镜像构建，导致容器内部无法使用jdk排查应用堆栈命令jstack和top命令(依赖版本有冲突)，所以采用tcpdump抓包的方式先看看微服务网关和其他模块的交互请求。
使用的tcpdump命令如下：

```shell
tcpdump -i eth0  port 9001 -s 0 -vv -w /tmp/1.cap
```

上述tcpdump命令实现抓取经过9001端口和eth0网口的网络包，将抓取到的网络包拷贝到宿主机，使用docker cp命令如下：

```shell
docker cp containerId:/tmp/q.cap  /usr/local/1.cap
```
拷贝命令中的containerId为容器ID，自行替换为实际部署微服务的容器ID，通过XFTP将网络包拷贝到本地，使用wireshark工具打开，http格式报文过滤后内容截图如下：
![微服务容器抓包](/images/docker/20251209/docker_20251209_001.png)

分析网关的请求交互没有出现特殊的请求内容，不应该出现cpu占用异常的情况。

## <span id="inline-blue">jstack命令抓取应用堆栈</span>

微服务因为基于openjdk:8-jre基础镜像构建，导致容器内部无法使用jdk排查应用堆栈命令jstack和top命令,下载第三方轻量工具jattach实现对java应用程序堆栈的抓取，配置jattach命令如下：

```shell
#containerId替换为实际容器ID
docker exec -it containerId /bin/bash

wget https://github.com/apangin/jattach/releases/download/v1.5/jattach -O /usr/bin/jattach

chmod +x /usr/bin/jattach

```

查询容器内java进程pid

```shell
#containerId替换为实际容器ID
docker exec -it containerId /bin/bash

# 查找占用9001端口的进程PID
netstat -tlnp | grep 9001

#输出
tcp6       0      0 :::9001                 :::*                    LISTEN      8/java

```

打印java进程堆栈

```shell
#containerId替换为实际容器ID
docker exec -it containerId /bin/bash

jattach 8 threaddump  > /tmp/java_stack_force.log
```

top命令不可用的情况下，需要安装procps依赖


```shell
#containerId替换为实际容器ID
docker exec -it containerId /bin/bash

apt update && apt install -y procps
```


获取到java应用程序堆栈之后需要定位到cpu占用高的对应线程，如果容器内top命令可用的情况下，显示占用高的线程命令如下：

```shell
#containerId替换为实际容器ID
docker exec -it containerId /bin/bash

#8为容器内运行的java进程ID
top -H -p 8
```



上述命令得到线程占用高的线程id之后需要转换为16进制，以便通过grep命令搜索堆栈中对应线程的详细内容。

线程ID转换为16进制的命令如下：

```shell
printf "%x\n"  线程ID
```

查找java堆栈中对应线程ID的内容：

```shell
#假设16进制的线程ID为56
grep -A 10 -B 10 "0x56" /tmp/java_stack_force.log
```

对应cpu占用高的线程详情如下：

```shell
"XNIO-1 I/O-2" #74 prio=5 os_prio=0 tid=0x00007fbee66d1000 nid=0x56 runnable [0x00007fbe8f0ef000]
   java.lang.Thread.State: RUNNABLE
        at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
        at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
        at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
        at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
        - locked <0x0000000081104310> (a sun.nio.ch.Util$3)
        - locked <0x0000000081104300> (a java.util.Collections$UnmodifiableSet)
        - locked <0x0000000081104320> (a sun.nio.ch.EPollSelectorImpl)
        at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
        at org.xnio.nio.WorkerThread.run(WorkerThread.java:551)

"XNIO-1 I/O-1" #73 prio=5 os_prio=0 tid=0x00007fbee66d0000 nid=0x55 runnable [0x00007fbe8f1f0000]
   java.lang.Thread.State: RUNNABLE
        at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
        at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
        at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
        at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
        - locked <0x0000000081104688> (a sun.nio.ch.Util$3)
        - locked <0x0000000081104678> (a java.util.Collections$UnmodifiableSet)
        - locked <0x0000000081104630> (a sun.nio.ch.EPollSelectorImpl)
        at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
        at org.xnio.nio.WorkerThread.run(WorkerThread.java:551) 
```

# <span id="inline-blue">问题原因</span>

JDK NIO的BUG epoll，导致Selector空轮询，最终导致CPU 占用居高不下。官方声称在JDK1.6版本的update18修复了该问题，但是直到JDK1.7版本该问题仍旧存在，只不过该BUG发生概率降低了一些而已，它并没有被根本解决。该BUG以及与该BUG相关的问题单可以参见以下链接内容。

https://bugs.java.com/bugdatabase/view_bug.do?bug_id=2147719

https://bugs.java.com/bugdatabase/view_bug.do?bug_id=6403933


# <span id="inline-blue">解决办法</span>

微服务网关集成的应用容器为undertow,该容器没有对JDK epoll模型进行优化导致上述问题，Tomcat已经对epoll bug进行封装和改进，需要将项目中的undertow依赖替换为tomcat.

去除undertow依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-undertow</artifactId>
</dependency>
```

添加tomcat依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-tomcat</artifactId>
</dependency>
```

重新执行clean install命令打包部署后，微服务网关的cpu占用恢复正常。

# <span id="inline-blue">验证</span>
![微服务网关cpu占用问题分析](/images/docker/20251209/docker_20251209_002.png)