# Cursor Gitea远程仓库身份验证失败

> 本文记录一次在 Cursor IDE 中使用内网 Gitea 时，出现「未能对 git remote 进行身份验证」问题的完整分析与处理过程，供后续遇到类似问题时参考。

---

## 问题现象

在 Cursor 中对 Gitea 远程仓库执行 **Pull / Push / Sync** 时，IDE 弹出错误：

```text
未能对 git remote 进行身份验证
（Failed to authenticate to git remote）
```

与此同时，部分 Git 操作的表现并不一致——有时终端可以正常拉取，有时 IDE 与终端均失败，容易误判为网络或 Cursor 本身的问题。

---

## 环境信息

| 项目 | 配置 |
|------|------|
| 操作系统 | Windows 10 |
| IDE | Cursor |
| Git 版本 | 2.47.1（`G:\Git\Git\cmd\git.exe`） |
| 远程仓库 | `http://10.10.5.238:3000/COSHIP/Photoframe-Cloud.git` |
| 代码托管 | 内网 Gitea |
| 凭据助手 | Git Credential Manager（`credential.helper=manager`） |
| 认证方式 | OAuth 免密登录（Cursor 配置） |
| HTTP 代理 | `http://127.0.0.1:7892`（全局 Git 代理） |

Git 全局配置中与凭据相关的片段如下：

```ini
[credential "http://10.10.5.238:3000"]
    provider = generic

[http]
    proxy = http://127.0.0.1:7892
```

Windows 凭据管理器中存在以下 Git 相关条目：

- `git:http://10.10.5.238:3000`
- `git:http://refresh_token.10.10.5.238:3000`

其中用户名为 `OAUTH_USER`，表明当前走的是 **OAuth Token** 认证链路，而非简单的「用户名 + 静态密码」。

---

## 排查过程

### 1. 确认远程地址与连通性

```powershell
git remote -v
```

输出：

```text
origin  http://10.10.5.238:3000/COSHIP/Photoframe-Cloud.git (fetch)
origin  http://10.10.5.238:3000/COSHIP/Photoframe-Cloud.git (push)
```

远程地址为内网 HTTP 协议，无 HTTPS 证书问题。

### 2. 终端验证 Git 操作

```powershell
git ls-remote origin
git fetch origin
git push --dry-run origin HEAD
```

部分时段内，终端命令可以正常执行，说明：

- 内网 Gitea 服务可达；
- 本地 Git 与 Credential Manager 基本可用；
- 问题更可能出在 **凭据过期/不一致**，而非单纯的网络故障。

### 3. 检查 Windows 凭据

通过「控制面板 → 凭据管理器 → Windows 凭据」，或命令行：

```powershell
cmdkey /list
```

发现 Gitea 相关凭据以 OAuth 形式存储，存在独立的 refresh token 条目：

```text
LegacyGeneric:target=git:http://10.10.5.238:3000
LegacyGeneric:target=git:http://refresh_token.10.10.5.238:3000
```

### 4. 回顾近期变更

进一步核对操作历史后发现关键线索：

> **Gitea 管理后台修改了对应账号的登录密码**，而本地 Windows 凭据仍保存着旧的 OAuth / refresh token 信息。

---

## 根因定位

问题根因可以归纳为以下链路：

```text
Cursor 配置 Gitea OAuth 免密登录
        ↓
Windows 凭据管理器缓存 access token / refresh token
        ↓
Gitea 后台修改账号登录密码
        ↓
旧 refresh token 失效，无法刷新获取新 access token
        ↓
Cursor / Git 请求远程仓库时身份验证失败
```

### 为什么「改了 Gitea 密码」会影响 Git？

表面上看，Git 使用的是缓存凭据，似乎与 Web 登录密码无关。但在 **OAuth 认证模式** 下：

1. 首次免密登录时，Git Credential Manager 向 Gitea 申请 OAuth 授权，并将 **access token** 与 **refresh token** 写入 Windows 凭据管理器；
2. access token 过期后，凭据助手会使用 refresh token 自动续期；
3. 当 Gitea 账号密码在后台被修改，与之关联的旧 refresh token 往往随之 **失效**；
4. 此时 Cursor 或终端发起 Pull/Push，凭据助手尝试刷新 token 失败，最终报错「未能对 git remote 进行身份验证」。

因此，这不是 Cursor 的 Bug，而是 **OAuth 凭据与账号状态不同步** 导致的预期行为。

---

## 解决方案

### 最终有效操作

1. 打开 **Windows 凭据管理器**；
2. 找到并编辑（或删除后重建）以下条目：
   - `git:http://refresh_token.10.10.5.238:3000`
   - （如有需要）`git:http://10.10.5.238:3000`
3. 将凭据更新为 Gitea 当前有效的认证信息（新密码或 Personal Access Token）；
4. 重新执行：

```powershell
git pull origin
```

操作恢复正常。

---

## 其他可选修复手段

若更新 refresh token 凭据后仍有个别场景失败，可依次尝试以下补充措施。

### 方案 A：彻底清理后重新认证

删除上述两条 Gitea 凭据，再执行一次 `git pull`，按提示重新输入：

- **用户名**：Gitea 账号
- **密码**：Gitea 登录密码，或更推荐 Personal Access Token

### 方案 B：内网 Gitea 绕过 HTTP 代理

全局 Git 代理指向 `127.0.0.1:7892`，在代理未启动或路由异常时，可能影响内网地址访问。可在 `~/.gitconfig` 中为 Gitea 单独禁用代理：

```ini
[http "http://10.10.5.238:3000"]
    proxy =
```

### 方案 C：统一 Cursor 与终端使用的 Git

在 Cursor `settings.json` 中指定 Git 路径，避免 IDE 与终端走不同的 Git 可执行文件或凭据流程：

```json
{
    "git.path": "G:\\Git\\Git\\cmd\\git.exe"
}
```

---

## 经验总结与最佳实践

### 1. 区分两种认证方式

| 方式 | 特点 | 密码变更影响 |
|------|------|--------------|
| OAuth 免密登录 | Cursor / GCM 自动管理 token | **会**导致 refresh token 失效 |
| Personal Access Token | 手动生成，长期有效（可设过期） | 一般 **不受** 登录密码变更影响 |

**建议**：Git 操作优先使用 **Personal Access Token**，与 Web 登录密码解耦，减少运维干扰。

在 Gitea 中生成 Token 的路径：

```text
用户设置 → 应用（Applications）→ 生成 Token
```

所需权限至少包括：`read:repository`、`write:repository`。

### 2. 修改 Gitea 密码后的检查清单

- [ ] 检查 Windows 凭据管理器中的 `git:http://*` 条目
- [ ] 删除或更新 `refresh_token` 相关凭据
- [ ] 终端执行 `git fetch` / `git pull` 验证
- [ ] Cursor 源代码管理面板执行 Sync 验证

### 3. 快速定位思路

遇到「Git 身份验证失败」时，可按以下顺序排查：

```text
远程地址是否正确
    → 内网/VPN 是否连通
        → Windows 凭据是否过期
            → 近期是否修改过 Gitea 密码
                → OAuth refresh token 是否需要更新
                    → 代理/IDE Git 路径是否一致
```

---

## 结语

本次问题的表面现象是 Cursor 提示「未能对 git remote 进行身份验证」，真正根因是 **Gitea 账号密码变更后，Windows 中缓存的 OAuth refresh token 未同步更新**。

更新 `git:http://refresh_token.10.10.5.238:3000` 对应凭据后，`git pull` 立即恢复正常。对于长期维护内网 Gitea 仓库的场景，推荐改用 Personal Access Token，并在团队内建立「改密码 → 同步 Git 凭据」的操作习惯，可显著降低同类问题复发概率。

---

*文档编写日期：2026-08-27*
