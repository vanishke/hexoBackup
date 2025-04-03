---
title: Docker部署emqx集群
categories:
	- Emqx
tags: 
	- Emqx
	- Docker
	
date: 2025-03-28 15:08:44
updated: 2025-03-28 15:08:44
---
<!-- toc -->
# <span id="inline-blue">环境</span>
Docker: 27.3.1
docker compose: v2.29.7
Emqx: 5.7.2

# <span id="inline-blue">背景</span>
线上业务涉及大量推送服务，原本使用的极光推送因为使用限制原因改由mqtt实现。

# <span id="inline-blue">实现</span>

```yml
services:
  photoframe-emqx-node1:
    image: photoframe-emqx
    env_file:
      - .env
    build:
      context: ./emqx
    networks:
      photoframe-base_photoframe-net:
        aliases:
          - docker.emqx.node1
    environment:
      TZ: Asia/Shanghai
      EMQX_NODE_NAME: emqxA@docker.emqx.node1
      EMQX_HOST: docker.emqx.node1
      EMQX_LISTEN__ADDRESS: 0.0.0.0
      EMQX_CLUSTER__DISCOVERY_STRATEGY: static
      EMQX_CLUSTER__STATIC__SEEDS: "[emqxA@docker.emqx.node1,emqxB@docker.emqx.node2]"
    volumes:
      - ./emqx/emqx01/data:/opt/emqx/data
      - ./emqx/emqx01/log:/opt/emqx/log
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
  photoframe-emqx-node2:
    image: photoframe-emqx
    env_file:
      - .env
    build:
      context: ./emqx
    networks:
      photoframe-base_photoframe-net:
        aliases:
          - docker.emqx.node2
    environment:
      TZ: Asia/Shanghai
      EMQX_NODE_NAME: emqxB@docker.emqx.node2
      EMQX_HOST: docker.emqx.node2
      EMQX_LISTEN__ADDRESS: 0.0.0.0
      EMQX_CLUSTER__DISCOVERY_STRATEGY: static
      EMQX_CLUSTER__STATIC__SEEDS: "[emqxA@docker.emqx.node1,emqxB@docker.emqx.node2]"
    volumes:
      - ./emqx/emqx02/data:/opt/emqx/data
      - ./emqx/emqx02/log:/opt/emqx/log
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
          - node.labels.role==service
networks:
  photoframe-base_photoframe-net:
    external: true
```

注意点：

1、emqx节点命名格式

​基本格式
节点名称必须为 ​**Name@Host**，例如：

emqx1@192.168.1.100
node2@broker.emqx.io
emqx@10.0.0.1

​字段说明

​**Name**：用户自定义的节点标识符，需保证集群内唯一。
​**Host**：节点的 IP 地址或完全限定域名（FQDN），需满足以下条件：
必须为 ​IP 地址​（如 192.168.1.100）或 ​FQDN​（如 emqx.example.com）。
不可包含端口号或特殊字符（如 - 需谨慎使用，建议用 _ 替代）。

2、docker swarm模式下如果采用服务名进行通信，节点名称host部分使用服务名会导致集群节点通信失败，并且启动后报错，提示节点名称非法。解决办法是通过aliases参数给服务指定别名。

3、节点名称中的name如果有数字，例如emqx1,这样集群通信端口5369、4370会发生偏移，建议采用emqxA这种命名方式。
