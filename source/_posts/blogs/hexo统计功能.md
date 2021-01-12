---
title: hexo统计功能
tags: hexo
categories: hexo

---

## <span id="inline-blue">安装插件</span>


```shell

npm install hexo-wordcount --save
```

修改themes/next/_config.yml主题配置文件，搜索关键字post_wordcount,修改如下:
```shell
post_wordcount:
  item_text: true
  wordcount: true #单篇文章字数
  min2read: true #单篇阅读时长
  totalcount: true #站点总字数
  separated_meta: true
```







