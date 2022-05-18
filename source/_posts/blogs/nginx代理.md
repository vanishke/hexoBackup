---
title: nginx代理
categories: 
	- Linux
	- nginx
tags: 
	- Linux
	- nginx
date: 2021-05-31 10:11:20
---
<!-- toc -->

## <span id="inline-blue">代理访问路径</span>

图片真实访问地址：http://10.9.216.12:8070/upload.war/homepage/641bcaac4ebbccbd22ebd12fe798e95e.png

代理访问地址：http://10.9.216.12:8888/upload/homepage/641bcaac4ebbccbd22ebd12fe798e95e.png

## <span id="inline-blue">配置详情</span>
```shell
server {
        listen       8888; //代理访问的端口
        server_name  10.9.216.12;//代理访问的IP地址

        #charset koi8-r;

        #access_log  logs/host.access.log  main;

        location /upload {
            proxy_pass http://10.9.216.12:8070/upload.war/; //代理访问路径
            index  index.html index.htm;
        }
		//proxy_pass参数路径分隔符作用
		//访问/upload/homepage/641bcaac4ebbccbd22ebd12fe798e95e.png
		//代理以"/"结束
		//将匹配到的/upload去掉之后拼接到代理访问路径的后面，访问效果http://10.9.216.12:8070/upload.war/homepage/641bcaac4ebbccbd22ebd12fe798e95e.png
		//代理不以"/"结束
		//将匹配到的访问路径直接拼接到代理路径的后面，访问效果http://10.9.216.12:8070/upload.war/upload/homepage/641bcaac4ebbccbd22ebd12fe798e95e.png
```








