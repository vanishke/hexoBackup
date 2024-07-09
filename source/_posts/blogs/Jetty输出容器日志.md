---
title: Jetty输出容器日志
categories:
	- Jetty

date: 2023-11-23 09:21:20
tags: 
	- Jetty
---
<!-- toc -->

# <span id="inline-blue">环境</span>
Jetty: jetty-9.4.42.v20210604
Java： 1.8.0_31
# <span id="inline-blue">背景</span>
如果您不执行任何操作来配置单独的日志记录框架，Jetty将默认使用内部org.eclipse.jetty.util.log.StdErrLog实施。这会将所有日志记录事件输出到STDERR（aka System.err ）。
Jetty发行版中包含一个名为的日志模块console-capture能够简单捕获所有STDOUT（ System.out ）和STDERR（ System.err ）输出到每天轮换的文件。
Jetty部署应用经常503，只打印对应的应用程序日志，无法进一步跟踪错误原因，通过增加配置输出Jetty容器的日志.
# <span id="inline-blue">解决办法</span>
Jetty启动增加两个默认依赖模块
console-capture
logging-jetty

激活console-capture方式：
```shell
[my-base]$ java -jar ../start.jar --add-to-start=console-capture
INFO  : console-capture initialized in ${jetty.base}/start.d/console-capture.ini
MKDIR : ${jetty.base}/logs
INFO  : Base directory was modified

[my-base]$ tree
.
├── logs
└── start.d
    └── console-capture.ini
```
激活对应的依赖之后再次启动不需要再添加对应参数，console-capture激活之后日志输出的默认配置将创建一个文件${jetty.base}/logs/yyyy_mm_dd.stderrout.log通过设置jetty.logs属性
默认情况下，未将日志设置为附加，这意味着在服务器重新启动后会清除干净日志文件。您可以通过编辑console-capture.ini并取消注释读取的行jetty.console-capture.append=true

只是启用console-capture只会将STDERR和STDOUT的值输出到日志文件。要进一步自定义日志，请使用一个名为logging-jetty可用于提供要配置的默认属性文件。与console-capture ，您激活logging-jetty在命令行上。
```shell
[my-base]$ java -jar ../start.jar --add-to-start=logging-jetty
INFO  : logging-jetty   initialized in ${jetty.base}/start.d/logging-jetty.ini
INFO  : resources       transitively enabled
MKDIR : ${jetty.base}/resources
COPY  : ${jetty.home}/modules/logging-jetty/resources/jetty-logging.properties to ${jetty.base}/resources/jetty-logging.properties
INFO  : Base directory was modified

[my-base]$ tree
.
├── logs
├── resources
│   └── jetty-logging.properties
└── start.d
    ├── console-capture.ini
    └── logging-jetty.ini
```
激活后，您可以在以下位置找到属性文件${jetty.base}/resources/jetty-logging.properties 。默认情况下，定义以下参数。要更改它们，请取消注释该行，并替换您的命名方案和配置选择。
```shell
## Force jetty logging implementation
#org.eclipse.jetty.util.log.class=org.eclipse.jetty.util.log.StdErrLog

## Set logging levels from: ALL, DEBUG, INFO, WARN, OFF
#org.eclipse.jetty.LEVEL=INFO
#com.example.LEVEL=INFO

## Hide stacks traces in logs?
#com.example.STACKS=false

## Show the source file of a log location?
#com.example.SOURCE=false
```

可以在配置中定义许多属性，这些属性会影响StdErr日志记录的行为。 console-capture 。
.LEVEL=
设置范围内所有记录器的记录级别name指定的级别，可以是（按限制顺序递增） ALL ， DEBUG ， INFO ， WARN ， OFF 。名称（或层次结构）可以是特定的完全限定的类或包名称空间。例如， org.eclipse.jetty.http.LEVEL=DEBUG是一种程序包名称空间方法，用于将Jetty HTTP程序包中的所有记录程序转换为DEBUG级别，并且org.eclipse.jetty.io.ChanelEndPoint.LEVEL=ALL打开特定类的所有日志记录事件，包括DEBUG ， INFO ， WARN （甚至是特殊的内部忽略的异常类）。如果有多个系统属性指定了日志记录级别，则应用最具体的级别。
.SOURCE=
命名为特定于Logger的日志，尝试打印Java源文件名和行号，从中记录日志事件。名称必须是完全限定的类名称（此可配置项不支持程序包名称层次结构）。默认为false。请注意，这是一个缓慢的操作，并且会影响性能。
.STACKS=
特定于Logger的名称，控制堆栈跟踪的显示。名称必须是完全限定的类名称（此可配置项不支持程序包名称层次结构）。默认为true。
org.eclipse.jetty.util.log.stderr.SOURCE=
特殊全局配置。尝试打印记录事件起源的Java源文件名和行号。默认为false。
org.eclipse.jetty.util.log.stderr.LONG=
特殊全局配置。如果为true，则将记录事件输出到STDERR使用长格式的完全合格的类名。如果为false，则使用缩写的软件包名称。默认为false。

设置为false时的示例：
```shell
2016-10-21 15:31:01.248:INFO::main: Logging initialized @332ms to org.eclipse.jetty.util.log.StdErrLog
2016-10-21 15:31:01.370:INFO:oejs.Server:main: jetty-9.4.0-SNAPSHOT
2016-10-21 15:31:01.400:INFO:oejs.AbstractConnector:main: Started ServerConnector@2c330fbc{HTTP/1.1,[http/1.1]}{0.0.0.0:8080}
2016-10-21 15:31:01.400:INFO:oejs.Server:main: Started @485ms
```

设置为true时的示例：
```shell
2016-10-21 15:31:35.020:INFO::main: Logging initialized @340ms to org.eclipse.jetty.util.log.StdErrLog
2016-10-21 15:31:35.144:INFO:org.eclipse.jetty.server.Server:main: jetty-9.4.0-SNAPSHOT
2016-10-21 15:31:35.174:INFO:org.eclipse.jetty.server.AbstractConnector:main: Started ServerConnector@edf4efb{HTTP/1.1,[http/1.1]}{0.0.0.0:8080}
2016-10-21 15:31:35.175:INFO:org.eclipse.jetty.server.Server:main: Started @495ms
```