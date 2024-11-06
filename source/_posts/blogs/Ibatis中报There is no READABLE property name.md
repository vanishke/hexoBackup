---
title: Ibatis中报There is no READABLE property name

tags: 
	- JDK
	- Windows
categories: 
	- JDK

date: 2024-10-21 09:34:27	
updated: 2024-10-21 09:34:27
---
# <span id="inline-blue">背景</span> 
项目打包之后部署启动出现报错
```shell
2024-10-18 13:39:00,296 ERROR [org.springframework.web.context.ContextLoader] (ServerService Thread Pool -- 94) Context initialization failed: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'LogDao' defined in class path resource [conf/appContextDaoLog.xml]: Cannot resolve reference to bean 'sqlMapClient' while setting bean property 'sqlMapClient'; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'sqlMapClient' defined in class path resource [conf/appContextDao.xml]: Invocation of init method failed; nested exception is org.springframework.core.NestedIOException: Failed to parse config resource: class path resource [conf/sql-map-config-oracle.xml]; nested exception is com.ibatis.common.xml.NodeletException: Error parsing XML.  Cause: java.lang.RuntimeException: Error parsing XPath '/sqlMapConfig/sqlMap'.  Cause: com.ibatis.common.xml.NodeletException: Error parsing XML.  Cause: java.lang.RuntimeException: Error parsing XPath '/sqlMap/resultMap/result'.  Cause: com.ibatis.common.beans.ProbeException: There is no WRITEABLE property named 'sTBSuggestedPrice' in class 'com.xxx.dhm.core.dao.resource.po.PAsset'
        at org.springframework.beans.factory.support.BeanDefinitionValueResolver.resolveReference(BeanDefinitionValueResolver.java:328)
        at org.springframework.beans.factory.support.BeanDefinitionValueResolver.resolveValueIfNecessary(BeanDefinitionValueResolver.java:106)
        at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.applyPropertyValues(AbstractAutowireCapableBeanFactory.java:1325)
        at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.populateBean(AbstractAutowireCapableBeanFactory.java:1086)
        at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:517)
        at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:456)
        at org.springframework.beans.factory.support.AbstractBeanFactory$1.getObject(AbstractBeanFactory.java:291)
        at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:222)
        at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:288)
        at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:190)
        at org.springframework.beans.factory.support.DefaultListableBeanFactory.preInstantiateSingletons(DefaultListableBeanFactory.java:580)
        at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:895)
        at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:425)
        at org.springframework.web.context.ContextLoader.createWebApplicationContext(ContextLoader.java:276)
        at org.springframework.web.context.ContextLoader.initWebApplicationContext(ContextLoader.java:197)
        at org.springframework.web.context.ContextLoaderListener.contextInitialized(ContextLoaderListener.java:47)
        at com.xxx.dhm.common.uif.system.StartupListener.contextInitialized(StartupListener.java:27)
        at io.undertow.servlet.core.ApplicationListeners.contextInitialized(ApplicationListeners.java:187)
        at io.undertow.servlet.core.DeploymentManagerImpl$1.call(DeploymentManagerImpl.java:219)
        at io.undertow.servlet.core.DeploymentManagerImpl$1.call(DeploymentManagerImpl.java:187)
        at io.undertow.servlet.core.ServletRequestContextThreadSetupAction$1.call(ServletRequestContextThreadSetupAction.java:42)
        at io.undertow.servlet.core.ContextClassLoaderSetupAction$1.call(ContextClassLoaderSetupAction.java:43)
        at org.wildfly.extension.undertow.deployment.UndertowDeploymentInfoService$UndertowThreadSetupAction.lambda$create$0(UndertowDeploymentInfoService.java:1544)
        at org.wildfly.extension.undertow.deployment.UndertowDeploymentInfoService$UndertowThreadSetupAction$$Lambda$982/1450947022.call(Unknown Source)
        at org.wildfly.extension.undertow.deployment.UndertowDeploymentInfoService$UndertowThreadSetupAction.lambda$create$0(UndertowDeploymentInfoService.java:1544)
        at org.wildfly.extension.undertow.deployment.UndertowDeploymentInfoService$UndertowThreadSetupAction$$Lambda$982/1450947022.call(Unknown Source)
        at org.wildfly.extension.undertow.deployment.UndertowDeploymentInfoService$UndertowThreadSetupAction.lambda$create$0(UndertowDeploymentInfoService.java:1544)
        at org.wildfly.extension.undertow.deployment.UndertowDeploymentInfoService$UndertowThreadSetupAction$$Lambda$982/1450947022.call(Unknown Source)
        at org.wildfly.extension.undertow.deployment.UndertowDeploymentInfoService$UndertowThreadSetupAction.lambda$create$0(UndertowDeploymentInfoService.java:1544)
        at org.wildfly.extension.undertow.deployment.UndertowDeploymentInfoService$UndertowThreadSetupAction$$Lambda$982/1450947022.call(Unknown Source)
        at io.undertow.servlet.core.DeploymentManagerImpl.deploy(DeploymentManagerImpl.java:255)
        at org.wildfly.extension.undertow.deployment.UndertowDeploymentService.startContext(UndertowDeploymentService.java:105)
        at org.wildfly.extension.undertow.deployment.UndertowDeploymentService$1.run(UndertowDeploymentService.java:87)
        at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
        at java.util.concurrent.FutureTask.run(FutureTask.java:266)
        at org.jboss.threads.ContextClassLoaderSavingRunnable.run(ContextClassLoaderSavingRunnable.java:35)
        at org.jboss.threads.EnhancedQueueExecutor.safeRun(EnhancedQueueExecutor.java:1990)
        at org.jboss.threads.EnhancedQueueExecutor$ThreadBody.doRunTask(EnhancedQueueExecutor.java:1486)
        at org.jboss.threads.EnhancedQueueExecutor$ThreadBody.run(EnhancedQueueExecutor.java:1377)
        at java.lang.Thread.run(Thread.java:745)
        at org.jboss.threads.JBossThread.run(JBossThread.java:513)
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'sqlMapClient' defined in class path resource [conf/appContextDao.xml]: Invocation of init method failed; nested exception is org.springframework.core.NestedIOException: Failed to parse config resource: class path resource [conf/sql-map-config-oracle.xml]; nested exception is com.ibatis.common.xml.NodeletException: Error parsing XML.  Cause: java.lang.RuntimeException: Error parsing XPath '/sqlMapConfig/sqlMap'.  Cause: com.ibatis.common.xml.NodeletException: Error parsing XML.  Cause: java.lang.RuntimeException: Error parsing XPath '/sqlMap/resultMap/result'.  Cause: com.ibatis.common.beans.ProbeException: There is no WRITEABLE property named 'sTBSuggestedPrice' in class 'com.xxx.dhm.core.dao.resource.po.PAsset'
        at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1420)
        at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:519)
        at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:456)
        at org.springframework.beans.factory.support.AbstractBeanFactory$1.getObject(AbstractBeanFactory.java:291)
        at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:222)
        at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:288)
        at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:190)
        at org.springframework.beans.factory.support.BeanDefinitionValueResolver.resolveReference(BeanDefinitionValueResolver.java:322)
        ... 40 more
Caused by: org.springframework.core.NestedIOException: Failed to parse config resource: class path resource [conf/sql-map-config-oracle.xml]; nested exception is com.ibatis.common.xml.NodeletException: Error parsing XML.  Cause: java.lang.RuntimeException: Error parsing XPath '/sqlMapConfig/sqlMap'.  Cause: com.ibatis.common.xml.NodeletException: Error parsing XML.  Cause: java.lang.RuntimeException: Error parsing XPath '/sqlMap/resultMap/result'.  Cause: com.ibatis.common.beans.ProbeException: There is no WRITEABLE property named 'sTBSuggestedPrice' in class 'com.xxx.dhm.core.dao.resource.po.PAsset'
        at org.springframework.orm.ibatis.SqlMapClientFactoryBean.buildSqlMapClient(SqlMapClientFactoryBean.java:341)
        at org.springframework.orm.ibatis.SqlMapClientFactoryBean.afterPropertiesSet(SqlMapClientFactoryBean.java:291)
        at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.invokeInitMethods(AbstractAutowireCapableBeanFactory.java:1477)
        at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1417)
        ... 47 more
```
# <span id="inline-blue">原因分析</span> 
问题咋一看之下以为是ibatis对应的实体类属性驼峰命名不规范导致，替换过报错对应实体属性对应的get/set方法，启动依然报错，察觉新版本才有这个问题，之前发布的版本也有这个实体类，并且没有做过改动，按道理应该不会报错，有可能是最近做的改动导致的问题，于是通过比对不同版本的pom.xml及发布后WEB-INF/lib目录下的jar包，发下如下差异：
pom.xml差异：
![Ibatis报错](/images/Ibatis/Ibatis_20241021_001.png)
lib目录差异：
![Ibatis报错](/images/Ibatis/Ibatis_20241021_002.png)
![Ibatis报错](/images/Ibatis/Ibatis_20241021_003.png)
最终定位是由于添加了如下依赖导致报错，pom.xml去掉依赖即可。
```shell
		<dependency>
			<groupId>org.springframework</groupId>
			<artifactId>spring-ibatis</artifactId>
		</dependency>
```

