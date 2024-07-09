---
title: Nginx配置MySQL请求转发
categories:
	- Nginx

date: 2024-01-12 11:26:20
tags: 
	- Nginx
---
<!-- toc -->

# <span id="inline-blue">环境</span>
linux : CentOS Linux release 7.7.1908 (Core)
nginx : 1.18.1
MySQL : 5.7
# <span id="inline-blue">目的</span>
通过nginx转发MySQL请求，解决内网环境和MySQL网络不能通信的情况
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
----with-stream 说明nginx编译时已添加stream模块支持。
如果没有对应的模块需要备份nginx配置，添加----with-stream参数支持重新编译nginx并安装。
```shell
./configure --prefix=/usr/local/nginx \
--sbin-path=/usr/local/nginx/sbin/nginx \
--modules-path=/usr/local/nginx/modules \
--conf-path=/usr/local/nginx/conf/nginx.conf \
--error-log-path=/usr/local/nginx/logs/error.log \
--http-log-path=/usr/local/nginx/logs/access.log \
--pid-path=/usr/local/nginx/logs/nginx.pid \
--lock-path=/usr/local/nginx/logs/nginx.lock \
--with-http_gzip_static_module \
--with-http_ssl_module \
--with-stream
```
## <span id="inline-blue">nginx配置</span>
nginx当前所在服务器为10.9.216.12,,监听3308端口，将请求转发到10.9.216.14:3306
```shell
user  root;
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;


events {
    worker_connections  1024;
}

stream {
    upstream mysqlupstream {
       hash $remote_addr consistent;
       server 10.9.216.14:3306 weight=5 max_fails=3 fail_timeout=30s;
    }
    server {
       listen 3308;
       proxy_connect_timeout 10s;
       proxy_timeout 300s;
       proxy_pass mysqlupstream;
    }
}
```
strean节点的内容是对应转发的关键配置，其他的信息主要是用于确定节点添加的位置。
# <span id="inline-blue">数据库连接配置</span>
```properties
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://10.9.216.12:3308/lovehome_xw?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=GMT%2B8
spring.datasource.username=root
spring.datasource.password=coship
spring.datasource.name=lovehome_xw
spring.datasource.type=com.alibaba.druid.pool.DruidDataSource
spring.datasource.initial-size=5
spring.datasource.min-idle=5
spring.datasource.max-active=20
spring.datasource.max-wait=30000
spring.datasource.time-between-eviction-runs-millis=60000
spring.datasource.min-evictable-idle-time-millis=300000
spring.datasource.validation-query=select '1' from dual
spring.datasource.test-while-idle=true
spring.datasource.test-on-borrow=false
spring.datasource.test-on-return=false
spring.datasource.pool-prepared-statements=true
spring.datasource.max-open-prepared-statements=20
spring.datasource.max-pool-prepared-statement-per-connection-size=20
spring.datasource.filters=stat,wall
```
