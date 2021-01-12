---
title: hexo安装GitHub插件
tags: hexo
categories: hexo

---

## <span id="inline-blue">上传配置</span>

hexo配置和文件文件添加如下

```shell
deploy:
  type: git
  repo: https://github.com/userName/repoName.github.io.git
  branch: master
```



## <span id="inline-blue">安装插件</span>

安装GitHub部署插件

```shell
npm install hexo-deployer-git --save
```

## <span id="inline-blue">测试部署</span>

```shell
hexo d   

```



