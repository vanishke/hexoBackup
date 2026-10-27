---
title: Hexo新建404
categories:
	- Hexo
tags:
	- Hexo

date: 2022-05-18 09:32:12
---

# 概述

为站点配置自定义 404 页，使访问不存在的路径时展示主题内友好提示，而不是 GitHub Pages / Nginx 默认错误页。

| 项 | 说明 |
| --- | --- |
| 页面路径 | `source/404/index.md` |
| 固定链接 | `/404.html`（供 GitHub Pages 识别） |
| 注意 | `title` 含 `#` 时必须加引号，否则 YAML 会把 `#` 后当成注释 |

# 核心步骤

## 新建页面

在站点根目录执行：

```bash
hexo new page 404
```

生成文件：`source/404/index.md`。

## 正确的 Front Matter

`source/404/index.md` 必须是**一对** `---` 包裹的 front matter，且只写一次：

```yaml
---
title: "404 Not Found：该页无法显示"
date: 2017-09-06 15:37:18
comments: false
permalink: /404.html
---

## 页面不存在

你访问的页面不存在或已被移除。

- [返回首页](/)
- [查看归档](/archives/)
```

| 易错点 | 后果 |
| --- | --- |
| 缺少开头的 `---`，或写了两段 front matter | 第二段 YAML 被当成正文显示 |
| `title: #404 ...` 无引号 | `#` 后被 YAML 注释掉，标题为空 |
| 未部署 `.nojekyll` | GitHub Pages 按 Jekyll 处理，部分路径异常 |

## 部署

```bash
hexo clean && hexo g && hexo d
```

确认部署仓库根目录存在 `.nojekyll`（`_config.yml` 中 `deploy.ignore_hidden: false`）。

# 验证

访问一个不存在的地址（如 `/hexo/this-page-does-not-exist/`），应看到自定义 404 文案，而不是原始 YAML 文本。
