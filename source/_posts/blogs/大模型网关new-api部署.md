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
updated: 2026-04-17 09:43:31
---
<!-- toc -->

# <span id="inline-blue">背景</span>

一个统一的AI模型聚合与分发中心。它支持将各种LLM（逻辑层级模型）转换为OpenAI兼容、Claude兼容或Gemini兼容的格式。一个用于个人和企业模型管理的集中式门户。


# <span id="inline-blue">Docker（默认 SQLite）快速部署</span>

直接用仓库根目录的 [`docker-compose.yml`](docker-compose.yml) 编排文件启动容器即可：

```bash
docker compose up -d
```

**参数含义（极简）：**

- **`up`**：按 `docker-compose.yml` 创建/启动服务
- **`-d`**：后台运行（detach）

**访问方式：**

- **Web 管理端**：`http://localhost:3000`

**SQLite 说明：**

- 本文采用 **SQLite** 作为默认数据库（零依赖、开箱即用），数据会落在挂载的 `./data` 目录中。

# <span id="inline-blue">new-api 后台生成 API Key</span>

后续调用 new-api 的图生图、图生视频接口，都需要在请求 Header 中携带 **new-api 的 API Key**（用户令牌，常见前缀为 `sk-`）。

## <span id="inline-blue">生成步骤</span>

1. 打开 new-api 管理端：`http://localhost:3000`
2. 使用管理员账号登录
3. 进入 **令牌 / Tokens（API Keys）** 页面
4. 点击 **新建/创建 Token**
5. 复制生成的 Key（形如 `sk-xxxx`）

## <span id="inline-blue">请求头写法</span>

推荐统一使用：

```text
Authorization: Bearer sk-xxxxxxxx
```

# <span id="inline-blue">火山方舟：图生图（同步）</span>

## <span id="inline-blue">渠道配置</span>

火山方舟的图生图**不需要自定义渠道**，直接使用 new-api 内置的官方渠道类型即可。

- **渠道类型**：45（字节火山方舟、豆包通用）  
- **API 地址**：默认 `https://ark.cn-beijing.volces.com`（如你在控制台开通的是其它地域域名，再按实际修改）  
- **API Key**：`*************`  

![火山引擎渠道配置](/images/new-api/newApi-20260417_001.png)

## <span id="inline-blue">调用 new-api 的图生图接口（同步返回）</span>

图生图走 OpenAI 兼容的 `images` 接口，请求到 new-api 后由网关转发到对应渠道，上游返回后 **同步** 给客户端。

常用接口（以 new-api OpenAI 兼容路径为准）：

- **生图/图生图**：`POST /v1/images/generations`（同步）

请求 Header（必须）：

```text
Authorization: Bearer sk-xxxxxxxx
```
- 
  ![火山引擎图生图接口](/images/new-api/newApi-20260417_002.png)

请求示例：http://10.9.216.12:3000/v1/images/edits


|  参数名称  |  参数类型  |  参数说明  |
|:------:|:------:|:------:|
| image  |  file  | 参考图片文件 |
| prompt | string |  提示信息  |
| model  | string |  模型ID  |

接口返回示例：
```json
{
	"model": "doubao-seedream-5-0-260128",
	"created": 1775617197,
	"data": [
		{
			"url": "https://ark-acg-cn-beijing.tos-cn-beijing.volces.com/doubao-seedream-5-0/02177561718044448aafbb39a6fef3e9b38f22991150366f47878_0.jpeg?<SIGNED_QUERY_STRING_REDACTED>",
			"size": "2048x2048"
		}
	],
	"usage": {
		"generated_images": 1,
		"output_tokens": 16384,
		"total_tokens": 16384
	}
}
```
# <span id="inline-blue">火山方舟：图生视频（异步）</span>

## <span id="inline-blue">渠道配置</span>

火山方舟的图生视频 **不需要新增渠道**：与图生图共用同一个火山方舟渠道即可。只需要在该渠道中**补充添加图生视频模型**。

- **渠道类型**：45（字节火山方舟、豆包通用）  
- **API 地址**：默认 `https://ark.cn-beijing.volces.com`  
- **API Key**：`*************`   
- **图生视频模型**：`doubao-seedance-1-0-pro-fast-251015`

## <span id="inline-blue">调用 new-api 的视频接口（异步任务）</span>

- **提交任务**：`POST /v1/videos`（异步，返回 `task_id`）  
- **查询任务**：`GET /v1/videos/:task_id`（查询任务状态/结果）  

请求 Header（必须）：

```text
Authorization: Bearer sk-xxxxxxxx
```

![火山引擎图生视频接口](/images/new-api/newApi-20260417_003.png)

请求示例：http://10.9.216.12:3000/v1/video/generations
```json
{
    "model": "doubao-seedance-1-0-pro-fast-251015",
    "prompt": "将图片转换为公主风",
	   "duration": 10,
    "width": 1024,
    "height": 768,
    "n": 1,
    "response_format": "url",
    "image": "base64编码字符串"
}
```

参数说明：

  |      参数名称       |  参数类型  |    参数说明     |
  |:---------------:|:------:|:-----------:|
  |    duration     |  file  |   时长，单位：秒   |
  |     prompt      | string |    提示信息     |
  |      model      | string |    模型ID     |
  |      width      |  int   |      宽      |
  |     height      |  int   |      高      |
  |        n        | string | 生成视频个数，默认：1 |
  | response_format | string |  返回格式，url   |
  |      image      | string | 图片base64编码  |

图片在线base64编码可以通过以下网站实现：https://base64.us/

## <span id="inline-blue">查询视频生成状态</span>

![火山引擎图生视频任务状态接口](/images/new-api/newApi-20260417_004.png)

请求示例：http://10.9.216.12:3000/v1/video/generations/task_jx5XjyHT3jRZ0CuIGXhzzQP7dUEyeEK6

接口返回示例：
```json
{
	"code": "success",
	"message": "",
	"data": {
		"id": 3,
		"created_at": 1775617446,
		"updated_at": 1775617496,
		"task_id": "task_jx5XjyHT3jRZ0CuIGXhzzQP7dUEyeEK6",
		"platform": "45",
		"user_id": 1,
		"group": "default",
		"channel_id": 4,
		"quota": 500,
		"action": "generate",
		"status": "SUCCESS",
		"fail_reason": "",
		"result_url": "https://ark-content-generation-cn-beijing.tos-cn-beijing.volces.com/doubao-seedance-1-0-pro-fast/02177561744658200000000000000000000ffffac15a1a6102859.mp4?<SIGNED_QUERY_STRING_REDACTED>",
		"submit_time": 1775617446,
		"start_time": 1775617448,
		"finish_time": 1775617496,
		"progress": "100%",
		"properties": {
			"input": "",
			"upstream_model_name": "doubao-seedance-1-0-pro-fast-251015",
			"origin_model_name": "doubao-seedance-1-0-pro-fast-251015"
		},
		"data": {
			"content": {
				"video_url": "https://ark-content-generation-cn-beijing.tos-cn-beijing.volces.com/doubao-seedance-1-0-pro-fast/02177561744658200000000000000000000ffffac15a1a6102859.mp4?<SIGNED_QUERY_STRING_REDACTED>"
			},
			"created_at": 1775617446,
			"draft": false,
			"duration": 5,
			"execution_expires_after": 172800,
			"framespersecond": 24,
			"id": "cgt-20260408110405-b6cj7",
			"model": "doubao-seedance-1-0-pro-fast-251015",
			"ratio": "16:9",
			"resolution": "1080p",
			"seed": 21342,
			"service_tier": "default",
			"status": "succeeded",
			"updated_at": 1775617485,
			"usage": {
				"completion_tokens": 246840,
				"total_tokens": 246840
			}
		}
	}
}
```


# <span id="inline-blue">MiniMax：图生图（同步）</span>

## <span id="inline-blue">渠道配置</span>

MiniMax 图生图使用 **自定义渠道**（便于按需对接与做请求参数覆盖改写）。

- **渠道类型**：8（自定义渠道）  
- **API 地址**：`https://api.minimaxi.com/v1/image_generation`  
- **API Key**：`*************`    
- **请求参数覆盖（JSON）**:
```json
{
  "operations": [
    {
      "mode": "set",
      "path": "model",
      "value": "{{model}}"
    },
    {
      "mode": "set",
      "path": "prompt",
      "value": "{{prompt}}"
    },
    {
      "mode": "set",
      "path": "aspect_ratio",
      "value": "16:9"
    },
    {
      "mode": "set",
      "path": "n",
      "value": "{{n}}"
    },
    {
      "mode": "set",
      "path": "subject_reference",
      "value": [
        {
          "type": "character",
          "image_file": "{{image}}"
        }
      ]
    }
  ]
}
```

![MiniMax 渠道配置](/images/new-api/newApi-20260417_005.png)

## <span id="inline-blue">图生图（同步返回）</span>

图生图走 OpenAI 兼容的 `images` 接口，请求到 new-api 后由网关转发到 MiniMax 渠道，上游返回后 **同步** 给客户端。

- **生图/图生图**：`POST /v1/images/generations`（同步）

请求 Header（必须，new-api API Key）：

```text
Authorization: Bearer sk-xxxxxxxx
```

请求示例：http://10.9.216.12:3000/v1/images/edits

content-type: mutipart/form-data

|  参数名称  |  参数类型  |  参数说明  |
|:------:|:------:|:------:|
| model  | string | 模型ID |
| prompt | string | 提示信息 |
| image  | string | 参考图片（base64） |

接口返回示例：

```json
{
  "id": "06267856a7fcc41ace4fad17a3de1b5d",
  "data": {
    "image_urls": [
      "https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-09%2F4a17d495-a2ff-40c2-a532-0af06ba35953_aigc.jpeg?<SIGNED_QUERY_STRING_REDACTED>"
    ]
  },
  "metadata": {
    "failed_count": "0",
    "success_count": "1"
  },
  "base_resp": {
    "status_code": 0,
    "status_msg": "success"
  }
}
```

# <span id="inline-blue">MiniMax：图生视频（异步）</span>

## <span id="inline-blue">渠道配置</span>

MiniMax 图生视频使用 **MiniMax 官方渠道**（同为渠道类型 35），在该渠道中添加对应图生视频模型即可。

- **渠道类型**：35（MiniMax）  
- **API 地址**：官方渠道已经内置api地址  
- **API Key**：`*************`    
- **图生视频模型**：`MiniMax-Hailuo-2.3,MiniMax-Hailuo-2.3-Fast,MiniMax-Hailuo-02,I2V-01-Director,I2V-01-live,I2V-01`  
- **请求参数覆盖（JSON）**：
```json
{
  "operations": [
    {
      "mode": "set",
      "path": "model",
      "value": "{{model}}"
    },
    {
      "mode": "set",
      "path": "prompt",
      "value": "{{prompt}}"
    },
    {
      "mode": "set",
      "path": "first_frame_image",
      "value": "{{image}}"
    },
    {
      "mode": "set",
      "path": "duration",
      "value": "{{duration}}"
    }
  ]
}
```

![MiniMax 图生视频渠道配置](/images/new-api/newApi-20260417_006.png)

## <span id="inline-blue">图生视频（异步任务）</span>

图生视频走 OpenAI 兼容的 `videos` 任务接口：提交任务是 **异步**，返回 `task_id`；之后需要轮询查询任务状态/结果。

- **提交任务**：`POST /v1/videos`（异步，返回 `task_id`）  
  

请求 Header（必须，new-api API Key）：

```text
Authorization: Bearer sk-xxxxxxxx
```

> 路由可在 `router/video-router.go` 看到：`POST /v1/videos`、`GET /v1/videos/:task_id`。

请求示例（提交任务）：http://10.9.216.12:3000/v1/video/generations

```json
{
  "model": "MiniMax-Hailuo-02",
  "prompt": "A mouse runs toward the camera, smiling and blinking.",
  "image": "https://cdn.hailuoai.com/prod/2024-09-18-16/user/multi_chat_file/9c0b5c14-ee88-4a5b-b503-4f626f018639.jpeg",
  "duration": 6
}
```

|  参数名称  |  参数类型  |  参数说明   |
|:------:|:------:|:-------:|
| model  | string |  模型ID   |
| prompt | string |  提示信息   |
| duration | int |  时长（秒）  |
| image | string | 图片url地址 |

## <span id="inline-blue">查询视频任务接口</span>

提交 `POST /v1/videos` 成功后会拿到 `task_id`（或响应中的 `id`）。使用下面接口查询任务状态与结果：

- **查询接口**：`GET /v1/videos/:task_id`
- **Header（必须）**：

```text
Authorization: Bearer sk-xxxxxxxx
```

请求示例：http://10.9.216.12:3000/v1/video/generations/task_SItXD98DHcx1JfIbZRTbPUADgGo8cBsa

返回示例）：

```json
{
  "code": "success",
  "message": "",
  "data": {
    "id": 4,
    "created_at": 1775717526,
    "updated_at": 1775717529,
    "task_id": "task_SItXD98DHcx1JfIbZRTbPUADgGo8cBsa",
    "platform": "35",
    "user_id": 1,
    "group": "default",
    "channel_id": 12,
    "quota": 500,
    "action": "generate",
    "status": "IN_PROGRESS",
    "fail_reason": "",
    "submit_time": 1775717526,
    "start_time": 1775717529,
    "finish_time": 0,
    "progress": "30%",
    "properties": {
      "input": "",
      "upstream_model_name": "MiniMax-Hailuo-02",
      "origin_model_name": "MiniMax-Hailuo-02"
    },
    "data": {
      "base_resp": {
        "status_code": 0,
        "status_msg": "success"
      },
      "file_id": "",
      "status": "Preparing",
      "task_id": "385697061261734",
      "video_height": 0,
      "video_width": 0
    }
  }
}
```

# <span id="inline-blue">小结与排查建议</span>

| 场景           | 渠道类型 | 典型能力     | 参数覆盖作用阶段           |
|----------------|----------|--------------|----------------------------|
| 火山方舟图生图 | 45       | Images API   | 出站 JSON（图生图/生成）   |
| 火山方舟图生视频 | 45     | `/v1/videos` | 出站任务 JSON（官方渠道） |
| MiniMax 图生图 | 8        | Images API   | 出站 JSON（图生图/生成）   |
| MiniMax 图生视频 | 35     | `/v1/videos` | 出站任务 JSON（MiniMax 官方） |

部署后若 **访问不了**：确认 `3000` 端口已映射且未被占用。若 **参数覆盖不生效**：确认渠道 JSON 语法正确，且 `path` 对应网关出站 JSON 的字段路径。

---

*文中默认端口、镜像名与环境变量示例来自仓库 `Dockerfile` 与 `docker-compose.yml`，部署前请以实际版本与官方文档为准。*
