---
title: hexo彩色标签云
tags: hexo
categories: hexo

---

## 彩色标签云
在/themes/next/layout/目录下，新增tag-color.swig文件，加入下方代码：

```bash
<script type="text/javascript">
     var alltags = document.getElementsByClassName('tag-cloud-tags');
     var tags = alltags[0].getElementsByTagName('a');
     for (var i = tags.length - 1; i >= 0; i--) {
       var r=Math.floor(Math.random()*75+130);
       var g=Math.floor(Math.random()*75+100);
       var b=Math.floor(Math.random()*75+80);
       tags[i].style.background = "rgb("+r+","+g+","+b+")";
     }
</script>

<style>
  .tag-cloud-tags{
    /*font-family: Helvetica, Tahoma, Arial;*/
    /*font-weight: 100;*/
    text-align: center;
    counter-reset: tags;
  }
  .tag-cloud-tags a{
    border-radius: 6px;
    padding-right: 5px;
    padding-left: 5px;
    margin: 8px 5px 0px 0px;
  }
  .tag-cloud-tags a:before{
    content: "?";
  }

  .tag-cloud-tags a:hover{
     box-shadow: 0px 5px 15px 0px rgba(0,0,0,.4);
     transform: scale(1.1);
     /*box-shadow: 10px 10px 15px 2px rgba(0,0,0,.12), 0 0 6px 0 rgba(104, 104, 105, 0.1);*/
     transition-duration: 0.15s;
  }
</style>
```
在/themes/next/layout/page.swig/中引入tag-color.swig：
```bash
在下方加上 {% include 'tag-color.swig' %} 代码
<div class="tag-cloud">
          <!--    <div class="tag-cloud-title">
                {{ _p('counter.tag_cloud', site.tags.length) }}
            </div>  -->
             <div class="tag-cloud-tags" id="tags">
			  {{ tagcloud({min_font: 16, max_font: 16, amount: 300, color: true, start_color: '#FFF', end_color: '#FFF'}) }}            
		  </div>
		</div>
     {% include 'tag-color.swig' %}	
```
或者将上方代码直接添加到下方

## 将标签云放到首页

在路径：/themes/next/layout/index.swig 中

```bash
{% block content %}下面添加下方代码
{% block content %}

	<div class="tag-cloud">
	  <div class="tag-cloud-tags" id="tags">
		{{ tagcloud({min_font: 16, max_font: 16, amount: 300, color: true, start_color: '#fff', end_color: '#fff'}) }}
	  </div>
	</div>
	<br>
{% include 'tag-color.swig' %}
```


