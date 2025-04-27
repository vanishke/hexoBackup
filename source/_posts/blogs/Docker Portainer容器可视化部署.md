---
title: Docker Portainer容器可视化部署
categories:
	- Docker
tags: 
	- Docker
	- Portainer
	
date: 2025-04-25 17:20:31
updated: 2025-04-25 17:20:31
---
<!-- toc -->
# <span id="inline-blue">环境</span>

Linux: CentOS Linux release 7.4.1708 (Core) 
Docker: 26.1.4
docker-compose: v2.25.0

# <span id="inline-blue">介绍</span>

Portainer 是一个轻量级的管理 UI ，可让你轻松管理不同的 Docker 环境（Docker 主机或 Swarm 群集）。
Portainer 的目的是部署和使用一样简单。它由一个可以在任何 Docker 引擎上运行的单一容器组成（可以部署为 Linux 容器或 Windows 本地容器，也支持其他平台）。
Portainer 允许你管理所有的 Docker 资源（容器、镜像、卷、网络等等）。它与独立的 Docker 引擎和 Docker Swarm 模式兼容。

# <span id="inline-blue">容器编排工具</span>

docker swarm部署模式下portainer需要和agent配合使用

portainer : 6053537/portainer-ce:2.24.1-alpine
agent : portainer/agent:2.24.1-alpine

agent使用的全局模式，每个docker节点都会部署
portainer: 副本模式，仅docker swarm管理节点部署，通过节点标签约束控制

```yml
services:
  test-portainer-agent:
    image: portainer/agent:2.24.1-alpine
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /var/lib/docker/volumes:/var/lib/docker/volumes
    networks:
    - test-net
    deploy:
      mode: global
      placement:
        constraints: [node.platform.os == linux]
  test-portainer:
    image: 6053537/portainer-ce:2.24.1-alpine
    build:
      context: ./portainer
    ports:
      - "9000:9000"
      - "8000:8000"
      - "9443:9443"
    volumes:
      - ./portainer/data:/data
    networks:
    - test-net
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
        - node.labels.role==base  
networks:
  test-net:
    external: true
```

# <span id="inline-blue">部署</span>

```shell
#docker swarm模式下需要将容器volume挂载路径转换为绝对路径
docker stack config -c docker-swarm-portainer.yml > docker-swarm-portainer-process.yml
#部署portainer容器服务
docker stack deploy -c docker-swarm-portainer-process.yml --resolve-image never test-portainer
```

# <span id="inline-blue">验证</span>

通过容器映射外部宿主机9000端口，访问portainer后台管理: http://10.9.216.12:9000
![portainer部署](/images/portainer/20250425/portainer_20250425_001.png)


连接docker swarm集群，通过agent上报实现，test-portainer-agent名称对应容器编排工具里面agent服务名称
![portainer部署](/images/portainer/20250425/portainer_20250425_002.png)
