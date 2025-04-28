---
title: Nginx禁止恶意扫描和爬虫
categories:
	- Nginx
tags: 
	- Nginx
	
date: 2025-04-27 16:30:25
updated: 2025-04-27 16:30:25
---
<!-- toc -->
# <span id="inline-blue">环境</span>
nginx: 1.24.0


# <span id="inline-blue">背景</span>
阿里云服务器部署微服务，Nginx请求日志出现大量莫名其妙的请求日志，并且请求路径携带非法特殊字符竟然导致微服务挂掉，所以需要增加访问过滤和反爬虫设置。

# <span id="inline-blue">过滤非法特殊字符</span>

http节点增加如下内容，修复nginx漏洞攻击，并定义非法控制字符

```shell
......
http{

	server_tokens off;
	#漏洞攻击
    add_header Content-Security-Policy "script-src 'self' 'unsafe-inline' 'unsafe-eval'" always;
    add_header Referrer-Policy "same-origin" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubdomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Download-Options "noopen" always;
    add_header X-Frame-Options "sameorigin" always;
    add_header X-Permitted-Cross-Domain-Policies  "none" always;                                          
    add_header X-Robots-Tag "none" always;
    add_header X-XSS-Protection "1; mode=block" always;
    proxy_hide_header  X-Powered-By;
    fastcgi_hide_header X-Powered-By;
	
	map $request_method $invalid_method {
		~*^[a-zA-Z0-9\-._%~]+$ 0;  # 合法方法返回 0
		default 1;                 # 其他情况视为非法，返回 1
	}

	map $uri $invalid_uri {
		~*[^\x20-\x7E] 1;          # 包含非法字符返回 1
		default 0;                 # 默认合法
	}
	......
}
```

server节点增加如下内容，过滤掉携带非法控制字符的请求

```shell

......
server{
	......
	client_max_body_size 1024m;  
        listen       80;
        server_name  dev-api.coframe.coship.com;
	### 引入屏蔽规则ip
    include /usr/local/nginx/conf/block_spiders.conf;
	
	# 综合判断：方法或URI任一非法则拦截
    if ($invalid_method) {
            return 400;
            break;
    }

    if ($invalid_uri) {
            return 400;
            break;
    }
	.......
}

```


# <span id="inline-blue">过滤ip</span>

nginx配置文件nginx.conf http节点增加如下配置：

```shell
......
http{
	
	### 引入屏蔽规则ip
    include /usr/local/nginx/conf/block_ips.conf;
	.......
}

```

nginx配置目录下增加配置文件block_ips.conf，路径: /usr/local/nginx/conf
block_ips.conf文件内容如下：

```shell
deny 223.70.213.73;
deny 45.148.10.4;
deny 78.153.140.151;
deny 45.148.10.97;
```

# <span id="inline-blue">过滤爬虫请求</span>

nginx配置文件nginx.conf server节点增加如下配置：

```shell
......
server{
	......
	client_max_body_size 1024m;  
        listen       80;
        server_name  dev-api.coframe.coship.com;
	### 引入屏蔽规则ip
    include /usr/local/nginx/conf/block_spiders.conf;
	.......
}

```

nginx配置目录下增加配置文件block_spiders.conf，路径: /usr/local/nginx/conf
block_spiders.conf文件内容如下：

```shell
# 禁止Scrapy等工具的抓取
#if ($http_user_agent ~* (Scrapy|HttpClient|PostmanRuntime|ApacheBench|Java||python-requests|Python-urllib|node-fetch)) {
#    return 403;
#}

# 禁止指定的 user agent 以及为空的访问
#if ($http_user_agent ~ "Nimbostratus|MJ12bot|MegaIndex|YisouSpider|^$" ) {
#    return 403;             
#}

# 屏蔽恶意访问
if ($document_uri ~* \.(php|asp|aspx|jsp|swp|git|env|yaml|yml|sql|db|bak|ini|docx|doc|rar|tar|gz|zip|log|txt)$) {
    return 404;
}

# 屏蔽指定关键词
if ($document_uri ~* (wordpress|phpinfo|wlwmanifest|phpMyAdmin|xmlrpc)) {
    return 404;
}
```