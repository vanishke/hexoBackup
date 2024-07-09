---
title: SpringBoot加载nacos动态下发logback-spring.xml
categories:
	- SpringBoot

date: 2023-12-05 17:21:20
tags: 
	- SpringBoot
---
<!-- toc -->

# <span id="inline-blue">环境</span>
SpringBoot: 2.2.6.RELEASE
SpringCloud: 2021.0.5
nacos: nacos-2.1.1
mybatis-plus: 3.3.1
Java： 1.8
# <span id="inline-blue">背景</span>
 微服务模块使用nacos作为注册中心和配置中心，但logback-spring.xml打包后放置在jar内部，导致每次启动都需要重新启动，需要实现通过nacos下发各个模块共用的logback-spring.xml文件，logback-spring.xml文件更改立即生效

# <span id="inline-blue">实现</span>
nacos新增公共配置文件common.properties，内容如下：
```properties
logging.config=http://${spring.cloud.nacos.config.server-addr}/nacos/v1/cs/configs?group=DEFAULT_GROUP&tenant=${spring.cloud.nacos.config.namespace}&username=${spring.cloud.nacos.discovery.username}&password=${spring.cloud.nacos.discovery.password}&dataId=logback-spring.xml

```
项目本地bootstrap.properties启动加载common.properties配置如下：
```properties
#扩展文件的id
spring.cloud.nacos.config.extension-configs[0].data-id=common.properties
#扩展文件所在的组，默认为DEFAULT_GROUP
spring.cloud.nacos.config.extension-configs[0].group=DEFAULT_GROUP
#是否实时刷新
spring.cloud.nacos.config.extension-configs[0].refresh=true
spring.main.allow-bean-definition-overriding=true
spring.application.name=ffcs-admin
```
上述配置指定nacos扩展配置文件为common.properties，支持自动刷新，spring.application.name本来一开始是配置在application.properties里面，但测试之后发现每次都会导致在指定日志目录下生成类似is_undefined文件夹，发现是由于logback-spring.xml文件里面引用了spring.application.name,但bootstrap.properties文件的加载优先级高于application.properties,所以将spring.application.name属性配置在bootstrap.properties文件里面

nacos配置管理后台新增logback-spring.xml配置如下：
![logback-spring.xml配置](/images/SpringBoot/SpringBoot_20231205_001.png)

logback-spring.xml整合不同级别日志输出到不同文件下，logback-spring.xml完整配置如下：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="10 seconds">
    <contextName>nacos</contextName>
    <!-- name的值是变量的名称，value的值时变量定义的值。通过定义的值会被插入到logger上下文中。定义变量后，可以使“${}”来使用变量。 -->

    <springProperty scope="context" name="spring.application.name" source="spring.application.name"/>
    <property name="log.path" value="./logs/${spring.application.name}"/>

    <!-- 彩色日志 -->
    <!-- 彩色日志依赖的渲染类 -->
    <conversionRule conversionWord="clr" converterClass="org.springframework.boot.logging.logback.ColorConverter" />
    <conversionRule conversionWord="wex" converterClass="org.springframework.boot.logging.logback.WhitespaceThrowableProxyConverter" />
    <conversionRule conversionWord="wEx" converterClass="org.springframework.boot.logging.logback.ExtendedWhitespaceThrowableProxyConverter" />
    <!-- 彩色日志格式 -->
    <property name="CONSOLE_LOG_PATTERN" value="${CONSOLE_LOG_PATTERN:-%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){faint} %clr(${LOG_LEVEL_PATTERN:-%5p}) %clr(${PID:- }){magenta} %clr(---){faint} %clr([%15.15t]){faint} %clr(%-40.40logger{39}){cyan} %clr(:){faint} %m%n${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}}"/>


    <!--输出到控制台-->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <!--此日志appender是为开发使用，只配置最底级别，控制台输出的日志级别是大于或等于此级别的日志信息-->
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>DEBUG</level>
        </filter>
        <encoder>
            <Pattern>${CONSOLE_LOG_PATTERN}</Pattern>
            <!-- 设置字符集 -->
            <charset>UTF-8</charset>
        </encoder>
    </appender>


    <!--输出到文件-->
    <!-- 时间滚动输出 level为 DEBUG 日志 -->
    <appender name="TRACE_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>${log.path}/trace/log_trace.log</file>
        <!--日志文件输出格式-->
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset> <!-- 设置字符集 -->
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- 日志归档 -->
            <fileNamePattern>${log.path}/trace/log-trace-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!--日志文件保留天数-->
            <maxHistory>15</maxHistory>
        </rollingPolicy>
        <!-- 此日志文件只记录debug级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>trace</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>
    <!-- 时间滚动输出 level为 DEBUG 日志 -->
    <appender name="DEBUG_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>${log.path}/debug/log_debug.log</file>
        <!--日志文件输出格式-->
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset> <!-- 设置字符集 -->
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- 日志归档 -->
            <fileNamePattern>${log.path}/debug/log-debug-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!--日志文件保留天数-->
            <maxHistory>15</maxHistory>
        </rollingPolicy>
        <!-- 此日志文件只记录debug级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>debug</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>

    <!-- 时间滚动输出 level为 INFO 日志 -->
    <appender name="INFO_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>${log.path}/info/log_info.log</file>
        <!--日志文件输出格式-->
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- 每天日志归档路径以及格式 -->
            <fileNamePattern>${log.path}/info/log-info-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!--日志文件保留天数-->
            <maxHistory>15</maxHistory>
        </rollingPolicy>
        <!-- 此日志文件只记录info级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>info</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>

    <!-- 时间滚动输出 level为 WARN 日志 -->
    <appender name="WARN_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>${log.path}/warn/log_warn.log</file>
        <!--日志文件输出格式-->
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset> <!-- 此处设置字符集 -->
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${log.path}/warn/log-warn-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!--日志文件保留天数-->
            <maxHistory>15</maxHistory>
        </rollingPolicy>
        <!-- 此日志文件只记录warn级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>warn</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>


    <!-- 时间滚动输出 level为 ERROR 日志 -->
    <appender name="ERROR_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>${log.path}/error/log_error.log</file>
        <!--日志文件输出格式-->
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset> <!-- 此处设置字符集 -->
        </encoder>
        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${log.path}/error/log-error-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <!--日志文件保留天数-->
            <maxHistory>15</maxHistory>
        </rollingPolicy>
        <!-- 此日志文件只记录ERROR级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>ERROR</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>

    <!--开发环境:打印控制台-->
    <springProfile name="dev">
        <!--<logger name="com.amor.base" level="debug"/>-->
        <!--additivity属性为false，表示此loger的打印信息不再向上级传递，
        <logger name="com.ffcs.platform" level="DEBUG" additivity="true"/>
        <logger name="org.apache.ibatis" level="DEBUG" additivity="true"/>
        <logger name="java.sql.Connection" level="DEBUG" additivity="true"/>
        <logger name="java.sql.Statement" level="DEBUG" additivity="true"/>
        <logger name="java.sql.PreparedStatement" level="DEBUG" additivity="true"/>
        <logger name="java.sql.ResultSet" level="DEBUG" additivity="true"/>
        <logger name="com.baomidou.mybatisplus" level="DEBUG" additivity="true"/>
        <logger name="jdbc.connection" level="DEBUG" additivity="true"/>
        <logger name="jdbc.resultset" level="DEBUG" additivity="true"/>
        <logger name="jdbc.resultsettable" level="DEBUG" additivity="true"/>
        <logger name="org.springframework.jdbc" level="DEBUG" additivity="true"/> -->
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
            <appender-ref ref="TRACE_FILE"/>
            <appender-ref ref="DEBUG_FILE"/>
            <appender-ref ref="INFO_FILE"/>
            <appender-ref ref="ERROR_FILE"/>
            <appender-ref ref="WARN_FILE"/>
        </root>


    </springProfile>

    <!--开发环境:打印控制台-->
    <springProfile name="test">
        <!--<logger name="com.amor.base" level="debug"/>-->
        <!--additivity属性为false，表示此loger的打印信息不再向上级传递，-->
        <logger name="com.ffcs.platform" level="DEBUG" additivity="false"/>
        <logger name="com.apache.ibatis" level="TRACE" additivity="false"/>
        <logger name="java.sql.Connection" level="DEBUG" additivity="false"/>
        <logger name="java.sql.Statement" level="DEBUG" additivity="false"/>
        <logger name="java.sql.PreparedStatement" level="DEBUG" additivity="false"/>
        <root level="INFO">
            <appender-ref ref="CONSOLE" />
        </root>
    </springProfile>

    <!--生产环境:输出到文件-->
    <springProfile name="prod">
        <root level="INFO">
            <appender-ref ref="CONSOLE" />
            <appender-ref ref="DEBUG_FILE" />
            <appender-ref ref="INFO_FILE" />
            <appender-ref ref="ERROR_FILE" />
            <appender-ref ref="WARN_FILE" />
        </root>
    </springProfile>

    <!--开发环境:打印控制台-->
    <springProfile name="prodtest">
        <!--<logger name="com.amor.base" level="debug"/>-->
        <!--additivity属性为false，表示此loger的打印信息不再向上级传递，-->
        <logger name="com.ffcs.platform" level="DEBUG" additivity="false"/>
        <logger name="com.apache.ibatis" level="TRACE" additivity="false"/>
        <logger name="java.sql.Connection" level="DEBUG" additivity="false"/>
        <logger name="java.sql.Statement" level="DEBUG" additivity="false"/>
        <logger name="java.sql.PreparedStatement" level="DEBUG" additivity="false"/>
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
        </root>
    </springProfile>

</configuration>
```

filter说明：

|过滤器	|来源	|说明	|相对常用	|
|:----: |:----: |:----: |:----: |
|LevelFilter	|	Filter|对指定level的日志进行记录(或不记录)，对不等于指定level的日志不记录(或进行记录)		|是	|
|ThresholdFilter	|Filter	|对大于或等于指定level的日志进行记录(或不记录)，对小于指定level的日志不记录(或进行记录)提示：info级别是大于debug的	|是	|
|EvaluatorFilter	|Filter	|对满足指定表达式的日志进行记录(或不记录)，对不满足指定表达式的日志不作记录(或进行记录)	|是	|
|MDCFilter	|TurboFilter	|若MDC域中存在指定的key-value，则进行记录，否者不作记录	|是	|
|DuplicateMessageFilter	|TurboFilter	|根据配置不记录多余的重复的日志	|是	|
|MarkerFilter	|TurboFilter	|针对带有指定标记的日志，进行记录(或不作记录)	|否|

微服务模块application-${spring.profiles.active}.properties配置文件增加指定日志级别配置项logging.level.com.ffcs.platform,指定当前模块包路径日志输出级别
```properties
logging.level.com.ffcs.platform=INFO
```
# <span id="inline-blue">debug模式下排除第三方依赖日志输出</span>
```properties
logging.level.com.ffcs.platform=DEBUG
logging.level.com.alibaba.nacos.shaded.io.grpc.netty.shaded.io.grpc.netty=ERROR
logging.level.com.netflix.loadbalancer.BaseLoadBalancer=ERROR
logging.level.org.apache.http=ERROR
logging.level.org.springframework=ERROR
logging.level.com.netflix.loadbalancer=ERROR
logging.level.org.mybatis.spring.SqlSessionUtils=ERROR
logging.level.io.undertow=ERROR
logging.level.org.elasticsearch.client.RestClient=ERROR
```
指定项目包路径com.ffcs.platform下，输出级别为DEBUG,其他依赖的级别设置为ERROR，该方法在logback-spring.xml文件设置logger无效，如下：
```xml
 <!--开发环境:打印控制台-->
    <springProfile name="test">
        <!--<logger name="com.amor.base" level="debug"/>-->
        <!--additivity属性为false，表示此loger的打印信息不再向上级传递，-->
        <logger name="com.apache.ibatis" level="TRACE" additivity="false"/>
        <logger name="java.sql.Connection" level="DEBUG" additivity="false"/>
        <logger name="java.sql.Statement" level="DEBUG" additivity="false"/>
        <logger name="java.sql.PreparedStatement" level="DEBUG" additivity="false"/>
        <root level="INFO">
            <appender-ref ref="CONSOLE" />
        </root>
    </springProfile>
```
# <span id="inline-blue">验证</span>
![验证](/images/SpringBoot/SpringBoot_20231205_002.png)
