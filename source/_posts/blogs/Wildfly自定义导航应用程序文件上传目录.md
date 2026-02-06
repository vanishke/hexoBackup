---
title: WildFly自定义导航应用程序文件上传目录
categories: 
	- WildFly
tags: 
	- WildFly
	- Java
	
date: 2025-12-05 16:47:40
updated: 2025-12-05 16:47:40
---
<!-- toc -->

# <span id="inline-blue">背景</span>

应用程序JDK版本升级为1.8之后，之前部署应用程序使用jboss-4.2.3在server.xml配置代理文件上传路径方式发生变化，现在演示在Wildfly-26.1.0-Final环境下自定义导航路径，使得应用程序上传的文件目录能够通过Wildfly的http://IP:port格式直接访问。

# <span id="inline-blue">环境</span>

JDK： 1.8
Spring: 4.3.20.RELEASE
WildFly: 26.1.0-Final

# <span id="inline-blue">实现</span>
修改Wildfly配置文件standalone.xml,文件所在位置：/home/tianjin_istore/wildfly26-istore/standalone/configuration undertow子系统配置节点修改如下：
```xml
        <subsystem xmlns="urn:jboss:domain:undertow:12.0" default-server="default-server" default-virtual-host="default-host" default-servlet-container="default" default-security-domain="other" statistics-enabled="${wildfly.undertow.statistics-enabled:${wildfly.statistics-enabled:false}}">
            <buffer-cache name="default"/>
            <server name="default-server">
                <http-listener name="default" socket-binding="http" redirect-socket="https" max-post-size="104857600" enable-http2="true"/>
                <https-listener name="https" socket-binding="https" ssl-context="applicationSSC" enable-http2="true"/>
                <host name="default-host" alias="localhost">
                    <location name="/" handler="welcome-content"/>
					<location name="/upload" handler="upload-content"/>
                    <http-invoker http-authentication-factory="application-http-authentication"/>
                </host>
            </server>
            <servlet-container name="default">
                <jsp-config/>
                <websockets/>
            </servlet-container>
            <handlers>
                <file name="welcome-content" path="${jboss.home.dir}/welcome-content"/>
				<file name="upload-content" path="${jboss.home.dir}/standalone/deployments/upload.war" directory-listing="true"/>
            </handlers>
            <application-security-domains>
                <application-security-domain name="other" security-domain="ApplicationDomain"/>
            </application-security-domains>
     
   </subsystem>
```

增加的内容如下：
```shell
<location name="/upload" handler="upload-content"/>
<file name="upload-content" path="${jboss.home.dir}/standalone/deployments/upload.war" directory-listing="true"/>
```


# <span id="inline-blue">验证</span>

![WildFly自定义导航](/images/WildFly/20251205/WildFly_20251205_001.png)