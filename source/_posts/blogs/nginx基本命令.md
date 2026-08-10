---
title: Nginx开机自启动（SysV init）
categories:
	- Nginx
tags:
	- Linux
	- Nginx

date: 2020-12-24 10:11:20
---
<!-- toc -->

# 概述

在仍使用 SysV `init.d` + `chkconfig` 的发行版上，为源码安装的 Nginx 配置开机自启动，并验证 start / reload / stop。

| 项 | 说明 |
| --- | --- |
| 场景 | CentOS 6 / 部分仍保留 chkconfig 的环境；Nginx 安装在 `/usr/local/nginx` |
| 做法 | 放置 init 脚本 → `chmod` → `chkconfig --add` → `chkconfig on` |
| 适用边界 | **SysV init**；脚本内容需按本机 `sbin/nginx` 与 `nginx.conf` 路径修改 |
| 不适用 | 已全面使用 **systemd** 的系统（应写 `nginx.service`，而不是本文 chkconfig 流程） |
| 标题说明 | 历史文件名曾为「基本命令」，正文实为自启动；现以自启动为准 |

官方 init 脚本参考：<https://www.nginx.com/resources/wiki/start/topics/examples/redhatnginxinit/>

# 实施步骤

## 1. 添加 init 脚本

```bash
vim /etc/init.d/nginx
```

将官网示例拷入后，至少核对：

- Nginx 可执行文件路径（如 `/usr/local/nginx/sbin/nginx`）
- 配置文件路径（如 `/usr/local/nginx/conf/nginx.conf`）

## 2. 赋予可执行权限

```bash
chmod a+x /etc/init.d/nginx
```

## 3. 加入开机自启动

```bash
chkconfig --add /etc/init.d/nginx
chkconfig nginx on
```

## 4. 启停与重载

```bash
service nginx start
service nginx reload
service nginx stop
```

`reload` 前会做配置语法检查；失败时不会加载错误配置。

# 验证清单

| 检查项 | 命令 / 期望 |
| --- | --- |
| 进程 | `ps -ef \| grep nginx` 可见 master / worker |
| 开机项 | `chkconfig --list nginx` 对应级别为 on |
| 重载 | `service nginx reload` 提示 syntax ok / test successful |

```bash
ps -ef | grep nginx
# 期望类似：
# nginx: master process /usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
# nginx: worker process
```

# 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `service nginx start` 失败 | 路径写错或端口占用 | 核对 init 脚本路径；`ss -lntp \| grep 80` |
| 重启后未自启 | 未 `chkconfig on` 或级别不对 | 重新 add/on 并查 `--list` |
| 系统无 chkconfig | 已是 systemd | 改用 unit 文件，勿套用本文 |

# 小结

1. 源码安装 Nginx 不会自动注册服务，需要自备 init 或 systemd 单元。  
2. **先分清 init 还是 systemd**，再选配置方式。  
3. 任何 reload/start 都以「配置测试通过 + 进程存在」为验收标准。
