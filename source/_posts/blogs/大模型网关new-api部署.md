---
title: 大模型网关new-api部署
categories:
	- new-api
tags:
	- Docker
	- new-api
	- 火山方舟
	- MiniMax

date: 2026-04-17 09:43:31
---
<!-- toc -->

# 概述

[new-api](https://github.com/Calcium-Ion/new-api) 是统一的 AI 模型聚合与分发网关：把各厂商能力转成 OpenAI / Claude / Gemini 等兼容协议，便于个人或企业集中管理模型、令牌与渠道。

| 项 | 说明 |
| --- | --- |
| 目标 | Docker 快速拉起；配置火山方舟 / MiniMax 的图生图、图生视频 |
| 做法 | `docker compose` + SQLite；后台建 Token 与渠道；客户端打 new-api 兼容接口 |
| 适用边界 | 默认 SQLite 适合单机验证；生产需评估高可用、备份、鉴权与配额 |
| 不适用 | 未阅读官方版本差异前，勿把本文路径/渠道类型号当成永久契约 |

**术语：** LLM = Large Language Model（大语言模型），不是「逻辑层级模型」。

# 环境与前置

| 项 | 要求 |
| --- | --- |
| 运行时 | Docker / Docker Compose |
| 端口 | 默认 `3000`（以仓库 `docker-compose.yml` 为准） |
| 数据 | `./data` 持久化（SQLite） |
| 密钥 | 厂商 API Key、new-api 用户令牌（`sk-`）；文中均脱敏 |

下文主机统一写作 `http://<new-api-host>:3000`，请替换为实际地址。

# Docker（默认 SQLite）快速部署

在 new-api 仓库根目录：

```bash
docker compose up -d
```

- **Web 管理端**：`http://<new-api-host>:3000`
- **数据库**：SQLite，数据落在挂载的 `./data`

**生产注意（边界）：**

- 定期备份 `./data`；评估是否改用 MySQL/PostgreSQL
- 管理端勿裸奔公网；加反向代理、HTTPS、访问控制
- 为 Token 配置额度 / 过期时间，避免密钥泄露后无限调用

# 生成 API Key

后续图生图、图生视频请求 Header 均需携带 **new-api 令牌**（不是厂商 Key）：

1. 打开管理端并登录  
2. 进入 **令牌 / Tokens**  
3. 新建并复制 `sk-xxxx`

```text
Authorization: Bearer sk-xxxxxxxx
```

# 接口路径约定（先读再调）

new-api 对外兼容路径以当前版本路由为准（源码常见：`POST /v1/videos`、`GET /v1/videos/:task_id`）。下文示例统一使用该约定；若你部署的版本另有别名路径，以实际 OpenAPI / 源码为准。

| 能力 | 方法 | 路径 | 模式 |
| --- | --- | --- | --- |
| 图生图 / 生图 | `POST` | `/v1/images/generations` 或厂商要求的 edits 形态 | 同步 |
| 提交视频任务 | `POST` | `/v1/videos` | 异步，返回 `task_id` |
| 查询视频任务 | `GET` | `/v1/videos/:task_id` | 轮询 |

> 若文档与示例曾混用 `/v1/images/edits`、`/v1/video/generations`，以你实例实际可用路径做一次 `curl` 探针后再固化到业务代码。

# 火山方舟：图生图（同步）

## 渠道配置

图生图使用内置官方渠道即可（无需自定义渠道）：

| 项 | 值 |
| --- | --- |
| 渠道类型 | 45（字节火山方舟 / 豆包通用） |
| API 地址 | `https://ark.cn-beijing.volces.com`（按开通地域调整） |
| API Key | 厂商控制台密钥（脱敏） |

## 调用

```text
POST http://<new-api-host>:3000/v1/images/generations
Authorization: Bearer sk-xxxxxxxx
```

若走带参考图的 edits 形态，按你网关实际开放的路径提交 `multipart/form-data`：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| image | file | 参考图 |
| prompt | string | 提示词 |
| model | string | 模型 ID |

返回示例（结构示意）：

```json
{
  "model": "doubao-seedream-5-0-260128",
  "created": 1775617197,
  "data": [{ "url": "https://example.tos.example.com/xxx.jpeg?<SIGNED>", "size": "2048x2048" }],
  "usage": { "generated_images": 1, "total_tokens": 16384 }
}
```

# 火山方舟：图生视频（异步）

## 渠道配置

与图生图共用渠道类型 45，在同一渠道中**追加视频模型**即可，例如：`doubao-seedance-1-0-pro-fast-251015`。

## 提交任务

```text
POST http://<new-api-host>:3000/v1/videos
Authorization: Bearer sk-xxxxxxxx
Content-Type: application/json
```

```json
{
  "model": "doubao-seedance-1-0-pro-fast-251015",
  "prompt": "将图片转换为公主风",
  "duration": 10,
  "width": 1024,
  "height": 768,
  "n": 1,
  "response_format": "url",
  "image": "<base64>"
}
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| model | string | 模型 ID |
| prompt | string | 提示词 |
| duration | int | 时长（秒） |
| width / height | int | 分辨率 |
| image | string | 参考图 base64 |
| response_format | string | 如 `url` |

图片可先转为 base64（注意体积与网关限制）。

## 查询任务

```text
GET http://<new-api-host>:3000/v1/videos/<task_id>
Authorization: Bearer sk-xxxxxxxx
```

关注返回中的 `status` / `progress` / `result_url`（或 `data.content.video_url`）。字段名随版本可能略有差异，以实际响应为准。

# MiniMax：图生图（同步）

## 渠道配置

使用**自定义渠道**便于做参数覆盖：

| 项 | 值 |
| --- | --- |
| 渠道类型 | 8（自定义） |
| API 地址 | `https://api.minimaxi.com/v1/image_generation` |
| API Key | 厂商密钥（脱敏） |

请求参数覆盖（JSON）示例：

```json
{
  "operations": [
    { "mode": "set", "path": "model", "value": "{{model}}" },
    { "mode": "set", "path": "prompt", "value": "{{prompt}}" },
    { "mode": "set", "path": "aspect_ratio", "value": "16:9" },
    { "mode": "set", "path": "n", "value": "{{n}}" },
    {
      "mode": "set",
      "path": "subject_reference",
      "value": [{ "type": "character", "image_file": "{{image}}" }]
    }
  ]
}
```

## 调用

```text
POST http://<new-api-host>:3000/v1/images/generations
Authorization: Bearer sk-xxxxxxxx
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| model | string | 模型 ID |
| prompt | string | 提示词 |
| image | string | 参考图（base64 等，按渠道约定） |

# MiniMax：图生视频（异步）

## 渠道配置

| 项 | 值 |
| --- | --- |
| 渠道类型 | 35（MiniMax 官方） |
| API 地址 | 官方渠道内置 |
| 模型示例 | `MiniMax-Hailuo-02` 等 |
| 参数覆盖 | 将 `model` / `prompt` / `first_frame_image` / `duration` 映射到出站 JSON |

```json
{
  "operations": [
    { "mode": "set", "path": "model", "value": "{{model}}" },
    { "mode": "set", "path": "prompt", "value": "{{prompt}}" },
    { "mode": "set", "path": "first_frame_image", "value": "{{image}}" },
    { "mode": "set", "path": "duration", "value": "{{duration}}" }
  ]
}
```

## 提交与查询

```text
POST http://<new-api-host>:3000/v1/videos
GET  http://<new-api-host>:3000/v1/videos/<task_id>
Authorization: Bearer sk-xxxxxxxx
```

提交体示例：

```json
{
  "model": "MiniMax-Hailuo-02",
  "prompt": "A mouse runs toward the camera, smiling and blinking.",
  "image": "https://example.com/first-frame.jpeg",
  "duration": 6
}
```

# 验证清单

| 检查项 | 期望 |
| --- | --- |
| 容器 | `docker compose ps` 健康；`:3000` 可打开管理端 |
| Token | 无 Key 返回 401；有 Key 可过网关 |
| 图生图 | 同步返回图片 URL 或等价字段 |
| 图生视频 | 先拿到 `task_id`，轮询至成功/失败 |
| 持久化 | 重启后 Token/渠道仍在（`./data` 未丢） |

# 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 打不开页面 | 端口未映射或冲突 | 查 compose 端口与防火墙 |
| 401 / 鉴权失败 | 用了厂商 Key 或 Token 错误 | Header 使用 new-api 的 `sk-` |
| 参数覆盖不生效 | JSON 语法错误或 `path` 不对 | 校验 operations；对照出站字段 |
| 路径 404 | 版本路由与文档不一致 | 以实例源码/实际探测为准 |
| SQLite 锁 / 丢数据 | 多实例抢同一文件或未备份 | 单写实例；定期备份；评估外置 DB |

# 小结

1. new-api 负责 **协议聚合 + 令牌治理**；厂商 Key 只配在渠道侧。  
2. 图生图偏同步 Images API，图生视频偏异步 `/v1/videos` 任务模型。  
3. 上线前固定三件事：**路径探针、数据备份、Token 额度与网络安全边界**。

| 场景 | 渠道类型 | 典型能力 |
| --- | --- | --- |
| 火山方舟图生图 | 45 | Images API |
| 火山方舟图生视频 | 45 | `/v1/videos` |
| MiniMax 图生图 | 8 | Images API（自定义覆盖） |
| MiniMax 图生视频 | 35 | `/v1/videos` |

*端口、镜像与环境变量以仓库 `Dockerfile` / `docker-compose.yml` 及官方文档为准。*
