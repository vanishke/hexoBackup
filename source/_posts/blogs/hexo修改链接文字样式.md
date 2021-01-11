---
title: hexo修改链接文字样式
tags: hexo
categories: hexo

---

## 修改链接文字样式
打开themes\next\source\css\_common\components\post\post.styl添加以下代码:
```bash
.post-body p a{

 color: #0593d3;
 border-bottom: none;
 &:hover {
   color: #ff106c;
   text-decoration: underline;
 }
}
```










