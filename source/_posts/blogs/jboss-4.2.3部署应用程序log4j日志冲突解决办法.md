---
title: jboss-4.2.3部署应用程序log4j日志冲突解决办法
categories:
	- Jboss
tags: 
	- Jboss
	- Log4j

date: 2025-11-14 17:23:02
updated: 2025-11-14 17:23:02
---
<!-- toc -->
# <span id="inline-blue">现象</span>
jboss-4.2.3容器部署java应用程序，启动日志出现如下报错：
```shell
2022-12-13 11:03:22,436 ERROR [STDERR] (main) log4j:ERROR A "org.jboss.logging.appender.FileAppender" object is not assignable to a "org.apache.log4j.Appender" variable.
2022-12-13 11:03:22,436 ERROR [STDERR] (main) log4j:ERROR The class "org.apache.log4j.Appender" was loaded by 
2022-12-13 11:03:22,436 ERROR [STDERR] (main) log4j:ERROR [WebappClassLoader
  delegate: false
  repositories:
    /WEB-INF/classes/
----------> Parent Classloader:
java.net.FactoryURLClassLoader@5a347448
] whereas object of type 
2022-12-13 11:03:22,436 ERROR [STDERR] (main) log4j:ERROR "org.jboss.logging.appender.FileAppender" was loaded by [org.jboss.system.server.NoAnnotationURLClassLoader@26021b6d].
2022-12-13 11:03:22,436 ERROR [STDERR] (main) log4j:ERROR Could not instantiate appender named "FILE".
```

# <span id="inline-blue">原因</span>
jboss自身日志系统已经集成log4j,并且jboss和应用程序使用的日志收集器不一致，导致转换失败，jboss自身集成log4j的配置文件路径如下：
/usr/local//jboss-4.2.3.GA/server/default/conf/jboss-log4j.xml

关键配置：
```shell

   <!-- A time/date based rolling appender -->
   <appender name="FILE" class="org.jboss.logging.appender.DailyRollingFileAppender">
      <errorHandler class="org.jboss.logging.util.OnlyOnceErrorHandler"/>
      <param name="File" value="${jboss.server.log.dir}/server.log"/>
      <param name="Append" value="true"/>
      <param name="Threshold" value="INFO"/>
	  <param name="DatePattern" value="'.'yyyy-MM-dd"/>

      <layout class="org.apache.log4j.PatternLayout">
         <param name="ConversionPattern" value="%d %-5p [%c] (%t) %m%n"/>
      </layout>
   </appender> 
```

# <span id="inline-blue">解决办法</span>

将/usr/local/jboss-4.2.3.GA/lib下jboss-common.jar依赖拷贝到应用程序lib目录下，重启jboss，日志输出即可恢复正常，如果需要获取jboss容器自身jboss-common.jar依赖版本信息，可以通过java反编译工具luyten-0.5.3.jar本地打开。
![jboss-common版本信息查看](/images/Jboss/20251114/Jboss_20251114_001.png)

maven项目添加如下依赖坐标：
```xml
		<dependency>
		    <groupId>jboss</groupId>
		    <artifactId>jboss-common</artifactId>
		    <version>1.2.1.GA</version>
		</dependency>
```

