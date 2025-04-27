---
title: SpringBoot以https加载emqx报错unable to find valid certification path to requested target 
categories:
	- Docker
tags: 
	- Emqx
	- Docker
	- Nginx
	
date: 2025-04-09 14:35:22
updated: 2025-04-09 14:35:22
---
<!-- toc -->
# <span id="inline-blue">环境</span>

Docker: 27.3.1
docker compose: v2.29.7
Emqx: 5.7.2
Nginx: 1.27.4
SpringBoot: 2.6.6

# <span id="inline-blue">背景</span>

Docker 环境下部署微服务，启动过程中日志报错提示如下：

```shell
unable to find valid certification path to requested target 
```

# <span id="inline-blue">原因</span>

springboot集成emqx，使用https协议连接nginx代理的emqx集群，nginx配置的自签名证书不被jdk所信任，导致加载证书失败，emqx相关配置如下:

```yml
emqx:
  # 是否启用emqx消息推送
  open: true
  config:
    # 认证配置
    auth:
      # 是否开启密码jwt认证，默认false
      openJWT: true
      # Secret是否使用 Base64 编码，默认false
      openBase64: true
      # 签名 当使用Base64编码，则使用base64编码的字符串（和服务配置一致）
      secret: Y29zaGlw
    # API配置  Basic认证
    api:
      # 认证名
      apiKey: 947d4819c1a17673
      # 认证密码
      secretKey: 6DewmDIsMaOOHjxCzYvuKGTiPTUe9A5fluwN1yx3iBq2
      apiUrl: http://10.0.1.202:18083/api/v5/
    # 客户端配置
    client:
      # 账号&密码为选填字段，可不填
      username: admin
      password: Coship7000?
      # tcp连接地址
      url: ssl://10.0.1.202:8884
      # 订阅主题
      subTopic: default/#
      # 消息传递质量:
      # QoS 0：最多一次，即<=1。这个级别的消息可能会被传递多次，或者可能根本不会被传递。这种级别适用于对数据要求不高的情况，丢几个数据影响不大的项目。
      # QoS 1：至少一次，即>=1。这个级别的消息至少会被传递一次，但如果设备在传递消息时出现故障，消息可能会被重发。这种级别适用于一些对消息传递可靠性要求较高的场景，但会增加网络传输的开销和延迟。
      # QoS 2：一次，即=1。这个级别的消息只会被传递一次，而且保证了消息的顺序性。在这个级别下，消息代理会进行两阶段的握手确认。只有在收到最终确认后，消息代理才会认为消息传递完成。QoS 2级别提供了最高的可靠性，但相应地增加了更多的网络开销和延迟。
      qos: 0
      # 默认qos（发布端）
      defaultQos: 0
      # 默认主题（发布端）
      defaultTopic: default
    # 多线程配置
    executor:
      # 是否使用线程池接受入站消息
      isOpen: true
      # 核心线程数
      corePoolSize: 8
      # 最大线程数
      maxPoolSize: 16
      # 等待队列
      queueCapacity: 9999
      # 自定义线程前缀
      thread-name-prefix: emqx-executor-
    # 拓展配置
    expand:
      # 批量获取客户端状态线程池固定线程数（默认5）
      statusThreadsNum: 5
```

使用https连接的情况下url参数格式必须以ssl开头,示例：

```yml
url: ssl://10.0.1.202:8884
```
# <span id="inline-blue">解决办法</span>

Dockerfile将证书拷贝进镜像，并将证书导入jdk受信任证书库

```shell
#拷贝https证书
COPY ./https /home/https
#jdk证书库导入自签名证书
RUN keytool -import -trustcacerts -noprompt -alias mqtt.xxx.xxx.com \
    -file /home/https/server.pem \
    -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit
```

-alias 指定别名(推荐和证书域名同名)

-keystore 指定存储文件(jdk受信任证书库文件名称，默认cacerts)

-file 指定证书文件全路径(证书文件所在的目录)

注意:当切换到 cacerts 文件所在的目录时,才可指定 -keystore cacerts, 否则应该指定全路径;

查看受信任证书列表：

```shell
keytool -list -keystore cacerts -alias mqtt.xxx.xxx.com
```

如果是在本地idea开发环境报错，则使用下面的命令实现：

powershell或者cmd命令行进入指定路径执行如下命令(管理员权限执行)

![jdk导入自签名证书](/images/docker/20250409/docker_20250409_001.png)

```shell
#执行命令输入默认证书库密码changeit
keytool -import -alias mqtt.xxx.xxx.com -keystore cacerts -file /home/xxx/mqtt/server.pem

keytool -list -keystore cacerts -alias mqtt.xxx.xxx.com
```
