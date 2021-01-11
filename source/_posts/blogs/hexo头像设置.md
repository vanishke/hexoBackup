---
title: hexo头像设置
tags: hexo
categories: hexo

---

## hexo头像设置
修改themes\next\source\css\_common\components\sidebar\sidebar-author.styl,新增以下代码:
```bash
.site-author-image {
  display: block;
  margin: 0 auto;
  padding: $site-author-image-padding;
  max-width: $site-author-image-width;
  height: $site-author-image-height;
  border: $site-author-image-border-width solid $site-author-image-border-color;
  //设置圆形
  border-radius: 50%;
  transition: 2s all;
}
   //旋转
 .site-author-image:hover{
   transform: rotate(360deg);
 }
```










