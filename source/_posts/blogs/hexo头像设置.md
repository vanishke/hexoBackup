---
title: hexo头像设置
tags: hexo
categories: hexo

---

## <span id="inline-blue">hexo头像设置</span>
```css
# 修改themes\next\source\css\_common\components\sidebar\sidebar-author.styl,新增以下代码:
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

## <span id="inline-blue">添加头像</span>

打开themes/next下的_config.yml文件，搜索 Sidebar Avatar关键字，去掉avatar前面的#

```css
# Sidebar Avatar
# in theme directory(source/images): /images/avatar.jpg
# in site  directory(source/uploads): /uploads/avatar.jpg
avatar: /images/avatar.png
```








