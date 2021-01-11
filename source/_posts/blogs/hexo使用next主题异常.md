---
title: hexo使用next主题异常
tags: hexo
categories: hexo

---

## 问题描述

访问hexo ,出现以下提示

```bash
{% extends '_layout.swig' %} {% import '_macro/post.swig' as post_template %} {% import '_macro/sidebar.swig' as sidebar_template %} {% block title %}{{ config.title }}{% if theme.index_with_subtitle and config.subtitle %} - {{config.subtitle }}{% endif %}{% endblock %} {% block page_class %} {% if is_home() %}page-home{% endif -%} {% endblock %} {% block content %}
{% for post in page.posts %} {{ post_template.render(post, true) }} {% endfor %}
{% include '_partials/pagination.swig' %} {% endblock %} {% block sidebar %} {{ sidebar_template.render(false) }} {% endblock %}

```



## 问题原因

hexo在5.0之后把swig给删除了需要自己手动安装

## 解决办法

```bash
npm i hexo-renderer-swig

```



