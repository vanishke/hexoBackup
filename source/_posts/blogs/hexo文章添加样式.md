---
title: Hexo文章添加样式
tags: 
	- Hexo
categories: 
	- Hexo

date: 2022-05-18 09:32:12
updated: 2022-05-18 09:32:12
---

## <span id="inline-blue">标题添加背景色</span>


打开themes/next/source/css/_custom 下的 custom.styl 文件,添加属性样式

```css
// 颜色块-黄
span#inline-yellow {
display:inline;
padding:.2em .6em .3em;
font-size:80%;
font-weight:bold;
line-height:1;
color:#fff;
text-align:center;
white-space:nowrap;
vertical-align:baseline;
border-radius:0;
background-color: #f0ad4e;
}
// 颜色块-绿
span#inline-green {
display:inline;
padding:.2em .6em .3em;
font-size:80%;
font-weight:bold;
line-height:1;
color:#fff;
text-align:center;
white-space:nowrap;
vertical-align:baseline;
border-radius:0;
background-color: #5cb85c;
}
// 颜色块-蓝
span#inline-blue {
display:inline;
padding:.2em .6em .3em;
font-size:80%;
font-weight:bold;
line-height:1;
color:#fff;
text-align:center;
white-space:nowrap;
vertical-align:baseline;
border-radius:0;
background-color: #2780e3;
}
// 颜色块-紫
span#inline-purple {
display:inline;
padding:.2em .6em .3em;
font-size:80%;
font-weight:bold;
line-height:1;
color:#fff;
text-align:center;
white-space:nowrap;
vertical-align:baseline;
border-radius:0;
background-color: #9954bb;
}
```

在你需要编辑的文章地方。放置如下代码
```css
<span id="inline-blue"> 站点配置文件 </span>
<span id="inline-purple"> 主题配置文件 </span>
<span id="inline-yellow"> 站点配置文件 </span>
<span id="inline-green"> 主题配置文件 </span>
```






