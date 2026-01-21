---
title: Docker部署微服务集群(五)
categories:
	- Docker
tags: 
	- Docker
	- docker swarm
	
date: 2024-12-13 15:38:45
updated: 2024-12-13 15:38:45
---
<!-- toc -->
# <span id="inline-blue">环境</span>

Docker: 26.1.4
docker-compose: v2.25.0

# <span id="inline-blue">背景</span>

基于docker-compose容器编排工具，实现容器在swarm集群环境下的分布式部署.

# <span id="inline-blue">swarm部署</span>

初始化swarm集群环境下manager和worker节点
管理节点(指定网卡IP地址)：

```shell
docker swarm init --advertise-addr=10.9.216.12
```

上述命令初始化当前节点为管理节点，并生成worker节点加入swarm集群命令，类似如下(token以实际情况为准)：

```shell
docker swarm join --token <SWARM_JOIN_TOKEN> 10.0.0.12:2377
```

查看swarm集群割接点信息(manage节点执行):

```shell
docker node ls
```

为swarm节点增加角色标签base，用于docker-swarm.yml编排service根据node.labels.role=base将容器部署到指定标签的swarm节点
语法：
docker node update --label-add <key1> --label-add <key2>=<value> <NODENAME>
示例：

```shell
docker node update  --label-add role=base stmxgrb0232cv7zn4gzf5r118
```

描述：
将stmxgrb0232cv7zn4gzf5r118节点赋予role标签base(基础服务mysql、nacos、redis、elasticsearch、rabbitmq、zipkin)

为swarm节点增加角色标签service，用于docker-swarm.yml编排service根据node.labels.role=service将容器部署到指定的swarm节点
语法：
docker node update --label-add <key1> --label-add <key2>=<value> <NODENAME>
示例：

```shell
docker node update  --label-add role=service 3ucz3fscdmxo36wy716thaga8
```

描述：
将3ucz3fscdmxo36wy716thaga8节点赋予role标签service(微服务)

interface，用于docker-swarm.yml编排interface根据node.labels.role=interface将容器部署到指定的swarm节点
语法：
docker node update --label-add <key1> --label-add <key2>=<value> <NODENAME>
示例：
```shell
docker node update  --label-add role=interface 3ucz3fscdmxo36wy716thaga7
```
描述：
将3ucz3fscdmxo36wy716thaga7节点赋予role标签interface(接口)

容器集群部署之前需要在部署对应容器的的swarm节点生成自定义镜像

方式一(Dockerfile):
切换到对应模块Dockerfile文件所在路径执行构建命令：

示例：

```shell
docker build -t photoframe-mysql .
```

-t:指定生成镜像名，和docker-swarm.yml文件中的对应模块的service指定image参数一致
. :代表了构建镜像的上下文环境，当前路径



方式二(docker-swarm.yml):
示例:
swarm带有base标签节点构建基础服务镜像

```shell
docker-compose -f docker-swarm.yml build photoframe-mysql photoframe-redis photoframe-nacos photoframe-elasticsearch photoframe-rabbitmq photoframe-sentinel photoframe-zipkin photoframe-zipkin-dependencies
```

swarm带有service标签节点构建微服务镜像

```shell
docker-compose -f docker-swarm.yml build photoframe-gateway photoframe-auth   photoframe-admin-biz photoframe-admin-log   photoframe-quartz photoframe-nginx
```

swarm带有interface标签节点构建接口微服务镜像

```shell
docker-compose -f docker-swarm.yml build photoframe-api-app  photoframe-api-pad
```

部署服务：

```shell
docker stack config --compose-file docker-swarm.yml > docker-swarm-process.yml
docker stack deploy --compose-file docker-swarm-process.yml --resolve-image never photoframe
```

stack: swarm集群部署的命令
docker stack config: 转换docker-swarm.yml配置，将env_file引用环境变量重写(docker deploy 命令不支持默认读取.env文件定义的环境变量)
docker stack deploy: 部署swarm栈，使用转换后的配置文件docker-swarm-process.yml
-c: 指定部署服务使用的docker-compose 配置文件，名称可自定义
photoframe: docker stack创建的栈名称
docker升级为swarm集群后不能再使用docker-compose命令执行docker-compose up -d(只适用单机环境)命令部署服务，需要使用docker stack命令部署

批量更新服务

```shell
docker service ls --format '{{.Name}}' | xargs -L1 docker service update --force
```

# <span id="inline-blue">swarm 命令汇总</span>


|命令|描述|
|:------:|:------:|
|docker swarm init|初始化一个 swarm 群集|
|docker swarm join|加入群集作为节点或管理器|
|docker swarm join-token|管理用于加入群集的令牌|
|docker swarm leave|离开 swarm 群集|
|docker swarm unlock|解锁 swarm 群集|
|docker swarm unlock-key|管理解锁钥匙|
|docker swarm update|更新 swarm 群集|


# <span id="inline-blue">service 命令汇总</span>


|命令|描述|
|:------:|:------:|
|docker node|service ls|查看集群中所有的节点(服务)|
|docker node|service ps|查看指定节点(服务)的容器信息|
|docker node|service inspect|查看指定节点(服务)的内部配置和状态信息|
|docker node|service update|更新节点(服务)配置信息|
|docker node|service rm|从集群中移除节点(服务)|



# <span id="inline-blue">node 命令汇总</span>


|命令|描述|
|:-----:|:------:|
|docker node demote|从 swarm 群集管理器中降级一个或多个节点|
|docker node promote|将一个或多个节点推入到群集管理器中(也就是升级节点)|
|docker node inspect|显示一个或多个节点的详细信息|
|docker node ls|列出 swarm 群集中的节点|
|docker node ps|列出在一个或多个节点上运行的任务，默认为当前节点|
|docker node rm|从 swarm 群集删除一个或多个节点|
|docker node update|更新一个节点|


# <span id="inline-blue">部署过程中遇到的问题</span>

## <span id="inline-blue">docker stack不支持的命令</span>

```yml
build
cgroup_parent
container_name
devices
tmpfs
external_links
links
network_mode
restart
security_opt
stop_signal
sysctls
userns_mode
```

## <span id="inline-blue">网关访问微服务失败</span>

原因就是我们在docker-compose.yml中定义swarm服务发现的模式问题：
endpoint_mode：

	vip: 这个是默认的方案。即通过虚拟的IP对外暴露服务，客户端无法察觉有多少个节点提供服务，也不知道实际提供服务的IP和端口。
	
	dnsrr：这个是DNS的轮询调度。客户端访问的时候，Docker会通过DNS列表返回对应的服务一系列IP地址，客户连接其中的一个。这种方式通常用于使用自己的负载均衡器，或者window和linux的混合应用。

我们在定义网关的时候使用的是deploy.endpoint_mode=vip，这个是没问题的 ，但是在定义网关后面的
子服务的时候就需要使用deploy.endpoint_mode=dnsrr这个模式了，因为我们是个集群，每个子服务存在
好几个副本，在网关路由的时候是通过服务名称去发现子服务的，而vip是通过ip地址发现的，所以需要使用dnsrr模式
在服务使用deploy.endpoint_mode=dnsrr模式后不能使用如下方式暴露端口：

```yml
ports: "8080:8080"
```

需要这样定义：

```yml
    ports:
    - target: 9411
      published: 9411
      protocol: tcp
      mode: host
```

mode:

  ingress: 通过 Ingress 模式发布的服务，可以保证从 Swarm 集群内任一节点（即使没有运行服务的副本）都能访问该服务；以 Host 模式发布的服务只能通过运行服务副本的节点来访问。
  host: 表示只有外部请求发送到运行了服务副本的节点才可以访问该服务。

下图展示两种模式的区别：
![Dockerfile docker-swarm](/images/docker/20241213/Docker_docker_swarm_20241213_001.png)
