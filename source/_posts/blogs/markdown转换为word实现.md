---
title: markdown转换为word实现
categories: 
	- markdown
tags: 
	- markdown
	- pandoc
	- word
	- typora
	
date: 2025-12-29 13:55:48
updated: 2025-12-29 13:55:48
---
<!-- toc -->

# <span id="inline-blue">背景</span>

平时记录习惯使用markdown作为记录工具，兼容性好，但是有时需要提供word格式的文档，不想重写再2整理一遍，想着能不能直接通过markdown直接转换为word格式，一番尝试之后终于成功了。

# <span id="inline-blue">实现</span>

首先需要安装pandoc工具，实现markdown转换为word目前来说实现效果比较不错的工具，如果使用typora作为markdown编辑工具，那么想要在typora导出word文档，typora就会引导用户安装pandoc,
在已经安装pandoc的情况下，转换的简单命令如下：

```shell
pandoc -s test.md -o dest.docx
```

参数说明：

-s : markdown源文件名称
-o : 目的word文件名称

以上命令在md格式文档路径下执行，默认该目录下生成对应word文件，转换之后的word查看之后发现格式混乱，列表和表格样式缺失，导致达不到预期效果，好在pandoc在实现转换时提供参数--reference-doc指定导出的样式。
调用方式如下：

```shell
pandoc -s source.md -o dest.docx --reference-doc templ.docx

```

其中templ.docx为word导出时指定的参考模板，以下是该模板下载链接：
 https://pan.baidu.com/s/12Z_RRSCgs01xRbFEH0KsNg?pwd=cyvf 提取码: cyvf
 
 
