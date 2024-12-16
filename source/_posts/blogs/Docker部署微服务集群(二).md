---
title: Docker部署微服务集群(二)
categories:
	- Docker
tags: 
	- Docker
	
date: 2024-11-25 10:27:05
updated: 2024-11-25 10:27:11
---
<!-- toc -->
# <span id="inline-blue">环境</span>
Docker: 26.1.4
# <span id="inline-blue">背景</span>
微服务使用docker镜像方式部署的优势
1、轻量级和可移植性
2、一致的开发和生产环境
3、快速部署和扩展
4、安全和隔离性

# <span id="inline-blue">微服务网关</span>
构建镜像上下文文件预览：
![Dockerfile microservice](/images/docker/20241125/Docker_microservice_20241125_001.png)
```shell
# 基础镜像
FROM  openjdk:8-jre
# author
MAINTAINER 909754 <18685129726@163.com>
# 挂载目录
VOLUME /home/photoframe
# 创建目录
RUN mkdir -p /home/photoframe
# 指定路径
WORKDIR /home/photoframe
# 复制jar文件到路径
COPY ./jar/photoframe-gateway.jar /home/photoframe/photoframe-gateway.jar
#复制容器依赖检测工具docker-compose-wait
COPY ./docker-compose-wait/wait /wait
#赋予检测脚本执行权限
RUN ["chmod", "+x", "/wait"]
#暴露服务端口
EXPOSE 9001
# 启动服务
CMD /wait && java -jar -Dcsp.sentinel.app.type=1 photoframe-gateway.jar
```
# <span id="inline-blue">微服务鉴权</span>
构建镜像上下文文件预览：
![Dockerfile microservice](/images/docker/20241125/Docker_microservice_20241125_002.png)
```shell
# 基础镜像
FROM  openjdk:8-jre
# author
MAINTAINER 909754 <18685129726@163.com>
# 挂载目录
VOLUME /home/photoframe
# 创建目录
RUN mkdir -p /home/photoframe
# 指定路径
WORKDIR /home/photoframe
# 复制jar文件到路径
COPY ./jar/photoframe-auth.jar /home/photoframe/photoframe-auth.jar
#复制容器依赖检测工具docker-compose-wait
COPY ./docker-compose-wait/wait /wait
#赋予检测脚本执行权限
RUN ["chmod", "+x", "/wait"]
#暴露服务端口
EXPOSE 9003
# 启动服务
CMD /wait && java -jar photoframe-auth.jar
```

# <span id="inline-blue">微服务后台管理</span>
构建镜像上下文文件预览：
![Dockerfile microservice](/images/docker/20241125/Docker_microservice_20241125_003.png)
```shell
# 基础镜像
FROM  openjdk:8-jre
# author
MAINTAINER 909754 <18685129726@163.com>
# 挂载目录
VOLUME /home/photoframe
# 创建目录
RUN mkdir -p /home/photoframe
# 指定路径
WORKDIR /home/photoframe
#拷贝微服务jar包
COPY ./jar/photoframe-admin-biz.jar /home/photoframe/photoframe-admin-biz.jar
#暴露访问端口
#复制容器依赖检测工具docker-compose-wait
COPY ./docker-compose-wait/wait /wait
#赋予检测脚本执行权限
RUN ["chmod", "+x", "/wait"]
EXPOSE 9020
# 启动服务
CMD /wait && java -jar photoframe-admin-biz.jar
```

# <span id="inline-blue">微服务日志服务</span>
构建镜像上下文文件预览：
![Dockerfile microservice](/images/docker/20241125/Docker_microservice_20241125_004.png)
```shell
# 基础镜像
FROM  openjdk:8-jre
# author
MAINTAINER 909754 <18685129726@163.com>
# 挂载目录
VOLUME /home/photoframe
# 创建目录
RUN mkdir -p /home/photoframe
# 指定路径
WORKDIR /home/photoframe
# 复制jar文件到路径
COPY ./jar/photoframe-admin-log.jar /home/photoframe/photoframe-admin-log.jar
#暴露服务端口
#复制容器依赖检测工具docker-compose-wait
COPY ./docker-compose-wait/wait /wait
#赋予检测脚本执行权限
RUN ["chmod", "+x", "/wait"]
EXPOSE 9021
# 启动服务
CMD /wait && java -jar photoframe-admin-log.jar
```

# <span id="inline-blue">微服务app接口服务</span>
构建镜像上下文文件预览：
![Dockerfile microservice](/images/docker/20241125/Docker_microservice_20241125_005.png)
```shell
# 基础镜像
FROM  openjdk:8-jre
# author
MAINTAINER 909754 <18685129726@163.com>
# 挂载目录
VOLUME /home/photoframe
# 创建目录
RUN mkdir -p /home/photoframe
# 指定路径
WORKDIR /home/photoframe
# 复制jar文件到路径
COPY ./jar/photoframe-api-app.jar /home/photoframe/photoframe-api-app.jar
#复制容器依赖检测工具docker-compose-wait
COPY ./docker-compose-wait/wait /wait
#赋予检测脚本执行权限
RUN ["chmod", "+x", "/wait"]
#暴露服务端口
EXPOSE 9006
# 启动服务
CMD /wait && java -jar photoframe-api-app.jar
```

# <span id="inline-blue">微服务pad接口服务</span>
构建镜像上下文文件预览：
![Dockerfile microservice](/images/docker/20241125/Docker_microservice_20241125_006.png)
```shell
# 基础镜像
FROM  openjdk:8-jre
# author
MAINTAINER 909754 <18685129726@163.com>
# 挂载目录
VOLUME /home/photoframe
# 创建目录
RUN mkdir -p /home/photoframe
# 指定路径
WORKDIR /home/photoframe
# 复制jar文件到路径
COPY ./jar/photoframe-api-pad.jar /home/photoframe/photoframe-api-pad.jar
#复制容器依赖检测工具docker-compose-wait
COPY ./docker-compose-wait/wait /wait
#赋予检测脚本执行权限
RUN ["chmod", "+x", "/wait"]
#暴露服务端口
EXPOSE 9007
# 启动服务
CMD /wait && java -jar photoframe-api-pad.jar
```

# <span id="inline-blue">微服务定时服务</span>
构建镜像上下文文件预览：
![Dockerfile microservice](/images/docker/20241125/Docker_microservice_20241125_007.png)
```shell
# 基础镜像
FROM  openjdk:8-jre
# author
MAINTAINER 909754 <18685129726@163.com>
# 挂载目录
VOLUME /home/photoframe
# 创建目录
RUN mkdir -p /home/photoframe
# 指定路径
WORKDIR /home/photoframe
# 复制jar文件到路径
COPY jar/photoframe-quartz.jar /home/photoframe/photoframe-quartz.jar
#复制容器依赖检测工具docker-compose-wait
COPY ./docker-compose-wait/wait /wait
#赋予检测脚本执行权限
RUN ["chmod", "+x", "/wait"]
#暴露服务端口
EXPOSE 9060
# 启动定时服务
CMD /wait && java -jar photoframe-quartz.jar

```