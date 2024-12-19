---
title: Docker部署微服务集群(四)
categories:
	- Docker
tags: 
	- Docker
	- docker-compose
	
date: 2024-12-06 10:05:19
updated: 2024-12-06 10:05:19
---
<!-- toc -->
# <span id="inline-blue">环境</span>
Docker: 26.1.4
docker-compose: v2.25.0
# <span id="inline-blue">背景</span>
基于docker-compose容器编排工具，实现容器启动、停止、删除，镜像批量导入导出，微服务打包自动拷贝镜像构建上下文环境。
# <span id="inline-blue">docker构建上下文环境</span>
![Dockerfile docker-compose](/images/docker/20241206/Docker_docker_compose_20241206_001.png)

# <span id="inline-blue">拷贝微服务镜像构建上下文内容</span>

copy.sh

```shell
#!/bin/sh

# 复制项目的文件到对应docker路径，便于一键生成镜像。
usage() {
	echo "Usage: sh copy.sh"
	exit 1
}


# copy sql
echo "begin copy sql "
cp ../DB/MySQL/init/nacos_config.sql ./mysql/db/sql
cp ../DB/MySQL/init/init_table.sql ./mysql/db/sql
cp ../DB/MySQL/init/init_data.sql ./mysql/db/sql

# copy html
# echo "begin copy html "
# cp -r ../photoframe-ui/dist/** ./nginx/html/dist


# copy jar
echo "begin copy photoframe-gateway"
cp ../photoframe-gateway/target/photoframe-gateway.jar ./photoframe/photoframe-gateway/jar

echo "begin copy photoframe-auth"
cp ../photoframe-auth/target/photoframe-auth.jar ./photoframe/photoframe-auth/jar

echo "begin copy photoframe-admin-biz"
cp ../photoframe-admin/photoframe-admin-biz/target/photoframe-admin-biz.jar  ./photoframe/photoframe-admin-biz/jar

echo "begin copy photoframe-admin-log"
cp ../photoframe-admin/photoframe-admin-log/target/photoframe-admin-log.jar  ./photoframe/photoframe-admin-log/jar


echo "begin copy photoframe-api-app"
cp ../photoframe-api/photoframe-api-app/target/photoframe-api-app.jar ./photoframe/photoframe-api-app/jar

echo "begin copy photoframe-api-pad"
cp ../photoframe-api/photoframe-api-pad/target/photoframe-api-pad.jar ./photoframe/photoframe-api-pad/jar

echo "begin copy photoframe-quartz"
cp ../photoframe-quartz/target/photoframe-quartz.jar ./photoframe/photoframe-quartz/jar
```

作用：
	拷贝MySQL数据库初始化脚本到MySQL镜像构建上下文环境
	拷贝前端UI到nginx镜像构建上下文环境
	拷贝微服务打包生成的jar包到对应镜像构建上下文环境

windows环境执行copy.sh需要git环境支持	

# <span id="inline-blue">镜像批量导出</span>

export.sh

```shell
#!/bin/bash
rm -rf  images
rm -rf tarname.txt
docker images > images.txt
awk '{print $1}' images.txt > REPOSITORY.txt
sed -i '1d' REPOSITORY.txt
mkdir images
touch tarname.txt
while read LINE
do
docker save $LINE > ./images/${LINE//\//_}.tar
echo "${LINE//\//_}.tar" >> tarname.txt
done < REPOSITORY.txt
rm -rf images.txt REPOSITORY.txt
cp import.sh ./images/
echo "images export finish"
```
批量导出docker环境下的镜像到当前目录images文件夹下

# <span id="inline-blue">镜像批量导入</span>

import.sh

```shell
#!/bin/bash
while read LINE
do
docker  load -i ./images/$LINE
echo ok
done < tarname.txt
echo finish
```
导入当前目录下images文件夹下的镜像

# <span id="inline-blue">自动执行脚本</span>

run.sh

```shell
#!/bin/sh

# 使用说明，用来提示输入参数
usage()
{
	echo "Usage: sh run.sh [port|base|modules|zipkin|stop|stop_base|stop_modules|stop_zipkin|rm|rm_base|rm_modules|rm_zipkin]"
	echo " 启动基础服务(mysql、elasticsearch、redis、rabbitmq、nacos): sh run.sh base "
	echo " 启动微服务: sh run.sh modules "
	echo " 停止所有docker服务: sh run.sh stop "
	exit 1
}

# 开启所需端口
port()
{
  #mysql
	firewall-cmd --add-port=3306/tcp --permanent
	#nacos
	firewall-cmd --add-port=8848/tcp --permanent
	firewall-cmd --add-port=8849/tcp --permanent
	#elasticsearch
	firewall-cmd --add-port=9200/tcp --permanent
	firewall-cmd --add-port=9300/tcp --permanent
	#zipkin
	firewall-cmd --add-port=9411/tcp --permanent
	#sentinel
	firewall-cmd --add-port=8180/tcp --permanent
	#rabbitmq
	firewall-cmd --add-port=5672/tcp --permanent
	firewall-cmd --add-port=15672/tcp --permanent
	#redis
	firewall-cmd --add-port=6379/tcp --permanent
	#photoframe-admin-biz
	firewall-cmd --add-port=9020/tcp --permanent
	#photoframe-admin-log
	firewall-cmd --add-port=9021/tcp --permanent
	#photoframe-api-app
	firewall-cmd --add-port=9006/tcp --permanent
	#photoframe-api-pad
	firewall-cmd --add-port=9007/tcp --permanent
	#photoframe-auth
	firewall-cmd --add-port=9003/tcp --permanent
	#photoframe-gateway
	firewall-cmd --add-port=9001/tcp --permanent
	#nginx
	firewall-cmd --add-port=8080/tcp --permanent
	service firewalld restart
}

# 启动基础环境（必须）
base()
{
  echo "启动基础服务容器(photoframe-mysql、photoframe-redis、photoframe-nacos、photoframe-elasticsearch、photoframe-rabbitmq)"
	docker-compose up -d photoframe-mysql photoframe-redis photoframe-nacos photoframe-elasticsearch photoframe-rabbitmq
}

# 启动程序模块（必须）
modules()
{
  echo "启动微服务模块容器"
	docker-compose up -d  photoframe-gateway photoframe-auth  photoframe-api-app  photoframe-api-pad photoframe-admin-biz photoframe-admin-log   photoframe-quartz photoframe-nginx
}

# 启动链路追踪（可选）
zipkin()
{
  echo "启动zipkin链路追踪容器"
	docker-compose up -d photoframe-zipkin photoframe-zipkin-dependencies
}

# 关闭所有环境/模块
stop()
{
  echo "停止所有Docker容器"
	docker-compose stop
}

# 关闭基础服务
stop_base()
{
  echo "停止基础服务容器(photoframe-mysql、photoframe-redis、photoframe-nacos、photoframe-elasticsearch、photoframe-rabbitmq)"
	docker-compose stop photoframe-mysql photoframe-redis photoframe-nacos photoframe-elasticsearch photoframe-rabbitmq
}

# 关闭微服务模块
stop_modules()
{
  echo "停止微服务容器"
	docker-compose stop photoframe-gateway photoframe-auth  photoframe-api-app  photoframe-api-pad photoframe-admin-biz photoframe-admin-log   photoframe-quartz photoframe-nginx
}

# 关闭zipkin
stop_modules()
{
  echo "停止zipkin"
	docker-compose stop photoframe-zipkin photoframe-zipkin-dependencies
}

# 删除所有环境/模块
rm()
{
  echo "删除所有容器"
	docker-compose rm
}

# 删除基础容器
rm_base()
{
  echo "删除基础容器"
	docker-compose rm photoframe-mysql photoframe-redis photoframe-nacos photoframe-elasticsearch photoframe-rabbitmq
}

# 删除微服务容器
rm_modules()
{
  echo "删除微服务容器"
	docker-compose rm photoframe-gateway photoframe-auth  photoframe-api-app  photoframe-api-pad photoframe-admin-biz photoframe-admin-log   photoframe-quartz photoframe-nginx
}

# 删除zipkin容器
stop_zipkin()
{
  echo "删除zipkin容器"
	docker-compose stop photoframe-zipkin photoframe-zipkin-dependencies
}

# 根据输入参数，选择执行对应方法，不输入则执行使用说明
case "$1" in
"port")
	port
;;
"base")
	base
;;
"modules")
	modules
;;
"zipkin")
	zipkin
;;
"stop")
	stop
;;
"stop_base")
	stop_base
;;
"stop_modules")
	stop_modules
;;
"stop_zipkin")
	stop_zipkin
;;
"rm")
	rm
;;
"rm_base")
	rm_base
;;
"rm_modules")
	rm_modules
;;
"rm_zipkin")
	rm_zipkin
;;
*)
	usage
;;
esac
```

# <span id="inline-blue">使用说明</span>

```shell
各模块jar包拷贝至对应docker环境目录(idea terminal需要配置git bash工具)
sh copy.sh

docker基础环境启动(mysql、redis、nacos)
sh run.sh base

docker项目核心环境启动(gateway、auth、admin、admin-log、quartz、api-app、api-pad)
sh run.sh modules

docker镜像批量导出
sh export.sh

docker镜像批量导入
sh import.sh
```

# <span id="inline-blue">部署过程中遇到的问题</span>

## <span id="inline-blue">端口映射问题</span>

容器端口映射配置需要使用双引号，如下所示：

```yml
    ports:
    - "8080:8080"
```

## <span id="inline-blue">Elasticseach权限问题</span>
Elasticsearch容器启动提示es.log not found ,没有对应的写入权限。

在Dockerfile里面创建对应的es用户，创建对应的日志目录，并且赋予了可读可写权限之外，docker-compose容器编排也加入了对应的权限赋予操作

Dockerfile

```Dockerfile
#基础镜像
FROM centos:7
#维护者
MAINTAINER 909754 <18685129726@163.com>
#拷贝安装包、创建elasticsearch用户elasticsearch、elasticsearch用户权限设置
COPY ./tar/elasticsearch-8.8.0-linux-x86_64.tar.gz /usr/local
RUN cd /usr/local && tar -zxvf elasticsearch-8.8.0-linux-x86_64.tar.gz &&  \
rm -f elasticsearch-8.8.0-linux-x86_64.tar.gz && \
useradd es  && \
chown -R es:es /usr/local/elasticsearch-8.8.0 && \
chmod -R 777  /usr/local/elasticsearch-8.8.0
#拷贝配置文件
ADD ./config/ /usr/local/elasticsearch-8.8.0/config/
#elasticsearch
USER es
#WORKDIR指令用于指定容器的一个目录， 容器启动时执行的命令会在该目录下执行
WORKDIR /usr/local/elasticsearch-8.8.0
#挂载匿名卷
VOLUME ["/usr/local/elasticsearch-8.8.0/data","/usr/local/elasticsearch-8.8.0/config","/usr/local/elasticsearch-8.8.0/logs"]
#CMD用于设置默认执行的命令
CMD ["/usr/local/elasticsearch-8.8.0/bin/elasticsearch"]
#暴露服务端口
EXPOSE 9200 9300
```

docker-compose.yml 对应服务定义如下：
```yml
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
```

最后发现挂载的宿主机目录也需要赋予读写权限

```shell
chown -R es:es /usr/local/docker/elasticsearch
chmod -R 777  /usr/local/docker/elasticsearch
```

## <span id="inline-blue">接口获取验证码失败</span>

报错信息如下：
```shell
Exception in thread "main" java.lang.NullPointerException
        at sun.awt.FontConfiguration.getVersion(FontConfiguration.java:1264)
        at sun.awt.FontConfiguration.readFontConfigFile(FontConfiguration.java:219)
        at sun.awt.FontConfiguration.init(FontConfiguration.java:107)
        at sun.awt.X11FontManager.createFontConfiguration(X11FontManager.java:776)
        at sun.font.SunFontManager$2.run(SunFontManager.java:431)
        at java.security.AccessController.doPrivileged(Native Method)
        at sun.font.SunFontManager.<init>(SunFontManager.java:376)
        at sun.awt.X11FontManager.<init>(X11FontManager.java:57)
        at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
        at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)
        at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
        at java.lang.reflect.Constructor.newInstance(Constructor.java:422)
        at java.lang.Class.newInstance(Class.java:442)
        at sun.font.FontManagerFactory$1.run(FontManagerFactory.java:83)
        at java.security.AccessController.doPrivileged(Native Method)
        at sun.font.FontManagerFactory.getInstance(FontManagerFactory.java:74)
        at java.awt.Font.<init>(Font.java:614)
        at java.awt.Font.createFont(Font.java:1056)
        at Main$.delayedEndpoint$Main$1(Main.scala:32)
        at Main$delayedInit$body.apply(Main.scala:11)
        at scala.Function0$class.apply$mcV$sp(Function0.scala:40)
        at scala.runtime.AbstractFunction0.apply$mcV$sp(AbstractFunction0.scala:12)
        at scala.App$$anonfun$main$1.apply(App.scala:76)
        at scala.App$$anonfun$main$1.apply(App.scala:76)
        at scala.collection.immutable.List.foreach(List.scala:381)
        at scala.collection.generic.TraversableForwarder$class.foreach(TraversableForwarder.scala:35)
        at scala.App$class.main(App.scala:76)
        at Main$.main(Main.scala:11)
        at Main.main(Main.scala)
```

原因是因为使用的java8精简基础镜像缺失相应的依赖，更改基础镜像即可。

```shell
--- FROM openjdk:8-jre-alpine
+++ FROM openjdk:8-jre
```

## <span id="inline-blue">depends_on导致容器启动异常</span>
depends_on配置项控制容器的启动顺序，只能保证容器启动顺序，不能实现被依赖容器服务启动完成的情况下再去启动相应的服务，导致加载异常，naocs依赖mysql,但不能保证MySQL服务可用的情况下去启动nacos,导致启动异常。

容器的依赖改用docker-compose-wait，实现容器间的心跳检测

Dockerfile文件加入docker-compose-wait支持：

```Dockerfile
# 基础镜像
FROM nacos/nacos-server:v2.1.1
# author
MAINTAINER 909754 <18685129726@163.com>
# 挂载目录
VOLUME /home/nacos
# 创建目录
RUN mkdir -p /home/nacos
# 指定路径
WORKDIR /home/nacos
#复制启动脚本
ADD ./bin/docker-startup.sh /bin/docker-startup.sh
#赋予初始化脚本执行权限
RUN ["chmod", "+x", "/bin/docker-startup.sh"]
#复制容器依赖检测工具docker-compose-wait
COPY ./docker-compose-wait/wait /wait
#赋予检测脚本执行权限
RUN ["chmod", "+x", "/wait"]
# 复制application.properties文件到路径
COPY ./conf/application.properties /home/nacos/conf/application.properties
# 复制nacos-logback.xml文件到路径
COPY ./conf/nacos-logback.xml /home/nacos/conf/nacos-logback.xml
#初始化命令
ENTRYPOINT /wait && bin/docker-startup.sh
```

docker-compose-wait下载地址：https://github.com/ufoscout/docker-compose-wait/releases

docker-compose.yml编排工具加入对应的环境变量WAIT_HOSTS、WAIT_TIMEOUT

```yml
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
      published: 8848
      protocol: tcp
      mode: host
    - target: 9848
      published: 9848
      protocol: tcp
      mode: host
    - target: 9849
      published: 9849
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
```

多个依赖服务的情况下采用逗号分隔
```yml
WAIT_HOSTS: photoframe-mysql:3306,photoframe-nacos:8848,photoframe-redis:6379
```

docker-compose.yml容器编排工具对应的服务没有定义WAIT_HOSTS环境变量的情况下，Dockerfile添加docker-compsoe-wait支持不生效