---
title: hexo文章置顶功能
tags: hexo
categories: hexo
---

## <span id="inline-blue">移除默认安装的插件</span>
```shell
npm uninstall hexo-generator-index --save
```

## <span id="inline-blue">安装新插件</span>
```shell

npm install hexo-generator-index-pin-top --save
```

## <span id="inline-blue">置顶操作</span>
文章开头分割部分添加
```shell
top: true
```
多篇文章置顶，控制顺序，数值较大的排在前面
```shell
top:n
```

## <span id="inline-blue">设置置顶图标</span>
打开 /themes/next/layout/_macro/post.swig文件，在&lt;div class=&quot;post-meta&quot;&gt;下方，插入如下代码：
```shell
{% if post.top %}
    &lt;i class=&quot;fa fa-thumb-tack&quot;&gt;&lt;/i&gt;
    &lt;font color=7D26CD&gt;置顶&lt;/font&gt;
   &lt;span class=&quot;post-meta-divider&quot;&gt;|&lt;/span&gt;
{% endif %}
```

如下图所示位置：

![hexo文章置顶图标](/images/hexo/next/hexo_next_2021_01_10_002.png)




