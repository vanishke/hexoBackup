---
title: Docker 容器执行定时任务
categories:
	- Docker
tags: 
	- Docker
	- docker swarm
	
date: 2024-12-13 17:53:24
updated: 2024-12-13 17:53:24
---
<!-- toc -->
# <span id="inline-blue">环境</span>

Docker: 26.1.4
docker-compose: v2.25.0

# <span id="inline-blue">背景</span>

docker-compose 编排容器部署后发现zipkin-dependencies模块启动之后容器就退出了，因为zipkin-dependencies是基于spark执行的统计计算任务，导致后续在系统定时任务添加的定时脚本无法执行。

# <span id="inline-blue">容器执行完不退出的方法</span>

```Dockerfile
# 基础镜像
FROM  exoplatform/ubuntu:20.04
# author
MAINTAINER 909754 <18685129726@163.com>
#拷贝jdk离线文件
ADD ./jdk/jdk-11.0.18_linux-x64_bin.tar.gz /usr/local/java
#设置jdk环境变量
ENV JAVA_HOME=/usr/local/java/jdk-11.0.18
ENV PATH=$JAVA_HOME/bin:$PATH
# 创建目录
RUN mkdir -p /home/photoframe/zipkin-dependencies && \
    apt update && \
    apt install -y cron && \
    apt install -y vim
# 指定路径
WORKDIR /home/photoframe/zipkin-dependencies
#环境变量设置
ENV STORAGE_TYPE=elasticsearch ES_HOSTS=http://photoframe-elasticsearch:9200
#拷贝启动脚本
ADD ./sh/start.sh /home/photoframe/zipkin-dependencies/start.sh
#复制jar文件到路径
COPY ./jar/zipkin-dependencies-3.0.0.jar /home/photoframe/zipkin-dependencies/zipkin-dependencies-3.0.0.jar
#复制容器依赖检测工具docker-compose-wait
COPY ./docker-compose-wait/wait /wait
#赋予执行权限
RUN touch /etc/cron.d/crontab && \
    echo "*/1 * * * * root /bin/sh /home/photoframe/zipkin-dependencies/start.sh" >> /etc/cron.d/crontab && \
    chmod a+x /home/photoframe/zipkin-dependencies/start.sh && \
    chmod 0644 /etc/cron.d/crontab && \
    touch /var/log/cron.log && \
    service cron restart && \
    chmod a+x /wait
# 启动服务
CMD  cron  && tail -f /var/log/cron.log
```

关键点在于tail -f /var/log/cron.log，表示一直监控定时任务的日志输出。这样可以保证容器执行完计算任务不退出容器，保持在线状态。



