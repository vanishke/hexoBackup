---
title: Hexo头像设置
tags:
	- Hexo
categories:
	- Hexo

date: 2022-05-18 09:32:12
---

<!-- toc -->

# 概述

在 Hexo **NexT 8.x** 主题侧栏显示头像（可选圆形、悬停旋转）。

| 项 | 说明 |
| --- | --- |
| 做法 | 在站点根目录 `_config.next.yml` 配置 `avatar` |
| 验证 | `hexo clean && hexo s` 后侧栏可见头像 |

# 配置

编辑 `_config.next.yml`：

```yaml
avatar:
  url: /images/avatar.png
  rounded: true
  rotated: true
```

将图片放到站点 `source/images/avatar.png`（或与 `url` 一致的路径）。

> 旧版直接改主题 stylus 实现圆形/旋转的方式属于 NexT 5.x 优化，已移除。

# 验证

```bash
hexo clean
hexo s
```
