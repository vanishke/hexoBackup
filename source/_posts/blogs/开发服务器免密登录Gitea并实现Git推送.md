---
title: 开发服务器免密登录 Gitea 并实现 Git 推送
categories:
	- 开发环境
tags:
	- Git
	- Gitea
	- SSH
	- 免密推送

date: 2026-07-01 17:39:33
updated: 2026-07-01 17:39:33
---
<!-- toc -->

# <span id="inline-blue">概述</span>

本文承接上篇 Remote-SSH 远程开发，继续解决一个常见痛点：**在远程开发服务器上 `git push` 时仍需要输入用户名/密码**。

核心思路是让“远程开发服务器 → Gitea”走 **SSH 协议 + SSH Key**，并确保仓库 `origin` 使用 **SSH remote**（而不是 HTTP remote）。

文中涉及的 **服务器地址、仓库名、用户名等均已脱敏**，并使用“随机示例数据”替代真实信息，便于阅读理解且不泄露内网信息。

| 项 | 说明 |
|----|------|
| 目标 | 在远程开发服务器上免密推送到 Gitea |
| 关键点 | `~/.ssh/config` 指定端口/用户/密钥 + `git remote set-url` 切换到 SSH |
| 常见误区 | Gitea 配了 SSH Key，但 remote 仍是 `http://...`，导致必须输入账号密码 |

**环境示例：**

| 角色 | 示例地址 |
|------|----------|
| 远程开发服务器 | `devbox-02 (10.23.45.67)` |
| Gitea Web | `http://10.88.1.20:3000` |
| Gitea SSH | `git.lab.local:2222` |
| 仓库路径 | `ACME/PhotoFrame-Cloud` |

参见上篇（Cursor Remote-SSH 免密登录）：[Cursor-Remote-SSH免密登录远程开发服务器](./Cursor-Remote-SSH免密登录远程开发服务器.md)

# <span id="inline-blue">环境要求</span>

| 项 | 建议/示例 |
|----|-----------|
| 远程开发服务器 OS | Ubuntu 18.04/20.04/22.04（示例：Ubuntu 18.04.6 LTS） |
| Git 版本（远程） | 2.25+（示例：2.34.1） |
| SSH 客户端（远程） | OpenSSH 7.6+（示例：7.6p1） |
| Gitea | 1.21.x（示例：1.21.11） |

# <span id="inline-blue">核心步骤</span>

## 在远程开发服务器生成 SSH Key（用于推送）

在远程开发服务器执行：

```bash
ssh-keygen -t ed25519 -C "build-bot@example.com"
```

默认生成：

```
~/.ssh/id_ed25519
~/.ssh/id_ed25519.pub
```

> **安全要求：**不要把私钥复制到任何文档/仓库；如果多人共用服务器，建议使用“个人账号 + 个人密钥”，避免共享密钥难追责。

## 将公钥添加到 Gitea

查看远程服务器公钥：

```bash
cat ~/.ssh/id_ed25519.pub
```

登录 Gitea Web（示例：`http://10.88.1.20:3000`）后：

- 个人设置 -> SSH Keys -> Add Key
- 粘贴公钥全文并保存

## 配置远程服务器 `~/.ssh/config`（指定 Gitea SSH 端口/用户/密钥）

编辑远程服务器 `~/.ssh/config`：

```sshconfig
Host git.lab.local
    HostName 10.88.1.20
    User git
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
```

| 参数 | 含义 |
|------|------|
| `Host` | 连接别名（建议用和团队一致的名字） |
| `User` | Gitea 的 SSH 用户（多数部署为 `git`，以实际为准） |
| `Port` | Gitea SSH 端口（不少环境不是 22） |
| `IdentityFile` | 该仓库推送所用私钥 |

验证 SSH 是否可用：

```bash
ssh -T git.lab.local
```

预期输出（示例，具体欢迎语可能不同）：

```
Hi there, build-bot! You've successfully authenticated, but Gitea does not provide shell access.
```

## 将 Git Remote 从 HTTP 切换为 SSH（关键）

进入项目目录（示例路径）：

```bash
cd /data/workspace/photo-frame-cloud
git remote -v
```

如果看到的是 HTTP remote（示例）：

```
origin  http://10.88.1.20:3000/ACME/PhotoFrame-Cloud.git (fetch)
origin  http://10.88.1.20:3000/ACME/PhotoFrame-Cloud.git (push)
```

改成 SSH remote：

```bash
git remote set-url origin "ssh://git.lab.local/ACME/PhotoFrame-Cloud.git"
git remote -v
```

预期：

```
origin  ssh://git.lab.local/ACME/PhotoFrame-Cloud.git (fetch)
origin  ssh://git.lab.local/ACME/PhotoFrame-Cloud.git (push)
```

## 免密推送验证

```bash
git push -u origin main
```

通过标准：不再提示输入用户名/密码，push 正常完成（或显示 `Everything up-to-date`）。

# <span id="inline-blue">配置与验证</span>

| 验证项 | 命令 | 通过标准 |
|------|------|----------|
| SSH key 生效 | `ssh -T git.lab.local` | 输出 “authenticated / no shell access” 类提示 |
| remote 协议正确 | `git remote -v` | `origin` 为 `ssh://...` 而非 `http(s)://...` |
| 推送免密 | `git push` | 不询问用户名/密码 |

# <span id="inline-blue">常见问题</span>

| 问题 | 原因 | 处理 |
|------|------|------|
| `git push` 仍要输入用户名密码 | remote 还是 HTTP | 用 `git remote -v` 确认并执行 `git remote set-url origin "ssh://git.lab.local/<org>/<repo>.git"` |
| `Permission denied (publickey)` | `~/.ssh/config` 用户/端口不对，或公钥未添加到 Gitea | `ssh -vT git.lab.local` 看用的 key；检查 Gitea SSH key 列表 |
| `Host key verification failed` | known_hosts 冲突或首次未确认 | 删除对应条目：`ssh-keygen -R "[10.88.1.20]:2222"` 后重试 |
| 多个密钥导致选错 | SSH 自动尝试了其他 key | 在 `~/.ssh/config` 固定 `IdentityFile`，必要时加 `IdentitiesOnly yes` |

# <span id="inline-blue">完整命令清单</span>

```bash
# ── 1. 远程服务器：生成用于 Gitea 的 SSH Key ──
ssh-keygen -t ed25519 -C "build-bot@example.com"

# ── 2. 远程服务器：配置 ~/.ssh/config（示例）──
# Host git.lab.local
#     HostName 10.88.1.20
#     User git
#     Port 2222
#     IdentityFile ~/.ssh/id_ed25519

# ── 3. 远程服务器：验证 SSH 连通性 ──
ssh -T git.lab.local

# ── 4. 远程服务器：切换 Git remote 为 SSH ──
cd /data/workspace/photo-frame-cloud
git remote -v
git remote set-url origin "ssh://git.lab.local/ACME/PhotoFrame-Cloud.git"
git remote -v

# ── 5. 远程服务器：免密推送验证 ──
git push -u origin main
```

完成以上步骤后，你的日常流程就是：Remote-SSH 连接远程服务器 → 编码 → `git push`（免密）→ 构建/部署。

