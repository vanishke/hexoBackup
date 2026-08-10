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

在 Hexo **NexT** 主题侧栏显示圆形头像，并可选增加悬停旋转动效。

| 项 | 说明 |
| --- | --- |
| 做法 | 主题 `_config.yml` 配置 `avatar`；按需改 stylus 样式 |
| 适用边界 | NexT 主题（路径以你安装的主题目录为准，常见 `themes/next`） |
| 验证 | `hexo clean && hexo s` 后侧栏可见头像；悬停有旋转（若启用） |

# 环境与前置

| 项 | 说明 |
| --- | --- |
| 主题 | NexT（版本不同，stylus 路径可能微调） |
| 图片位置 | 主题目录 `source/images/avatar.png`，或站点 `source/uploads/avatar.jpg` |

# 实施步骤

## 1. 配置头像路径

编辑 `themes/next/_config.yml`，搜索 `Sidebar Avatar`，启用并指向图片：

```yaml
# Sidebar Avatar
# in theme directory(source/images): /images/avatar.jpg
# in site  directory(source/uploads): /uploads/avatar.jpg
avatar: /images/avatar.png
```

将图片放到对应目录（与上面路径一致）。

## 2. （可选）圆形与悬停旋转

编辑主题样式（NexT 常见路径）：

`themes/next/source/css/_common/components/sidebar/sidebar-author.styl`

```css
.site-author-image {
  display: block;
  margin: 0 auto;
  padding: $site-author-image-padding;
  max-width: $site-author-image-width;
  height: $site-author-image-height;
  border: $site-author-image-border-width solid $site-author-image-border-color;
  border-radius: 50%;
  transition: 2s all;
}

.site-author-image:hover {
  transform: rotate(360deg);
}
```

# 验证清单

| 检查项 | 期望 |
| --- | --- |
| 静态资源 | 浏览器可直接打开 `/images/avatar.png`（或你配置的路径） |
| 侧栏 | 头像显示且为圆形（若加了 `border-radius`） |
| 动效 | 鼠标悬停旋转一周 |

```bash
hexo clean
hexo s
```

# 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 裂图 | 路径与文件位置不一致 | 核对 `avatar` 与真实文件 |
| 样式不生效 | 改错主题目录或未 clean | 确认正在用的 theme；清理缓存重生成 |
| 无悬停效果 | 未改 stylus 或被自定义 CSS 覆盖 | 检查选择器与构建后的 CSS |

# 小结

1. 头像先保证 **配置路径与文件一致**，再谈样式。  
2. 样式改动依赖具体 NexT 版本目录，升级主题后可能需重做。  
3. 以本地 `hexo s` 目视为验收，不要只改文件不预览。
