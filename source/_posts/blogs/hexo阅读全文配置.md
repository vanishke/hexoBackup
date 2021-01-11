---
title: hexo阅读全文配置
tags: hexo
categories: hexo

---

## 修改 阅读全文 前显示文字数量
第一种方式：
打开 themes/next/_config.yml，搜索关键字 auto_excerpt， 修改length即可修改阅读全文前显示文字数量
```bash
# Automatically Excerpt. Not recommend.
# Please use <!-- more --> in the post to control excerpt accurately.
auto_excerpt:
  enable: false
  length: 150
```

第二种方式：
文章任意位置添加 <!-- more -->









