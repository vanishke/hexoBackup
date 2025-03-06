---
title: SpringBoot3升级记录
categories:
	- SpringBoot
tags: 
	- SpringBoot
	
date: 2025-02-28 16:27:25
updated: 2025-02-28 16:27:25
---
<!-- toc -->
# <span id="inline-blue">背景</span>
项目微服务redisson bug需要进行升级，redisson版本需要升级到3.40.1，但升级的同时springBoot、spring、springCloud、java版本都需要进行升级，如下是升级前后对比：

|依赖项|升级前版本|升级后版本|备注|
|:---:|:---:|:---:|:---:|
|SpringBoot|2.6.6|3.4.1|直接更新到最新版本|
|SpringCloud|2021.0.6|2024.0.0|对应SpringBoot3.4.1|
|spring-security|5.6.2|6.4.2|对应SpringBoot3.4.1|
|spring|5.3.18|6.2.1|对应SpringBoot3.4.1|	
|spring|5.3.18|6.2.1|对应SpringBoot3.4.1|	
|spring-security-oauth2|2.5.2.RELEASE|spring-security-oauth2-authorization-server-1.4.1|SpringBoot3版本之后oauth2.0被替换为spring-security-oauth2-authorization-server|
|Mybatis-Plus|3.5.3|3.5.9|artifactId 从mybatis-plus-boot-starter改成了mybatis-plus-spring-boot3-starter|
|springcloud-alibaba|2021.0.6.0|2023.0.3.2|对应SpringCloud版本2024.0.0|
|java|1.8|21|对应SpringBoot版本3.4.1|

# <span id="inline-blue">依赖报错问题</span>

## <span id="inline-blue">MySQL</span>

![MySQL依赖迁移](/images/SpringBoot/20250228/SpringBoot_20250228_001.png)
mysql maven依赖坐标由com.mysql:mysql-connector-java更新为mysql:mysql-connector-j
```xml
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <version>8.0.31</version>
        </dependency>
```

## <span id="inline-blue">Mybatis-plus</span>

Mybatis-plus升级到3.5.9版本后，MybatisPlusInterceptor代码爆红，提示类缺失，查了之后发现3.5.9之后MybatisPlusInterceptor被拆分到mybatis-plus-jsqlparser依赖里面，添加如下依赖：

```xml
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-jsqlparser</artifactId>
        </dependency>
```

## <span id="inline-blue">Jakarta EE</span>

![Jakarta EE依赖迁移](/images/SpringBoot/20250228/SpringBoot_20250228_002.png)

maven依赖坐标javax.servlet:javax.servlet-api更新为jakarta.servlet:jakarta.servlet-api，并且包名还进行了更新，所有javax.xxx.xxx都需要批量更改为jakarta.xxx.xxx
更新之后的maven坐标如下：

```xml
<dependency>
            <groupId>jakarta.servlet</groupId>
            <artifactId>jakarta.servlet-api</artifactId>
            <version>6.0.0</version>
</dependency>
```

## <span id="inline-blue">Redis</span>

![redis配置迁移](/images/SpringBoot/20250228/SpringBoot_20250228_003.png)

更新后的配置如下：

```yml
redisson:
  keyPrefix:
  nettyThreads: 8
  singleServerConfig:
    clientName: redissonSingleClient
    connectionMinimumIdleSize: 8
    connectionPoolSize: 32
    idleConnectionTimeout: 10000
    subscriptionConnectionPoolSize: 50
    timeout: 3000
  threads: 4
spring:
  data:
    redis:
      database: 0
      host: 10.9.216.12
      password: 123456
      port: 6379
      ssl:
        enabled: false
      timeout: 10s
```

## <span id="inline-blue">Elasticsearch</span>

![Elasticsearch迁移](/images/SpringBoot/20250228/SpringBoot_20250228_004.png)

SpringBoot3默认使用的Elasticsearch版本为8.8.0,和项目里面使用的版本没有差异，只是java 客户端升级为8.15.5，保持和springBoot 预定义依赖版本一致

更新后的配置如下：

```xml
 <dependency>
            <artifactId>elasticsearch-rest-client</artifactId>
            <groupId>org.elasticsearch.client</groupId>
            <version>8.15.5</version>
        </dependency>
```

## <span id="inline-blue">AutoConfiguration</span>

SpringBoot2.7时已经提出使用META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports 代替 spring.factories


https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.7-Release-Notes#changes-to-auto-configuration

## <span id="inline-blue">升级后模块启动报错问题</span>

### <span id="inline-blue">springdoc</span>

```log
java.lang.IllegalStateException: Failed to load ApplicationContext for [WebMergedContextConfiguration@4d065e1a testClass = cofee.controller.CrewMemberControllerTest, locations = [], classes = [cofee.CofeeApplication], contextInitializerClasses = [], activeProfiles = ["junit", "cdsmock"], propertySourceDescriptors = [], propertySourceProperties = ["org.springframework.boot.test.context.SpringBootTestContextBootstrapper=true", "server.port=0"], contextCustomizers = [org.springframework.boot.test.context.filter.ExcludeFilterContextCustomizer@1a245833, org.springframework.boot.test.json.DuplicateJsonObjectContextCustomizerFactory$DuplicateJsonObjectContextCustomizer@5b799640, org.springframework.boot.test.mock.mockito.MockitoContextCustomizer@0, org.springframework.boot.test.web.client.TestRestTemplateContextCustomizer@194fad1, org.springframework.boot.test.web.reactive.server.WebTestClientContextCustomizer@790da477, org.springframework.boot.test.web.reactor.netty.DisableReactorResourceFactoryGlobalResourcesContextCustomizerFactory$DisableReactorResourceFactoryGlobalResourcesContextCustomizerCustomizer@55de24cc, org.springframework.boot.test.autoconfigure.OnFailureConditionReportContextCustomizerFactory$OnFailureConditionReportContextCustomizer@69c81773, org.springframework.boot.test.autoconfigure.actuate.observability.ObservabilityContextCustomizerFactory$DisableObservabilityContextCustomizer@1f, org.springframework.boot.test.autoconfigure.properties.PropertyMappingContextCustomizer@0, org.springframework.boot.test.autoconfigure.web.servlet.WebDriverContextCustomizer@5c86a017, org.springframework.boot.test.context.SpringBootTestAnnotation@6e5c6e5c], resourceBasePath = "src/main/webapp", contextLoader = org.springframework.boot.test.context.SpringBootContextLoader, parent = null]
    at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContext(DefaultCacheAwareContextLoaderDelegate.java:180)
    at org.springframework.test.context.support.DefaultTestContext.getApplicationContext(DefaultTestContext.java:130)
    at org.springframework.test.context.support.DependencyInjectionTestExecutionListener.injectDependencies(DependencyInjectionTestExecutionListener.java:142)
    at org.springframework.test.context.support.DependencyInjectionTestExecutionListener.prepareTestInstance(DependencyInjectionTestExecutionListener.java:98)
    at org.springframework.test.context.TestContextManager.prepareTestInstance(TestContextManager.java:260)
    at org.springframework.test.context.junit.jupiter.SpringExtension.postProcessTestInstance(SpringExtension.java:163)
    at java.base/java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:197)
    at java.base/java.util.stream.ReferencePipeline$2$1.accept(ReferencePipeline.java:179)
    at java.base/java.util.ArrayList$ArrayListSpliterator.forEachRemaining(ArrayList.java:1708)
    at java.base/java.util.stream.AbstractPipeline.copyInto(AbstractPipeline.java:509)
    at java.base/java.util.stream.AbstractPipeline.wrapAndCopyInto(AbstractPipeline.java:499)
    at java.base/java.util.stream.StreamSpliterators$WrappingSpliterator.forEachRemaining(StreamSpliterators.java:310)
    at java.base/java.util.stream.Streams$ConcatSpliterator.forEachRemaining(Streams.java:735)
    at java.base/java.util.stream.Streams$ConcatSpliterator.forEachRemaining(Streams.java:734)
    at java.base/java.util.stream.ReferencePipeline$Head.forEach(ReferencePipeline.java:762)
    at java.base/java.util.Optional.orElseGet(Optional.java:364)
    at java.base/java.util.ArrayList.forEach(ArrayList.java:1596)
    at java.base/java.util.ArrayList.forEach(ArrayList.java:1596)
Caused by: java.lang.IllegalStateException: Error processing condition on org.springdoc.webmvc.ui.SwaggerConfig.springWebProvider
    at org.springframework.boot.autoconfigure.condition.SpringBootCondition.matches(SpringBootCondition.java:60)
    at org.springframework.context.annotation.ConditionEvaluator.shouldSkip(ConditionEvaluator.java:108)
    at org.springframework.context.annotation.ConfigurationClassBeanDefinitionReader.loadBeanDefinitionsForBeanMethod(ConfigurationClassBeanDefinitionReader.java:183)
    at org.springframework.context.annotation.ConfigurationClassBeanDefinitionReader.loadBeanDefinitionsForConfigurationClass(ConfigurationClassBeanDefinitionReader.java:144)
    at org.springframework.context.annotation.ConfigurationClassBeanDefinitionReader.loadBeanDefinitions(ConfigurationClassBeanDefinitionReader.java:120)
    at org.springframework.context.annotation.ConfigurationClassPostProcessor.processConfigBeanDefinitions(ConfigurationClassPostProcessor.java:429)
    at org.springframework.context.annotation.ConfigurationClassPostProcessor.postProcessBeanDefinitionRegistry(ConfigurationClassPostProcessor.java:290)
    at org.springframework.context.support.PostProcessorRegistrationDelegate.invokeBeanDefinitionRegistryPostProcessors(PostProcessorRegistrationDelegate.java:349)
    at org.springframework.context.support.PostProcessorRegistrationDelegate.invokeBeanFactoryPostProcessors(PostProcessorRegistrationDelegate.java:118)
    at org.springframework.context.support.AbstractApplicationContext.invokeBeanFactoryPostProcessors(AbstractApplicationContext.java:789)
    at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:607)
    at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.refresh(ServletWebServerApplicationContext.java:146)
    at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:754)
    at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:456)
    at org.springframework.boot.SpringApplication.run(SpringApplication.java:335)
    at org.springframework.boot.test.context.SpringBootContextLoader.lambda$loadContext$3(SpringBootContextLoader.java:137)
    at org.springframework.util.function.ThrowingSupplier.get(ThrowingSupplier.java:58)
    at org.springframework.util.function.ThrowingSupplier.get(ThrowingSupplier.java:46)
    at org.springframework.boot.SpringApplication.withHook(SpringApplication.java:1463)
    at org.springframework.boot.test.context.SpringBootContextLoader$ContextLoaderHook.run(SpringBootContextLoader.java:553)
    at org.springframework.boot.test.context.SpringBootContextLoader.loadContext(SpringBootContextLoader.java:137)
    at org.springframework.boot.test.context.SpringBootContextLoader.loadContext(SpringBootContextLoader.java:108)
    at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContextInternal(DefaultCacheAwareContextLoaderDelegate.java:225)
    at org.springframework.test.context.cache.DefaultCacheAwareContextLoaderDelegate.loadContext(DefaultCacheAwareContextLoaderDelegate.java:152)
    ... 17 more
Caused by: java.lang.IllegalStateException: Failed to introspect Class [org.springdoc.webmvc.ui.SwaggerConfig] from ClassLoader [jdk.internal.loader.ClassLoaders$AppClassLoader@639fee48]
    at org.springframework.util.ReflectionUtils.getDeclaredMethods(ReflectionUtils.java:483)
    at org.springframework.util.ReflectionUtils.doWithMethods(ReflectionUtils.java:360)
    at org.springframework.util.ReflectionUtils.getUniqueDeclaredMethods(ReflectionUtils.java:417)
    at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.lambda$getTypeForFactoryMethod$1(AbstractAutowireCapableBeanFactory.java:750)
    at java.base/java.util.concurrent.ConcurrentHashMap.computeIfAbsent(ConcurrentHashMap.java:1708)
    at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.getTypeForFactoryMethod(AbstractAutowireCapableBeanFactory.java:749)
    at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.determineTargetType(AbstractAutowireCapableBeanFactory.java:682)
    at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.predictBeanType(AbstractAutowireCapableBeanFactory.java:653)
    at org.springframework.beans.factory.support.AbstractBeanFactory.isFactoryBean(AbstractBeanFactory.java:1687)
    at org.springframework.beans.factory.support.DefaultListableBeanFactory.doGetBeanNamesForType(DefaultListableBeanFactory.java:562)
    at org.springframework.beans.factory.support.DefaultListableBeanFactory.getBeanNamesForType(DefaultListableBeanFactory.java:534)
    at org.springframework.boot.autoconfigure.condition.OnBeanCondition.collectBeanNamesForType(OnBeanCondition.java:247)
    at org.springframework.boot.autoconfigure.condition.OnBeanCondition.getBeanNamesForType(OnBeanCondition.java:240)
    at org.springframework.boot.autoconfigure.condition.OnBeanCondition.getBeanNamesForType(OnBeanCondition.java:230)
    at org.springframework.boot.autoconfigure.condition.OnBeanCondition.getMatchingBeans(OnBeanCondition.java:183)
    at org.springframework.boot.autoconfigure.condition.OnBeanCondition.getMatchOutcome(OnBeanCondition.java:158)
    at org.springframework.boot.autoconfigure.condition.SpringBootCondition.matches(SpringBootCondition.java:47)
    ... 40 more
Caused by: java.lang.NoClassDefFoundError: org/springframework/web/servlet/resource/LiteWebJarsResourceResolver
    at java.base/java.lang.ClassLoader.defineClass1(Native Method)
    at java.base/java.lang.ClassLoader.defineClass(ClassLoader.java:1027)
    at java.base/java.security.SecureClassLoader.defineClass(SecureClassLoader.java:150)
    at java.base/jdk.internal.loader.BuiltinClassLoader.defineClass(BuiltinClassLoader.java:862)
    at java.base/jdk.internal.loader.BuiltinClassLoader.findClassOnClassPathOrNull(BuiltinClassLoader.java:760)
    at java.base/jdk.internal.loader.BuiltinClassLoader.loadClassOrNull(BuiltinClassLoader.java:681)
    at java.base/jdk.internal.loader.BuiltinClassLoader.loadClass(BuiltinClassLoader.java:639)
    at java.base/jdk.internal.loader.ClassLoaders$AppClassLoader.loadClass(ClassLoaders.java:188)
    at java.base/java.lang.ClassLoader.loadClass(ClassLoader.java:526)
    at java.base/java.lang.Class.getDeclaredMethods0(Native Method)
    at java.base/java.lang.Class.privateGetDeclaredMethods(Class.java:3578)
    at java.base/java.lang.Class.getDeclaredMethods(Class.java:2676)
    at org.springframework.util.ReflectionUtils.getDeclaredMethods(ReflectionUtils.java:465)
    ... 56 more
Caused by: java.lang.ClassNotFoundException: org.springframework.web.servlet.resource.LiteWebJarsResourceResolver
    at java.base/jdk.internal.loader.BuiltinClassLoader.loadClass(BuiltinClassLoader.java:641)
    at java.base/jdk.internal.loader.ClassLoaders$AppClassLoader.loadClass(ClassLoaders.java:188)
    at java.base/java.lang.ClassLoader.loadClass(ClassLoader.java:526)
    ... 69 more
```

问题原因是spring版本升级到6.2.1之后对应的springdoc版本也要进行升级，否则不兼容，以下是版本对应：

![springdoc兼容问题](/images/SpringBoot/20250228/SpringBoot_20250228_005.png)

### <span id="inline-blue">zipkin启动报错</span>

```log
Caused by: java.lang.NoClassDefFoundError: zipkin2/codec/BytesEncoder
	at java.base/java.lang.Class.getDeclaredMethods0(Native Method)
	at java.base/java.lang.Class.privateGetDeclaredMethods(Class.java:3578)
	at java.base/java.lang.Class.getDeclaredMethods(Class.java:2676)
	at org.springframework.util.ReflectionUtils.getDeclaredMethods(ReflectionUtils.java:465)
	... 37 more
Caused by: java.lang.ClassNotFoundException: zipkin2.codec.BytesEncoder
	at java.base/java.net.URLClassLoader.findClass(URLClassLoader.java:445)
	at java.base/java.lang.ClassLoader.loadClass(ClassLoader.java:593)
	at org.springframework.boot.loader.net.protocol.jar.JarUrlClassLoader.loadClass(JarUrlClassLoader.java:104)
	at org.springframework.boot.loader.launch.LaunchedClassLoader.loadClass(LaunchedClassLoader.java:91)
	at java.base/java.lang.ClassLoader.loadClass(ClassLoader.java:526)
	... 41 more
```

问题原因是SpringCloud放弃了sleuth，转而使用zipkin+opentracing实现链路追踪，zipkin-reporter-brave依赖的版本需要升级到3.4.3

```xml
<properties>
<micrometer-tracing.version>1.4.1</micrometer-tracing.version>
<micrometer-observation.version>1.14.2</micrometer-observation.version>
<feign-micrometer.version>13.5</feign-micrometer.version>
<zipkin-reporter-brave.version>3.4.3</zipkin-reporter-brave.version>
</properties>

<!--micrometer-tracing-bom导入链路追踪版本中心  -->
        <dependency>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-tracing-bom</artifactId>
            <version>${micrometer-tracing.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <!--micrometer-tracing指标追踪  -->
        <dependency>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-tracing</artifactId>
            <version>${micrometer-tracing.version}</version>
        </dependency>
        <!--micrometer-tracing-bridge-brave适配zipkin的桥接包 -->
        <dependency>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-tracing-bridge-brave</artifactId>
            <version>${micrometer-tracing.version}</version>
        </dependency>
        <!--micrometer-observation -->
        <dependency>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-observation</artifactId>
            <version>${micrometer-observation.version}</version>
        </dependency>
        <!--feign-micrometer -->
        <dependency>
            <groupId>io.github.openfeign</groupId>
            <artifactId>feign-micrometer</artifactId>
            <version>${feign-micrometer.version}</version>
        </dependency>
        <!--zipkin-reporter-brave -->
        <dependency>
            <groupId>io.zipkin.reporter2</groupId>
            <artifactId>zipkin-reporter-brave</artifactId>
            <version>${zipkin-reporter-brave.version}</version>
        </dependency>
```

### <span id="inline-blue">nacos配置文件动态刷新失败</span>

```log
java.lang.IllegalArgumentException: ExistingValue must be an instance of com.zaxxer.hikari.HikariDataSource
	at org.springframework.util.Assert.isTrue(Assert.java:139) ~[spring-core-5.3.14.jar:5.3.14]
	at org.springframework.boot.context.properties.bind.Bindable.withExistingValue(Bindable.java:182) ~[spring-boot-2.6.2.jar:2.6.2]
	at org.springframework.boot.context.properties.ConfigurationPropertiesBean.create(ConfigurationPropertiesBean.java:268) ~[spring-boot-2.6.2.jar:2.6.2]
	at org.springframework.boot.context.properties.ConfigurationPropertiesBean.get(ConfigurationPropertiesBean.java:201) ~[spring-boot-2.6.2.jar:2.6.2]
	at org.springframework.boot.context.properties.ConfigurationPropertiesBindingPostProcessor.postProcessBeforeInitialization(ConfigurationPropertiesBindingPostProcessor.java:78) ~[spring-boot-2.6.2.jar:2.6.2]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.applyBeanPostProcessorsBeforeInitialization(AbstractAutowireCapableBeanFactory.java:440) ~[spring-beans-5.3.14.jar:5.3.14]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1796) ~[spring-beans-5.3.14.jar:5.3.14]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:431) ~[spring-beans-5.3.14.jar:5.3.14]
	at org.springframework.cloud.context.properties.ConfigurationPropertiesRebinder.rebind(ConfigurationPropertiesRebinder.java:105) ~[spring-cloud-context-3.1.0.jar:3.1.0]
	at org.springframework.cloud.context.properties.ConfigurationPropertiesRebinder.rebind(ConfigurationPropertiesRebinder.java:83) ~[spring-cloud-context-3.1.0.jar:3.1.0]
	at org.springframework.cloud.context.properties.ConfigurationPropertiesRebinder.onApplicationEvent(ConfigurationPropertiesRebinder.java:138) ~[spring-cloud-context-3.1.0.jar:3.1.0]
	at org.springframework.cloud.context.properties.ConfigurationPropertiesRebinder.onApplicationEvent(ConfigurationPropertiesRebinder.java:51) ~[spring-cloud-context-3.1.0.jar:3.1.0]
	at org.springframework.context.event.SimpleApplicationEventMulticaster.doInvokeListener(SimpleApplicationEventMulticaster.java:176) ~[spring-context-5.3.14.jar:5.3.14]
	at org.springframework.context.event.SimpleApplicationEventMulticaster.invokeListener(SimpleApplicationEventMulticaster.java:169) ~[spring-context-5.3.14.jar:5.3.14]
	at org.springframework.context.event.SimpleApplicationEventMulticaster.multicastEvent(SimpleApplicationEventMulticaster.java:143) ~[spring-context-5.3.14.jar:5.3.14]
	at org.springframework.context.support.AbstractApplicationContext.publishEvent(AbstractApplicationContext.java:421) ~[spring-context-5.3.14.jar:5.3.14]
	at org.springframework.context.support.AbstractApplicationContext.publishEvent(AbstractApplicationContext.java:378) ~[spring-context-5.3.14.jar:5.3.14]
	at org.springframework.cloud.context.environment.EnvironmentManager.publish(EnvironmentManager.java:104) ~[spring-cloud-context-3.1.0.jar:3.1.0]
	at org.springframework.cloud.context.environment.EnvironmentManager.setProperty(EnvironmentManager.java:92) ~[spring-cloud-context-3.1.0.jar:3.1.0]
	at org.springframework.cloud.context.environment.WritableEnvironmentEndpointWebExtension.write(WritableEnvironmentEndpointWebExtension.java:47) ~[spring-cloud-context-3.1.0.jar:3.1.0]
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[na:na]
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:77) ~[na:na]
	at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43) ~[na:na]
	at java.base/java.lang.reflect.Method.invoke(Method.java:568) ~[na:na]
	at org.springframework.util.ReflectionUtils.invokeMethod(ReflectionUtils.java:282) ~[spring-core-5.3.14.jar:5.3.14]
	at org.springframework.boot.actuate.endpoint.invoke.reflect.ReflectiveOperationInvoker.invoke(ReflectiveOperationInvoker.java:74) ~[spring-boot-actuator-2.6.2.jar:2.6.2]
	at org.springframework.boot.actuate.endpoint.annotation.AbstractDiscoveredOperation.invoke(AbstractDiscoveredOperation.java:60) ~[spring-boot-actuator-2.6.2.jar:2.6.2]
	at org.springframework.boot.actuate.endpoint.web.servlet.AbstractWebMvcEndpointHandlerMapping$ServletWebOperationAdapter.handle(AbstractWebMvcEndpointHandlerMapping.java:336) ~[spring-boot-actuator-2.6.2.jar:2.6.2]
	at org.springframework.boot.actuate.endpoint.web.servlet.AbstractWebMvcEndpointHandlerMapping$OperationHandler.handle(AbstractWebMvcEndpointHandlerMapping.java:421) ~[spring-boot-actuator-2.6.2.jar:2.6.2]
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method) ~[na:na]
	at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:77) ~[na:na]
	at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43) ~[na:na]
	at java.base/java.lang.reflect.Method.invoke(Method.java:568) ~[na:na]
	at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:205) ~[spring-web-5.3.14.jar:5.3.14]
	at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:150) ~[spring-web-5.3.14.jar:5.3.14]
	at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:117) ~[spring-webmvc-5.3.14.jar:5.3.14]
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:895) ~[spring-webmvc-5.3.14.jar:5.3.14]
	at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:808) ~[spring-webmvc-5.3.14.jar:5.3.14]
	at org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter.handle(AbstractHandlerMethodAdapter.java:87) ~[spring-webmvc-5.3.14.jar:5.3.14]
	at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1067) ~[spring-webmvc-5.3.14.jar:5.3.14]
	at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:963) ~[spring-webmvc-5.3.14.jar:5.3.14]
	at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1006) ~[spring-webmvc-5.3.14.jar:5.3.14]
	at org.springframework.web.servlet.FrameworkServlet.doPost(FrameworkServlet.java:909) ~[spring-webmvc-5.3.14.jar:5.3.14]
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:681) ~[tomcat-embed-core-9.0.56.jar:4.0.FR]
	at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:883) ~[spring-webmvc-5.3.14.jar:5.3.14]
	at javax.servlet.http.HttpServlet.service(HttpServlet.java:764) ~[tomcat-embed-core-9.0.56.jar:4.0.FR]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:227) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:53) ~[tomcat-embed-websocket-9.0.56.jar:9.0.56]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:189) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-5.3.14.jar:5.3.14]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:117) ~[spring-web-5.3.14.jar:5.3.14]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:189) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93) ~[spring-web-5.3.14.jar:5.3.14]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:117) ~[spring-web-5.3.14.jar:5.3.14]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:189) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.springframework.cloud.sleuth.instrument.web.servlet.TracingFilter.doFilter(TracingFilter.java:68) ~[spring-cloud-sleuth-instrumentation-3.1.0.jar:3.1.0]
	at org.springframework.cloud.sleuth.autoconfig.instrument.web.TraceWebServletConfiguration$LazyTracingFilter.doFilter(TraceWebServletConfiguration.java:129) ~[spring-cloud-sleuth-autoconfigure-3.1.0.jar:3.1.0]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:189) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.springframework.boot.actuate.metrics.web.servlet.WebMvcMetricsFilter.doFilterInternal(WebMvcMetricsFilter.java:96) ~[spring-boot-actuator-2.6.2.jar:2.6.2]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:117) ~[spring-web-5.3.14.jar:5.3.14]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:189) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-5.3.14.jar:5.3.14]
	at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:117) ~[spring-web-5.3.14.jar:5.3.14]
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:189) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:162) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:197) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:97) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:540) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:135) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:92) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:78) ~[tomcat-embed-core-9.0.56.jar:9.0.56]
	at org.springframework.cloud.sleuth.instrument.web.tomcat.TraceValve.invoke(TraceValve.java:74) ~[spring-cloud-sleuth-instrumentation-3.1.0.jar:3.1.0]
```

问题原因是因为模块添加了SQL监控组件依赖p6spy,对数据源HikariDataSource进行了封装，导致配置刷新的时候HikariDataSource类和初始加载不一致，导致异常，去掉对应的依赖即可
另外如果使用sleuth也有可能存在同样的问题。

```xml
      <dependency>
        <groupId>com.github.gavlyukovskiy</groupId>
        <artifactId>p6spy-spring-boot-starter</artifactId>
        <version>${p6spy.version}</version>
      </dependency>
```

### <span id="inline-blue">logback加载报错</span>

报错信息：
```log
Exception in thread "main" java.lang.IllegalStateException: java.lang.IllegalStateException: Logback configuration error detected: 
ERROR in ch.qos.logback.core.model.processor.ImplicitModelHandler - Could not create component [timeBasedFileNamingAndTriggeringPolicy] of type [ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP] java.lang.ClassNotFoundException: ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP
ERROR in c.q.l.core.rolling.DefaultTimeBasedFileNamingAndTriggeringPolicy - Filename pattern [/logs/app/%d{yyyy-MM-dd}.%i.log] contains an integer token converter, i.e. %i, INCOMPATIBLE with this configuration. Remove it.
```
logback底层已经把这个弃用类TimeBasedRollingPolicy删除了,配置文件修改成如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="10 seconds" >
    <!--日志格式应用spring boot默认的格式，也可以自己更改-->
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>

    <property name="FILE_LOG_PATTERN" value="[%d{yyyy-MM-dd HH:mm:ss.SSS}] [%-5level] [%thread] [%logger{50}] [%M] [%line] - %msg%n"/>

    <springProperty scope="context" name="spring.application.name" source="spring.application.name"/>
	<!--定义日志存放的位置，默认存放在项目启动的相对路径的目录 -->
    <springProperty scope="context" name="LOG_PATH" source="logging.file.path" defaultValue="./logs/${spring.application.name}"/>
	<!--定义日志级别，默认INFO -->
	<springProperty scope="context" name="LOG_LEVEL" source="logging.level.root" defaultValue="INFO"/>

    <!-- 控制台输出 -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${CONSOLE_LOG_PATTERN}</pattern>
            <charset>utf-8</charset>
        </encoder>
    </appender>

    <!-- 日志记录器，日期滚动记录，level为 ERROR 日志 -->
    <appender name="FILE_ERROR" class="ch.qos.logback.core.rolling.RollingFileAppender">

        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>${LOG_PATH}/log_error.log</file>

        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">

            <!-- 归档的日志文件的路径，%d{yyyy-MM-dd}指定日期格式，%i指定索引 -->
            <fileNamePattern>${LOG_PATH}/error/%d{yyyy-MM-dd,aux}/log-error-%d{yyyy-MM-dd}-%i.log</fileNamePattern>
            <!--日志最大的历史7天-->
            <maxHistory>7</maxHistory>
            <!-- 日志文件的最大大小 -->
            <maxFileSize>10MB</maxFileSize>
            <!-- 总日志文件大小不超过3GB -->
            <totalSizeCap>3GB</totalSizeCap>
        </rollingPolicy>

        <!-- 追加方式记录日志 -->
        <append>true</append>

        <!-- 日志文件的格式 -->
        <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
            <pattern>${FILE_LOG_PATTERN}</pattern>
            <charset>utf-8</charset>
        </encoder>

        <!-- 此日志文件只记录error级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>error</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>


    <!-- 日志记录器，日期滚动记录，level为 INFO 日志 -->
    <appender name="FILE_INFO" class="ch.qos.logback.core.rolling.RollingFileAppender">

        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>${LOG_PATH}/log_info.log</file>

        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">

            <!-- 归档的日志文件的路径，%d{yyyy-MM-dd}指定日期格式，%i指定索引 -->
            <fileNamePattern>${LOG_PATH}/info/%d{yyyy-MM-dd,aux}/log-info-%d{yyyy-MM-dd}-%i.log</fileNamePattern>
            <!--日志最大的历史7天-->
            <maxHistory>7</maxHistory>
            <!-- 日志文件的最大大小 -->
            <maxFileSize>10MB</maxFileSize>
            <!-- 总日志文件大小不超过3GB -->
            <totalSizeCap>3GB</totalSizeCap>
        </rollingPolicy>

        <!-- 追加方式记录日志 -->
        <append>true</append>

        <!-- 日志文件的格式 -->
        <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
            <pattern>${FILE_LOG_PATTERN}</pattern>
            <charset>utf-8</charset>
        </encoder>

        <!-- 此日志文件只记录info级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>info</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>


    <!-- 日志记录器，日期滚动记录，level为 WARN 日志 -->
    <appender name="FILE_WARN" class="ch.qos.logback.core.rolling.RollingFileAppender">

        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>${LOG_PATH}/log_warn.log</file>

        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">

            <!-- 归档的日志文件的路径，%d{yyyy-MM-dd}指定日期格式，%i指定索引 -->
            <fileNamePattern>${LOG_PATH}/warn/%d{yyyy-MM-dd,aux}/log-warn-%d{yyyy-MM-dd}-%i.log</fileNamePattern>
            <!--日志最大的历史7天，表示最多保留7天的日志文件-->
            <maxHistory>7</maxHistory>
            <!-- 日志文件的最大大小 -->
            <maxFileSize>10MB</maxFileSize>
            <!-- 总日志文件大小不超过3GB -->
            <totalSizeCap>3GB</totalSizeCap>
        </rollingPolicy>

        <!-- 追加方式记录日志 -->
        <append>true</append>

        <!-- 日志文件的格式 -->
        <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
            <pattern>${FILE_LOG_PATTERN}</pattern>
            <charset>utf-8</charset>
        </encoder>

        <!-- 此日志文件只记录warn级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>warn</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>

    <!-- 日志记录器，日期滚动记录，level为 DEBUG 日志 -->
    <appender name="FILE_DEBUG" class="ch.qos.logback.core.rolling.RollingFileAppender">

        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>${LOG_PATH}/log_debug.log</file>

        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">

            <!-- 归档的日志文件的路径，%d{yyyy-MM-dd}指定日期格式，%i指定索引 -->
            <fileNamePattern>${LOG_PATH}/debug/%d{yyyy-MM-dd,aux}/log-debug-%d{yyyy-MM-dd}-%i.log</fileNamePattern>
            <!--日志最大的历史7天-->
            <maxHistory>7</maxHistory>
            <!-- 日志文件的最大大小 -->
            <maxFileSize>10MB</maxFileSize>
            <!-- 总日志文件大小不超过3GB -->
            <totalSizeCap>3GB</totalSizeCap>
        </rollingPolicy>

        <!-- 追加方式记录日志 -->
        <append>true</append>

        <!-- 日志文件的格式 -->
        <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
            <pattern>${FILE_LOG_PATTERN}</pattern>
            <charset>utf-8</charset>
        </encoder>

        <!-- 此日志文件只记录debug级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>debug</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>


    <!-- 日志记录器，日期滚动记录，所有日志 -->
    <appender name="FILE_ALL" class="ch.qos.logback.core.rolling.RollingFileAppender">

        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>${LOG_PATH}/log_total.log</file>

        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">

            <!-- 归档的日志文件的路径，%d{yyyy-MM-dd}指定日期格式，%i指定索引 -->
            <fileNamePattern>${LOG_PATH}/total/%d{yyyy-MM-dd,aux}/log-total-%d{yyyy-MM-dd}-%i.log</fileNamePattern>
            <!--日志最大的历史7天-->
            <maxHistory>7</maxHistory>
            <!-- 日志文件的最大大小 -->
            <maxFileSize>10MB</maxFileSize>
            <!-- 总日志文件大小不超过3GB -->
            <totalSizeCap>3GB</totalSizeCap>
        </rollingPolicy>

        <!-- 追加方式记录日志 -->
        <append>true</append>

        <!-- 日志文件的格式 -->
        <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
            <pattern>${FILE_LOG_PATTERN}</pattern>
            <charset>utf-8</charset>
        </encoder>
    </appender>


    <!-- 日志记录器，日期滚动记录，level 根据配置动态输出日志 -->
    <appender name="FILE_RELEASE" class="ch.qos.logback.core.rolling.RollingFileAppender">

        <!-- 正在记录的日志文件的路径及文件名 -->
        <file>${LOG_PATH}/log_release.log</file>

        <!-- 日志记录器的滚动策略，按日期，按大小记录 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">

            <!-- 归档的日志文件的路径，%d{yyyy-MM-dd}指定日期格式，%i指定索引 -->
            <fileNamePattern>${LOG_PATH}/release/%d{yyyy-MM-dd,aux}/log-warn-%d{yyyy-MM-dd}-%i.log</fileNamePattern>
            <!--日志最大的历史7天-->
            <maxHistory>7</maxHistory>
            <!-- 日志文件的最大大小 -->
            <maxFileSize>10MB</maxFileSize>
            <!-- 总日志文件大小不超过3GB -->
            <totalSizeCap>3GB</totalSizeCap>
        </rollingPolicy>

        <!-- 追加方式记录日志 -->
        <append>true</append>

        <!-- 日志文件的格式 -->
        <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
            <pattern>${FILE_LOG_PATTERN}</pattern>
            <charset>utf-8</charset>
        </encoder>

        <!-- 此日志文件只记录warn级别的 -->
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>${LOG_LEVEL}</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
    </appender>




    <!--生产环境:输出到文件-->
    <springProfile name="dev">
        <root level="${LOG_LEVEL}">
            <appender-ref ref="STDOUT"/>
            <appender-ref ref="FILE_ERROR"/>
            <appender-ref ref="FILE_INFO"/>
            <appender-ref ref="FILE_WARN"/>
            <appender-ref ref="FILE_DEBUG"/>
            <appender-ref ref="FILE_ALL"/>
        </root>
    </springProfile>

    <!--    取消logback启动日志信息 -->
    <statusListener class="ch.qos.logback.core.status.NopStatusListener" />
    
</configuration>
```

application.yml增加下面的配置：

```yml
logging:
 config: http://${spring.cloud.nacos.config.server-addr}/nacos/v1/cs/configs?group=${spring.cloud.nacos.config.group}&tenant=${spring.cloud.nacos.config.namespace}&username=${spring.cloud.nacos.discovery.username}&password=${spring.cloud.nacos.discovery.password}&dataId=logback-spring.xml
 file:
   path: ./logs/${spring.application.name}
 level:
    root: INFO
```

### <span id="inline-blue">序列化报错</span>

```log
Caused by: com.fasterxml.jackson.databind.JsonMappingException:
Unexpected token (START_OBJECT), expected START_ARRAY:
need JSON Array to contain As.WRAPPER_ARRAY type information for class java.lang.Object
```
原因是因为升级前redis里面存储的数据没有清除，导致反序列化时报错，redis清掉数据再重启就好了。

### <span id="inline-blue">登录报错</span>

错误信息：
```log
[Given that there is no default password encoder configured, each password must have a password encoding prefix. Please either prefix this password with '{noop}' or set a default password encoder in `DelegatingPasswordEncoder`.] 
```
因为升级之后使用的DelegatingPasswordEncoder代理密码加密，需要添加前缀表明加密类型，未升级前的密码都没有密码前缀导致不能正确识别。

解决办法： 

之前的密码加密使用的加密类型是bcrypt,所以只需要更新密码添加对应的前缀即可。

```sql

update sys_user set password = concat('{bcrypt}',password);

```


## <span id="inline-blue">参考</span>

https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide





