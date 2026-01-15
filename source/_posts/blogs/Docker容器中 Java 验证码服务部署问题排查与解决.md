
---
title: Docker容器中 Java 验证码服务部署问题排查与解决
categories:
	- Docker
tags: 
	- Docker
	- Captcha

date: 2026-01-15 14:02:43
updated: 2026-01-15 14:02:43
---
<!-- toc -->

# <span id="inline-blue">Docker容器中 Java 验证码服务部署问题排查与解决</span>

## <span id="inline-blue">问题背景</span>

在使用 Docker 构建并部署一个基于 Spring Boot 的微服务时，遇到了两个关键问题：

1. **验证码生成失败**：`java.lang.NoClassDefFoundError: Could not initialize class sun.font.SunFontManager`
2. **容器启动崩溃**：`Fatal glibc error: cannot get entropy for arc4random`

本文记录了完整的排查过程和最终解决方案。

## <span id="inline-blue">环境信息</span>

- **宿主机**：CentOS 7，内核版本 3.10.x
- **基础镜像**：`eclipse-temurin:8-jdk`（初始尝试）
- **应用类型**：Spring Boot 微服务，包含验证码生成功能

## <span id="inline-blue">问题一：SunFontManager 初始化失败</span>

### <span id="inline-blue">错误现象</span>

应用在生成验证码时抛出异常：

```
java.lang.NoClassDefFoundError: Could not initialize class sun.font.SunFontManager
        at java.desktop/sun.font.FontDesignMetrics.getMetrics(FontDesignMetrics.java:266)
        at java.desktop/sun.java2d.SunGraphics2D.getFontMetrics(SunGraphics2D.java:863)
        at com.test.captcha.SpecCaptcha.graphicsImage(SpecCaptcha.java:76)
        at com.test.captcha.SpecCaptcha.out(SpecCaptcha.java:45)
```

### <span id="inline-blue">问题分析</span>

这个错误的根本原因是：

1. **缺少字体库**：Docker 基础镜像（特别是精简版）通常不包含字体文件和字体渲染所需的系统库
2. **字体管理器初始化失败**：Java 的 `SunFontManager` 在初始化时需要访问系统的字体配置和字体文件，当这些资源缺失时会导致初始化失败
3. **验证码库依赖字体**：`com.test.captcha` 库在生成图片验证码时需要加载字体来渲染文字

### <span id="inline-blue">解决方案</span>

在 Dockerfile 中安装必要的字体和字体配置工具：

```dockerfile
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        fontconfig \
        libfreetype6 \
        fonts-dejavu-core \
        fonts-wqy-microhei \
    && rm -rf /var/lib/apt/lists/*
```

**关键包说明**：
- `fontconfig`：字体配置工具，Java 需要通过它来发现和加载系统字体
- `libfreetype6`：字体渲染库，用于解析和渲染字体文件
- `fonts-dejavu-core`：DejaVu 字体包，提供常用的拉丁字符字体
- `fonts-wqy-microhei`：文泉驿微米黑字体，支持中文字符显示

## <span id="inline-blue">问题二：glibc arc4random 熵源错误</span>

### <span id="inline-blue">错误现象</span>

在解决了字体问题后，重新构建镜像并部署，容器启动时立即崩溃：

```
Fatal glibc error: cannot get entropy for arc4random
Aborted (core dumped)
```

### <span id="inline-blue">问题分析</span>

这是一个**系统层面的兼容性问题**，与 Java 应用代码无关：

1. **glibc 版本冲突**：
   - `eclipse-temurin:8-jdk` 默认基于 **Ubuntu 24.04**，使用 **glibc 2.39**
   - 宿主机是 **CentOS 7，内核 3.10.x**（较老的 Linux 内核）

2. **系统调用不兼容**：
   - glibc 2.39 中的 `arc4random` 函数优先使用 `getrandom` 系统调用获取随机数
   - 老版本内核（3.10.x）对 `getrandom` 的支持不完整或行为不一致
   - 当 `getrandom` 调用失败时，glibc 2.39 在某些情况下未能正确回退到 `/dev/urandom`，直接抛出致命错误

3. **构建阶段也受影响**：
   - 在构建镜像时执行 `fc-cache -fv` 命令也会触发此问题
   - 这是因为 `fontconfig` 工具在刷新字体缓存时也会调用 glibc 的随机数函数

### <span id="inline-blue">解决方案</span>

**核心思路**：使用较旧但稳定的基础镜像，避免 glibc 2.39 与新内核的兼容性问题。

将基础镜像从 `eclipse-temurin:8-jdk` 改为 `eclipse-temurin:8-jdk-jammy`：

```dockerfile
FROM eclipse-temurin:8-jdk-jammy
```

**为什么选择 jammy**：
- `jammy` 基于 **Ubuntu 22.04**，使用 **glibc 2.35**
- glibc 2.35 对老内核的兼容性更好，`arc4random` 能正确回退到 `/dev/urandom`
- 仍然提供完整的字体和图形库支持，满足验证码生成需求

### <span id="inline-blue">构建阶段的优化</span>

在安装字体包时，移除了手动执行 `fc-cache` 的步骤：

```dockerfile
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        fontconfig \
        libfreetype6 \
        fonts-dejavu-core \
        fonts-wqy-microhei \
    && rm -rf /var/lib/apt/lists/*
```

**原因**：
- 安装字体包时，`fontconfig` 的 post-install 脚本会自动刷新字体缓存
- 手动执行 `fc-cache` 在构建阶段可能因为熵源问题导致失败
- 对于 Java 应用来说，只要字体包装好、`fontconfig` 存在即可，不依赖手动刷新缓存

## <span id="inline-blue">最终解决方案</span>

完整的 Dockerfile 如下：

```dockerfile
# 宿主机 CentOS 7 内核 3.10.x 版本与 eclipse-temurin:8-jdk 镜像构建 glibc 版本冲突
# 选择镜像版本较旧的镜像（jammy），间接降低了 glibc 版本，提高兼容性
FROM eclipse-temurin:8-jdk-jammy

LABEL maintainer="your-email@example.com"

# 安装验证码调用所需字体 fonts 依赖支持
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        fontconfig \
        libfreetype6 \
        fonts-dejavu-core \
        fonts-wqy-microhei \
    && rm -rf /var/lib/apt/lists/*

VOLUME /home/app
RUN mkdir -p /home/app
WORKDIR /home/app

COPY ./jar/app-service.jar /home/app/app-service.jar
COPY ./docker-compose-wait/wait /wait
RUN chmod +x /wait

EXPOSE 9020

ENV JAVA_OPTS="-Xms2g -Xmx2g \
               -XX:NewRatio=2 \
               -XX:SurvivorRatio=8 \
               -XX:+UseG1GC \
               -XX:MaxGCPauseMillis=200 \
               -XX:MetaspaceSize=512m \
               -XX:MaxMetaspaceSize=512m \
               -Djava.security.egd=file:/dev/./urandom \
               -Dsun.security.egd=file:/dev/./urandom \
               -Djdk.random.legacyGenerator=true \
               -Djava.awt.headless=true"

CMD /wait && java $JAVA_OPTS -jar app-service.jar
```

### <span id="inline-blue">关键配置说明</span>

1. **基础镜像选择**：`eclipse-temurin:8-jdk-jammy` 提供稳定的 glibc 环境
2. **字体支持**：安装 `fontconfig`、`libfreetype6` 和常用字体包
3. **JVM 参数**：
   - `-Djava.awt.headless=true`：启用无头模式，适合容器环境
   - `-Djava.security.egd=file:/dev/./urandom`：使用 `/dev/urandom` 作为随机数源，避免阻塞

## <span id="inline-blue">验证结果</span>

使用上述 Dockerfile 构建镜像并部署后：

1. 容器正常启动，不再出现 `arc4random` 错误
2. 验证码接口正常响应，`SunFontManager` 初始化成功
3. 验证码图片正常生成，包含中英文字符

## <span id="inline-blue">经验总结</span>

1. **字体问题**：在容器中运行需要生成图片或处理字体的 Java 应用时，必须安装 `fontconfig` 和字体包
2. **glibc 兼容性**：在较老的宿主机内核上部署时，应选择较旧但稳定的基础镜像，避免 glibc 新版本的兼容性问题
3. **镜像选择原则**：不是越新越好，要根据实际运行环境选择合适的基础镜像版本
4. **构建优化**：避免在构建阶段执行可能因环境限制而失败的操作（如 `fc-cache`）

## <span id="inline-blue">参考资料</span>

- [glibc bug 31612 - arc4random fallback issue](https://sourceware.org/bugzilla/show_bug.cgi?id=31612)
- [Eclipse Temurin Docker Images](https://hub.docker.com/_/eclipse-temurin)
- [Fontconfig Documentation](https://www.freedesktop.org/wiki/Software/fontconfig/)


