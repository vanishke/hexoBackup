---
title: gc日志回收设置
categories:
	- Jboss

date: 2022-08-26 16:10:20
tags: 
	- Linux
	- Jboss
---
<!-- toc -->

# <span id="inline-blue">gc参数设置</span>
文件名称：run.conf 
文件路径：/usr/local/sdp_trunk/usm/jboss5/bin
 ## 配置信息
 ```shell
 #
d=`date  '+%Y%m%d'`
if [ "x$JAVA_OPTS" = "x" ]; then
   JAVA_OPTS="-Xms4G -Xmx4G -Xmn1400M -XX:PermSize=512M -XX:MaxPermSize=512M
        -XX:+PrintGCDetails
        -XX:+PrintGCDateStamps
        -XX:+PrintTenuringDistribution
        -XX:+PrintHeapAtGC
        -XX:+PrintReferenceGC
        -XX:+PrintGCApplicationStoppedTime
        -XX:+PrintSafepointStatistics
        -XX:PrintSafepointStatisticsCount=1
        -Xloggc:/usr/local/sdp_trunk/usm/jboss5/server/default/log/gc-$d.log
    -XX:SurvivorRatio=20 -XX:MaxTenuringThreshold=5 -XX:+UseParNewGC -XX:+UseConcMarkSweepGC -XX:+UseCMSCompactAtFullCollection -XX:CMSFul
lGCsBeforeCompaction=0 -XX:+CMSClassUnloadingEnabled -XX:+CMSPermGenSweepingEnabled -XX:+CMSParallelRemarkEnabled -XX:CMSInitiatingOccupancyFraction=85 -XX:SoftRefLRUPolicyMSPerMB=0 -XX:-ReduceInitialCardMarks -Dorg.jboss.resolver.warning=true -Dsun.rmi.dgc.client.gcInterval=3600000"
fi
```
# <span id="inline-blue">gc日志输出</span>
```shell
Total time for which application threads were stopped: 0.0002160 seconds
Total time for which application threads were stopped: 0.0002200 seconds
Total time for which application threads were stopped: 0.0002860 seconds
Total time for which application threads were stopped: 0.0004960 seconds
Total time for which application threads were stopped: 0.0002400 seconds
Total time for which application threads were stopped: 0.0006370 seconds
Total time for which application threads were stopped: 0.0002700 seconds
Total time for which application threads were stopped: 0.0002550 seconds
Total time for which application threads were stopped: 0.0001760 seconds
Total time for which application threads were stopped: 0.0001270 seconds
Total time for which application threads were stopped: 0.0000820 seconds
Total time for which application threads were stopped: 0.0001410 seconds
Total time for which application threads were stopped: 0.0001400 seconds
Total time for which application threads were stopped: 0.0001320 seconds
Total time for which application threads were stopped: 0.0000810 seconds
Total time for which application threads were stopped: 0.0001170 seconds
Total time for which application threads were stopped: 0.0000880 seconds
Total time for which application threads were stopped: 0.0002370 seconds
Total time for which application threads were stopped: 0.0000780 seconds
Total time for which application threads were stopped: 0.0007060 seconds
Total time for which application threads were stopped: 0.0000590 seconds
Total time for which application threads were stopped: 0.0000560 seconds
Total time for which application threads were stopped: 0.0000480 seconds
Total time for which application threads were stopped: 0.0001760 seconds
{Heap before GC invocations=0 (full 0):
 par new generation   total 1368448K, used 443248K [0x00000006e0000000, 0x0000000737800000, 0x0000000737800000)
  eden space 1303296K,  34% used [0x00000006e0000000, 0x00000006fb0dc230, 0x000000072f8c0000)
  from space 65152K,   0% used [0x000000072f8c0000, 0x000000072f8c0000, 0x0000000733860000)
  to   space 65152K,   0% used [0x0000000733860000, 0x0000000733860000, 0x0000000737800000)
 concurrent mark-sweep generation total 2760704K, used 0K [0x0000000737800000, 0x00000007e0000000, 0x00000007e0000000)
 ```


