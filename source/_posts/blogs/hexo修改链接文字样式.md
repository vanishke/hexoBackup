---
title: Hexo修改链接文字样式
tags: 
	- Hexo
categories: 
	- Hexo

date: 2023-05-20 14:50:53
updated: 2023-05-20 14:50:53
---

## <span id="inline-blue">修改链接文字样式</span>
打开themes\next\source\css\\_common\components\post\post.styl添加以下代码:
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










