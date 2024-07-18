---
title: Nginx基于特定访问路径的location匹配
categories: 
	- Nginx
tags: 
	- Nginx
	
date: 2024-01-25 17:11:20
updated: 2024-01-25 17:11:20
---
<!-- toc -->

## <span id="inline-blue">环境</span>
Linux : CentOS Linux release 7.6.1810 (Core) 
Nginx : nginx/1.18.0 

## <span id="inline-blue">背景</span>
项目最近实现了"一键置灰"功能，通过在原始接口下发的图片访问路径增加一层路径实现切换到自定义图片访问地址。

接口下发图片地址：
图片灰色地址：http://10.9.216.103:8098/grey/oms-pic/special/common/048/10033.png
图片彩色地址：http://10.9.216.103:8098/oms-pic/special/common/048/10033.png

灰色主题下本地图片访问路径：/home/nanjing_oms/grey/oms-pic/special/common/048/10033.png
彩色主题下本地图片访问路径：/home/nanjing_oms/oms-pic/special/common/048/10033.png

灰色主题下访问路径在oms-pic前面多了/grey/路径。


## <span id="inline-blue">实现</span>
```shell
server {
        listen       8098;
        server_name  10.9.216.104;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;
        # access_log off;
		# 访问根路径匹配/grey的情况下访问/home/nanjing_oms/grey/oms-pic
        location ^~ /grey {
            #expires 3d;
			autoindex on;
            root /home/nanjing_oms/;
            #proxy_store on;
            #proxy_store_access user:rw group:rw all:rw;
            #proxy_temp_path ./proxy_temp;
            if ( !-e $request_filename)  {
                 #proxy_pass http://10.9.216.103:8060$uri;
            }
            index  index.html index.htm;
        }
		# 访问根路径匹配/oms-pic的情况下访问/home/nanjing_oms/oms-pic
		location ^~ /oms-pic {
            #expires 3d;
			autoindex on;
            root /home/nanjing_oms/;
            #proxy_store on;
            #proxy_store_access user:rw group:rw all:rw;
            #proxy_temp_path ./proxy_temp;
            if ( !-e $request_filename)  {
                 #proxy_pass http://10.9.216.103:8060$uri;
            }
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }   
 }
```

## <span id="inline-blue">文件访问指令root和alias的差异</span>
root: 服务器实际访问路径为 root路径 ＋ location路径
```shell
location /html {
	root /usr/local/nginx/;
}
请求:  http://10.9.212.55:8080/html/a.html => 匹配服务器文件: /usr/local/nginx/html/a.html
请求:  http:/10.9.212.55:8080/html/www/a.html => 匹配服务器文件: /usr/local/nginx/html/www/a.html
```
alias: 服务器实际访问路径为 alias路径 ＋ 去掉location路径后的请求路径
```shell
location /html {
	alias /usr/local/nginx/;
}
请求:  http://10.9.212.55:8080/html/a.html => 匹配服务器文件: /usr/local/nginx/a.html
请求:  http://10.9.212.55:8080/html/www/a.html => 匹配服务器文件: /usr/local/nginx/www/a.html

location /html/www {
	alias /usr/local/nginx;
}
请求:  http://10.9.212.55:8080/html/www/a.html => 匹配服务器文件: /usr/local/nginx/a.html

```






