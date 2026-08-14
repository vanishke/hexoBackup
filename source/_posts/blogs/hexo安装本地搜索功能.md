---
title: Hexo安装本地搜索功能
tags: 
	- Hexo
categories: 
	- Hexo
	
date: 2022-05-17 11:33:49

---


## 安装插件

```shell
npm install hexo-generator-searchdb --save
```



## 新增配置

修改hexo/_config.yml站点配置文件，新增以下内容到任意位置：

```shell
search:
path: search.xml
field: post
format: html
limit: 10000
```

## 修改主题配置文件，开启本地搜索功能

```shell
# Local search
local_search:
enable: true  

```
