---
title: Docker Swarm模式下实现Nginx集群服务平滑升级实现
categories:
  - Docker
tags:
  - Docker Swarm
  - Nginx
  - Docker

date: 2026-05-15 17:39:10
updated: 2026-05-15 17:39:10
---
<!-- toc -->

# <span id="inline-blue">背景</span>

在 Docker Swarm 模式下，通过 **Stack** 部署多副本 Nginx 服务，结合 **`deploy.update_config`**（`start-first`、分批 `parallelism`、健康检查等），可在滚动更新时尽量保持入口可用，实现 **平滑升级**。

本文以测试堆栈为例：使用 **手动构建的自定义镜像**（构建时将 `PAGE_VERSION` 写入默认首页），通过循环 `curl` 观察升级过程中首页版本与 HTTP 状态码变化，验证 Swarm 滚动更新行为。

**相关文件（`docker` 目录下）：**

| 文件 | 说明 |
|------|------|
| `nginx-upgrade-test/Dockerfile` | 基于 `nginx:1.25-alpine`，构建时写入首页版本信息 |
| `docker-swarm-nginx-test.yml` | Swarm Stack 编排（3 副本、ingress 端口、滚动更新策略） |

# <span id="inline-blue">环境与前置条件</span>

- 已初始化 **Docker Swarm** 集群（至少 1 个 Manager 节点）。
- 在 **Manager 节点** 执行 `docker stack deploy` 及 `docker service update`。
- 所有命令均在 **`docker` 目录** 下执行（与 `nginx-upgrade-test`、`docker-swarm-nginx-test.yml` 同级）。
- 测试访问地址示例：`http://10.9.216.12:18080/`（`10.9.216.12` 换为任一 Swarm 节点 IP，端口与编排中 `published: 18080` 一致）。
- **多节点集群**：需在私有仓库构建并 `push` 镜像 `nginx-upg-test:v1` / `v2`，各节点能拉取；编排中 `image` 建议写仓库完整地址。

# <span id="inline-blue">自定义镜像说明</span>

`nginx-upgrade-test/Dockerfile` 在 **构建阶段** 将 `PAGE_VERSION` 与 `nginx -v` 输出写入 `/usr/share/nginx/html/index.html`：

```dockerfile
FROM nginx:1.25-alpine

ARG PAGE_VERSION=v1

RUN set -e; \
    NGINX_VER="$(nginx -v 2>&1)"; \
    printf '%s\n' \
      '<!DOCTYPE html><html lang="zh-CN">...' \
      "<p><strong>构建版本 PAGE_VERSION</strong></p><pre>${PAGE_VERSION}</pre>" \
      ... > /usr/share/nginx/html/index.html; \
    printf '<pre>%s</pre>\n' "$NGINX_VER" >> /usr/share/nginx/html/index.html; \
    echo '</body></html>' >> /usr/share/nginx/html/index.html
```

**说明：**

- 首页显示的 **v1 / v2** 由 **`docker build --build-arg PAGE_VERSION=...`** 决定，与 Stack 里 `image:` 标签名无自动绑定。
- 部署前可用 `docker run --rm nginx-upg-test:v1 cat /usr/share/nginx/html/index.html` 自检镜像内容。

# <span id="inline-blue">Stack 编排要点</span>

`docker-swarm-nginx-test.yml` 核心配置：

```yaml
services:
  nginx-upgrade-test:
    image: nginx-upg-test:v1
    networks:
      - nginx-upgrade-test-net
    ports:
      - target: 80
        published: 18080
        protocol: tcp
    environment:
      TZ: Asia/Shanghai
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "5"
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://127.0.0.1/ >/dev/null || exit 1"]
      interval: 5s
      timeout: 3s
      retries: 3
      start_period: 10s
    deploy:
      mode: replicated
      replicas: 3
      endpoint_mode: vip
      restart_policy:
        condition: on-failure
        delay: 3s
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
        delay: 10s
        failure_action: rollback
        monitor: 20s
        max_failure_ratio: 0
        order: start-first

networks:
  nginx-upgrade-test-net:
    driver: overlay
    attachable: true
```

| 配置项 | 作用 |
|--------|------|
| `replicas: 3` | 多副本，滚动时新旧任务可并存 |
| `published: 18080`（ingress） | 经 routing mesh 负载均衡到健康副本 |
| `order: start-first` | 有利于减少升级空窗 |
| `healthcheck` | Swarm 判断任务是否就绪 |

Stack 名称：`stack-nginx-test` → 服务全名为 **`stack-nginx-test_nginx-upgrade-test`**。

# <span id="inline-blue">构建镜像</span>

在 `docker` 目录执行：

```bash
# 构建 nginx:v1 版本镜像
docker build --no-cache --build-arg PAGE_VERSION=v1 -t nginx-upg-test:v1 ./nginx-upgrade-test

# 构建 nginx:v2 版本镜像
docker build --no-cache --build-arg PAGE_VERSION=v2 -t nginx-upg-test:v2 ./nginx-upgrade-test
```

**部署前自检（推荐）：**

```bash
docker run --rm nginx-upg-test:v1 cat /usr/share/nginx/html/index.html | grep -oP '(?<=<pre>)[^<]+' | head -1
# 应输出 v1

docker run --rm nginx-upg-test:v2 cat /usr/share/nginx/html/index.html | grep -oP '(?<=<pre>)[^<]+' | head -1
# 应输出 v2
```

# <span id="inline-blue">部署 Stack</span>

```bash
docker stack deploy -c docker-swarm-nginx-test.yml stack-nginx-test
```

**检查服务与任务：**

```bash
docker stack services stack-nginx-test
docker service ps stack-nginx-test_nginx-upgrade-test --no-trunc
```

首次部署成功后，访问首页应稳定显示 **`PAGE_VERSION` 为 v1**（若一直是 v2，参见文末「常见问题」）。

# <span id="inline-blue">循环检测服务</span>

在**单独终端**持续请求，观察版本文案与 HTTP 状态码：

```bash
while true; do
  curl -s http://10.9.216.12:18080/ | grep -E 'PAGE_VERSION|nginx version'
  curl -s -o /dev/null -w "HTTP %{http_code}\n" http://10.9.216.12:18080/
  sleep 0.4
done
```

**观测说明：**

- 升级过程中可能出现 **v1 与 v2 交替**，表示新旧任务并存、入口仍在分流。
- 若全程 **HTTP 200** 且最终稳定为 **v2**，说明滚动过程无明显中断。
- 升级结束后若**始终只有 v2**，表示全部副本已切到新镜像。

# <span id="inline-blue">平滑升级服务版本</span>

在**循环检测已运行**的前提下，于另一终端执行滚动更新。

**从 v1 升级到 v2（常用）：**

```bash
docker service update \
  --image nginx-upg-test:v2 \
  --force \
  --update-parallelism 3 \
  --update-delay 0s \
  --update-monitor 0s \
  --no-resolve-image \
  stack-nginx-test_nginx-upgrade-test
```

**强制按指定镜像重建（与现场命令一致，镜像 tag 按需替换）：**

```bash
docker service update \
  --image nginx-upg-test:v1 \
  --force \
  --update-parallelism 3 \
  --update-delay 0s \
  --update-monitor 0s \
  --no-resolve-image \
  stack-nginx-test_nginx-upgrade-test
```

### <span id="inline-blue">参数说明</span>

| 参数 | 含义 |
|------|------|
| `--image nginx-upg-test:v2` | 目标镜像；**v1→v2 升级时须写 v2** |
| `--force` | 即使规格未变也强制重建任务 |
| `--update-parallelism 3` | 每轮最多同时更新 3 个任务（与 3 副本相当一次全换） |
| `--update-delay 0s` | 批次间无等待 |
| `--update-monitor 0s` | 更新后监控窗口为 0 |
| `--no-resolve-image` | 不将标签解析为 digest，按给定镜像名更新 |
| `stack-nginx-test_nginx-upgrade-test` | Swarm 服务全名 |

**说明：**

- 上述 CLI 使用 **parallelism=3、delay=0**，更新速度较快；若需更渐进平滑，可改为 `--update-parallelism 1 --update-delay 10s`，并与编排中 `update_config` 保持一致。
- Stack 内已配置 `order: start-first`；`service update` 未显式指定时一般继承服务已有更新策略。

**查看更新进度：**

```bash
docker service ps stack-nginx-test_nginx-upgrade-test
docker service inspect stack-nginx-test_nginx-upgrade-test --pretty
```

# <span id="inline-blue">使用 Portainer 执行同等升级（可选）</span>

1. 进入 Swarm 环境 → **Services** → 选择 `stack-nginx-test_nginx-upgrade-test` → **Update**。
2. **Image** 填写 `nginx-upg-test:v2`（或目标 tag）。
3. **Rolling update**：Parallelism `3`，Delay `0`，Monitor `0`；勾选 **Force update**。
4. 若界面无 `--no-resolve-image` 对应项，可在 Portainer **Console** 中执行上文 `docker service update` 完整命令。

# <span id="inline-blue">卸载 Stack</span>

```bash
docker stack rm stack-nginx-test
```

# <span id="inline-blue">常见问题</span>

### <span id="inline-blue">部署后一直是 v2，看不到 v1</span>

- **原因**：构建时把 `PAGE_VERSION=v2` 打到了 `nginx-upg-test:v1` 标签，或只构建了 v2、编排/更新却指向 v2 镜像。
- **处理**：`--no-cache` 分别构建 v1/v2，部署前用 `docker run --rm nginx-upg-test:v1 cat ...` 确认首页为 v1；再 `stack deploy`。

### <span id="inline-blue">执行 service update 后“没有升级”</span>

- **原因**：当前任务已是目标镜像（如已是 v2 再 update 到 v2），Swarm 不会滚动。
- **处理**：确认 `docker service inspect ... --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}'`，目标 tag 与当前不同，并加 `--force`。

### <span id="inline-blue">多节点镜像不一致</span>

- **原因**：镜像仅在 Manager 本地 build，Worker 拉到旧层或拉取失败。
- **处理**：push 到统一仓库，编排使用仓库地址，各节点 `docker pull` 后再部署/更新。


