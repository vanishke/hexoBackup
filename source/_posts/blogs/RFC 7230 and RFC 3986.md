---
title: RFC 7230 and RFC 3986
categories:
	- Tomcat
tags: 
	- Tomcat
	
date: 2022-12-30 11:32:20
updated: 2022-12-30 11:32:20
---
<!-- toc -->

# <span id="inline-blue">现象</span>
tomcat由版本8.0.38升级为8.5.41，请求接口报错，错误信息如下：
http://10.9.212.55:8080/SPSmartCMS/json/content_list.jspx?channelIds[]=156&first=0&count=7
```log
HTTP Status 400 – Bad Request
Type Exception Report

Message Invalid character found in the request target. The valid characters are defined in RFC 7230 and RFC 3986

Description The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).

Exception

java.lang.IllegalArgumentException: Invalid character found in the request target. The valid characters are defined in RFC 7230 and RFC 3986
	org.apache.coyote.http11.Http11InputBuffer.parseRequestLine(Http11InputBuffer.java:483)
	org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:684)
	org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:66)
	org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:808)
	org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1498)
	org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:49)
	java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)
	java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)
	org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	java.lang.Thread.run(Thread.java:745)
```
# <span id="inline-blue">原因</span>
参考https://www.cnblogs.com/DDgougou/p/11668073.html
大致原因是因为tomcat版本版本升级之后对url请求特殊字符有严格的编码要求,[]字符不符合编码规范。
# <span id="inline-blue">解决办法</span>
D:\Tomcat\smartCMS_GZ\apache-tomcat-8.5.41\conf\server.xml，修改connector节点，增加配置内容如下：
relaxedQueryChars="[,]"
```xml
 <Connector connectionTimeout="20000" port="8080" protocol="HTTP/1.1" redirectPort="8443" relaxedQueryChars="[,]"/>
```
重启Tomcat服务，接口请求正常。



