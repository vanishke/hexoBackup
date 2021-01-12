---
title: hexo安装本地搜索功能
tags: hexo
categories: hexo

---

## <span id="inline-blue">安装插件</span>

```shell
npm install hexo-generator-searchdb --save
```



## <span id="inline-blue">新增配置</span>

修改hexo/_config.yml站点配置文件，新增以下内容到任意位置：

```shell
search:
path: search.xml
field: post
format: html
limit: 10000
```

## <span id="inline-blue">修改主题配置文件，开启本地搜索功能</span>

```shell
# Local search
local_search:
enable: true  

```



