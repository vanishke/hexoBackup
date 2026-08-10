---
title: SpringBoot加载Nacos动态下发logback-spring.xml
categories:
	- SpringBoot
tags:
	- SpringBoot
	- Nacos
	- Logback

date: 2023-12-05 17:21:20
---
<!-- toc -->

# 概述

微服务把 `logback-spring.xml` 打进 jar 后，改日志策略往往只能重新打包发布。本文通过 Nacos 托管公共日志配置，用 `logging.config` 指向 Nacos 上的 `logback-spring.xml`，让各模块共用同一份日志规范。

| 项 | 说明 |
| --- | --- |
| 问题 | 日志配置内嵌 jar，多模块难统一，改配置成本高 |
| 做法 | Nacos 存 `logback-spring.xml`；`common.properties` 配置 `logging.config` HTTP 拉取；bootstrap 引入扩展配置 |
| 效果 | 多模块共用一份日志 XML；改配置后按下方「生效边界」处理 |
| 适用边界 | Spring Boot 2.x + Spring Cloud Alibaba / Nacos Config；**默认在启动时加载** `logging.config`，**不等于** Nacos 发布后进程内热切换整份 XML |

> **生效边界（重要）**  
> - `logging.config` 一般在 **应用启动阶段** 被 LoggingSystem 读取；Nacos 上改 XML 后，多数场景仍需 **重启实例** 才能完整生效。  
> - XML 内 `scan="true"` 只对「本地可扫描文件」有意义；经 HTTP 拉取的远程内容，不要默认当成「改完立即生效」。  
> - `extension-configs[].refresh=true` 对 `common.properties` 中部分可刷新项有效，**不能等同于** Logback 上下文已热重载。

# 环境与前置

| 组件 | 本文验证版本 | 说明 |
| --- | --- | --- |
| Java | 1.8 | — |
| Spring Boot | 2.2.6.RELEASE | 若升级 Boot，请同步核对 Cloud / Alibaba 兼容矩阵 |
| Spring Cloud | Hoxton.SR12（建议） | 原文曾写 `2021.0.5`，与 Boot 2.2.x **不匹配**；请按官方 BOM 对齐 |
| Nacos | 2.1.1 | 需开通配置中心，并具备读配置权限 |
| MyBatis-Plus | 3.3.1 | 与日志方案无强绑定，仅环境记录 |

**术语：**

| 词 | 含义 |
| --- | --- |
| `logging.config` | Spring Boot 指定 Logging 配置位置（可为 classpath / file / http URL） |
| `extension-configs` | Nacos 扩展配置，可在 bootstrap 中额外拉取 |
| `springProperty` | Logback 从 Spring Environment 取值的标签 |

# 原理要点

1. **统一入口**：各模块不内置完整 XML，而是通过 `logging.config` 指向 Nacos `dataId=logback-spring.xml` 的 HTTP 读接口。  
2. **公共属性下发**：`common.properties` 放在 Nacos，由 `extension-configs` 引入，集中维护 `logging.config`。  
3. **启动顺序**：Logback 初始化很早；`spring.application.name` 若只写在 `application.properties`，XML 里 `${spring.application.name}` 可能得到空值，从而出现 `logs/is_undefined` 一类目录——应放到 **bootstrap**（或保证在 Logging 初始化前已进入 Environment）。

# 实施步骤

## 1. Nacos 新增公共属性 `common.properties`

```properties
logging.config=http://${spring.cloud.nacos.config.server-addr}/nacos/v1/cs/configs?group=DEFAULT_GROUP&tenant=${spring.cloud.nacos.config.namespace}&username=${spring.cloud.nacos.discovery.username}&password=${spring.cloud.nacos.discovery.password}&dataId=logback-spring.xml
```

| 项 | 含义 | 注意 |
| --- | --- | --- |
| `dataId` | Nacos 中日志 XML 的 dataId | 需与后台创建的配置名一致 |
| `tenant` | 命名空间 | 空命名空间时按环境实际传参 |
| 账号密码 | 读配置凭证 | 生产勿写死明文，优先环境变量 / 加密配置 |

## 2. 本地 `bootstrap.properties` 引入扩展配置

```properties
spring.cloud.nacos.config.extension-configs[0].data-id=common.properties
spring.cloud.nacos.config.extension-configs[0].group=DEFAULT_GROUP
spring.cloud.nacos.config.extension-configs[0].refresh=true
spring.main.allow-bean-definition-overriding=true
spring.application.name=your-service-name
```

## 3. Nacos 创建 `logback-spring.xml`

在配置管理中新增 dataId=`logback-spring.xml`（类型 XML）。完整示例见文末附录；正文只保留关键片段：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="10 seconds">
    <springProperty scope="context" name="spring.application.name" source="spring.application.name"/>
    <property name="log.path" value="./logs/${spring.application.name}"/>
    <!-- appender：CONSOLE / INFO_FILE / ERROR_FILE ... -->
    <springProfile name="prod">
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
            <appender-ref ref="INFO_FILE"/>
            <appender-ref ref="ERROR_FILE"/>
        </root>
    </springProfile>
</configuration>
```

![logback-spring.xml配置](/images/SpringBoot/SpringBoot_20231205_001.png)

## 4. 模块级日志级别（可选）

在 `application-${profile}.properties` 中按包控制级别：

```properties
logging.level.com.example.platform=INFO
```

调试时拉高业务包、压低第三方噪声：

```properties
logging.level.com.example.platform=DEBUG
logging.level.com.alibaba.nacos=ERROR
logging.level.org.springframework=ERROR
logging.level.io.undertow=ERROR
```

> 部分第三方包用 `logging.level.*` 比在 XML 里写 `<logger>` 更稳；若 XML 中 logger 不生效，优先用 Boot 的 `logging.level` 覆盖。

# 验证清单

| 检查项 | 期望 |
| --- | --- |
| 启动日志 | 无 LoggingSystem 找不到配置的错误 |
| 日志目录 | `./logs/<spring.application.name>/` 存在，无 `is_undefined` |
| 级别切换 | 修改 `logging.level.*` 后按策略生效（可刷新项）或重启后生效 |
| 改 Nacos XML | **重启实例** 后新 appender/pattern 生效（不要默认热更新） |

![验证](/images/SpringBoot/SpringBoot_20231205_002.png)

# 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 出现 `logs/is_undefined` | `spring.application.name` 在 Logging 初始化前不可用 | 写入 bootstrap，或保证更早注入 Environment |
| 改了 Nacos XML「没反应」 | `logging.config` 非进程内热加载 | 滚动重启实例；勿只依赖 `scan` |
| Boot / Cloud 版本怪异错误 | BOM 不匹配（如 Boot 2.2 + Cloud 2021） | 按官方兼容表对齐 |
| 第三方 DEBUG 刷屏 | root 或包级别过低 | 用 `logging.level` 单独压到 ERROR |

# 小结

1. **Nacos 适合统一托管** 多模块共用的 `logback-spring.xml`，而不是把巨型 XML 复制进每个 jar。  
2. **先分清「启动加载」与「热更新」**，对外沟通与运维手册不要写「改完立即生效」除非你已自建重载机制。  
3. **版本矩阵与启动顺序**（bootstrap / application.name）比再贴一份完整 XML 更关键。

---

## 附录：完整 logback-spring.xml 示例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="10 seconds">
    <contextName>nacos</contextName>
    <springProperty scope="context" name="spring.application.name" source="spring.application.name"/>
    <property name="log.path" value="./logs/${spring.application.name}"/>
    <conversionRule conversionWord="clr" converterClass="org.springframework.boot.logging.logback.ColorConverter" />
    <conversionRule conversionWord="wex" converterClass="org.springframework.boot.logging.logback.WhitespaceThrowableProxyConverter" />
    <conversionRule conversionWord="wEx" converterClass="org.springframework.boot.logging.logback.ExtendedWhitespaceThrowableProxyConverter" />
    <property name="CONSOLE_LOG_PATTERN" value="${CONSOLE_LOG_PATTERN:-%clr(%d{yyyy-MM-dd HH:mm:ss.SSS}){faint} %clr(${LOG_LEVEL_PATTERN:-%5p}) %clr(${PID:- }){magenta} %clr(---){faint} %clr([%15.15t]){faint} %clr(%-40.40logger{39}){cyan} %clr(:){faint} %m%n${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}}"/>

    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>DEBUG</level>
        </filter>
        <encoder>
            <Pattern>${CONSOLE_LOG_PATTERN}</Pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <appender name="INFO_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${log.path}/info/log_info.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${log.path}/info/log-info-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <maxHistory>15</maxHistory>
        </rollingPolicy>
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>info</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>

    <appender name="ERROR_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${log.path}/error/log_error.log</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
            <charset>UTF-8</charset>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${log.path}/error/log-error-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
            <maxHistory>15</maxHistory>
        </rollingPolicy>
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>ERROR</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>

    <springProfile name="dev">
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
            <appender-ref ref="INFO_FILE"/>
            <appender-ref ref="ERROR_FILE"/>
        </root>
    </springProfile>

    <springProfile name="prod">
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
            <appender-ref ref="INFO_FILE"/>
            <appender-ref ref="ERROR_FILE"/>
        </root>
    </springProfile>
</configuration>
```

常用 Filter：`LevelFilter`（精确级别）、`ThresholdFilter`（大于等于某级别）。按需扩展 TRACE/DEBUG/WARN 分文件 appender。
