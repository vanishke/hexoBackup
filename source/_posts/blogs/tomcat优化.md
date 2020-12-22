---
title: Tomcat 启动配置优化
categories: Tomcat
date: 2020-11-17 8:23:20
tags: Tomcat
---

## 内存优化

```txt
文件名称：catalina.sh 
文件路径：/usr/local/guangdong/ERMproxy/apache-tomcat-6.0.13/bin
JAVA_OPTS="-Djava.awt.headless=true -Xms1024m -Xmx2048m -XX:PermSize=256M -XX:MaxNewSize=256m -XX:MaxPermSize=256m -verbose:gc -XX:+PrintGCDetails -XX:+PrintGCTimeStamps -XX:+HeapDumpOnOutOfMemoryError"
```



## 连接数优化

```txt
文件名称：server.xml  
文件路径：/usr/local/guangdong/ERMproxy/apache-tomcat-6.0.13/conf
<Connector connectionTimeout="20000" port="8080" protocol="HTTP/1.1" maxThreads="2000" minSpareThreads="100" maxSpareThreads="1000" minProcessors="100" maxProcessors="1000" compression="on" compressionMinSize="2048" compressableMimeType="text/html,text/xml,text/javascript,text/css,text/plain"  redirectPort="8443"/>


```

## 启动参数优化

```txt
文件名称：catalina.properties 
文件路径：/usr/local/guangdong/ERMproxy/apache-tomcat-6.0.13/conf

1.找到代码tomcat.util.scan.StandardJarScanFilter.jarsToScan=\
2.这行代码下面的jar包的都是需要扫描的，这也是导致tomcat启动过慢的元凶，所以删除下面的jar包即可
3.将tomcat.util.scan.StandardJarScanFilter.jarsToScan=\修改为tomcat.util.scan.StandardJarScanFilter.jarsToSkip=*.jar
4.修改完之后保存回到eclipse删除以前的tomcat配置，并重新配置

```



