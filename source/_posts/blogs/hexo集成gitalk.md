---
title: Hexo集成Gitalk
categories:
	- Hexo
tags: 
	- Hexo
	- Next
	- Gitalk
	
date: 2021-01-15 15:55:20	
---

## 注册应用

注册地址：https://github.com/settings/applications/new

参数说明：
- Application name：应用名称
- Homepage URL：博客地址
- Authorization callback URL：使用 Gitalk 的博客地址

注册成功后记下 Client ID / Client Secret。

## 创建仓库

在 GitHub 创建一个用于存储评论 Issue 的仓库。

## NexT 8.x 配置

旧版通过改主题 comments 模板手动接入的方式属于 **NexT 5.x**，已过时。

在站点根目录 `_config.next.yml` 中配置即可：

```yaml
gitalk:
  enable: true
  github_id: your-github-id
  repo: your-comments-repo
  client_id: your-client-id
  client_secret: your-client-secret
  admin_user: your-github-id
  distraction_free_mode: true
```

## 验证

```bash
hexo clean && hexo s
```

打开任意文章页底部，确认 Gitalk 评论框可加载。
