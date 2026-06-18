---
title: Jenkins CI配置
categories:
	- Jenkins
tags:
	- Jenkins
	- CI
	- SVN

date: 2026-06-18 11:03:21
updated: 2026-06-18 11:03:21
---
<!-- toc -->

# <span id="inline-blue">文档索引</span>

本文档为 Jenkins CI 系列说明的索引页，涵盖 Jenkins 安装、流水线配置与 SVN 服务部署三部分内容。

| 文档 | 内容 |
|------|------|
| [Jenkins部署](./Jenkins部署.md) | Jenkins 安装、Docker 加速、各服务 jattach/wait、Maven profile、凭据 |
| [Jenkins流水线配置](./Jenkins流水线配置.md) | Pipeline、post-commit Hook、重复构建排障、Harbor 镜像推送 |
| [Docker部署SVN服务](./Docker部署SVN服务.md) | SVN 部署、Hook、容器 curl 依赖 |

# <span id="inline-blue">官方资源</span>

- Jenkins WAR：[https://get.jenkins.io/war-stable/](https://get.jenkins.io/war-stable/)
- 插件查询：[https://updates.jenkins-ci.org/download/plugins/](https://updates.jenkins-ci.org/download/plugins/)

# <span id="inline-blue">构建要点</span>

- 微服务镜像构建上下文为 `docker/<项目名>/<服务名>`，各服务目录独立存放 `jattach` / `wait` 二进制。
- 推荐 post-commit Hook 触发构建，并关闭 `pollSCM`，避免同一次提交触发两次构建。
- Harbor 推送项目按环境区分（如 `<Harbor项目名-test>`、`<Harbor项目名-prod>`），凭据与 Token 仅保存在 Jenkins / SVN 服务器，**勿写入代码仓库或文档**。
