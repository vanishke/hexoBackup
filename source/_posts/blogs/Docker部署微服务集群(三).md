---
title: Docker部署微服务集群(三)
categories:
	- Docker
tags: 
	- Docker
	
date: 2024-12-05 16:31:11
updated: 2024-12-05 16:31:11
---
<!-- toc -->
# <span id="inline-blue">环境</span>
Docker: 26.1.4
docker-compose: v2.25.0
# <span id="inline-blue">背景</span>
为了更好的管理docker镜像和容器服务，引入docker-compose容器编排工具，统一配置和集成微服务和基础服务

# <span id="inline-blue">docker-compose文件格式与docker 引擎版本对应</span>
docker-compose和docker engine版本说明：
|docker-compose文件格式|Docker 引擎|
|: ------ :| : ------ : |
|3.8|19.03.0+|
|3.7|18.06.0+|
|3.6|18.02.0+|
|3.5|17.12.0+|
|3.4|17.09.0+|
|3.3|17.06.0+|
|3.2|17.04.0+|
|3.1|1.13.1+|
|3.0|1.13.0+|
|2.4|17.12.0+|
|2.3|17.06.0+|
|2.2|1.13.0+|
|2.1|1.12.0+|
|2.0|1.10.0+|

# <span id="inline-blue">docker-compose.yml</span>
```yml
version: '3'
services:
  photoframe-mysql:
    container_name: photoframe-mysql
    build:
      context: ./mysql
    restart: always
    networks:
    - photoframe-net
    ports:
    - "3306:3306"
    volumes:
    - ./mysql/conf:/etc/mysql/conf.d
    - ./mysql/log:/var/mysql/log
    - ./mysql/data:/var/mysql/data
    - ./mysql/db/init:/docker-entrypoint-initdb.d/:ro
    - ./mysql/db/sql:/opt/sql/:ro
    environment:
      TZ: Asia/Shanghai
      MYSQL_ROOT_PASSWORD: coship
  photoframe-nacos:
        container_name: photoframe-nacos
        build:
          context: ./nacos
        restart: always
        networks:
        - photoframe-net
        environment:
          TZ: Asia/Shanghai
          MODE: standalone
          PREFER_HOST_MODE: ip
          SPRING_DATASOURCE_PLATFORM: mysql
          MYSQL_SERVICE_HOST: photoframe-mysql
          MYSQL_SERVICE_PORT: 3306
          MYSQL_SERVICE_USER: root
          MYSQL_SERVICE_PASSWORD: coship
          MYSQL_SERVICE_DB_NAME: nacos_config
          JVM_XMS: 1g
          JVM_XMX: 1g
          JVM_XMN: 128m
          WAIT_HOSTS: photoframe-mysql:3306
          WAIT_TIMEOUT: 120
        volumes:
        - ./nacos/logs/:/home/nacos/logs
        - ./nacos/conf/:/home/nacos/conf
        ports:
        - "8848:8848"
        - "9848:9848"
        - "9849:9849"
        depends_on:
        - photoframe-mysql
  photoframe-elasticsearch:
    container_name: photoframe-elasticsearch
    build:
      context: ./elasticsearch
    restart: always
    networks:
    - photoframe-net
    environment:
    # 开启内存锁定
      bootstrap.memory_lock: true
      ES_JAVA_OPTS: "-Xms4g -Xmx4g"
    # 指定单节点启动
      discovery.type: single-node
    ulimits:
      # 取消内存相关限制 用于开启内存锁定
      memlock:
        soft: -1
        hard: -1
    volumes:
    - ./elasticsearch/data:/usr/local/elasticsearch-8.8.0/data
    - ./elasticsearch/logs:/usr/local/elasticsearch-8.8.0/logs
    - ./elasticsearch/config:/usr/local/elasticsearch-8.8.0/config
    - ./elasticsearch/plugins:/usr/local/elasticsearch-8.8.0/plugins
    ports:
    - "9200:9200"
    - "9300:9300"
  photoframe-redis:
    container_name: photoframe-redis
    build:
      context: ./redis
    restart: always
    networks:
    - photoframe-net
    ports:
    - "6379:6379"
    volumes:
    - ./redis/conf:/etc/redis/
    environment:
      TZ: Asia/Shanghai
  photoframe-rabbitmq:
    container_name: photoframe-rabbitmq
    build:
      context: ./rabbitmq
    restart: always
    networks:
    - photoframe-net
    ports:
    - "5672:5672"
    - "15672:15672"
    volumes:
    - ./rabbitmq/data:/var/lib/rabbitmq
    - ./rabbitmq/log:/var/log/rabbitmq
    - ./rabbitmq/conf:/etc/rabbitmq
    environment:
      TZ: Asia/Shanghai
  photoframe-admin-log:
    container_name: photoframe-admin-log
    build:
      context: ./photoframe/photoframe-admin-log
    restart: always
    networks:
    - photoframe-net
    ports:
    - "9021:9021"
    depends_on:
    - photoframe-nacos
    - photoframe-mysql
    - photoframe-redis
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-mysql:3306,photoframe-nacos:8848,photoframe-redis:6379
      WAIT_TIMEOUT: 180
  photoframe-admin-biz:
    container_name: photoframe-admin-biz
    build:
      context: ./photoframe/photoframe-admin-biz
    restart: always
    networks:
    - photoframe-net
    ports:
    - "9020:9020"
    depends_on:
    - photoframe-nacos
    - photoframe-mysql
    - photoframe-redis
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-mysql:3306,photoframe-nacos:8848,photoframe-redis:6379
      WAIT_TIMEOUT: 180
  photoframe-api-app:
    container_name: photoframe-api-app
    build:
      context: ./photoframe/photoframe-api-app
    restart: always
    networks:
    - photoframe-net
    ports:
    - "9006:9006"
    depends_on:
    - photoframe-nacos
    - photoframe-mysql
    - photoframe-redis
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-mysql:3306,photoframe-nacos:8848,photoframe-redis:6379
      WAIT_TIMEOUT: 180
  photoframe-api-pad:
    container_name: photoframe-api-pad
    build:
      context: ./photoframe/photoframe-api-pad
    restart: always
    networks:
    - photoframe-net
    ports:
    - "9007:9007"
    volumes:
    - ./photoframe/uploadPath:/home/photoframe/uploadPath
    depends_on:
    - photoframe-nacos
    - photoframe-mysql
    - photoframe-redis
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-mysql:3306,photoframe-nacos:8848,photoframe-redis:6379
      WAIT_TIMEOUT: 180
  photoframe-auth:
    container_name: photoframe-auth
    build:
      context: ./photoframe/photoframe-auth
    restart: always
    networks:
    - photoframe-net
    ports:
    - "9003:9003"
    depends_on:
    - photoframe-mysql
    - photoframe-redis
    - photoframe-nacos
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-mysql:3306,photoframe-nacos:8848,photoframe-redis:6379
      WAIT_TIMEOUT: 180
  photoframe-quartz:
    container_name: photoframe-quartz
    build:
      context: ./photoframe/photoframe-quartz
    restart: always
    networks:
    - photoframe-net
    ports:
    - "9060:9060"
    depends_on:
    - photoframe-mysql
    - photoframe-redis
    - photoframe-nacos
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-mysql:3306,photoframe-nacos:8848,photoframe-redis:6379
      WAIT_TIMEOUT: 180
  photoframe-gateway:
    container_name: photoframe-gateway
    build:
      context: ./photoframe/photoframe-gateway
    restart: always
    networks:
    - photoframe-net
    ports:
    - "9001:9001"
    depends_on:
    - photoframe-redis
    - photoframe-nacos
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-nacos:8848,photoframe-redis:6379,photoframe-admin-biz:9020,photoframe-admin-log:9021,photoframe-api-app:9006,photoframe-api-pad:9007,photoframe-auth:9003,photoframe-quartz:9060
      WAIT_TIMEOUT: 180
  photoframe-nginx:
    container_name: photoframe-nginx
    build:
      context: ./nginx
    restart: always
    networks:
    - photoframe-net
    ports:
    - "8080:8080"
    volumes:
    - ./nginx/conf:/etc/nginx/conf
    - ./nginx/logs:/var/log/nginx
    depends_on:
    - photoframe-gateway
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-gateway:9001
      WAIT_TIMEOUT: 300
  photoframe-sentinel:
    container_name: photoframe-sentinel
    build:
      context: ./sentinel
    restart: always
    networks:
    - photoframe-net
    ports:
    - "8180:8180"
    volumes:
    - ./sentinel/logs:/root/logs
    depends_on:
    - photoframe-nacos
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-nacos:8848
      WAIT_TIMEOUT: 180
  photoframe-zipkin:
    container_name: photoframe-zipkin
    build:
      context: ./zipkin
    restart: always
    networks:
    - photoframe-net
    ports:
    - "9411:9411"
    depends_on:
    - photoframe-elasticsearch
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-elasticsearch:9200
      WAIT_TIMEOUT: 180
  photoframe-zipkin-dependencies:
    container_name: photoframe-zipkin-dependencies
    build:
      context: ./zipkin-dependencies
    restart: always
    networks:
    - photoframe-net
    depends_on:
    - photoframe-elasticsearch
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-elasticsearch:9200
      WAIT_TIMEOUT: 180
networks:
  photoframe-net:
    driver: bridge
```
