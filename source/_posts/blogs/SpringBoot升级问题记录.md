---
title: SpringBoot升级问题记录
tags:
	- Java
	- SpringBoot
categories: 
	- SpringBoot

date: 2024-05-31 14:11:20
updated: 2024-05-31 14:11:20
---
## <span id="inline-blue">项目背景</span>
项目为实现全链路灰度发布功能，需要引入loadbalance依赖，放弃掉现有hytrix和ribbon,因此将项目微服务框架版本升级
## <span id="inline-blue">升级内容</span>
|名称|原始版本|新版本|
|----|----|----|
|SpringBoot|2.2.6.RELEASE|2.6.6 |
|SpringCloud|	2021.0.5|2021.0.6|
|springCloud-alibaba|2021.1|2021.0.6.0|
|spring-cloud-stater|2.2.2.RELEASE|3.1.6|
|spring-boot-stater|2.2.6.RELEASE|2.6.6|
|spring|5.2.5.RELEASE|5.3.18|
|mybatis-plus|3.3.1|3.5.3|
### <span id="inline-blue">RedisUtil问题</span>
redis版本升级导致语法变更
解决方案：
```java
报错代码：redisTemplate.delete(CollectionUtils.arrayToList(key));
修正代码: redisTemplate.delete(Arrays.asList(key));

报错代码：Cursor<byte[]> cursor = connection.scan(new ScanOptions.ScanOptionsBuilder().match(realKey).count(Integer.MAX_VALUE).build());
修正代码: Cursor<byte[]> cursor = connection.scan(ScanOptions.scanOptions().match(realKey).count(Integer.MAX_VALUE).build());
```

### <span id="inline-blue">Junit问题</span>
解决方案：
SpringBoot升级之后需要自行导入Junit依赖
```xml
<dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.11</version>
            <scope>test</scope>
        </dependency>
```

### <span id="inline-blue">定时任务问题</span>
spring-boot-starter-quartz 2.5.9 之前使用org.quartz.impl.jdbcjobstore.JobStoreTX定义quartz的默认数据源支持，即如下配置：
```properties
org.quartz.jobStore.class=org.quartz.impl.jdbcjobstore.JobStoreTX
```
解决方案：
新版本配置变更为如下内容：
```properties
org.quartz.jobStore.class=org.springframework.scheduling.quartz.LocalDataSourceJobStore
```

### <span id="inline-blue">循环依赖问题</span>
```java
Application run failed   org.springframework.boot.SpringApplication.reportFailure(SpringApplication.java:824) 
org.springframework.context.ApplicationContextException: Failed to start bean 'documentationPluginsBootstrapper'; nested exception is java.lang.NullPointerException
    at org.springframework.context.support.DefaultLifecycleProcessor.doStart(DefaultLifecycleProcessor.java:181) ~[spring-context-5.3.22.jar:5.3.22]

```
在 Spring Boot 2.6 版本中，循环引用默认情况下已经被禁止了。如果你的项目存在循环引用问题，那你在启动项目的时候就会报错。
解决方案：
在bootStrap.properties启动配置文件中增加如下配置项解决
```properties
spring.main.allow-circular-references=true
```

### <span id="inline-blue">knife4j启动加载问题</span>
![Swagger2.0报错](/images/SpringBoot/SpringBoot_20240531_001.png)

springboot2.6.x以及上版本默认使用的PATH_PATTERN_PARSER而knife4j的springfox使用的是ANT_PATH_MATCHER导致的
解决方案：
springboot的配置文件配置url匹配规则
```properties
spring.mvc.pathmatch.matching-strategy=ANT_PATH_MATCHER
```

Swagger初始化配置类增加如下内容：
```java
/**
 * 解决springboot2.6 和springfox不兼容问题
 * @return
 */
@Bean
public static BeanPostProcessor springfoxHandlerProviderBeanPostProcessor() {
    return new BeanPostProcessor() {

        @Override
        public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
            if (bean instanceof WebMvcRequestHandlerProvider || bean instanceof WebFluxRequestHandlerProvider) {
                customizeSpringfoxHandlerMappings(getHandlerMappings(bean));
            }
            return bean;
        }

        private <T extends RequestMappingInfoHandlerMapping> void customizeSpringfoxHandlerMappings(List<T> mappings) {
            List<T> copy = mappings.stream()
                    .filter(mapping -> mapping.getPatternParser() == null)
                    .collect(Collectors.toList());
            mappings.clear();
            mappings.addAll(copy);
        }

        @SuppressWarnings("unchecked")
        private List<RequestMappingInfoHandlerMapping> getHandlerMappings(Object bean) {
            try {
                Field field = ReflectionUtils.findField(bean.getClass(), "handlerMappings");
                field.setAccessible(true);
                return (List<RequestMappingInfoHandlerMapping>) field.get(bean);
            } catch (IllegalArgumentException | IllegalAccessException e) {
                throw new IllegalStateException(e);
            }
        }
    };
}
```

### <span id="inline-blue">微服务启动缺失nacos配置信息导致启动报错</span>
问题原因：
SpringBoot项目，只会识别application.properties 配置文件，并不会自动识别bootstrap.properties。
bootstrap.yml配置是SpringCloud项目才会用到的，如果你想在springboot项目中用bootstrap.properties，那么你需要添加bootstrap启动器。
Spring Boot 2.4版本开始，配置文件加载方式进行了重构
```text
39.2. Config First Bootstrap

To use the legacy bootstrap way of connecting to Config Server, bootstrap must be enabled via a property or the spring-cloud-starter-bootstrap starter. The property is spring.cloud.bootstrap.enabled=true. It must be set as a System Property or environment variable.
```
解决方案：
pom.xml添加对应依赖
```xml
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-bootstrap</artifactId>
			<version>3.1.6</version>
        </dependency>
```

### <span id="inline-blue">hibernate-validator加载报错</span>
Springboot从2.3以后，spring-boot-starter-web中不再引入hibernate-validator
解决方案：
pom.xml引入对应依赖
```xml
<dependency>
    <groupId>org.hibernate.validator</groupId>
    <artifactId>hibernate-validator</artifactId>
    <version>6.0.18.Final</version>
    <scope>compile</scope>
</dependency>
```

### <span id="inline-blue">微服务启动时No Feign Client for loadBalancing defined</span>
SpringCloud版本升级后移除hytrix熔断和Ribbon负载均衡实现
解决方案：
pom.xml手动引入openfeign和loadbalance依赖
```xml
<dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-loadbalancer</artifactId>
			<version>3.1.6</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
			<version>3.1.6</version>
        </dependency>
```

### <span id="inline-blue">java.lang.NoSuchFieldError: INSTANCE</span>
启动报错，错误信息如下：
```java
Could not instantiate bean class EventPublishingRunListener   
org.springframework.beans.BeanInstantiationException
exception is java.lang.NoSuchFieldError: INSTANCE
```
从调用链看是Spring-bean依赖对应的实体类缺失对应的方法，查看pom.xml文件依赖树发现存在多个版本的Spring版本依赖，导致加载异常。
解决方案：
排除掉存在冲突的依赖版本，只保留最新的版本。

### <span id="inline-blue">commons-pool2兼容性报错</span>
错误信息
```java
Description:

An attempt was made to call a method that does not exist. The attempt was made from the following location:
    org.springframework.boot.autoconfigure.data.redis.JedisConnectionConfiguration.jedisPoolConfig(JedisConnectionConfiguration.java:114)

The following method did not exist:

    redis.clients.jedis.JedisPoolConfig.setMaxWait(Ljava/time/Duration;)V

Action:

Correct the classpath of your application so that it contains compatible versions of the classes org.springframework.boot.autoconfigure.data.redis.JedisConnectionConfiguration and redis.clients.jedis.JedisPoolConfig

```
Git Issue ：https://github.com/spring-projects/spring-boot/issues/27642
看这个时间很早就修正了，commons-pool2 在2.8.1版本后丢失了一些方法。
解决方案：
commons-pool2依赖版本升级到2.11.1。
