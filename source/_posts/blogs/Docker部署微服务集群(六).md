---
title: Docker部署微服务集群(六)
categories:
	- Docker
tags: 
	- Docker
	- Docker-compose
	
date: 2025-01-10 16:41:06
updated: 2025-01-10 16:41:06
---
<!-- toc -->
# <span id="inline-blue">环境</span>

Linux: CentOS Linux release 7.7.1908 (Core)
Docker：26.1.4
Docker compose: v2.25.0
	
# <span id="inline-blue">背景</span>

微服务集群通过docker-compose编排工具成功在docker swarm分布式集群环境下部署后，发现更新stack下的服务非常麻烦，更新多个服务经常需要重复执行命令，导致有时执行服务的批量更新命令，MySQL和elasticsearch容器的数据丢失。
所以将微服务和基础服务MySQL、redis、Elasticsearch以及监控服务sentinel、zipkin 等分成多个文件进行服务编排，这样在升级微服务或者数据库的情况下，不会对其他stack里面服务造成影响。

# <span id="inline-blue">docker-compose.yml之间网络通信</span>

微服务集群服务拆分为多个文件进行部署，首先需要解决服务之间的网络互通问题

docker-swarm-base.yml基础服务定义网络

```yml
# base/docker-swarm-base.yml
services:
  front:
    ...
    networks:
      - some-net
networks:
  some-net:
    driver: overlay
```

docker-swarm-services.yml微服务引用网络

```yml
# service/docker-swarm-services.yml
services:
  api:
    ...
    networks:
      - base_some-net
networks:
  base_some-net:
    external: true
```
docker-swarm-base.yml作为其他服务的基础依赖，定义微服务集群的网络，driver:overlay表明创建网络类型为层叠网络，这是docker swarm模式下，docker容器能够跨docker主机通信的关键。
docker-swarm-services.yml引用网络名称使用的是base_some-net，而不是some-net,原因是因为docker swarm模式下部署的服务最终生成的service服务名称会添加上部署stack的前缀，部署命令类似：
```shell
docker stack deploy -c docker-swarm-base-process.yml --resolve-image never base
```
-c: 指定stack部署依赖的配置文件
--resolve-image：指定拉取镜像时是否校验当前系统和镜像的兼容性(镜像架构一般有windows/arm64/amd64)
|镜像架构|兼容系统|
|:---:|:---:|
|windows|windows|
|arm64|MAC|
|amd64|Lniux|

never: 不进行校验，加快镜像构建的速度
base是部署的stack名称，部署服务的集合

# <span id="inline-blue">docker-swarn-base.yml</span>

```yml
services:
  photoframe-mysql:
    image: photoframe-mysql
    env_file:
    - .env
    build:
      context: ./mysql
    networks:
    - photoframe-net
    ports:
    - target: 3306
      published: 3307
      protocol: tcp
      mode: host
    volumes:
    - ./mysql/conf:/etc/mysql/conf.d
    - ./mysql/log:/var/mysql/log
    - ./mysql/data:/var/mysql/data
    - ./mysql/db/init:/docker-entrypoint-initdb.d/:ro
    - ./mysql/db/sql:/opt/sql/:ro
    environment:
      TZ: Asia/Shanghai
      MYSQL_ROOT_PASSWORD: coship
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
        delay: 3s
        failure_action: pause
        monitor: 10s
        max_failure_ratio: 0
        order: stop-first
      placement:
        constraints:
        - node.labels.role==base
  photoframe-nacos:
    image: photoframe-nacos
    env_file:
    - .env
    build:
      context: ./nacos
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
    - target: 8848
      published: 8849
      protocol: tcp
      mode: host
    - target: 9848
      published: 9850
      protocol: tcp
      mode: host
    - target: 9849
      published: 9851
      protocol: tcp
      mode: host
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
        - node.labels.role==base
  photoframe-redis:
    image: photoframe-redis
    env_file:
    - .env
    build:
      context: ./redis
    networks:
    - photoframe-net
    ports:
    - target: 6379
      published: 6380
      protocol: tcp
      mode: host
    volumes:
    - ./redis/conf:/etc/redis/
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
        - node.labels.role==base
  photoframe-elasticsearch:
    image: photoframe-elasticsearch
    env_file:
    - .env
    build:
      context: ./elasticsearch
    networks:
    - photoframe-net
    environment:
      # 开启内存锁定
      bootstrap.memory_lock: "true"
      ES_JAVA_OPTS: "-Xms4g -Xmx4g"
      # 指定单节点启动
      discovery.type: single-node
      TZ: Asia/Shanghai
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
    - target: 9200
      published: 9201
      protocol: tcp
      mode: host
    - target: 9300
      published: 9301
      protocol: tcp
      mode: host
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
        - node.labels.role==base
  photoframe-rabbitmq:
    image: photoframe-rabbitmq
    env_file:
    - .env
    build:
      context: ./rabbitmq
    networks:
    - photoframe-net
    ports:
    - target: 5672
      published: 5673
      protocol: tcp
      mode: host
    - target: 15672
      published: 15673
      protocol: tcp
      mode: host
    volumes:
    - ./rabbitmq/data:/var/lib/rabbitmq
    - ./rabbitmq/log:/var/log/rabbitmq
    - ./rabbitmq/conf:/etc/rabbitmq
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
        - node.labels.role==base
networks:
  photoframe-net:
    driver: overlay
```

部署基础服务命令：

```shell
#/usr/local/docker,docker-swarm-base.yml所在目录,转换配置，提取.env文件定义的环境变量
docker stack config -c docker-swarm-base.yml > docker-swarm-base-process.yml
#/usr/local/docker,docker-swarm-base-process.yml所在目录,执行部署
docker stack deploy -c docker-swarm-base-process.yml --resolve-image never photoframe-base
```

# <span id="inline-blue">docker-swarn-services.yml</span>

```yml
services:
  photoframe-admin-log:
    image: photoframe-admin-log
    env_file:
    - .env
    build:
      context: ./photoframe/photoframe-admin-log
    networks:
    - photoframe-base_photoframe-net
    ports:
    - target: 9021
      published: 9023
      protocol: tcp
      mode: host
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-mysql:3306,photoframe-nacos:8848,photoframe-redis:6379
      WAIT_TIMEOUT: 180
    deploy:
      mode: replicated
      replicas: 1
      endpoint_mode: dnsrr
      restart_policy:
        condition: on-failure
        delay: 3s
        max_attempts: 5
        window: 120s
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
        - node.labels.role==service
  photoframe-admin-biz:
    image: photoframe-admin-biz
    env_file:
    - .env
    build:
      context: ./photoframe/photoframe-admin-biz
    networks:
    - photoframe-base_photoframe-net
    ports:
    - target: 9020
      published: 9022
      protocol: tcp
      mode: host
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-mysql:3306,photoframe-nacos:8848,photoframe-redis:6379
      WAIT_TIMEOUT: 180
    deploy:
      mode: replicated
      replicas: 1
      endpoint_mode: dnsrr
      restart_policy:
        condition: on-failure
        delay: 3s
        max_attempts: 5
        window: 120s
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
        - node.labels.role==service
  photoframe-api-app:
    image: photoframe-api-app
    env_file:
    - .env
    build:
      context: ./photoframe/photoframe-api-app
    networks:
    - photoframe-base_photoframe-net
    ports:
    - target: 9006
      published: 9008
      protocol: tcp
      mode: host
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-mysql:3306,photoframe-nacos:8848,photoframe-redis:6379
      WAIT_TIMEOUT: 180
    deploy:
      mode: replicated
      replicas: 1
      endpoint_mode: dnsrr
      restart_policy:
        condition: on-failure
        delay: 3s
        max_attempts: 5
        window: 120s
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
        - node.labels.role==service
  photoframe-api-pad:
    image: photoframe-api-pad
    env_file:
    - .env
    build:
      context: ./photoframe/photoframe-api-pad
    networks:
    - photoframe-base_photoframe-net
    ports:
    - target: 9007
      published: 9009
      protocol: tcp
      mode: host
    volumes:
    - ./photoframe/uploadPath:/home/photoframe/uploadPath
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-mysql:3306,photoframe-nacos:8848,photoframe-redis:6379
      WAIT_TIMEOUT: 180
    deploy:
      mode: replicated
      replicas: 1
      endpoint_mode: dnsrr
      restart_policy:
        condition: on-failure
        delay: 3s
        max_attempts: 5
        window: 120s
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
        - node.labels.role==service
  photoframe-auth:
    image: photoframe-auth
    env_file:
    - .env
    build:
      context: ./photoframe/photoframe-auth
    networks:
    - photoframe-base_photoframe-net
    ports:
    - target: 9003
      published: 9004
      protocol: tcp
      mode: host
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-mysql:3306,photoframe-nacos:8848,photoframe-redis:6379
      WAIT_TIMEOUT: 180
    deploy:
      mode: replicated
      replicas: 1
      endpoint_mode: dnsrr
      restart_policy:
        condition: on-failure
        delay: 3s
        max_attempts: 5
        window: 120s
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
        - node.labels.role==service
  photoframe-quartz:
    image: photoframe-quartz
    env_file:
    - .env
    build:
      context: ./photoframe/photoframe-quartz
    networks:
    - photoframe-base_photoframe-net
    ports:
    - target: 9060
      published: 9061
      protocol: tcp
      mode: host
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-mysql:3306,photoframe-nacos:8848,photoframe-redis:6379
      WAIT_TIMEOUT: 180
    deploy:
      mode: replicated
      replicas: 1
      endpoint_mode: dnsrr
      restart_policy:
        condition: on-failure
        delay: 3s
        max_attempts: 5
        window: 120s
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
        - node.labels.role==service
  photoframe-gateway:
    image: photoframe-gateway
    env_file:
    - .env
    build:
      context: ./photoframe/photoframe-gateway
    networks:
    - photoframe-base_photoframe-net
    ports:
    - target: 9001
      published: 9002
      protocol: tcp
      mode: host
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-nacos:8848,photoframe-redis:6379,photoframe-admin-biz:9020,photoframe-admin-log:9021,photoframe-api-app:9006,photoframe-api-pad:9007,photoframe-auth:9003,photoframe-quartz:9060
      WAIT_TIMEOUT: 180
    deploy:
      mode: replicated
      replicas: 1
      endpoint_mode: vip
      restart_policy:
        condition: on-failure
        delay: 3s
        max_attempts: 5
        window: 120s
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
        - node.labels.role==service
networks:
  photoframe-base_photoframe-net:
    external: true
```

部署微服务命令：

```shell
#/usr/local/docker,docker-swarm-services.yml所在目录,转换配置，提取.env文件定义的环境变量
docker stack config -c docker-swarm-services.yml > docker-swarm-services-process.yml
#/usr/local/docker,docker-swarm-services-process.yml所在目录,执行部署
docker stack deploy -c docker-swarm-services-process.yml --resolve-image never photoframe-services
```

# <span id="inline-blue">docker-swarn-monitor.yml</span>

```yml
services:
  photoframe-nginx:
    image: photoframe-nginx
    env_file:
    - .env
    build:
      context: ./nginx
    networks:
    - photoframe-base_photoframe-net
    ports:
    - target: 9090
      published: 9091
      protocol: tcp
      mode: host
    volumes:
    - ./nginx/conf/nginx.conf:/etc/nginx/nginx.conf
    - ./nginx/logs:/var/log/nginx
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-gateway:9001
      WAIT_TIMEOUT: 180
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
        - node.labels.role==base
  photoframe-sentinel:
    image: photoframe-sentinel
    env_file:
    - .env
    build:
      context: ./sentinel
    networks:
    - photoframe-base_photoframe-net
    ports:
    - target: 8180
      published: 8181
      protocol: tcp
      mode: host
    volumes:
    - ./sentinel/logs:/root/logs
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-nacos:8848
      WAIT_TIMEOUT: 180
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
        - node.labels.role==base
  photoframe-zipkin:
    image: photoframe-zipkin
    env_file:
    - .env
    build:
      context: ./zipkin
    networks:
    - photoframe-base_photoframe-net
    ports:
    - target: 9411
      published: 9412
      protocol: tcp
      mode: host
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-elasticsearch:9200
      WAIT_TIMEOUT: 180
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
        - node.labels.role==base
  photoframe-zipkin-dependencies:
    image: photoframe-zipkin-dependencies
    env_file:
    - .env
    build:
      context: ./zipkin-dependencies
    networks:
    - photoframe-base_photoframe-net
    environment:
      TZ: Asia/Shanghai
      WAIT_HOSTS: photoframe-elasticsearch:9200
      WAIT_TIMEOUT: 180
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
        - node.labels.role==base
networks:
  photoframe-base_photoframe-net:
    external: true
```

部署监控服务命令：

```shell
#/usr/local/docker,docker-swarm-monitor.yml所在目录,转换配置，提取.env文件定义的环境变量
docker stack config -c docker-swarm-monitor.yml > docker-swarm-monitor-process.yml
#/usr/local/docker,docker-swarm-monitor-process.yml所在目录,执行部署
docker stack deploy -c docker-swarm-monitor-process.yml --resolve-image never photoframe-monitor
```

# <span id="inline-blue">docker-swarn-portainer.yml</span>

```yml
services:
  portainer:
    image: portainer/portainer
    ports:
      - "9000:9000"
      - "8000:8000"
    volumes:
      - /usr/local/docker/portainer/data:/data
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
    - photoframe-base_photoframe-net
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
        - node.labels.role==base  
networks:
  photoframe-base_photoframe-net:
    external: true
```

部署portainer容器管理服务命令：

```shell
#/usr/local/docker,docker-swarm-portainer.yml所在目录,转换配置，提取.env文件定义的环境变量
docker stack config -c docker-swarm-portainer.yml > docker-swarm-portainer-process.yml
#/usr/local/docker,docker-swarm-portainer-process.yml所在目录,执行部署
docker stack deploy -c docker-swarm-portainer-process.yml --resolve-image never photoframe-portainer
```