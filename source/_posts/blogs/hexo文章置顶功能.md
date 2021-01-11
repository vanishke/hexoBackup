---
title: hexo文章置顶功能
tags: hexo
categories: hexo

---

## 移除默认安装的插件
```bash
npm uninstall hexo-generator-index --save
```

## 安装新插件
```bash

npm install hexo-generator-index-pin-top --save
```

## 置顶操作
文章开头分割部分添加
```bash
top: true
```
多篇文章置顶，控制顺序，数值较大的排在前面
```bash
top:n
```

## 设置置顶图标

打开/themes/next/layout/_macro/post.swig文件，在<div class="post-meta">下方，插入如下代码：

```bash
{% if post.top %}
    <i class="fa fa-thumb-tack"></i>
    <font color=7D26CD>置顶</font>
    <span class="post-meta-divider">|</span>
{% endif %}
```
如下图所示位置：

![hexo文章置顶图标](/images/hexo/next/hexo_next_2021_01_10_002.png)




