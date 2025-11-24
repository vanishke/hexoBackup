---
title: Docker基于debian系统基础镜像构建的容器安装依赖失败解决办法
categories:
	- Docker
tags: 
	- Docker

date: 2025-11-24 15:56:25
updated: 2025-11-24 15:56:25
---
<!-- toc -->

# <span id="inline-blue">背景</span>

基于Debian基础镜像构建的zipkin容器，在追查模块发送链路追踪消息时，发现数据未上报到Elasticsearch，在使用docker exec -it 容器ID /bin/bash进入容器内部，使用curl命令测试容器之间的连通性时提示命令无法识别，提示信息如下：
```shell
apt-get install curl
Reading package lists... Done
Building dependency tree        
Reading state information... Done
E: Unable to locate package curl
```

# <span id="inline-blue">问题原因</span>

Debian Buster（10）已经进入旧版本归档（oldoldstable），官方源地址变更导致无法访问

# <span id="inline-blue">解决办法</span>

## <span id="inline-blue">修改source.list文件</span>

```shell
# 备份原有源文件
cp /etc/apt/sources.list /etc/apt/sources.list.bak

# 编辑源文件（使用buster的归档源）
cat > /etc/apt/sources.list << EOF
deb http://archive.debian.org/debian buster main contrib non-free
deb http://archive.debian.org/debian-security buster/updates main contrib non-free
deb http://archive.debian.org/debian buster-updates main contrib non-free
EOF

# 添加忽略过期验证（因为buster已停止更新）
echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/99no-check-valid-until
```

## <span id="inline-blue">更新并安装 curl</span>

```shell
# 更新源缓存
apt-get update

# 安装curl
apt-get install -y curl
```

## <span id="inline-blue">验证</span>

```shell
curl --version
#common-elasticsearch是Docker swarm模式下部署的服务名
curl http://common-elasticsearch:9200
```



