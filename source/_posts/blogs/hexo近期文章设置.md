---
title: Hexo近期文章设置
tags: 
	- Hexo
categories: 
	- Hexo

date: 2023-05-23 10:02:45
---

## 近期文章设置（NexT 8.x）

在站点目录新建 `source/_data/sidebar.njk`（已有则可跳过创建），用于侧栏最近文章。

编辑站点根目录 `_config.next.yml`：

```yaml
custom_file_path:
  sidebar: source/_data/sidebar.njk
  style: source/_data/styles.styl

recent_posts:
  title: 最近文章
  icon: fa fa-history
  max_count: 5
```

样式写在站点 `source/_data/styles.styl`（不要改主题目录内文件，避免升级丢失）。

> 文中若仍出现 `*.swig` / 直接改 `themes/next/_config.yml` 的写法，属于旧习惯；NexT 8.x 请统一用 `_config.next.yml`。
