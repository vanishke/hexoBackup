---
title: Jenkins流水线配置
categories:
	- Jenkins
tags:
	- Jenkins
	- Pipeline
	- CI

date: 2026-06-12 15:36:05
updated: 2026-06-12 15:36:05
---
<!-- toc -->

# <span id="inline-blue">概述</span>

前置条件：已完成 [Jenkins部署](./Jenkins部署.md)。流水线文件位于项目根目录 `Jenkinsfile`，Harbor 使用乐此加密 HTTPS，无需 `insecure-registries`。

**当前环境示例：**

| 项 | 值 |
|----|-----|
| Jenkins | `http://<Jenkins节点IP>:<HTTP端口>` |
| Pipeline 任务名 | `<Pipeline任务名>` |
| Remote 触发 Token | `<Remote触发Token>` |
| SVN 仓库 URL | `svn://<SVN服务器IP>/<项目名>`（项目根目录，非 `trunk`） |
| Harbor 推送项目 | `<Harbor项目名-test>` |
| SVN 凭据 ID | `SVN-<项目名>` |
| Harbor 凭据 ID | `harbor-<项目名>` |

# <span id="inline-blue">流水线目标</span>

```
SVN 提交 → post-commit Hook 触发 Jenkins（推荐）
    ↓
Jenkins 检出 → mvn install → copy.sh
    ↓
docker build（上下文 docker/<项目名>/<服务名>）
    ↓
docker push → Harbor <Harbor项目名-test>
```

## 微服务与镜像

| 服务名 | Dockerfile | 构建上下文 |
|--------|------------|------------|
| app-gateway | `docker/<项目名>/app-gateway/Dockerfile` | `docker/<项目名>/app-gateway` |
| app-auth | `docker/<项目名>/app-auth/Dockerfile` | `docker/<项目名>/app-auth` |
| app-api-web | `docker/<项目名>/app-api-web/Dockerfile` | `docker/<项目名>/app-api-web` |
| app-api-mobile | `docker/<项目名>/app-api-mobile/Dockerfile` | `docker/<项目名>/app-api-mobile` |
| app-admin-biz | `docker/<项目名>/app-admin-biz/Dockerfile` | `docker/<项目名>/app-admin-biz` |
| app-admin-log | `docker/<项目名>/app-admin-log/Dockerfile` | `docker/<项目名>/app-admin-log` |
| app-scheduler | `docker/<项目名>/app-scheduler/Dockerfile` | `docker/<项目名>/app-scheduler` |

各上下文目录须包含 `bin/jattach`、`docker-compose-wait/wait`、`jar/*.jar`（jar 由 `copy.sh` 生成）。

## Harbor 镜像命名

```
<Harbor地址>:8443/<Harbor项目名-test>/<服务名>:<BUILD_NUMBER>
<Harbor地址>:8443/<Harbor项目名-test>/<服务名>:latest
```

| HARBOR_PROJECT | 说明 |
|----------------|------|
| `<Harbor项目名-test>` | Jenkins CI 与 Hook 默认推送目标 |
| `<Harbor项目名-prod>` | 生产发版时手动选择 |

# <span id="inline-blue">Jenkinsfile 与 SVN</span>

`Jenkinsfile` 须与 `pom.xml` 一同放在 SVN **仓库根目录**：

```bash
svn add Jenkinsfile
svn add docker/<项目名>/app-*/bin/jattach
svn add docker/<项目名>/app-*/docker-compose-wait/wait
svn commit -m "update CI pipeline and per-service build binaries"
```

| 配置项 | 值 |
|--------|-----|
| `SVN_URL` | `svn://<SVN服务器IP>/<项目名>` |
| `credentialsId`（SVN） | `SVN-<项目名>` |
| `credentialsId`（Harbor） | `harbor-<项目名>` |
| Global Tool | `jdk8`、`maven3` |
| 默认 `HARBOR_PROJECT` | `<Harbor项目名-test>` |
| 默认 `SERVICE` | `all` |

# <span id="inline-blue">创建 Pipeline 任务</span>

1. **New Item** → `<Pipeline任务名>` → **Pipeline**
2. **Pipeline script from SCM** → **Subversion**
3. Repository URL：`svn://<SVN服务器IP>/<项目名>`
4. Credentials：`SVN-<项目名>`
5. Script Path：`Jenkinsfile`
6. **Build Triggers** → 勾选 **Trigger builds remotely**，Authentication Token：`<Remote触发Token>`
7. **Build with Parameters** 首次验证：`HARBOR_PROJECT=<Harbor项目名-test>`，`SERVICE=all`

任务页 **不要** 额外勾选 Poll SCM（与 post-commit 或 `Jenkinsfile` 轮询叠加会导致重复构建，见下文）。

成功日志示例：

```
[Maven Build] BUILD SUCCESS
[Docker Build & Push] docker push <Harbor地址>:8443/<Harbor项目名-test>/app-gateway:1
Finished: SUCCESS
```

# <span id="inline-blue">自动触发</span>

## 推荐：SVN post-commit Hook

SVN 提交完成后，Hook 调用 Jenkins `buildWithParameters`，参数与 `Jenkinsfile` 一致。

**Jenkins 侧：**

- 任务 `<Pipeline任务名>` → **Trigger builds remotely** → Token：`<Remote触发Token>`
- Jenkins 用户 → **API Token**（**非**登录密码）

**SVN 侧（容器内路径 `/var/opt/svn/<项目名>/hooks/post-commit`）：**

须使用可执行文件 **`post-commit`**（由 `post-commit.tmpl` 复制改名，**勿只改 `.tmpl`**）。

```bash
#!/bin/sh
REPOS="$1"
REV="$2"

JENKINS_URL="http://<Jenkins节点IP>:<HTTP端口>"
JENKINS_USER="<Jenkins用户名>"
JENKINS_API_TOKEN="<API Token>"
JOB_NAME="<Pipeline任务名>"
BUILD_TOKEN="<Remote触发Token>"

/usr/bin/curl -s -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
  "${JENKINS_URL}/job/${JOB_NAME}/buildWithParameters?token=${BUILD_TOKEN}&SERVICE=all&HARBOR_PROJECT=<Harbor项目名-test>" \
  > /dev/null 2>&1 &

exit 0
```

```bash
chmod +x /var/opt/svn/<项目名>/hooks/post-commit
```

**SVN 容器须安装 curl：** 官方 `garethflowers/svn-server` 镜像默认无 `curl`，Hook 会静默失败。处理见 [SVN部署说明](./SVN部署说明.md) 第 10.4 节。

**连通性验证（在 SVN 容器内，测 Jenkins 而非外网）：**

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -u "<用户名>:<API Token>" \
  "http://<Jenkins节点IP>:<HTTP端口>/job/<Pipeline任务名>/buildWithParameters?token=<Remote触发Token>&SERVICE=all&HARBOR_PROJECT=<Harbor项目名-test>"
```

返回 `201` 或 `302` 表示触发成功。

> API Token **勿写入 SVN 仓库**；泄露须撤销并重新生成。详见 [Jenkins部署说明](./Jenkins部署说明.md) 凭据配置一节。

## 备选：Poll SCM（轮询）

`Jenkinsfile` 中可配置：

```groovy
triggers { pollSCM('H/5 * * * *') }
```

**工作机制：** 定时**检查** SVN 是否有新 revision，**仅有变更时才触发构建**，不是每到点就构建。

| 场景 | 行为 |
|------|------|
| 轮询时刻无新提交 | 不触发构建 |
| 轮询时刻有新提交 | 触发一次构建 |
| 与 post-commit 同时启用 | **同一次提交可能触发两次构建**（见下文） |

任务页 **不要重复勾选** Poll SCM。

## 重复构建：一次提交出现两条记录

**现象：** SVN 提交后 Jenkins 几乎同时出现两条构建，常仅一条在执行、另一条排队。

**原因：** **双重触发**叠加：

| 触发源 | 典型 Build Cause |
|--------|------------------|
| post-commit Hook | `Started by remote host` / API 用户 |
| `pollSCM` | `Started by an SCM change` |

执行器默认常为 1 个，第二条会 **Queued**，待第一条结束后才执行。

**处理（推荐）：** 已启用 post-commit 时，从 `Jenkinsfile` **删除或注释** `triggers { pollSCM(...) }`，并确认任务页未勾选 Poll SCM。

**可选：** 任务 **Do not allow concurrent builds** 禁止同一任务并行（仍可能有两条记录，但严格串行）。

# <span id="inline-blue">流水线阶段说明</span>

## Checkout

使用 `SVN-<项目名>` 检出 `svn://<SVN服务器IP>/<项目名>`。

## Maven Build

当前命令：

```bash
mvn clean install -DskipTests -T 2C
```

JDK8 由 Global Tool `jdk8` 注入。

**Profile 说明：**

- 根 `pom.xml` 中 `dev` 为 `activeByDefault=true`，未写 `-P` 时等价于 `-Pdev`。
- 打包变量写入 jar：`spring.profiles.active`、`nacos.namespace`、`nacos-address` 等。
- CI 推送 `<Harbor项目名-test>` 时，若运行环境 Nacos 为 test 命名空间，应考虑改为 `-Ptest` 或增加 Jenkins 参数联动 profile，避免 jar 内仍是 dev 的 Nacos 地址（见部署说明 Maven Profile 一节）。

显式指定示例：

```bash
mvn clean install -DskipTests -T 2C -Ptest
```

## Copy Artifacts

`docker/copy.sh` 将 `target/*.jar` 拷贝到 `docker/<项目名>/*/jar/`。**不**处理 `jattach` / `wait`。

## Docker Build & Push

`Jenkinsfile` 中与手动构建等价：

```bash
docker build -f docker/<项目名>/<服务>/Dockerfile \
  -t <Harbor>/<项目>/<服务>:<标签> \
  docker/<项目名>/<服务>
docker push ...
```

- 构建上下文：**各微服务目录** `docker/<项目名>/app-*`
- Harbor 登录通过 `harbor-<项目名>` 凭据注入

## 镜像构建依赖说明

| 依赖 | 处理方式 |
|------|----------|
| 基础镜像 `eclipse-temurin:8-jre` / `8-jdk-jammy` | Docker 节点 `registry-mirrors`（见部署说明） |
| `jattach` | 各 `docker/<项目名>/app-*/bin/jattach`，`COPY bin/jattach` |
| `docker-compose-wait` | 各 `docker/<项目名>/app-*/docker-compose-wait/wait`，`COPY docker-compose-wait/wait /wait` |

# <span id="inline-blue">手动验证</span>

在 Jenkins 服务器上执行：

```bash
svn checkout svn://<SVN服务器IP>/<项目名> /tmp/build-test
cd /tmp/build-test
export JAVA_HOME=/usr/local/java/jdk8u312-b07
/home/apache-maven-3.8.9/bin/mvn clean install -DskipTests
cd docker && sh copy.sh

docker login <Harbor地址>:8443 -u <Harbor用户名>
docker build -f <项目名>/app-gateway/Dockerfile \
  -t <Harbor地址>:8443/<Harbor项目名-test>/app-gateway:manual-test \
  <项目名>/app-gateway
docker push <Harbor地址>:8443/<Harbor项目名-test>/app-gateway:manual-test
```

# <span id="inline-blue">常见问题</span>

| 现象 | 原因 | 处理 |
|------|------|------|
| `failed to resolve eclipse-temurin:8-jre` / 403 | Docker Hub 或旧加速器不可用 | 配置 `daemon.json` 镜像加速，重启 Docker |
| `release-assets.githubusercontent.com` 失败 | 构建时在线拉 jattach | 使用各服务 `bin/jattach` 并提交 SVN |
| `COPY bin/jattach` / `COPY docker-compose-wait/wait` 失败 | 二进制未入库 | 放入对应微服务目录并 `svn commit` |
| 提交后 Jenkins 无构建 | SVN 容器无 `curl` | `apk add curl` 或使用 `docker/svn/Dockerfile` |
| 提交后**两条**构建、一条排队 | post-commit + `pollSCM` 双触发 | 去掉 `pollSCM`，勿重复勾选 Poll SCM |
| Hook 不触发但手动 curl 成功 | `post-commit` 不可执行或路径错误 | `chmod +x`，确认文件名非 `.tmpl` |
| `credentialsId` 报错 | ID 与 Jenkins 不一致 | 核对 `SVN-<项目名>`、`harbor-<项目名>` |
| `docker push` 认证失败 | Harbor 凭据错误 | 更新 Jenkins Credentials |
| SVN checkout 失败 | 网络或 URL | 确认 `<SVN服务器IP>:3690`，URL 为仓库根 |
| 镜像在 test 仓库但连 dev Nacos | Maven 默认 `dev` profile | 评估 CI 使用 `-Ptest` 或与 `HARBOR_PROJECT` 联动 |

# <span id="inline-blue">后续扩展</span>

镜像推送成功后，可通过 SSH 在 Swarm Manager 执行 `docker service update`（需配置 `swarm-ssh-key` 凭据），详见 Swarm 编排文档。

# <span id="inline-blue">相关文件</span>

| 文件 | 说明 |
|------|------|
| `Jenkinsfile` | 流水线定义 |
| `docker/copy.sh` | JAR 拷贝 |
| `docker/<项目名>/app-*/bin/jattach` | jattach（各服务一份） |
| `docker/<项目名>/app-*/docker-compose-wait/wait` | wait（各服务一份） |
| `docker/<项目名>/*/Dockerfile` | 各微服务镜像 |
| `docker/svn/Dockerfile` | SVN 镜像（含 curl，供 Hook） |