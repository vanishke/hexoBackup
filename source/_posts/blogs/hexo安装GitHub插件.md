---
title: hexo安装GitHub插件
tags: hexo
categories: hexo

---

## 上传配置

hexo配置和文件文件添加如下

```bash
deploy:
  type: git
  repo: https://github.com/userName/repoName.github.io.git
  branch: master
```



## 安装插件

安装GitHub部署插件

```bash
npm install hexo-deployer-git --save
```

## 测试部署

```bash
hexo d   

```



