---
title: 解决SpringCloud-Gateway请求favicon.ico出现404
categories:
	- SpringCloud
tags: 
	- SpringCloud
	- Java
	- knife4j-gateway
	
date: 2024-06-21 17:39:20
updated: 2024-06-21 17:39:20
---
<!-- toc -->
# <span id="inline-blue">背景</span>
微服务网关模块集成knife4j-gateway,访问/doc.html发现浏览器请求/favicon.ico报错，提示404
# <span id="inline-blue">解决办法</span>
knife4j-gateway子依赖knife4j-springdoc-ui默认提供了favicon.ico等静态文件，拷贝一份通过https://www.bitbug.net ,网址制作一份网站图标并将其放在网关模块/src/main/resources/static/路径下并重名为favicon.ico
knife4j-springdoc-uijar包解压后favicon.ico文件路径如下所示：
![Knife4j](/images/Knife4j/Knife4j_20240621_001.png)
favicon.ico文件如果想要自定义存放的位置需要在网关自定义favicon.ico访问地址，因为SpringCloud微服务的静态文件的默认访问路径在/src/main/resources/static/
网关模块favicon.ico存放地址如下图所示：
![Knife4j](/images/Knife4j/Knife4j_20240621_002.png)

# <span id="inline-blue">验证</span>
![Knife4j](/images/Knife4j/Knife4j_20240621_003.png)
