---
title: Hexo设置下载样式
categories: 
	- Hexo
tags: 
	- Hexo

date: 2021-01-12 10:11:20
updated: 2021-01-12 10:11:20
---

## 下载样式
打开themes/next/source/css/_custom 下的 custom.styl 文件,添加属性样式
```css
a#download {
display: inline-block;
padding: 0 10px;
color: #000;
background: transparent;
border: 2px solid #000;
border-radius: 2px;
transition: all .5s ease;
font-weight: bold;
&:hover {
background: #000;
color: #fff;
}
}
```
在你需要编辑的文章地方。放置如下代码
```css
<a id="download" href="http://mirrors.aliyun.com/docker-toolbox/windows/docker-toolbox/?spm=5176.8351553.0.0.4bc61991tQpsnV"><i class="fa fa-download"></i><span> 阿里云Docker镜像</span> </a>

```