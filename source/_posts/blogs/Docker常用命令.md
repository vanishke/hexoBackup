---
title: Docker常用命令
categories:
	- Docker
tags:
	- Docker

date: 2023-07-10 14:49:20
---
<!-- toc -->

# 概述

Docker Toolbox / Engine 日常运维速查：镜像、容器、Compose 与清理。按场景分类，并对高危删除命令单独警示。

| 项 | 说明 |
| --- | --- |
| 环境示例 | Windows 7 + Docker Toolbox 18.03（命令在现代 Docker Engine 上大多仍适用） |
| 适用边界 | 单机开发 / 运维速查；Swarm/K8s 编排命令不在本文 |
| 文件名说明 | 原文件名 `Dokcer常用命令.md` 已更正为本文 |

# 信息查看

```bash
docker version   # 客户端/服务端版本
docker info      # 守护进程详情
```

# 镜像

```bash
docker image ls                 # 或 docker images
docker pull <镜像>:<标签>       # 例：docker pull mysql:5.7
docker rmi <镜像名|镜像ID>      # 删除单个镜像
docker image prune              # 删除虚悬（dangling）镜像
```

> **危险：** `docker rmi -f $(docker images -a -q)` 会尝试删除**几乎所有镜像**，仅在可重建的开发机使用。

# 容器

```bash
docker ps                       # 运行中
docker ps -a                    # 含已退出
docker stop <容器名|ID>
docker logs <容器名|ID>
docker exec -it <容器名> /bin/bash
```

> **危险：** `docker rm -vf $(docker ps -a -q)` 会删除**全部容器**（含数据卷挂载策略需自行确认）。

# docker-compose

需配合 `docker-compose.yml`：

```bash
docker-compose up -d --build [服务名...]   # 后台启动；--build 重建镜像
docker-compose down                        # 停止并移除该编排创建的容器/网络（默认不删具名卷）
```

现代 Docker 亦可使用 `docker compose`（插件）同义命令。

# 清理与磁盘

```bash
docker image prune    # 虚悬镜像
docker system prune   # 未使用的容器、网络、虚悬镜像、构建缓存等
```

| `docker system prune` 可能清理 | 说明 |
| --- | --- |
| 已停止容器 | 默认会删 |
| 未使用网络 | 默认会删 |
| 虚悬镜像 | 默认会删 |
| 构建缓存 | 默认会删 |
| 未使用的镜像（非虚悬） | 需加 `-a` 才更激进 |

> 生产主机执行 `system prune` 前先确认无「已停止但还要保留」的容器与数据。

# 验证清单

| 检查项 | 期望 |
| --- | --- |
| 版本 | `docker version` 无守护进程连接错误 |
| 拉取 | `docker pull` 后 `docker images` 可见 |
| 运行 | `docker ps` 见目标容器 |

# 小结

1. 日常用 `ps` / `images` / `logs` / `exec` 即可覆盖大部分排障。  
2. 带 `$()` 的批量删除与 `system prune` 属于高危操作，先想清楚再执行。  
3. Compose 以 yml 为源，`up`/`down` 成对理解生命周期。
