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


|docker-compose文件格式|Docker compose 版本|Docker 引擎|
|:------:| :------: | :------: |
|3.8|1.13.0+|19.03.0+|
|3.7|1.13.0+|18.06.0+|
|3.6|1.13.0+|18.02.0+|
|3.5|1.13.0+|17.12.0+|
|3.4|1.13.0+|17.09.0+|
|3.3|1.13.0+|17.06.0+|
|3.2|1.13.0+|17.04.0+|
|3.1|1.13.1+|1.13.1+|
|3.0|1.13.0+|1.13.0+|
|2.4|1.21.0+|17.12.0+|
|2.3|1.16.0+|17.06.0+|
|2.2|1.13.0+|1.13.0+|
|2.1|1.9.0+|1.12.0+|
|2.0|1.6+|1.10.0+|
|1.0|1.6|1.10|


docker-compose文件格式一共有3个版本，V1,V2,V3
V1: 
	docker-compose-1.6之前版本配合Dokcer engine-1.10.0版本兼容V1文件格式
	未声明版本的Compose 文件被视为"版本 1"。在这些文件中，所有服务都在文档的根目录下声明,目前已弃用。
	V1文件无法声明命名volume、network、build参数。
    示例：
```yml
web:
  build: .
  ports:
   - "8000:5000"
  volumes:
   - .:/code
  links:
   - redis
redis:
  image: redis
```
	
V2: 
	docker-compose-1.6至1.21.0版本配合Docker engine-1.10.0至1.13.0版本兼容V2文件格式
	版本特性：
	支持 depends_on 关键字定义服务之间的依赖关系。
	支持 healthcheck 关键字定义健康检查。
	支持 constraints 关键字定义服务部署约束。
	支持 secrets 关键字定义加密数据。
	支持 configs 关键字定义配置文件。
	支持 scale 关键字定义服务副本数量。
	支持 deploy 关键字定义服务的部署方式
	
示例：
```shell
version: "2.4"
services:
  web:
    build: .
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
  redis:
    image: redis
  db:
    image: postgres
    healthcheck:
      test: "exit 0"
```

V3: 
	docker-compose-1.13.0版本配合Docker engine-1.13.0至19.03.0版本兼容V3文件格式,主要是为了解决docker-compose支持集群swarm模式部署
	版本特性：
	支持新的服务控制指令，如 up, down, start, stop, restart, kill, ps, logs, pause, unpause, rm 等。
	支持新的服务编排功能，如 profiles 和 stack。
	支持新的网络和卷插件。
	支持新的环境变量处理方式。
	支持新的健康检查语法。
	支持新的服务更新策略。
	支持新的服务扩展策略。
	支持新的服务监控和日志记录功能。
	支持新的服务安全特性，如 secrets 和 configs。

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

## <span id="inline-blue">docker-compose V3版本配置项语法</span>

### <span id="inline-blue">version</span>
顶级version属性由Compose规范定义以实现向后兼容性它仅提供信息，如果使用版本规范不支持的属性，将收到一条警告消息，表明它已过时。
version属性包含主要版本和次要版本，如果在V2版本规范下定义如下：
```yml
version: '2'
```
等同于：
```yml
version: '2.0'
```
V2版本在不明确指定次要版本的情况下，默认匹配最早的次要版本。

如果在V3版本规范下定义如下：
```yml
version: '3'
```
等同于：
```yml
version: '3.8'
```
V3版本在不明确指定次要版本的情况下，默认匹配最新的次要版本。

### <span id="inline-blue">build</span>
在构建时应用的配置选项。
build可以指定为包含构建上下文路径的字符串：
```yml
version: "3.8"
services:
  webapp:
    build: ./dir
```
或者，作为一个对象，其路径在 context下指定，并且可选 Dockerfile和 args：
```yml
version: "3.8"
services:
  webapp:
    build:
      context: ./dir
      dockerfile: Dockerfile-alternate
      args:
        buildno: 1
```
如果指定image以及tag，则Compose会使用指定的image和选项build来命名构建的映像：webapp:tag 
```yml
build: ./dir
image: webapp:tag
```

### <span id="inline-blue">context</span>
包含 Dockerfile 的目录的路径，或 git 存储库的 url。
当提供的值是相对路径时，它将被解释为相对于Compose文件的位置。该目录也是发送到Docker守护进程的构建上下文。
Compose构建并使用生成的名称对其进行标记，然后使用该图像。
```yml
build:
  context: ./dir
```

### <span id="inline-blue">dockerfile</span>
备用 Dockerfile。
Compose使用备用文件进行构建。还必须指定构建路径。
```yml
build:
  context: .
  dockerfile: Dockerfile-alternate
```

### <span id="inline-blue">ARG</span>
添加构建参数，这些参数是仅在构建过程中可访问的环境变量。
首先，在 Dockerfile 中指定参数：
```yml
# syntax=docker/dockerfile:1

ARG buildno
ARG gitcommithash

RUN echo "Build number: $buildno"
RUN echo "Based on commit: $gitcommithash"
```
然后指定该键下的参数build。您可以传递映射或列表：
```yml
build:
  context: .
  args:
    buildno: 1
    gitcommithash: cdc3b19
```
列表形式
```yml
build:
  context: .
  args:
    - buildno=1
    - gitcommithash=cdc3b19
```
在您的 Dockerfile 中，如果您在指令ARG之前指定FROM， ARG则在下一个FROM的构建指令中不可用。如果您需要在两个地方都提供一个参数，也请在FROM指令下指定它
您可以在指定构建参数时省略该值，在这种情况下，其在构建时的值是 Compose 运行环境中的值。
```yml
args:
  - buildno
  - gitcommithash
```
YAML布尔值( "true", "false", "yes", "no", "on", "off") 必须用引号引起来，以便解析器将它们解释为字符串。

### <span id="inline-blue">cache_from</span>
引擎用于缓存解析的图像列表。
```yml
build:
  context: .
  cache_from:
    - alpine:latest
    - corp/web_app:3.14
```
3.3版本docker compose文件格式添加

### <span id="inline-blue">label</span>
使用Docker 标签将元数据添加到生成的图像中 。您可以使用数组或字典。
建议使用反向DNS表示法，以防止您的标签与其他软件使用的标签发生冲突。

单值映射：

```yml
build:
  context: .
  labels:
    com.example.description: "Accounting webapp"
    com.example.department: "Finance"
    com.example.label-with-empty-value: ""
```

列表形式：

```yml
build:
  context: .
  labels:
    - "com.example.description=Accounting webapp"
    - "com.example.department=Finance"
    - "com.example.label-with-empty-value"
```

3.3版本docker compose文件格式添加

### <span id="inline-blue">network</span>

设置网络容器连接以获取RUN构建期间的说明。

```yml
build:
  context: .
  network: host
```

```yml
build:
  context: .
  network: custom_network_1
```

用于none在构建期间禁用网络：

```yml
build:
  context: .
  network: none
```

3.4版本docker compose文件格式添加

### <span id="inline-blue">shm_size</span>

/dev/shm设置此构建容器的分区大小。指定为表示字节数的整数值或表示 字节值的字符串。

```yml
build:
  context: .
  shm_size: '2gb'
```

```yml
build:
  context: .
  shm_size: 10000000
```

3.5版本docker compose文件格式添加

### <span id="inline-blue">target</span>

构建指定阶段，如Dockerfile

```yml
build:
  context: .
  target: prod
```

3.4版本docker compose文件格式添加

### <span id="inline-blue">cap_add、cap_drop</span>

添加或删除容器功能

```yml
cap_add:
  - ALL

cap_drop:
  - NET_ADMIN
  - SYS_ADMIN
```

### <span id="inline-blue">cgroup_parent</span>

为容器指定一个可选的父 cgroup。

```yml
cgroup_parent: m-executor-abcd
```

在 Swarm 模式下部署堆栈时，该cgroup_parent选项将被忽略

### <span id="inline-blue">command</span>

覆盖默认命令。

```yml
command: bundle exec thin -p 3000
```

该命令也可以是一个列表，其方式类似于 dockerfile：

```yml
command: ["bundle", "exec", "thin", "-p", "3000"]
```

### <span id="inline-blue">container_name</span>

指定自定义容器名称，而不是生成的默认名称。

```yml
container_name: my-web-container
```

由于 Docker 容器名称必须是唯一的，因此如果指定了自定义名称，则无法将服务扩展至超过 1 个容器。尝试这样做会导致错误。
在 Swarm 模式下部署堆栈时，该container_name选项将被忽略。

参考：https://docker.github.net.cn/compose/compose-file/compose-file-v3/