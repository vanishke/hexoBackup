---
title:  Docker Swarm模式下Nginx日志自动归档实现
categories: 
	- Docker
tags: 
	- Docker
	- Swarm
	- Nginx
	- Logrotate
	
date: 2026-04-16 11:43:13
updated: 2026-04-16 11:43:13
---
<!-- toc -->

# <span id="inline-blue">背景</span>

在 Docker Swarm 模式下运行 Nginx 时，如果 Nginx 将请求日志写入容器内文件（例如 `/var/log/nginx/access.log` / `error.log`），通常会将该目录 bind mount 到宿主机目录，方便集中查看与持久化。

本篇目标是实现：仅在本机进行日志轮转保留（自动归档），不引入 ELK/Loki/S3 等集中式日志系统。核心方案是：宿主机使用 `logrotate` 对挂载目录中的 Nginx 日志进行轮转/压缩/保留。

# <span id="inline-blue">环境信息</span>

宿主机系统版本：

```bash
[root@<HOSTNAME> logs]# cat /etc/redhat-release
AlmaLinux release 9.5 (Teal Serval)
```

# <span id="inline-blue">Nginx 日志关键配置</span>

`nginx.conf` 中与日志相关的关键配置如下：

```nginx
log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for" '
                      '$request_time $upstream_response_time $scheme $server_port $host $request_length';

#access_log  logs/access.log  main;
access_log  /var/log/nginx/access.log  main;

error_log  /var/log/nginx/error.log;
```

说明：

- Nginx 将访问日志写入 `/var/log/nginx/access.log`，错误日志写入 `/var/log/nginx/error.log`。
- 在 Swarm 部署时，通常会把容器的 `/var/log/nginx` 目录挂载到宿主机目录（例如 `/usr/local/docker/nginx/logs`），宿主机即可直接拿到日志文件。

# <span id="inline-blue">Docker Swarm 下的日志落盘方式</span>

典型做法是对 Nginx 服务做 bind mount，把容器的 `/var/log/nginx` 映射到宿主机目录（本机归档诉求下，日志留在本节点即可）：

```text
容器：/var/log/nginx/*.log  --->  宿主机：/usr/local/docker/nginx/logs/*.log
```

注意：

- 在 Swarm 场景中，服务任务可能重建，但只要日志目录是宿主机挂载目录，日志文件就不会随容器删除而丢失。
- 如果同一节点可能同时跑多个副本（`replicas > 1` 且调度到同一节点），要避免多个 task 写同一份日志文件（否则轮转会“打架”）。本篇前提是：同一节点对应该日志目录只有一个 Nginx 写入者（常见是 `global` 模式每节点一份，或 `replicas=1`）。

# <span id="inline-blue">logrotate 配置（自动轮转归档）</span>

`logrotate` 配置目录：

```text
/etc/logrotate.d/
```

在 `/etc/logrotate.d/` 下新增（或已存在）配置文件 `photoframe-nginx`，内容如下：

```conf
/usr/local/docker/nginx/logs/*.log {
    daily
    rotate 7
    copytruncate      
    missingok
    notifempty
    dateext
    create 0644 root root
    sharedscripts
	postrotate
		SERVICE_NAME='photoframe-nginx_photoframe-nginx'
		CID="$(/usr/bin/docker ps -q \
		  --filter "label=com.docker.swarm.service.name=${SERVICE_NAME}" \
		  --filter status=running | /usr/bin/head -n 1)"
		if /usr/bin/test -n "$CID"; then
		  /usr/bin/docker exec "$CID" nginx -s reopen >/dev/null 2>&1 || true
		fi
	endscript	
}
```

参数解释（逐项说明常用项的作用）：

- **`/usr/local/docker/nginx/logs/*.log`**：匹配需要轮转的目标日志文件（宿主机挂载目录里的 `*.log`）。
- **`create 0644 root root`**：轮转后创建新的空日志文件，并设置权限/属主/属组（避免轮转后 nginx 因权限写不进去）。
- **`daily`**：按天轮转（每天触发一次轮转逻辑）。
- **`rotate 7`**：保留 7 份历史归档（超过数量会删除最旧的）。
- **`copytruncate`**：先把当前日志复制为归档文件，再把原文件截断为 0，进程仍继续写同一个文件名；优点是无需切换文件句柄也能完成轮转，缺点是在极端高并发写入窗口可能出现少量丢行或重复。
- **`missingok`**：目标文件不存在时不报错（例如某些日志暂时没生成）。
- **`notifempty`**：目标文件为空则不轮转（避免产生大量空归档）。
- **`dateext`**：归档文件名追加日期后缀（例如 `access.log-20260416`）；如需自定义格式可配 `dateformat -%Y%m%d`。
- **`compress / delaycompress`**：历史日志压缩；`delaycompress` 表示延迟一轮再压缩，避免刚轮转的文件仍被短暂占用导致问题（你当前配置是 `copytruncate`，且未启用压缩，需要压缩时再改）。
- **`sharedscripts`**：多个日志匹配到同一段配置时，`postrotate/ prerotate` 脚本只执行一次（避免对同一服务重复 `reopen`）。
- **`postrotate ... endscript`**：轮转完成后执行脚本。本例通过 `docker exec ... nginx -s reopen` 让 nginx 重新打开日志文件句柄，确保轮转后继续写入新文件而不是写到旧文件上。

# <span id="inline-blue">验证 logrotate 是否生效</span>

## <span id="inline-blue">手动执行一次</span>

1）先用调试模式查看会做哪些动作（不会真的轮转）：

```bash
logrotate -d /etc/logrotate.d/photoframe-nginx
```

2）确认无误后，用强制执行验证轮转结果：

```bash
logrotate -vf /etc/logrotate.d/photoframe-nginx
```

执行后检查目录：

```bash
ls -lh /usr/local/docker/nginx/logs/
```

你应该能看到类似：

- `access.log`（被截断后继续写入的新文件）
- `access.log-YYYYMMDD` 或 `access.log-YYYYMMDD.gz`（历史归档）
- `error.log` 同理

## <span id="inline-blue">查看是否由 systemd timer / cron 自动触发</span>

AlmaLinux 9 通常是 systemd timer 驱动 `logrotate`（也可能存在 cron 兜底，取决于安装与配置）。

1）查看是否存在 `logrotate.timer`：

```bash
systemctl list-timers --all | grep -i logrotate
```

2）查看 timer 详情（下次运行时间/是否启用）：

```bash
systemctl status logrotate.timer
systemctl cat logrotate.timer
```

3）查看实际执行的 service（具体调用的命令）：

```bash
systemctl status logrotate.service
systemctl cat logrotate.service
```

4）查看最近执行日志：

```bash
journalctl -u logrotate.service --since "7 days ago"
```

5）查看 logrotate 状态文件（证明“跑过”）：

```bash
ls -l /var/lib/logrotate/status /var/lib/logrotate.status 2>/dev/null
```

## <span id="inline-blue">systemd 定时执行失败但手动执行正常（ProtectSystem 权限限制）</span>

现象是：手动执行 `logrotate -vf /etc/logrotate.d/photoframe-nginx` 正常，但通过 systemd timer 触发的 `logrotate.service` 失败。

查看日志：

```text
Apr 23 00:00:00 <HOSTNAME> systemd[1]: Starting Rotate log files...
Apr 23 00:00:00 <HOSTNAME> logrotate[1205370]: error: error opening /usr/local/docker/nginx/logs/access.log
Apr 23 00:00:00 <HOSTNAME> systemd[1]: logrotate.service: Main process exited, code=exited, status=1/...
Apr 23 00:00:00 <HOSTNAME> systemd[1]: logrotate.service: Failed with result 'exit-code'.
Apr 23 00:00:00 <HOSTNAME> systemd[1]: Failed to start Rotate log files.
```

原因是：部分发行版的 `logrotate.service` 默认启用了 `ProtectSystem=full` 等加固策略，导致 service 进程对 **未显式放行的路径** 只有只读权限（即使实际运行用户是 root），从而在 `/usr/local/docker/nginx/logs` 下执行轮转时出现“创建/写入失败”。

解决方式是给 `logrotate.service` 增加 `ReadWritePaths` 放行 Nginx 日志目录。

示例（逻辑等价于你直接在 unit 里加的配置）：
vim /usr/lib/systemd/system/logrotate.service
```ini
[Unit]
Description=Rotate log files
Documentation=man:logrotate(8) man:logrotate.conf(5)
RequiresMountsFor=/var/log
ConditionACPower=true

[Service]
Type=oneshot
ExecStart=/usr/sbin/logrotate /etc/logrotate.conf

ReadWritePaths=/var/log
ReadWritePaths=/var/lib/logrotate
ReadWritePaths=/usr/local/docker/nginx/logs

# hardening options
ProtectSystem=full
```

修改后重载并重启：

```shell
systemctl daemon-reload
systemctl restart logrotate.service
```

验证放行目录是否生效：

```shell
systemctl show logrotate.service -p ReadWritePaths
```

# <span id="inline-blue">常见问题与注意事项</span>

## <span id="inline-blue">同节点多副本写同一目录</span>

如果某节点同时运行多个 Nginx task，并且都挂载到同一个宿主机日志目录且写同名文件，会导致：

- 日志混写；
- `logrotate` 轮转时互相影响，甚至产生异常轮转结果。

建议保证 同节点同一路径只有一个写入者（例如使用 `global` 或确保 `replicas=1`），或者按 task/节点拆分日志目录与文件名。

## <span id="inline-blue">权限问题</span>

确保容器内 Nginx 写日志用户对挂载目录有写权限；同时宿主机执行轮转的用户（本例为 root）对目录有读写权限。若系统启用了更严格的权限策略（某些 RHEL 系发行版），可在配置段内增加 `su root root` 来明确以 root 身份轮转（否则可能出现 “permission denied” 或轮转脚本不执行）。

# <span id="inline-blue">总结</span>

在 Docker Swarm 下，如果 Nginx 以“写文件日志 + 挂载宿主机目录”的方式落盘，并且只需要本机轮转保留（归档），最稳妥的方式是：在每个节点上使用 `logrotate` 对挂载目录的 `*.log` 进行 `daily + rotate + compress` 轮转。该方式与容器生命周期解耦，容器重建不影响历史归档文件。

