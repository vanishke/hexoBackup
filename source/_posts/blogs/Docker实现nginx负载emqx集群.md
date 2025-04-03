---
title: Docker实现nginx负载emqx集群
categories:
	- Docker
tags: 
	- Emqx
	- Docker
	- Nginx
	
date: 2025-04-03 10:44:10
updated: 2025-04-03 10:44:10
---
<!-- toc -->
# <span id="inline-blue">环境</span>
Docker: 27.3.1
docker compose: v2.29.7
Emqx: 5.7.2
Nginx: 1.27.4

# <span id="inline-blue">背景</span>
docker部署emqx集群服务之后，查看emqx官方文档,建议使用nginx提供https访问并实现负载均衡。

# <span id="inline-blue">实现</span>

docker-swarm-emqx-nginx.yml配置文件如下：
```yml
services:
  photoframe-emqx-nginx:
    image: photoframe-emqx-nginx
    env_file:
      - .env
    build:
      context: ./emqx_nginx
    networks:
      - photoframe-base_photoframe-net
    ports:
      - target: 8884
        published: 8884
        protocol: tcp
        mode: host
      - target: 8085
        published: 8085
        protocol: tcp
        mode: host
      - target: 443
        published: 443
        protocol: tcp
        mode: host
    volumes:
      - ./emqx_nginx/conf/nginx.conf:/etc/nginx/nginx.conf
      - ./emqx_nginx/https:/home/nginx/https
      - ./emqx_nginx/logs:/var/log/nginx
    environment:
      TZ: Asia/Shanghai
    deploy:
      mode: replicated
      replicas: 1
      endpoint_mode: vip
      restart_policy:
        condition: on-failure
        delay: 3s
        max_attempts: 3
        window: 30s
      rollback_config:
        parallelism: 2
        delay: 5s
        failure_action: pause
        monitor: 15s
        max_failure_ratio: 0
        order: stop-first
      update_config:
        parallelism: 2
        delay: 10s
        failure_action: pause
        monitor: 15s
        max_failure_ratio: 0
        order: stop-first
      placement:
        constraints:
          - node.labels.role==interface
networks:
  photoframe-base_photoframe-net:
    external: true
```

Dockerfile:

```Dockerfile
# 基础镜像
FROM nginx:1.27.4
# 挂载目录
VOLUME /home/nginx
# 创建目录
RUN mkdir -p /home/nginx
# 指定路径
WORKDIR /home/nginx
# 复制conf文件到路径
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
# 复制html文件到路径
COPY ./https /home/nginx/https/
#复制容器依赖检测工具docker-compose-wait
COPY ./docker-compose-wait/wait /wait
#赋予检测脚本可执行权限
RUN chmod a+x /wait
#容器启动命令
CMD /wait && nginx -g 'daemon off;'
```

nginx配置文件如下:

```shell

user root;
worker_processes auto;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;


events {
	worker_connections 1024;
}

stream{

       #emqx ssl
       upstream mqtt_servers {
                server photoframe-emqx-node1:1883;
                server photoframe-emqx-node2:1883;
       }
       #emqx websocket ssl
       upstream mqtt_websocket_servers {
                server photoframe-emqx-node1:8083;
                server photoframe-emqx-node2:8083;
       }
       server {
        		listen 8884 ssl;
        		#charset koi8-r;
        		#access_log  logs/host.access.log  main;
        		proxy_buffer_size 4k;
                ssl_handshake_timeout 15s;
                ssl_session_cache shared:SSL:10m;
                ssl_session_timeout 10m;
        		ssl_certificate /home/nginx/https/mqtt/server.pem;
        		ssl_certificate_key /home/nginx/https/mqtt/server.key;
                ssl_protocols  TLSv1.3;
		        ssl_prefer_server_ciphers on;
		        ssl_ciphers 'EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5';

                proxy_pass mqtt_servers;

                # 启用此项时，对应后端监听器也需要启用 proxy_protocol
                #proxy_protocol on;
                proxy_connect_timeout 10s;
                # 默认心跳时间为 10 分钟
                proxy_timeout 1800s;
                tcp_nodelay on;
       }

	   server {
                listen 8085 ssl;
                proxy_buffer_size 4k;
                ssl_handshake_timeout 15s;
                ssl_session_cache shared:SSL:10m;
                ssl_session_timeout 10m; 
                ssl_certificate /home/nginx/https/mqtt/server.pem;
                ssl_certificate_key /home/nginx/https/mqtt/server.key;
                ssl_protocols  TLSv1.3;
                ssl_prefer_server_ciphers on;
                ssl_ciphers 'EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5';

                # 添加 CA 证书及开启验证客户端证书参数即可启用双向认证
                # ssl_client_certificate /usr/local/NGINX/certs/ca.pem;
                # ssl_verify_client on;

                proxy_pass mqtt_websocket_servers;

                # 启用此项时，对应后端监听器也需要启用 proxy_protocol
                #proxy_protocol on;
                proxy_connect_timeout 10s;
                # 默认心跳时间为 10 分钟
                proxy_timeout 1800s;
                tcp_nodelay on;
       }

    }

http {
	include       mime.types;
	default_type  application/octet-stream;
	client_max_body_size 1024m;

	#log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
	#                  '$status $body_bytes_sent "$http_referer" '
	#                  '"$http_user_agent" "$http_x_forwarded_for"';

	#access_log  logs/access.log  main;

	sendfile        on;
	#tcp_nopush     on;

	#keepalive_timeout  0;
	keepalive_timeout  65;

	#gzip  on;

	server {
        client_max_body_size 1024m;
        listen       443 ssl;
        server_name  api.xxx.xxx.com;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;

		ssl_certificate /home/nginx/https/api/server.pem; # 证书文件路径
		ssl_certificate_key /home/nginx/https/api/server.key; # 私钥文件路径

		ssl_protocols TLSv1.2 TLSv1.3; # 推荐的TLS协议
		ssl_prefer_server_ciphers on;
		ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES256-GCM-SHA384';

		 # knife4j反向代理
        location /prod/ {
            #rewrite ^/prod-api(.*)$ $1 break; #去除prod-api这层目录
			proxy_pass http://photoframe-gateway:9001/prod/;
            proxy_set_header    Host                $http_host;
			proxy_set_header    X-Real-IP           $realip_remote_addr;
			proxy_set_header    X-Forwarded-Proto   $scheme;
			proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;
			proxy_connect_timeout 60;
			proxy_send_timeout 60;
			proxy_read_timeout 60;
			send_timeout 60;

			add_header Cache-Control no-cache;
			# 不缓存，支持流式输出
			proxy_cache off;  # 关闭缓存
			proxy_buffering off;  # 关闭代理缓冲
			chunked_transfer_encoding on;  # 开启分块传输编码
			tcp_nopush on;  # 开启TCP NOPUSH选项，禁止Nagle算法
			tcp_nodelay on;  # 开启TCP NODELAY选项，禁止延迟ACK算法
			keepalive_timeout 300;  # 设定keep-alive超时时间为65秒
			#
			# #防止跨域问题
			add_header 'Access-Control-Allow-Origin' '*' always;
			add_header 'Access-Control-Allow-Credentials' 'true';
			add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
			add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
         }

        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }

}
```

注意点：

1、https证书参数ssl_certificate、ssl_certificate_key指定的证书和密钥路径一定要匹配。
2、nginx实现负载均衡需要stream模块，编译参数一定要有对应模块支持，可以通过以下命令查询是否有对应参数：
```shell
[root@S21612 sbin]# ./nginx -V
nginx version: nginx/1.18.0
built by gcc 4.8.5 20150623 (Red Hat 4.8.5-39) (GCC) 
built with OpenSSL 1.0.2k-fips  26 Jan 2017
TLS SNI support enabled
configure arguments: --prefix=/usr/local/nginx --user=nginx --group=nginx --with-http_ssl_module --with-http_v2_module --with-http_realip_module --with-http_stub_status_module --with-http_gzip_static_module --with-pcre --with-stream --with-stream_ssl_module --with-stream_realip_module
```

--with-stream --with-stream_ssl_module 参数表示支持stream流转发。

3、上述nginx实现的https为单向认证，listen参数监听的端口需要带有ssl标识，否则使用MQTTX客户端连接emqx报错：
```shell
Error: Client network socket disconnected before secure TLS connection was established
```


