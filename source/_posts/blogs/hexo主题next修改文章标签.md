---
title: hexo修改主题文章底部标签
tags: hexo
categories: hexo

---

## 修改模板
/themes/next/layout/_macro/post.swig

```bash

搜索 rel=“tag”>#，将 # 换成<i class="fa fa-tag"></i>
```

效果如图：

![hexo修改文章底部标签](/images/hexo/next/hexo_next_2021_01_10_001.png)






