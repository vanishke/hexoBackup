---
title: Hexo使用Next主题异常
tags: 
	- Hexo
categories: 
	- Hexo

date: 2021-01-12 10:11:20
updated: 2021-01-12 10:11:20
---

## <span id="inline-blue">问题描述<span>

访问hexo ,出现以下提示

```css
{% extends '_layout.swig' %} {% import '_macro/post.swig' as post_template %} {% import '_macro/sidebar.swig' as sidebar_template %} {% block title %}{{ config.title }}{% if theme.index_with_subtitle and config.subtitle %} - {{config.subtitle }}{% endif %}{% endblock %} {% block page_class %} {% if is_home() %}page-home{% endif -%} {% endblock %} {% block content %}
{% for post in page.posts %} {{ post_template.render(post, true) }} {% endfor %}
{% include '_partials/pagination.swig' %} {% endblock %} {% block sidebar %} {{ sidebar_template.render(false) }} {% endblock %}

```



## <span id="inline-blue">问题原因</span>

hexo在5.0之后把swig给删除了需要自己手动安装

## 解决办法

```shell
npm i hexo-renderer-swig

```



