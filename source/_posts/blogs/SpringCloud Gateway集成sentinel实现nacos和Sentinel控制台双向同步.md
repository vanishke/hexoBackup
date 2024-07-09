---
title: SpringCloud Gateway集成sentinel实现nacos和Sentinel控制台双向同步
date: 2024-04-29 14:11:20
tags:
	- Java
	- SpringCloud
	- Sentinel
	- Java
categories: 
	- SpringCloud
---
## <span id="inline-blue">环境</span>
Java: 1.8
SpringBoot: 2.2.6.Release
SpringCloud: 2021.0.5
Sentinel: 1.8.7
nacos：2.2.0
### <span id="inline-blue">背景</span>
SpringBoot版本升级为2.6.6，SpringCloud对应模块组件升级3.1.6版本之后，SpringCloud移除了hytrix和Ribbon实现，网关配置的hytrix自定义过滤和限流不能使用，因此选择集成Sentinel实现从网关上限制各个路由节点的流量和熔断功能。

### <span id="inline-blue">实现</span>
网关模块添加sentinel和nacos依赖
```xml
		<dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
        </dependency>
        <!--sentinel-datasource-nacos持久化-->
        <dependency>
            <groupId>com.alibaba.csp</groupId>
            <artifactId>sentinel-datasource-nacos</artifactId>
        </dependency>
        <!--    spring cloud gateway整合sentinel的依赖-->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-alibaba-sentinel-gateway</artifactId>
        </dependency>
```

网关模块bootstrap.properties添加对应配置项如下：
```properties
#sentinel
#关闭sentinel默认过滤器
spring.cloud.sentinel.filter.enabled=false
#关闭懒加载模式
spring.cloud.sentinel.eager=true
# 关闭context整合,避免链路模式下，请求资源共用同一个root资源导致限制规则失效
spring.cloud.sentinel.web-context-unify=false
#微服务和sentinel通信交互的http端口，检测端口出现冲突的情况下递增
spring.cloud.sentinel.transport.port=${admin-album.sentinel-transport-port}
#微服务注册sentinel控制台地址
spring.cloud.sentinel.transport.dashboard=${sentinel-dashboard-addr}
#feign调用开启sentinel
feign.sentinel.enabled=true

#网关限流 gw-flow-rules
#nacos服务地址
spring.cloud.sentinel.datasource.gw-flow.nacos.server-addr=${nacos-addr}
#nacos命名空间
spring.cloud.sentinel.datasource.gw-flow.nacos.namespace=${nacos-namespace}
#sentinel 网关限流规则
spring.cloud.sentinel.datasource.gw-flow.nacos.dataId=${spring.application.name}-gw-flow-rules.json
#nacos默认分组
spring.cloud.sentinel.datasource.gw-flow.nacos.groupId=DEFAULT_GROUP
#规则定义文件格式
spring.cloud.sentinel.datasource.gw-flow.nacos.data-type=json
#规则类型
spring.cloud.sentinel.datasource.gw-flow.nacos.rule-type=gw-flow

#服务降级 degrade-rules
#nacos服务地址
spring.cloud.sentinel.datasource.degrade.nacos.server-addr=${nacos-addr}
#nacos命名空间
spring.cloud.sentinel.datasource.degrade.nacos.namespace=${nacos-namespace}
#sentinel 网关限流规则
spring.cloud.sentinel.datasource.degrade.nacos.dataId=${spring.application.name}-degrade-rules.json
#nacos默认分组
spring.cloud.sentinel.datasource.degrade.nacos.groupId=DEFAULT_GROUP
#规则定义文件格式
spring.cloud.sentinel.datasource.degrade.nacos.data-type=json
#规则类型
spring.cloud.sentinel.datasource.degrade.nacos.rule-type=degrade

#api分组 gw-api-group-rules
#nacos服务地址
spring.cloud.sentinel.datasource.gw-api-group.nacos.server-addr=${nacos-addr}
#nacos命名空间
spring.cloud.sentinel.datasource.gw-api-group.nacos.namespace=${nacos-namespace}
#sentinel 网关限流规则
spring.cloud.sentinel.datasource.gw-api-group.nacos.dataId=${spring.application.name}-gw-api-group-rules.json
#nacos默认分组
spring.cloud.sentinel.datasource.gw-api-group.nacos.groupId=DEFAULT_GROUP
#规则定义文件格式
spring.cloud.sentinel.datasource.gw-api-group.nacos.data-type=json
#规则类型
spring.cloud.sentinel.datasource.gw-api-group.nacos.rule-type=gw-api-group

#系统规则 system-rules
#nacos服务地址
spring.cloud.sentinel.datasource.system.nacos.server-addr=${nacos-addr}
#nacos命名空间
spring.cloud.sentinel.datasource.system.nacos.namespace=${nacos-namespace}
#sentinel 网关限流规则
spring.cloud.sentinel.datasource.system.nacos.dataId=${spring.application.name}-system-rules.json
#nacos默认分组
spring.cloud.sentinel.datasource.system.nacos.groupId=DEFAULT_GROUP
#规则定义文件格式
spring.cloud.sentinel.datasource.system.nacos.data-type=json
#规则类型
spring.cloud.sentinel.datasource.system.nacos.rule-type=system
```

### <span id="inline-blue">Sentinel源码适配</span>
Sentinel默认是不支持控制台规则同步nacos,需要自己修改源码实现。
Sentinel版本使用1.8.7，自定义规则同步实现参考：https://www.cnblogs.com/cndarren/p/16197684.html
已经修改完成的nacos分支版本地址：https://github.com/vanishke/sentinel-1.8.7/tree/master


<a id="download" href="/images/Sentinel/sentinel-dashboard-1.8.7-customized.zip"><i class="fa fa-download"></i><span>sentinel-dashboard-1.8.7-customized.zip</span> </a>

### <span id="inline-blue">Sentinel启动</span>
start.sh脚本内容如下：
```shell
#!/bin/bash
pid=$(ps -ef | grep sentinel-dashboard-1.8.7-customized.jar | grep -v grep | awk '{print $2}')
kill -9 $pid
nohup java -Dserver.port=8180 -Dnacos.serverAddr=localhost:8848 -Dsentinel.dashboard.auth.username=sentinel -Dsentinel.dashboard.auth.password=sentinel -Dnacos.namespace=ffcs-test -Dcsp.sentinel.dashboard.server=localhost:8180 -Dproject.name=sentinel-dashboard -jar sentinel-dashboard-1.8.7-customized.jar  > ./info.log &

#-Dnacos.serverAddr=localhost:8848 nacos控制台地址
#-Dsentinel.dashboard.auth.username=sentinel 管理用户名
#-Dsentinel.dashboard.auth.password=sentinel 管理用户密码
#-Dnacos.namespace=ffcs-test  nacos命名空间
#-Dcsp.sentinel.dashboard.server=localhost:8180 Sentinel控制台
```

### <span id="inline-blue">Sentinel熔断和限流规则配置</span>

#### <span id="inline-blue">限流</span>
![Sentinel限流](/images/Sentinel/sentinel_20240531_001.png)
#### <span id="inline-blue">熔断</span>
![Sentinel熔断](/images/Sentinel/sentinel_20240531_002.png)

### <span id="inline-blue">网关统一设置限流异常</span>
```java
@Bean
    @Order(-2)
    public GlobalFilter sentinelGatewayFilter() {
        return new SentinelGatewayFilter();
    }

    @Bean(name = "sentinelBlockRequestHandler")
    public BlockRequestHandler sentinelBlockRequestHandler() {
        BlockRequestHandler blockRequestHandler = new BlockRequestHandler() {
            @SneakyThrows
            @Override
            public Mono<ServerResponse> handleRequest(ServerWebExchange serverWebExchange, Throwable throwable) {

                int code;
                String message;
                if (throwable instanceof FlowException) {
                    code = SentinelExceptionTypeEnum.FLOW.getValue();
                    message = SentinelExceptionTypeEnum.FLOW.getMessage();
                } else if (throwable instanceof ParamFlowException) {
                    code =SentinelExceptionTypeEnum.PARAMFLOW.getValue();
                    message = SentinelExceptionTypeEnum.PARAMFLOW.getMessage();
                } else if (throwable instanceof DegradeException) {
                    code = SentinelExceptionTypeEnum.DEGRADE.getValue();
                    message = SentinelExceptionTypeEnum.DEGRADE.getMessage();
                } else if (throwable instanceof AuthorityException) {
                    code = SentinelExceptionTypeEnum.AUTHORITY.getValue();
                    message = SentinelExceptionTypeEnum.AUTHORITY.getMessage();
                }
                else if(throwable instanceof SystemBlockException)
                {
                    code = SentinelExceptionTypeEnum.SYSTEM.getValue();
                    message = SentinelExceptionTypeEnum.SYSTEM.getMessage();
                }
                else{
                    code = SentinelExceptionTypeEnum.INTERNAL.getValue();
                    message = SentinelExceptionTypeEnum.INTERNAL.getMessage();
                }
                return ServerResponse.status(HttpStatus.BAD_GATEWAY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(BodyInserters.fromValue(new ObjectMapper().writeValueAsString("{\"msg\": " + message + ", \"code\": " + code + "}")));
            }
        };
        return blockRequestHandler;
    }
```

### <span id="inline-blue">验证</span>
限流：
![Sentinel限流](/images/Sentinel/sentinel_20240531_003.png)
熔断：
![Sentinel熔断](/images/Sentinel/sentinel_20240531_004.png)

nacos限流规则同步：
![nacos限流同步](/images/Sentinel/sentinel_20240531_005.png)
nacos熔断规则同步：
![nacos熔断同步](/images/Sentinel/sentinel_20240531_006.png)