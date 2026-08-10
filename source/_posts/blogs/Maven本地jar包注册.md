---
title: Maven本地jar包注册
categories:
	- Maven
tags:
	- Maven

date: 2023-05-18 16:15:20
---
<!-- toc -->

# 概述

依赖在中央仓库（或远端仓库）本身存在，但本机因网络、镜像、代理等原因下载失败，导致 IDE 持续报红。可把已到手的 jar **临时安装进本地仓库**（`~/.m2/repository`），让坐标解析先恢复。

| 项 | 说明 |
| --- | --- |
| 场景 | 远端可访问/可手工下载，但 Maven 自动下载失败 |
| 做法 | `mvn install:install-file` 写入本地仓库 |
| 适用边界 | 个人机救急、内网临时构建；坐标必须与 `pom` 声明一致 |
| 不适用 | 团队长期依赖——应上私服（Nexus/Artifactory）或修镜像源 |

# 原因分层

按优先级排查，不要一上来只装本地包：

1. **网络 / 代理 / DNS**：公司代理未配、`settings.xml` 镜像不可达  
2. **仓库坐标或版本写错**：groupId/artifactId/version 与真实构件不一致  
3. **本地仓库损坏**：对应目录下残缺文件，可删后重下  
4. **确需离线**：才使用 `install-file` 灌入本地仓库

# 实施步骤

## 1. 安装到本地仓库

```bash
mvn install:install-file \
  -Dfile="C:\path\to\spring-boot-configuration-processor-2.2.6.RELEASE.jar" \
  -DgroupId=org.springframework.boot \
  -DartifactId=spring-boot-configuration-processor \
  -Dversion=2.2.6.RELEASE \
  -Dpackaging=jar
```

| 参数 | 含义 |
| --- | --- |
| `install:install-file` | 将外部 jar 安装到本地仓库 |
| `-Dfile` | **待安装 jar 文件**的绝对路径（不是本地仓库路径） |
| `-DgroupId` / `-DartifactId` / `-Dversion` | Maven 坐标，须与 pom 一致 |
| `-Dpackaging` | 一般为 `jar`（亦可 `pom` / `war`） |

## 2. 在 pom 中声明（若尚未声明）

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-configuration-processor</artifactId>
  <version>2.2.6.RELEASE</version>
</dependency>
```

# 验证清单

| 检查项 | 期望 |
| --- | --- |
| 本地路径 | `~/.m2/repository/org/springframework/boot/spring-boot-configuration-processor/2.2.6.RELEASE/` 下有 jar 与 pom |
| IDE | Reimport 后红线消失 |
| 命令行 | `mvn -q dependency:resolve` 成功 |

# 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 安装成功仍报红 | 坐标与 pom 不一致或 IDE 未刷新 | 对齐 GAV；Reimport / 失效缓存 |
| `-Dfile` 指错 | 误当成「本地仓库目录」 | 指向 **jar 文件本身** |
| 他人机器仍失败 | 只装在你本机 | 上传私服或修复团队镜像 |

# 小结

1. `install-file` 是**本地救急**，不是依赖治理的终点。  
2. `-Dfile` 是 jar 的绝对路径；坐标必须与 pom 一致。  
3. 团队场景优先修仓库/镜像或使用私服，避免每人手工安装。
