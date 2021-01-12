---
title: hexo修改链接文字样式
tags: hexo
categories: hexo

---

## <span id="inline-blue">修改链接文字样式</span>
打开themes\next\source\css\_common\components\post\post.styl添加以下代码:
```css
.post-body p a{

 color: #0593d3;
 border-bottom: none;
 &:hover {
   color: #ff106c;
   text-decoration: underline;
 }
}
```










