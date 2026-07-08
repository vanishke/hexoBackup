---
title: Cursor Remote-SSH 免密登录远程开发服务器
categories:
	- Cursor
tags:
	- Cursor
	- Remote-SSH
	- SSH

date: 2026-07-08 17:39:45
updated: 2026-07-08 17:39:45
---
<!-- toc -->

# <span id="inline-blue">概述</span>

本文记录如何在 **Windows 开发机**使用 **Cursor + Remote-SSH** 实现**免密 SSH 登录**到一台 Ubuntu 代码开发服务器，并在服务器上打开代码目录进行日常开发。

文中涉及的 **服务器地址、仓库名、用户名等均已脱敏**，并使用“随机示例数据”替代真实信息，便于阅读理解且不泄露内网信息。

| 项 | 说明 |
|----|------|
| 目标 | Windows 上用 Cursor Remote-SSH 免密登录 Ubuntu 开发服务器 |
| 适用场景 | 服务器资源更强、统一构建/依赖环境、代码不落地本机 |
| 关键点 | 本地密钥 + `~/.ssh/config` + Cursor 远程连接 |

**环境示例：**

| 角色 | 示例地址 |
|------|----------|
| 远程开发服务器 | `devbox-02 (10.23.45.67:22)` |
| 远程项目目录 | `/data/workspace/photo-frame-cloud` |

参见下篇（远程服务器免密推送到 Gitea）：[开发服务器免密登录Gitea并实现Git推送（下）](./开发服务器免密登录Gitea并实现Git推送（下）.md)

# <span id="inline-blue">环境要求</span>

> 版本号以“本教程验证环境”为例，和你的实际环境不一致也通常不影响，核心是 Remote-SSH 能工作、SSH 能免密登录。

| 项 | 建议/示例 |
|----|-----------|
| Windows | Windows 11 Pro 23H2 |
| Cursor | 0.50.x（任意近期版本均可） |
| Git for Windows | 2.47.0 |
| OpenSSH Client | Windows 自带 OpenSSH（可选） |
| 远程服务器 OS | Ubuntu 18.04/20.04/22.04（示例：Ubuntu 18.04.6 LTS） |

**Remote-SSH 插件信息（示例）：**

| 项 | 值 |
|----|----|
| 插件名称 | Remote - SSH |
| 提供者 | Microsoft |
| 版本 | 0.113.1 |

# <span id="inline-blue">核心步骤</span>

## 安装 Cursor 与 Remote-SSH 插件

1. 安装 Cursor（略）。
2. 打开扩展市场（`Ctrl+Shift+X`），搜索并安装 `Remote - SSH`。

> 安装完成后，左下角会出现远程连接入口（形如 `><`），并可在命令面板看到 `Remote-SSH:` 相关命令。

## 生成本地 SSH 密钥（Windows）

在 **PowerShell** 或 **Git Bash** 执行：

```bash
ssh-keygen -t ed25519 -C "dev.user@example.com"
```

默认会生成：

```
~/.ssh/id_ed25519
~/.ssh/id_ed25519.pub
```

> **安全要求：**私钥文件 `id_ed25519` 不要拷贝到群聊/邮件，不要提交到仓库；如设置了 passphrase，建议配合系统密钥代理使用。

## 将公钥部署到远程开发服务器

### 方式一：ssh-copy-id（最省事）

如果你本地安装了 `ssh-copy-id`（Git Bash / WSL 常见）：

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub devuser@10.23.45.67
```

### 方式二：手动追加 authorized_keys（通用）

1. 本地查看公钥内容：

```bash
cat ~/.ssh/id_ed25519.pub
```

2. 登录远程服务器后，将公钥追加到：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "<粘贴你的公钥一整行>" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## 配置本地 SSH Config（建议必做）

编辑本地 `~/.ssh/config`，添加一个易读别名：

```sshconfig
Host devbox-02
    HostName 10.23.45.67
    User devuser
    Port 22
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

| 参数 | 含义 |
|------|------|
| `Host` | 连接别名（Cursor 里也会显示） |
| `HostName` | 服务器 IP/域名（示例已脱敏） |
| `IdentityFile` | 指定私钥路径，避免选错密钥 |
| `ServerAliveInterval` | 保活心跳，减少断连 |

本地验证免密是否成功：

```bash
ssh devbox-02
```

预期：不再提示输入密码（如设置了私钥口令，可能提示输入 passphrase）。

## 在 Cursor 中发起 Remote-SSH 连接

1. 打开命令面板 `Ctrl+Shift+P`。
2. 选择 `Remote-SSH: Connect to Host...`。
3. 选择 `devbox-02`（即 `~/.ssh/config` 里配置的 `Host`）。
4. 首次连接会自动在远程安装服务端组件（耗时取决于网络与服务器性能）。

连接成功后，左下角会显示类似：

```
SSH: devbox-02
```

## 打开远程项目目录并开发

连接到远程后：

1. `File -> Open Folder` 打开远程目录，例如：

```
/data/workspace/photo-frame-cloud
```

2. 打开集成终端（`` Ctrl+` ``），终端会在远程服务器执行命令：

```bash
pwd
ls -la
```

# <span id="inline-blue">配置与验证</span>

| 验证项 | 命令/现象 | 通过标准 |
|------|-----------|----------|
| SSH 免密登录 | `ssh devbox-02` | 不再提示输入服务器密码 |
| Cursor 远程状态 | 左下角显示 `SSH: devbox-02` | 连接稳定、可打开远程文件 |
| 终端是否远程 | 终端执行 `hostname` | 输出远程主机名（示例：`devbox-02`） |

# <span id="inline-blue">常见问题</span>

| 问题 | 原因 | 处理 |
|------|------|------|
| Cursor 连接时要求输服务器密码 | 公钥未部署或权限不对 | 检查 `~/.ssh/authorized_keys` 是否包含公钥且权限 `700/600` |
| `Permission denied (publickey)` | `IdentityFile` 指向错误密钥 | 在 `~/.ssh/config` 明确 `IdentityFile`，并用 `ssh -v devbox-02` 查看选用的 key |
| 连接一段时间后断开 | 网络抖动/空闲断开 | 加 `ServerAliveInterval/CountMax`；必要时调整服务器端 `sshd_config` |

# <span id="inline-blue">完整命令清单</span>

```bash
# ── 1. Windows 本地：生成密钥 ──
ssh-keygen -t ed25519 -C "dev.user@example.com"

# ── 2. Windows 本地：写 SSH config（示例）──
#   编辑 ~/.ssh/config，加入 devbox-02 段

# ── 3. Windows 本地：验证免密 ──
ssh devbox-02

# ── 4. 远程服务器：创建并设置 authorized_keys（手动方式）──
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "<粘贴你的公钥一整行>" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

完成以上配置后，继续按下篇将“远程服务器 → Gitea”也配置为免密推送：参见 [开发服务器免密登录Gitea并实现Git推送](./开发服务器免密登录Gitea并实现Git推送.md)。

