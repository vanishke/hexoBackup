---
title: Java进程占用系统内存超过堆分配大小原因
categories:
	- Maven
tags: 
	- Maven
	
date: 2023-09-19 09:05:20
updated: 2023-09-19 09:05:20
---
<!-- toc -->

# <span id="inline-blue">项目环境</span>
JDK: 1.8.0_321
JVM配置信息： 
```shell
java -DSTOP.PORT=8074 -Djava.net.preferIPv4Stack=true -server -Xms3G -Xmx3G -Xmn1600G -XX:MetaspaceSize=600M -XX:MaxMetaspaceSize=600M  -XX:SurvivorRatio=32 -XX:MaxTenuringThreshold=3 -XX:+UseParNewGC -XX:+UseConcMarkSweepGC -XX:+UseCMSCompactAtFullCollection -XX:CMSFullGCsBeforeCompaction=0 -XX:+CMSClassUnloadingEnabled -XX:-CMSParallelRemarkEnabled -XX:CMSInitiatingOccupancyFraction=90 -XX:SoftRefLRUPolicyMSPerMB=0   -Djava.util.logging.config.file="$IEPG_HOME/iepg/conf/log4j.xml" -Djava.io.tmpdir=work -jar start.jar &
```
# <span id="inline-blue">系统内存占用</span>
![Java内存占用](/images/Java/Java_20230919_001.png)

# <span id="inline-blue">Native Memory Tracking</span>
ava8给HotSpot VM引入了Native Memory Tracking (NMT)特性，可以用于追踪JVM的内部内存使用
## <span id="inline-blue">开启</span>
-XX:NativeMemoryTracking=[off|summary|detail]。
```shell
-XX:NativeMemoryTracking=summary
```
使用-XX:NativeMemoryTracking=summary可以用于开启NMT，其中该值默认为off，可以设置为summary或者detail来开启；开启的话，大概会增加5%-10%的性能消耗
## <span id="inline-blue">查看</span>
```shell
jcmd <pid> VM.native_memory [summary | detail | baseline | summary.diff | detail.diff | shutdown] [scale= KB | MB | GB]

# summary: 分类内存使用情况.
# detail: 详细内存使用情况，除了summary信息之外还包含了虚拟内存使用情况。
# baseline: 创建内存使用快照，方便和后面做对比
# summary.diff: 和上一次baseline的summary对比
# detail.diff: 和上一次baseline的detail对比
# shutdown: 关闭NMT
```
## <span id="inline-blue">实例</span>
```shell
jcmd 16000 VM.native_memory summary scale=MB
```
![Java内存占用分析](/images/Java/Java_20230919_002.png)

