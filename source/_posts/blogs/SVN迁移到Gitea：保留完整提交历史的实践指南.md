---
title: SVN迁移到Gitea
categories:
	- Git
tags:
	- SVN
	- Gitea
	- git-svn

date: 2026-07-06 16:39:27
updated: 2026-07-06 16:39:27
---
<!-- toc -->

# <span id="inline-blue">概述</span>

本文记录将公司 SVN 项目（标准「序号 + 项目名」结构）迁移为 Git 仓库并推送到 Gitea 的完整流程，以某 Java 微服务项目为例。迁移工具采用 **Git 自带的 `git svn`**（Git Bash 环境下已验证可用）。

文中涉及的服务器地址、仓库名、人员信息均已脱敏，实际迁移时请替换为真实值。。

| 项 | 说明 |
|----|------|
| 迁移工具 | `git svn`（Git for Windows 内置） |
| 目标平台 | Gitea |
| 迁移范围 | `02.src/trunk` 源码主干及提交历史 |
| 默认分支 | `main`（与 Gitea 默认分支一致） |

**环境示例：**

| 角色 | 示例地址 |
|------|----------|
| SVN 大仓库根 | `http://<svn-host>/<repo-root>` |
| SVN 项目目录 | `XX.ProjectName` |
| SVN 源码 trunk | `http://<svn-host>/<repo-root>/XX.ProjectName/02.src/trunk` |
| Gitea 仓库 | `http://<gitea-host>:<port>/<org>/ProjectName.git` |

# <span id="inline-blue">迁移目标</span>

| 目标 | 说明 |
|------|------|
| 保留提交历史 | 作者、时间、提交说明完整保留 |
| 正确识别分支与标签 | `branches`、`tags` 作为 Git ref，不作为普通目录带入主分支 |
| 源码与文档分离 | `01.doc`（转测资料归档）不进入日常开发仓库 |
| 规范默认分支 | 本地 `master` 重命名为 `main` 后推送 Gitea |

# <span id="inline-blue">迁移范围说明</span>

## SVN 项目目录结构

```
XX.ProjectName/
├── 01.doc/              # 版本转测资料归档（不迁移到源码 Git 仓库）
└── 02.src/
    ├── trunk/           # 日常开发源码（迁移目标）
    ├── branches/        # SVN 分支
    └── tags/            # SVN 标签
```

## 只迁移 trunk 会包含什么、不包含什么

| 范围 | 是否进入 Git 源码仓库 |
|------|----------------------|
| `02.src/trunk` 下全部源码及提交历史 | 是 |
| `02.src/branches`、`02.src/tags` | 作为 Git ref 迁移，不作为目录出现在主分支 |
| `01.doc` | 否 |

若业务上也需要保留 `01.doc` 的历史，建议单独建归档 Git 仓库，或保留 SVN 只读访问。

## 关键认知：init 阶段必须指定布局

迁移时**不能**使用下面这种配置方式：

```bash
git svn init http://<svn-host>/<repo-root>
git config svn.trunk "XX.ProjectName/02.src/trunk"
git config svn.branches "XX.ProjectName/02.src/branches"
git config svn.tags "XX.ProjectName/02.src/tags"
```

`git svn` **不识别** `svn.trunk`、`svn.branches`、`svn.tags` 这类配置项。错误配置会导致 `git svn fetch` 把项目根目录整体当成一个普通分支迁移，最终 `main` 分支里会出现：

```
01.doc/
02.src/trunk/
02.src/branches/
02.src/tags/
```

正确做法是在 `git svn init` 时通过 `-T`、`-b`、`-t` 明确指定 SVN 布局。

# <span id="inline-blue">环境要求</span>

| 项 | 建议 |
|----|------|
| 操作系统 | Windows（Git Bash / MINGW64）或 Linux |
| 磁盘 | 预留足够空间（大仓库 `.git` 可达数 GB） |
| 网络 | 可稳定访问 SVN 服务器与 Gitea |

```bash
git --version
git svn --version
svn --version
```

建议在 **Git Bash** 中执行，路径统一使用 Unix 风格（如 `/path/to/migrate`）。

# <span id="inline-blue">生成 authors.txt</span>

`authors.txt` 用于将 SVN 提交人（域账号、工号等）映射为 Git 要求的 `姓名 <邮箱>` 格式。迁移前必须先生成此文件。

## 步骤 1：导出 SVN 提交日志

以项目根目录为范围导出，可覆盖 trunk、branches、tags 的全部提交人：

```bash
svn log "http://<svn-host>/<repo-root>/XX.ProjectName" --xml > /path/to/migrate/svn-log.xml
```

若只需 trunk 范围的提交人，可缩小路径：

```bash
svn log "http://<svn-host>/<repo-root>/XX.ProjectName/02.src/trunk" --xml > /path/to/migrate/svn-log.xml
```

## 步骤 2：提取去重后的作者列表

```bash
grep '<author>' /path/to/migrate/svn-log.xml \
  | sed 's/.*<author>\(.*\)<\/author>.*/\1/' \
  | sort -u > /path/to/migrate/svn-authors-raw.txt

cat /path/to/migrate/svn-authors-raw.txt
```

典型输出示例（已脱敏）：

```
DOMAIN\user001
DOMAIN\user002
user003
```

## 步骤 3：生成 authors.txt 初稿

```bash
while read author; do
  name=$(echo "$author" | sed 's/.*\\//')
  echo "$author = $name <${name}@example.com>"
done < /path/to/migrate/svn-authors-raw.txt > /path/to/migrate/authors.txt
```

## 步骤 4：手工校对

将右侧邮箱替换为真实姓名和公司邮箱：

```
DOMAIN\user001 = 张三 <zhangsan@example.com>
DOMAIN\user002 = 李四 <lisi@example.com>
user003 = 王五 <wangwu@example.com>
```

| 规则 | 说明 |
|------|------|
| 等号左边 | 必须与 SVN `<author>` **完全一致**（含域前缀、大小写） |
| 等号右边 | Git 提交人格式：`显示名 <邮箱>` |
| 未映射后果 | 迁移后显示为 `(no author)` 或原始 SVN 账号 |

**安全要求：**

- `authors.txt` 含真实姓名与邮箱，**不得**提交到公开仓库。
- 建议放在迁移工作目录外，通过 `git config svn.authorsfile` 引用绝对路径。

> **备选方式（无需 XML）**：
>
> ```bash
> svn log "http://<svn-host>/<repo-root>/XX.ProjectName" -q \
>   | grep '^r' | awk -F'|' '{print $2}' | sed 's/^ //;s/ $//' | sort -u
> ```

# <span id="inline-blue">核心迁移步骤</span>

## 创建本地工作目录

```bash
mkdir -p /path/to/migrate/ProjectName
cd /path/to/migrate/ProjectName
```

## 初始化 git-svn

```bash
git svn init http://<svn-host>/<repo-root>/XX.ProjectName \
  -T 02.src/trunk \
  -b 02.src/branches \
  -t 02.src/tags \
  --no-metadata
```

| 参数 | 含义 |
|------|------|
| `-T 02.src/trunk` | SVN 主干源码目录 |
| `-b 02.src/branches` | SVN 分支目录 |
| `-t 02.src/tags` | SVN 标签目录 |
| `--no-metadata` | 不在提交说明中追加 `git-svn-id` |

## 配置作者映射

```bash
git config svn.authorsfile /path/to/migrate/authors.txt
```

## 拉取 SVN 历史

```bash
git svn fetch --log-window-size 1000
```

`--log-window-size 1000` 控制 git-svn 查询 SVN log 的窗口大小，适合大仓库迁移。

若出现如下警告，通常可忽略：

```
W: Ignoring error from SVN, path probably does not exist
W: Do not be alarmed at the above message git-svn is just searching aggressively for old history.
```

这是早期 revision 中路径尚不存在，git-svn 正在向前扫描历史。只要仍在推进（如 `Checked through r20000`），继续等待即可。

按 revision 分段拉取（可选）：

```bash
git svn fetch -r 1:1000
git svn fetch -r 1001:2000
git svn fetch   # 补齐到最新
```

# <span id="inline-blue">检出分支与空目录处理</span>

## 检出主分支并规范分支名

```bash
git checkout -b master refs/remotes/origin/trunk
git branch -M main
git branch -v
```

## 保留空目录结构

Git 不跟踪空目录。SVN 迁移后如需保留空目录结构，添加 `.gitkeep` 占位文件。

列出所有空目录：

```bash
find . -type d -not -path './.git/*' -not -path './.git' -empty | sort
```

批量生成 `.gitkeep`：

```bash
find . -type d -not -path './.git/*' -not -path './.git' -empty \
  ! -exec test -f '{}/.gitkeep' \; \
  -exec touch '{}/.gitkeep' \;
```

提交：

```bash
git add -A
git status
git commit -m "为空目录添加 .gitkeep 占位文件，保留目录结构"
```

# <span id="inline-blue">Git 仓库配置</span>

## 提交人信息

```bash
git config --local user.name "<你的姓名>"
git config --local user.email "<your.email@example.com>"
```

## 大小写策略

```bash
git config core.ignorecase          # 查看当前值
git config core.ignorecase false    # 仓库级：严格区分大小写
```

> Windows 文件系统默认不区分大小写。若项目中存在仅大小写不同的文件名，建议先统一命名规范，再调整该配置。

# <span id="inline-blue">推送到 Gitea</span>

在 Gitea 创建**空仓库**（**不要**勾选 README 初始化），然后执行：

```bash
git remote -v
git remote remove origin   # 若已有错误远程

git remote add origin http://<gitea-host>:<port>/<org>/ProjectName.git
git push -u origin main
git push origin --tags     # 可选：推送标签
```

若本地分支仍为 `master` 而远程默认 `main`：

```bash
git branch -M main
git push -u origin main
```

# <span id="inline-blue">迁移结果验证</span>

```bash
# 1. 确认 git-svn 布局配置
git config --get-regexp "svn-remote"

# 期望输出示例：
# svn-remote.svn.url http://<svn-host>/<repo-root>/XX.ProjectName
# svn-remote.svn.fetch 02.src/trunk:refs/remotes/origin/trunk
# svn-remote.svn.branches 02.src/branches/*:refs/remotes/origin/*
# svn-remote.svn.tags 02.src/tags/*:refs/remotes/origin/tags/*

# 2. 确认远程 refs
git for-each-ref refs/remotes

# 3. 确认工作区根目录为源码内容（而非 02.src/trunk 子目录）
ls

# 4. 确认提交历史和作者映射
git log --oneline -20
git log --format="%an <%ae>" | sort -u
```

迁移正确时，仓库根目录应直接是源码内容（如 `pom.xml`、各服务模块、`docker`、`conf` 等），不应再包含 `02.src/trunk` 前缀。作者列表中不应出现 `(no author)`。

# <span id="inline-blue">常见问题</span>

| 问题 | 原因 | 处理 |
|------|------|------|
| main 含 `01.doc`、`02.src/trunk` 等 | init 未用 `-T/-b/-t`，`git config svn.trunk` 无效 | 重新迁移，init 时指定布局 |
| `--fetch-size` 报错 | `git svn fetch` 不支持该参数 | 使用 `--log-window-size` 或 `-r` 分段 |
| 提交人显示 `(no author)` | `authors.txt` 映射不完整 | 用 SVN log 补全作者后重新 fetch |
| `01.doc` 是否进源码仓库 | 不在 trunk 范围内 | 单独建归档仓库或保留 SVN 只读 |
| 本地 `master`、远程 `main` | 分支命名不一致 | `git branch -M main` 后推送 |
| `git svn fetch` 很慢 | 大仓库 revision 多 | 使用 `-r` 分段拉取，避免中断 |

# <span id="inline-blue">完整命令清单</span>

```bash
# ── 1. 提取 SVN 作者并生成 authors.txt ──
svn log "http://<svn-host>/<repo-root>/XX.ProjectName" --xml > /path/to/migrate/svn-log.xml

grep '<author>' /path/to/migrate/svn-log.xml \
  | sed 's/.*<author>\(.*\)<\/author>.*/\1/' \
  | sort -u > /path/to/migrate/svn-authors-raw.txt

while read author; do
  name=$(echo "$author" | sed 's/.*\\//')
  echo "$author = $name <${name}@example.com>"
done < /path/to/migrate/svn-authors-raw.txt > /path/to/migrate/authors.txt

# 手工编辑 authors.txt，将邮箱替换为真实信息

# ── 2. 初始化并拉取 ──
mkdir -p /path/to/migrate/ProjectName
cd /path/to/migrate/ProjectName

git svn init http://<svn-host>/<repo-root>/XX.ProjectName \
  -T 02.src/trunk \
  -b 02.src/branches \
  -t 02.src/tags \
  --no-metadata

git config svn.authorsfile /path/to/migrate/authors.txt
git svn fetch --log-window-size 1000

# ── 3. 检出、补全空目录、规范分支 ──
git checkout -b master refs/remotes/origin/trunk

find . -type d -not -path './.git/*' -not -path './.git' -empty \
  ! -exec test -f '{}/.gitkeep' \; \
  -exec touch '{}/.gitkeep' \;

git add -A && git commit -m "为空目录添加 .gitkeep 占位文件，保留目录结构"
git branch -M main

# ── 4. 配置提交人并推送 ──
git config --local user.name "<你的姓名>"
git config --local user.email "<your.email@example.com>"

git remote add origin http://<gitea-host>:<port>/<org>/ProjectName.git
git push -u origin main
```

完成以上迁移后，团队成员可通过 `git clone` 获取新仓库。
