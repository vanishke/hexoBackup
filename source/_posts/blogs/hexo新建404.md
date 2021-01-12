---
title: hexo新建404
tags: hexo
categories: hexo

---

## <span id="inline-blue">新建404</span>

在站点根目录下,输入 hexo new page 404,默认在Hexo 站点下/source/404/index.md
打开新建的404界面，在顶部插入一行，写上permalink: /404，这表示指定该页固定链接为 http://"主页"/404.html

```shell
permalink: /404
---
title: #404 Not Found：该页无法显示
date: 2017-09-06 15:37:18
comments: false
permalink: /404
---
```









