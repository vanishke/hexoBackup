---
title: Hexo设置图片懒加载
categories:
	- Hexo
tags: 
	- Hexo
	- Next
	
date: 2021-01-15 15:11:20
updated: 2021-01-15 15:11:20
---

## <span id="inline-blue">下载样式</span>
在主题文件夹下的scripts文件夹里,新增一个js文件，名字可以任意。
```javascript
"use strict";
var cheerio = require('cheerio'); 
  
function lazyloadImg(source) {
    var LZ= cheerio.load(source, {
        decodeEntities: false
    });
    //遍历所有 img 标签，添加data-original属性
    LZ('img').each(function(index, element) {
        var oldsrc = LZ(element).attr('src');
        if (oldsrc) {
            LZ(element).removeAttr('src');
            LZ(element).attr({
                
                 'data-original': oldsrc
            });
            
        }
    });
    return LZ.html();
}
//在渲染之前，更改 img 标签
hexo.extend.filter.register('after_render:html', lazyloadImg);
```

打开themes/next/source/js/src/utils.js文件,找到lazyLoadPostsImages函数对应位置，将函数内容替换为以下内容。
```javascript
lazyLoadPostsImages: function () {
      $('img').lazyload({
	   //设置懒加载你默认占位图,自己下载一张加载图片放在hexo/themes/next/source/images路径下，名称//为loading.gif
         placeholder: '/images/loading.gif',
		 // 加载效果
        effect: 'fadeIn',
        threshold : 100, //设置图片在距离屏幕200px时提前加载
        failure_limit : 20,//将 failurelimit 设为 20 ，当插件找到 20 //个不在可见区域的图片时停止搜索 
        skip_invisible : false // 加载隐藏图片
      });
    },
```
