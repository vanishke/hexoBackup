---
title: Windows nginx代理Hexo静态文件部署访问
categories:
	- Hexo

date: 2024-07-09 14:10:20
tags: 
	- Hexo
	- Nginx
	- Windows
---
<!-- toc -->
# <span id="inline-blue">背景</span>
hexo打包启动之后本地访问特别慢，通过nginx代理静态文件优化访问速度
# <span id="inline-blue">实现</span>
Hexo所在根目录执行Hexo deploy命令之后在public目录生成静态文件，将其拷贝至nginx主目录
Hexo静态文件生成目录图
![Hexo优化](/images/hexo/hexo_nginx_20240709_001.png)

静态文件所在nginx目录结构图
![Hexo优化](/images/hexo/hexo_nginx_20240709_002.png)

nginx新增配置如下：
```shell
server {
        listen       8888;
        server_name  10.9.212.55;

        charset utf-8;

        access_log  logs/host.access.log ;

        location / {
			charset utf-8;
			autoindex on;
            alias  blog/;
        }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
```

