---
title: hexo近期文章设置
tags: hexo
categories: hexo

---

## 近期文章设置
修改themes/next/layout/_macro/sidebar.swig 。找到theme.social板块代码，在该板块最后的endif后隔一行添加如下代码。
```bash
.post {
  margin-top: 60px;
  margin-bottom: 60px;
  padding: 25px;
  -webkit-box-shadow: 0 0 5px rgba(202, 203, 203, .5);
  -moz-box-shadow: 0 0 5px rgba(202, 203, 204, .5);
 }
```

编辑themes/next/source/css/_common/components/sidebar/sidebar-blogroll.styl

```bash
li.recent_posts_li {
    text-align: cengter;
    display: block;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
```

在 themes/next/_config.yml中添加下方代码

```bash
# 近期文章设置
recent_posts_title: 近期文章
recent_posts_layout: block
recent_posts: true
```







