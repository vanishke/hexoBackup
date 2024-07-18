---
title: Hexo修改主题文章底部标签
tags: 
	- Hexo
categories: 
	- Hexo

date: 2020-11-16 11:08:12
updated: 2020-11-16 11:08:12
---

## <span id="inline-blue">修改模板</span>
/themes/next/layout/_macro/post.swig

```shell

搜索 rel=“tag”>#，将 # 换成<i class="fa fa-tag"></i>
```

效果如图：

![hexo修改文章底部标签](/images/hexo/next/hexo_next_2021_01_10_001.png)






