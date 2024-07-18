---
title: Dokcer常用命令
categories:
	- Docker
tags: 
	- Docker
	
date: 2023-07-10 14:49:20
updated: 2023-07-10 14:49:20
---
<!-- toc -->
# <span id="inline-blue">环境</span>
	Windows7
	DockerToolbox-18.03.0-ce.exe
# <span id="inline-blue">查看Docker版本信息</span>
```shell
docker version 
```
# <span id="inline-blue">查看Docker详情</span>
```shell
docker info 
```
# <span id="inline-blue">操作镜像</span>
```shell
#查看镜像
docker image ls 
#列出镜像列表
docker image list
#拉取镜像  docker pull mysql:5.7
docker pull 镜像:标签  
#删除镜像 docker rmi mysql-5.7(镜像名或image ID 前四位)
docker rmi 镜像名
#批量删除镜像
docker rmi -f $(docker images -a -q)
#删除虚悬镜像
docker image prune
```

# <span id="inline-blue">操作容器</span>
```shell
#查看正在运行容器
docker ps
#查看所有容器
docker ps -a 
#批量删除所有容器
docker rm -vf $(docker ps -a -q)
#停止容器 docker stop mysql5.7(容器名或容器ID)
docker stop 容器名
#查看容器日志 docker logs 容器名或容器ID
docker logs mysql5.7
#进入容器内部
docker exec -it mysql5.7 /bin/bash
```

# <span id="inline-blue">docker-compose工具</span>
```shell
#启动容器  -d:后台启动 --build:重建镜像 容器名可跟多个,docker-compose半拍工具需要结合docker-compose.yml使用
docker-compose up -d --build 容器名
#停止所有容器
docker-compose down
```