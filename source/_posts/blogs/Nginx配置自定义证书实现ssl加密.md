---
title: Nginx配置自定义证书实现ssl加密
categories:
	- Nginx
tags: 
	- Nginx
	
date: 2024-01-09 9:50:20
updated: 2024-01-09 9:50:20
---
<!-- toc -->

# <span id="inline-blue">环境</span>
linux : CentOS Linux release 7.7.1908 (Core)
nginx : 1.18.1
# <span id="inline-blue">目的</span>
访问nginx添加ssl加密，使用自定义安全证书
# <span id="inline-blue">实现</span>
查看当前nginx版本是否支持ssl
```shell
cd /usr/local/nginx/sbin
./nginx -V
nginx version: nginx/1.18.0
built by gcc 4.8.5 20150623 (Red Hat 4.8.5-39) (GCC) 
built with OpenSSL 1.0.2k-fips  26 Jan 2017
TLS SNI support enabled
configure arguments: --prefix=/usr/local/nginx --user=nginx --group=nginx --with-http_ssl_module --with-http_v2_module --with-http_realip_module --with-http_stub_status_module --with-http_gzip_static_module --with-pcre --with-stream --with-stream_ssl_module --with-stream_realip_module
```
--with-http_ssl_module 说明nginx编译时已添加ssl模块支持，如果没有对应标识，需要重新执行nginx编译，命令内容如下，路径参数执行修改
```shell
./configure --prefix=/usr/local/nginx \
            --sbin-path=/usr/sbin/nginx \
            --modules-path=/usr/lib/nginx/modules \
            --conf-path=/usr/local/nginx/conf/nginx.conf \
            --error-log-path=/var/log/nginx/error.log \
            --http-log-path=/var/log/nginx/access.log \
            --user=nginx \
            --group=nginx \
            --with-http_ssl_module \
			--with-http_v2_module \
			--with-http_realip_module \
			--with-http_stub_status_module \
			--with-http_gzip_static_module \
			--with-pcre --with-stream \
			--with-stream_ssl_module \
			--with-stream_realip_module
```



## <span id="inline-blue">自定义安全证书</span>
```shell
#指定/home路径下生成certificate.jks证书，秘钥为coshipOk698
keytool -genkey -alias coship  -keyalg RSA -keysize 2048 -validity 3650 -ext SAN=dns:www.nginx12.com,ip:10.9.216.12  -keystore /home/certificate.jks -storepass coshipOk698 -dname "CN=www.nginx82.com, OU=www.nginx82.com, O=www.nginx82.com, L=wuhan, ST=wuhan, C=cn"
```

## <span id="inline-blue">证书格式转换</span>
```shell
#certificate.jks是键值对形式的证书，推荐转换为标准格式pkcs12
keytool -importkeystore -srckeystore certificate.jks -destkeystore certificate.jks -deststoretype pkcs12
```

## <span id="inline-blue">导出证书</span>
```shell
#将certificate.jks证书导出，certificate.jks已经是pkcs12格式
keytool -export -trustcacerts -alias coship -file /home/cas.crt -keystore /home/certificate.jks -storepass coshipOk698
```
## <span id="inline-blue">cer格式转换为pem</span>
```shell
#将cas.crt格式转换为server.pem，方便nginx使用
openssl x509 -inform der -in cas.crt -out server.pem
```

## <span id="inline-blue">提取私钥</span>
```shell
openssl pkcs12 -nocerts -nodes -in certificate.jks -out server.key
```

## <span id="inline-blue">nginx配置</span>
将转换后的证书server.pem、server.key 上传到nginx配置对应的目录，当前使用的是默认的/home路径下
监听端口为443， ssl_certificate、ssl_certificate_key配置为新增的证书和密钥的路径
```shell
server {
		client_max_body_size 1024m;  
        listen       443 ssl;
        server_name  www.nginx12.com;
		
		ssl_certificate      /home/server.pem;
        ssl_certificate_key  /home/server.key;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;

        location / {
            root   /home/dev/dist-prodtest;
            #root   /home/dev/prod; 
            index  index.html;
			try_files $uri $uri/ /index.html;
        }
		
		# 反向代理
		location /prodtest/ {
			proxy_pass http://10.9.216.12:9001/dev/;
			proxy_set_header Host 10.9.216.12;
			proxy_connect_timeout 6;
			proxy_send_timeout 6;
			proxy_read_timeout 6;
			send_timeout 6;
         }
			 

        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
```

# <span id="inline-blue">验证</span>
![nginx安全访问验证](/images/nginx/nginx_20240109_001.png)