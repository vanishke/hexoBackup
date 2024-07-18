---
title: Hexo修改[read more]按钮样式
tags: 
	- Hexo
categories: 
	- Hexo

date: 2022-05-18 09:32:12
updated: 2022-05-18 09:32:12
---

## <span id="inline-blue">安装插件</span>
修改themes\next\source\css\_custom\custom.styl文件，加入自定义样式

```css

// [Read More]按钮样式
.post-button .btn {
    color: #555 !important;
    background-color: rgb(255, 255, 255);
    border-radius: 3px;
    font-size: 15px;
    box-shadow: inset 0px 0px 10px 0px rgba(0, 0, 0, 0.35);
    border: none !important;
    transition-property: unset;
    padding: 0px 15px;
}

.post-button .btn:hover {
    color: rgb(255, 255, 255) !important;
    border-radius: 3px;
    font-size: 15px;
    box-shadow: inset 0px 0px 10px 0px rgba(0, 0, 0, 0.35);
    background-image: linear-gradient(90deg, #a166ab 0%, #ef4e7b 25%, #f37055 50%, #ef4e7b 75%, #a166ab 100%);
}
```










