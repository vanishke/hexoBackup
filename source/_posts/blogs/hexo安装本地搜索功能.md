---
title: hexo安装本地搜索功能
tags: hexo
categories: hexo

---

## 安装插件

```bash
npm install hexo-generator-searchdb --save
```



## 新增配置

修改hexo/_config.yml站点配置文件，新增以下内容到任意位置：

```bash
search:
path: search.xml
field: post
format: html
limit: 10000
```

## 修改主题配置文件，开启本地搜索功能

```bash
# Local search
local_search:
enable: true  

```



