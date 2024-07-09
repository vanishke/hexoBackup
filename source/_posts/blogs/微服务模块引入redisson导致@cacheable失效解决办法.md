---
title: 微服务模块引入redisson导致@cacheable失效解决办法
categories: 
	- SpringCloud
tags: 
	- SpringCloud
	- Redisson
	- Java
date: 2024-03-06 17:47:20
---
<!-- toc -->

## <span id="inline-blue">环境</span>
SpringCloud : 2021.0.5
SpringBoot : 2.2.6.RELEASE
Spring : 5.2.5.RELEASE
redisson : 3.12.5
Java : 1.8
MySQL : 5.7
## <span id="inline-blue">现象</span>
微服务引入redisson模块依赖之后发现启动出现Cannot find cache named RedisClientCache
## <span id="inline-blue">原因</span>
报错部分代码如下：
```java
@Cacheable(value = { "RedisClientCache" }, unless = "#result == null", key = "T(com.ffcs.platform.common.base.constants.GlobalsConstants).CLIENT_DETAILS_KEY.concat(T(String).valueOf(#clientId))")
    public OauthClientDetails findOauthClientDetailsByClientId(String clientId) {
        return oauthClientDetailsDao.getOauthClientDetailsByClientId(clientId);
    }
```
在未添加redisson之前，启动没有问题，怀疑是因为redisson和@Cacheable冲突导致缓存对象RedisClientCache未创建，查询了之后发现确实是因为redisson的影响导致，参考如下
https://dandelioncloud.cn/article/details/1517352520602173442
## <span id="inline-blue">解决办法</span>
模块对应启动配置文件增加配置项如下:
```properties
spring.cache.type=redis   
spring.cache.cache-names=RedisClientCache
```




