---
title: Hexo安装GitHub插件
tags: 
	- Hexo
categories: 
	- Hexo

date: 2022-05-15 10:57:21

---


## 上传配置

hexo配置和文件文件添加如下

```shell
deploy:
  type: git
  repo: https://github.com/userName/repoName.github.io.git
  branch: master
```



## 安装插件

安装GitHub部署插件

```shell
npm install hexo-deployer-git --save
```

## 测试部署

```shell
hexo d   

```
