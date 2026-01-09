---
title: Docker-Swarm模式下实现MySQL备份
categories:
	- Docker
tags: 
	- Docker
	- Docker swarm
	- mysql-cron-backup

date: 2026-01-09 13:52:10
updated: 2026-01-09 13:52:10
---
<!-- toc -->

# <span id="inline-blue">基于 Docker Swarm 的 MySQL 自动备份服务部署指南</span>

## <span id="inline-blue">概述</span>

在生产环境中，数据库备份是确保数据安全的关键环节。本文将介绍如何使用 Docker Swarm 编排部署一个自动化的 MySQL 数据库备份服务，该服务能够按照设定的时间表自动执行备份任务，并自动清理过期备份文件。

## <span id="inline-blue">技术架构</span>

本方案基于以下技术栈：

- **Docker Swarm**：容器编排平台
- **fradelg/mysql-cron-backup**：MySQL 定时备份镜像（v1.14.1）
- **Docker Secrets**：用于安全存储 MySQL 密码
- **Cron**：定时任务调度

## <span id="inline-blue">服务特性</span>

### <span id="inline-blue">1. 自动化定时备份</span>
- 支持通过 Cron 表达式配置备份时间
- 默认配置：每天凌晨 3 点执行备份

### <span id="inline-blue">2. 数据压缩存储</span>
- 使用 gzip 压缩备份文件
- 支持配置压缩级别（1-9，9 为最高压缩率）
- 默认使用最高压缩级别，节省存储空间

### <span id="inline-blue">3. 自动清理机制</span>
- 自动保留指定天数的备份文件
- 默认保留最近 7 天的备份
- 自动删除过期备份，避免磁盘空间浪费

### <span id="inline-blue">4. 安全认证</span>
- 使用 Docker Swarm Secrets 管理敏感信息
- 通过 `MYSQL_PASS_FILE` 环境变量从 Secret 文件读取密码
- 避免在配置文件中明文存储密码

### <span id="inline-blue">5. 高可用部署</span>
- 支持 Docker Swarm 集群部署
- 配置自动重启策略
- 支持节点约束，可指定部署节点

## <span id="inline-blue">配置文件详解</span>

### <span id="inline-blue">docker-swarm-mysql-backup.yml</span>

```yaml
services:
  mysql-backup:
    image: mysql-backup:latest
    build:
      context: ./mysql-backup
    networks:
      - app-net
    secrets:
      - mysql-password
    environment:
      TZ: Asia/Shanghai
      # MySQL连接配置
      MYSQL_HOST: mysql-service
      MYSQL_PORT: 3306
      MYSQL_USER: root
      # 使用MYSQL_PASS_FILE从secret文件读取密码
      MYSQL_PASS_FILE: /run/secrets/mysql-password
      # 指定要备份的数据库
      MYSQL_DATABASE: app_cloud
      # 备份保留天数（7天）
      MAX_BACKUPS: 7
      # 备份时间：每天凌晨3点
      CRON_TIME: "0 3 * * *"
      # 压缩级别：9（最高压缩率）
      GZIP_LEVEL: 9
    volumes:
      - ./mysql-backup/backup:/backup
    deploy:
      mode: replicated
      replicas: 1
      endpoint_mode: vip
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 30s
      rollback_config:
        parallelism: 1
        delay: 5s
        failure_action: pause
        monitor: 15s
        max_failure_ratio: 0
        order: stop-first
      update_config:
        parallelism: 1
        delay: 5s
        failure_action: pause
        monitor: 10s
        max_failure_ratio: 0
        order: stop-first
      placement:
        constraints:
          - node.labels.role==base

secrets:
  mysql-password:
    external: true

networks:
  app-net:
    external: true
```

### <span id="inline-blue">关键配置说明</span>

#### <span id="inline-blue">环境变量</span>

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `TZ` | 时区设置 | Asia/Shanghai |
| `MYSQL_HOST` | MySQL 服务名称（Swarm 服务名） | mysql-service |
| `MYSQL_PORT` | MySQL 端口 | 3306 |
| `MYSQL_USER` | MySQL 用户名 | root |
| `MYSQL_PASS_FILE` | MySQL 密码文件路径 | /run/secrets/mysql-password |
| `MYSQL_DATABASE` | 要备份的数据库名 | app_cloud |
| `MAX_BACKUPS` | 保留的备份文件数量 | 7 |
| `CRON_TIME` | Cron 定时表达式 | "0 3 * * *" |
| `GZIP_LEVEL` | Gzip 压缩级别（1-9） | 9 |

#### <span id="inline-blue">部署策略配置</span>

- **mode**: `replicated` - 副本模式
- **replicas**: `1` - 单副本运行（备份服务通常只需一个实例）
- **restart_policy**: 故障时自动重启，最多尝试 3 次
- **placement.constraints**: 约束部署到标签为 `role==base` 的节点

#### <span id="inline-blue">存储卷</span>

- 将本地 `./mysql-backup/backup` 目录挂载到容器内的 `/backup` 目录
- 备份文件将保存在宿主机本地，便于管理和备份

## <span id="inline-blue">部署步骤</span>

### <span id="inline-blue">前置准备</span>

#### <span id="inline-blue">1. 创建 Docker Secret</span>

确保 MySQL 密码 Secret 已创建：

```bash
echo "your-mysql-password" | docker secret create mysql-password -
```

#### <span id="inline-blue">2. 创建 Docker Swarm 网络</span>

确保应用网络已创建：

```bash
docker network create app-net -d overlay
```

#### <span id="inline-blue">3. 准备备份目录</span>

创建备份文件存储目录：

```bash
mkdir -p ./mysql-backup/backup
```

### <span id="inline-blue">部署流程</span>

#### <span id="inline-blue">步骤 1：构建镜像</span>

首先构建备份服务镜像：

```bash
docker compose -f docker-swarm-mysql-backup.yml build mysql-backup
```

> **说明**：虽然使用 `docker compose` 命令构建，但这是为了在 Swarm 模式下构建镜像。注意文件名使用的是 `docker-swarm-mysql-backup.yml`，符合 Swarm 编排文件命名规范。

#### <span id="inline-blue">步骤 2：验证和预处理配置</span>

使用 Docker Stack 配置验证命令，生成处理后的配置文件：

```bash
docker stack config -c docker-swarm-mysql-backup.yml > docker-swarm-mysql-backup-process.yml
```

> **说明**：此命令会验证配置文件的语法正确性，并展开所有变量和引用，生成一个可用于部署的配置文件。如果配置有误，会在这一步报错。

#### <span id="inline-blue">步骤 3：部署 Stack</span>

使用处理后的配置文件部署服务栈：

```bash
docker stack deploy -c docker-swarm-mysql-backup-process.yml --resolve-image never docker-stack-mysql-backup
```

> **说明**：
> - `-c`：指定配置文件路径
> - `--resolve-image never`：不自动解析镜像标签，使用配置文件中指定的镜像
> - `docker-stack-mysql-backup`：Stack 名称

### <span id="inline-blue">验证部署</span>

#### <span id="inline-blue">查看服务状态</span>

```bash
# 查看 Stack 中的所有服务
docker stack services docker-stack-mysql-backup

# 查看服务详情
docker service ls | grep mysql-backup
```

#### <span id="inline-blue">查看服务日志</span>

```bash
# 实时查看日志
docker service logs -f docker-stack-mysql-backup_mysql-backup

# 查看最近 100 行日志
docker service logs --tail 100 docker-stack-mysql-backup_mysql-backup
```

#### <span id="inline-blue">检查备份文件</span>

```bash
# 查看备份目录
ls -lh ./mysql-backup/backup/

# 查看备份文件大小和数量
du -sh ./mysql-backup/backup/
```

## <span id="inline-blue">备份文件说明</span>

### <span id="inline-blue">文件命名格式</span>

备份文件采用以下命名格式：

```
{database_name}_{YYYYMMDD}_{HHMMSS}.sql.gz
```

示例：`app_cloud_20240115_030000.sql.gz`

### <span id="inline-blue">文件存储位置</span>

- **容器内路径**：`/backup`
- **宿主机路径**：`./mysql-backup/backup`

### <span id="inline-blue">备份文件管理</span>

- 系统会自动根据 `MAX_BACKUPS` 配置保留指定数量的备份文件
- 超出保留数量的旧备份会被自动删除
- 建议定期将备份文件同步到远程存储（如云存储、NAS 等）

## <span id="inline-blue">运维管理</span>

### <span id="inline-blue">手动触发备份</span>

如果需要立即执行一次备份（不等待定时任务），可以进入容器手动执行：

```bash
# 查找容器 ID
docker ps | grep mysql-backup

# 执行备份脚本
docker exec <container_id> /backup.sh
```

### <span id="inline-blue">更新配置</span>

修改配置文件后，重新部署：

```bash
# 1. 重新构建镜像（如果需要）
docker compose -f docker-swarm-mysql-backup.yml build mysql-backup

# 2. 验证配置
docker stack config -c docker-swarm-mysql-backup.yml > docker-swarm-mysql-backup-process.yml

# 3. 重新部署
docker stack deploy -c docker-swarm-mysql-backup-process.yml --resolve-image never docker-stack-mysql-backup
```

### <span id="inline-blue">停止服务</span>

```bash
docker stack rm docker-stack-mysql-backup
```

### <span id="inline-blue">扩缩容</span>

备份服务通常只需 1 个副本，如需调整：

修改配置文件中的 `replicas` 值，然后重新部署。

## <span id="inline-blue">故障排查</span>

### <span id="inline-blue">常见问题</span>

#### <span id="inline-blue">1. 备份失败：无法连接到 MySQL</span>

**症状**：日志中显示连接错误

**排查步骤**：
- 确认 MySQL 服务名称正确（`MYSQL_HOST`）
- 检查备份服务与 MySQL 服务是否在同一个 Swarm 网络中
- 验证 MySQL 服务是否正常运行：`docker service ls | grep mysql`

#### <span id="inline-blue">2. 认证失败</span>

**症状**：日志中显示认证错误

**排查步骤**：
- 确认 Secret 已正确创建：`docker secret ls`
- 验证 Secret 内容是否正确
- 检查 `MYSQL_USER` 和 `MYSQL_PASS_FILE` 配置

#### <span id="inline-blue">3. 备份文件未生成</span>

**排查步骤**：
- 检查 Cron 任务是否正常：查看容器日志
- 验证备份目录挂载是否正确：`docker service inspect docker-stack-mysql-backup_mysql-backup`
- 检查磁盘空间是否充足：`df -h`

#### <span id="inline-blue">4. 备份文件未自动清理</span>

**排查步骤**：
- 检查 `MAX_BACKUPS` 配置是否正确
- 查看日志确认清理任务是否执行
- 手动验证备份文件数量是否超过配置值

### <span id="inline-blue">日志分析</span>

```bash
# 查看完整的服务日志
docker service logs docker-stack-mysql-backup_mysql-backup

# 过滤错误日志
docker service logs docker-stack-mysql-backup_mysql-backup 2>&1 | grep -i error

# 查看最近的成功备份记录
docker service logs docker-stack-mysql-backup_mysql-backup 2>&1 | grep -i "backup completed"
```

## <span id="inline-blue">最佳实践</span>

### <span id="inline-blue">1. 备份策略优化</span>

- **备份频率**：根据业务需求调整 `CRON_TIME`，重要数据可增加备份频率
- **保留期限**：根据数据重要性调整 `MAX_BACKUPS`，建议至少保留 7-30 天
- **压缩级别**：如果磁盘空间充足，可降低压缩级别以加快备份速度

### <span id="inline-blue">2. 存储管理</span>

- **本地存储**：备份文件存储在本地，定期同步到远程存储
- **磁盘监控**：监控备份目录所在磁盘的使用情况
- **备份验证**：定期测试备份文件的恢复功能，确保备份可用

### <span id="inline-blue">3. 安全加固</span>

- **密码管理**：使用 Docker Secrets 管理密码，不要硬编码
- **访问控制**：限制备份目录的访问权限
- **传输加密**：如果备份需要传输到远程，使用加密传输

### <span id="inline-blue">4. 监控告警</span>

- 监控备份任务执行状态
- 设置磁盘空间告警
- 监控备份文件生成时间，异常时及时告警

## <span id="inline-blue">总结</span>

通过 Docker Swarm 部署 MySQL 自动备份服务，我们可以实现：

 **自动化**：无需人工干预，定时自动备份  
 **安全可靠**：使用 Secrets 管理敏感信息，配置自动重启  
 **资源高效**：压缩存储，自动清理过期备份  
 **易于管理**：标准化部署流程，便于维护和扩展  

该方案适用于生产环境，能够有效保障数据安全。根据实际业务需求，可以灵活调整备份策略和配置参数。

---

**参考资源**：
- [Docker Swarm 官方文档](https://docs.docker.com/engine/swarm/)
- [Docker Secrets 使用指南](https://docs.docker.com/engine/swarm/secrets/)
- [fradelg/mysql-cron-backup 镜像文档](https://hub.docker.com/r/fradelg/mysql-cron-backup)

