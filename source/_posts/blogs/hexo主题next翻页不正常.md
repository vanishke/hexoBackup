---
title: Hexo主题next翻页不正常
tags: 
	- Hexo
categories: 
	- Hexo

date: 2020-11-16 12:23:25
updated: 2020-11-16 12:23:25
---

## <span id="inline-blue">修改文件</span>
themes\next\layout\_partials\pagination.swig

修改前
```css
{% if page.prev or page.next %}
  &lt;nav class=&quot;pagination&quot;&gt;
    {{
      paginator({
        prev_text: &#x27;&lt;i class=&quot;fa fa-angle-left&quot;&gt;&lt;/i&gt;&#x27;,
        next_text: &#x27;&lt;i class=&quot;fa fa-angle-right&quot;&gt;&lt;/i&gt;&#x27;,
        mid_size: 1
      })
    }}
  &lt;/nav&gt;
{% endif %}
```

修改后
```css
{% if page.prev or page.next %}
  &lt;nav class=&quot;pagination&quot;&gt;
    {{
      paginator({
        prev_text: &#x27;&lt;&#x27;,
        next_text: &#x27;&gt;&#x27;,
        mid_size: 1
      })
    }}
  &lt;/nav&gt;
{% endif %}
```








