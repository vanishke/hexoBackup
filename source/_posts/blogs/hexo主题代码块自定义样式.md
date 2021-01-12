---
title: hexo主题代码块自定义样式
tags: hexo
categories: hexo

---

## <span id="inline-blue">代码块自定义样式</span>
打开themes/next/source/css/_custom/下的custom.styl,向里面加代码(颜色可以自己定义)

```css
code {
    color: #ff7600;
    background: #fbf7f8;
    margin: 2px;
}
// 边框的自定义样式
.highlight, pre {
    margin: 5px 0;
    padding: 5px;
    border-radius: 3px;
}
.highlight, code, pre {
    border: 1px solid #d6d6d6;
}
```







