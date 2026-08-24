---
title: Docker Nginx日志集成fail2ban拦截恶意扫描攻击
categories:
	- Docker
tags:
	- Fail2ban
	- Nginx
	- Docker

date: 2026-07-24 15:08:20
---

<!-- toc -->

# 概述

Docker 部署的 Nginx / 反向代理入口长期暴露在公网时，`access.log` 里往往充斥 `.env`、`.git`、Nmap、路径穿越等扫描请求。仅靠 Nginx 静态 `deny` / 路径拦截能挡单次探测，却无法自动封禁反复扫描的源 IP，日志噪音与带宽消耗仍会持续。

本文介绍在 Ubuntu 22.04 宿主机安装 fail2ban，读取 Docker 挂载到宿主机的 Nginx `access.log`，结合系统默认 nftables 自动封禁恶意扫描 IP 的做法。方案适用于阿里云 Docker Swarm 双入口（管理后台 / API）场景。

| 项   | 说明                                                |
|:----|:--------------------------------------------------|
| 目标  | 恶意扫描 IP 自动封禁，降低 access.log 噪音                     |
| 系统  | Ubuntu 22.04 LTS                                  |
| 组件  | fail2ban + nftables；Docker Nginx（端口 `mode: host`） |
| 日志  | 宿主机绝对路径下的 `access.log`                            |
| 不依赖 | ufw；无需改造 Nginx 镜像                                 |

**环境示例：**

| 角色                  | 示例                                                                       |
|:--------------------|:-------------------------------------------------------------------------|
| 管理入口节点（base）        | 私网 `<vpc-base-ip>`，日志 `/usr/local/<app>/nginx/logs/access.log`           |
| API 入口节点（interface） | 私网 `<vpc-interface-ip>`，日志 `/usr/local/<app>/emqx_nginx/logs/access.log` |
| 办公网出口（白名单）          | `<office-egress-ip>`                                                     |
| 管理入口                | `https://<admin-host>`                                                   |
| API 入口              | `https://<api-host>`                                                     |

# 架构说明

```mermaid
flowchart TB
  A[公网扫描流量] --> B[云安全组]
  B --> C[宿主机 nftables]
  C -->|未封禁| D[Docker Nginx mode:host]
  C -->|已封禁 reject| X[丢弃]
  D --> E[静态规则 403/404]
  E --> F[业务 / Gateway]
  D -->|写入| G[宿主机 access.log]
  G --> H[fail2ban]
  H -->|banaction nftables-multiport| C
```

| 原则     | 说明                                            |
|:-------|:----------------------------------------------|
| 宿主机安装  | fail2ban 直接改本机 nftables，与 `mode: host` 发布端口匹配 |
| 分节点部署  | 管理入口、API 入口各装一份；日志不在同一机，不做跨节点共享               |
| 不开 ufw | 避免与 Docker 规则冲突；外层用云安全组即可                     |
| 匹配扫描特征 | 禁止对全部 404 计次，避免误封业务 API                       |

# 环境要求

| 项            | 要求                                   |
|:-------------|:-------------------------------------|
| OS           | Ubuntu 22.04（系统默认 nftables）          |
| Docker Nginx | `access.log` 已 bind mount 到宿主机目录     |
| 端口模式         | 建议 `published` 使用 `mode: host`       |
| 权限           | root 或具备 sudo                        |
| 网络           | 已知 VPC 私网段、Docker bridge 段、办公出口公网 IP |

**日志挂载关系：**

```text
Nginx 容器内  /var/log/nginx/access.log
        ↕ bind mount
宿主机        /usr/local/<app>/nginx/logs/access.log
        ↑
fail2ban 只读这一侧绝对路径
```

**日志格式（`log_format main`）：**

```text
$remote_addr - $remote_user [$time_local] "$request" $status ...
```

典型恶意请求示例：

```text
<scanner-ip> - - [24/Jul/2026:07:20:40 +0000] "GET /.env HTTP/1.1" 404 153 "-" "..." "-"
<scanner-ip> - - [24/Jul/2026:08:27:29 +0000] "GET /HNAP1 HTTP/1.1" 404 153 "-" "Nmap Scripting Engine" "-"
```

# 核心步骤

## 确认宿主机日志可读

```bash
# 管理入口节点
ls -l /usr/local/<app>/nginx/logs/access.log
tail -n 5 /usr/local/<app>/nginx/logs/access.log

# API 入口节点
ls -l /usr/local/<app>/emqx_nginx/logs/access.log
tail -n 5 /usr/local/<app>/emqx_nginx/logs/access.log
```

| 检查项     | 期望                   |
|:--------|:---------------------|
| 文件存在    | `access.log` 持续增长    |
| 行首 IP   | 公网访问为公网源 IP（无 SLB 时） |

## 安装 fail2ban

两台入口机均执行：

```bash
sudo apt-get update
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
```

**安全要求：** 不要仅为 fail2ban 开启 ufw。

## 编写 filter

创建 `/etc/fail2ban/filter.d/nginx-scan.conf`：

```ini
[Definition]
# 只匹配扫描特征 URI / 恶意 UA，勿匹配全部 404
failregex = ^<HOST> - \S+ \[\]?[^]]*\] "(GET|POST|HEAD|PUT|DELETE|PROPFIND|OPTIONS)[^\"]*(?:/\.env(?:\.[a-zA-Z0-9_-]+)?(?:/|$|\?)|/\.git(?:/|$|\?)|/phpunit|/vendor/phpunit|/wp-admin|/wp-login|/phpmyadmin|/xmlrpc\.php|/wlwmanifest|/cgi-bin/|/HNAP1|/evox/about|/sdk(?:/|$|\?)|/nmaplowercheck|/actuator|/solr/|/console/|/manager/html|\.php(?:\?|$| ))[^\"]*" (400|403|404|405)
            ^<HOST> - \S+ \[\]?[^]]*\] "[^\"]*" (400|403|404|405) "[^\"]*" "[^\"]*(?:Nmap Scripting Engine|FreePBX-Scanner|nvdorz|zgrab|masscan|sqlmap)[^\"]*"

# 仅排除业务版 API 的 404；切勿写成 /api/（会误忽略 /api/.env）
ignoreregex = ^<HOST> - \S+ \[\]?[^]]*\] "(GET|POST|HEAD) /api/v[0-9]+/[^\"]*" (404)
```

| 匹配类型      | 示例                         |
|:----------|:---------------------------|
| 敏感文件      | `/.env`、`/.git/config`     |
| 路径穿越      | `/cgi-bin/.%2e/.../bin/sh` |
| 设备扫描      | `/HNAP1`、`nmaplowercheck*` |
| 扫描器 UA    | Nmap、sqlmap、masscan        |

## 编写 jail

**管理入口** `/etc/fail2ban/jail.d/nginx-admin.local`：

```ini
[nginx-admin]
enabled   = true
filter    = nginx-scan
logpath   = /usr/local/<app>/nginx/logs/access.log
backend   = auto
port      = 80,443,8080,8001,18083,8182,9412,9444
protocol  = tcp
banaction = nftables-multiport
findtime  = 10m
maxretry  = 8
bantime   = 12h
ignoreip  = 127.0.0.1/8 ::1
            10.0.0.0/8 172.16.0.0/12 192.168.0.0/16
            172.17.0.0/16 172.18.0.0/16
            <vpc-cidr>
            <office-egress-ip>
```

**API 入口** `/etc/fail2ban/jail.d/nginx-api.local`：

```ini
[nginx-api]
enabled   = true
filter    = nginx-scan
logpath   = /usr/local/<app>/emqx_nginx/logs/access.log
backend   = auto
port      = 80,443,8001,8085,8884
protocol  = tcp
banaction = nftables-multiport
findtime  = 10m
maxretry  = 8
bantime   = 12h
ignoreip  = 127.0.0.1/8 ::1
            10.0.0.0/8 172.16.0.0/12 192.168.0.0/16
            172.17.0.0/16 172.18.0.0/16
            <vpc-cidr>
            <office-egress-ip>
```

| 参数          | 含义                          |
|:------------|:----------------------------|
| `findtime`  | 统计窗口                        |
| `maxretry`  | 窗口内命中次数达到后封禁                |
| `bantime`   | 封禁时长                        |
| `ignoreip`  | 永不封禁的地址（本机、VPC、Docker、办公出口） |
| `banaction` | 使用 nftables multiport       |
| `port`      | 封禁生效的本机监听端口（按实际暴露裁剪）        |

> `ignoreip` 务必包含办公出口 `<office-egress-ip>`，以及 `docker0`（`172.17.0.0/16`）、`docker_gwbridge`（`172.18.0.0/16`）、VPC 私网段。

## 校验正则

```bash
sudo fail2ban-regex /usr/local/<app>/nginx/logs/access.log \
  /etc/fail2ban/filter.d/nginx-scan.conf
```

| 期望                     | 说明                          |
|:-----------------------|:----------------------------|
| Failregex 有较多命中        | `.env` / `.git` / HNAP 等能匹配 |
| Ignored 中无 `/api/.env` | `ignoreregex` 未过宽           |
| 业务 `/api/v5/...` 404   | 可被 ignore，或不计入 fail         |

## 启动服务

```bash
sudo systemctl restart fail2ban
sudo fail2ban-client status
sudo fail2ban-client status nginx-admin   # 或 nginx-api
```

# 配置与验证

## 手工测封（确认 nftables 真正生效）

```bash
TEST_IP=203.0.113.10
sudo fail2ban-client set nginx-admin banip "$TEST_IP"
sudo fail2ban-client status nginx-admin

# 正确查看方式：表名为 f2b-table，set 名为 addr-set-<jail>
sudo nft list tables
sudo nft list table inet f2b-table
```

正常时类似：

```text
table inet f2b-table {
  set addr-set-nginx-admin {
    elements = { 203.0.113.10 }
  }
  chain f2b-chain {
    type filter hook input priority filter - 1; policy accept;
    tcp dport { 80, 443, ... } ip saddr @addr-set-nginx-admin reject ...
  }
}
```

测完解封：

```bash
sudo fail2ban-client set nginx-admin unbanip "$TEST_IP"
```

## 理解「regex 有命中但 status 为 0」

| 命令               | 行为                    |
|:-----------------|:----------------------|
| `fail2ban-regex` | 离线扫整份历史日志             |
| 运行中 jail         | 只监控启动后新写入的行，默认不回溯历史封禁 |

因此刚 `restart` 后 `Currently banned: 0` 属于正常；等新扫描写入或手工 `banip` 验证即可。

## 日常运维

| 操作       | 命令                                             |
|:---------|:-----------------------------------------------|
| 查看 jail  | `fail2ban-client status`                       |
| 查看封禁列表   | `fail2ban-client status nginx-admin`           |
| 解封       | `fail2ban-client set nginx-admin unbanip <IP>` |
| 重载配置     | `fail2ban-client reload`                       |
| 看服务日志    | `journalctl -u fail2ban -f`                    |
| 看 nft 规则 | `nft list table inet f2b-table`                |

# 常见问题

| 问题                                        | 原因                                       | 处理                                 |
|:------------------------------------------|:-----------------------------------------|:-----------------------------------|
| `fail2ban-regex` 把 `/api/.env` 算进 Ignored | `ignoreregex` 写成了 `/api/`                | 改为仅 `/api/v[0-9]+/`                |
| status 有 Banned，但 `grep f2b-<jail名>` 为空   | 规则在 `inet f2b-table` / `addr-set-<jail>` | 使用 `nft list table inet f2b-table` |
| 封禁后仍能访问                                   | Docker 与 nft 优先级、或 port 列表不全             | 核对 `port=`；可试 `nftables-allports`  |
| 办公网被封                                     | 未加办公出口到 `ignoreip`                       | 加入 `<office-egress-ip>` 后 reload   |
| 业务 API 误封                                 | 对全部 404 计次                               | 只用扫描特征 failregex                   |
| 需要开 ufw 吗                                 | 不需要                                      | 安全组 + nftables 即可                  |

# fail2ban 常用操作命令

## 服务管理

```bash
# 启动 / 停止 / 重启
sudo systemctl start fail2ban
sudo systemctl stop fail2ban
sudo systemctl restart fail2ban

# 开机自启
sudo systemctl enable fail2ban
sudo systemctl disable fail2ban

# 查看状态
sudo systemctl status fail2ban

# 重载配置（不中断已封禁）
sudo fail2ban-client reload
```

## 全局状态

```bash
# 查看整体状态（jail 列表、当前封禁数）
sudo fail2ban-client status

# 查看 fail2ban 版本
fail2ban-client version

# 查看客户端是否连上服务端
sudo fail2ban-client ping
```

## Jail 管理

```bash
# 查看某个 jail 详情（含封禁 IP、过滤规则等）
sudo fail2ban-client status sshd
sudo fail2ban-client status nginx-http-auth

# 启用 / 禁用某个 jail
sudo fail2ban-client start <jail>
sudo fail2ban-client stop <jail>

# 重载单个 jail
sudo fail2ban-client reload <jail>
```

## 封禁 / 解封 IP

```bash
# 手动封禁
sudo fail2ban-client set <jail> banip <IP>

# 手动解封
sudo fail2ban-client set <jail> unbanip <IP>

# 解封该 jail 下所有 IP
sudo fail2ban-client set <jail> unbanip --all

# 示例
sudo fail2ban-client set sshd banip 1.2.3.4
sudo fail2ban-client set sshd unbanip 1.2.3.4
```

## 查询与排查

```bash
# 查看某 jail 当前被封 IP
sudo fail2ban-client get <jail> banned

# 查看某 jail 的失败阈值、封禁时长等
sudo fail2ban-client get <jail> maxretry
sudo fail2ban-client get <jail> bantime
sudo fail2ban-client get <jail> findtime

# 查看日志
sudo tail -f /var/log/fail2ban.log

# 用 journalctl 看服务日志
sudo journalctl -u fail2ban -f
```

## 配置相关

```bash
# 主配置
/etc/fail2ban/jail.conf          # 默认，一般不直接改
/etc/fail2ban/jail.local         # 本地覆盖（推荐改这里）
/etc/fail2ban/jail.d/*.conf      # 分 jail 配置片段
/etc/fail2ban/filter.d/          # 过滤规则
/etc/fail2ban/action.d/          # 封禁动作（iptables/nftables 等）

# 改配置后重载
sudo fail2ban-client reload

# 测试 filter 能否匹配日志（常用排错）
sudo fail2ban-regex /var/log/auth.log /etc/fail2ban/filter.d/sshd.conf
sudo fail2ban-regex /var/log/nginx/error.log /etc/fail2ban/filter.d/nginx-http-auth.conf
```

## SSH 常用示例（jail = sshd）

```bash
# 状态
sudo fail2ban-client status sshd

# 封 / 解
sudo fail2ban-client set sshd banip 203.0.113.10
sudo fail2ban-client set sshd unbanip 203.0.113.10

# 确认是否还在封禁列表
sudo fail2ban-client get sshd banned
```

## 安装（参考）

```bash
# Debian / Ubuntu
sudo apt update && sudo apt install -y fail2ban

# RHEL / CentOS / Rocky
sudo yum install -y fail2ban
# 或
sudo dnf install -y fail2ban
```

## 快速排错清单

| 现象 | 建议命令 |
|------|----------|
| 服务未运行 | `systemctl status fail2ban` |
| jail 未生效 | `fail2ban-client status` |
| 规则不匹配日志 | `fail2ban-regex <日志> <filter>` |
| IP 解不掉 | `set <jail> unbanip <IP>` 后 `get <jail> banned` |
| 改配置无效 | `fail2ban-client reload` 或 `systemctl restart fail2ban` |
