---
title: jboss-5.1.0.GA启动报错解决
categories:
	- Linux
	- Jboss
date: 2022-07-06 10:55:20
tags: 
	- Linux
	- Jboss
---
<!-- toc -->

# <span id="inline-blue">现象</span>
```shell
10:13:23,908 INFO  [JMXKernel] Legacy JMX core initialized
10:13:24,590 ERROR [AbstractKernelController] Error installing to Instantiated: name=AttachmentStore state=Described
java.lang.IllegalArgumentException: Wrong arguments. new for target java.lang.reflect.Constructor expected=[java.net.URI] actual=[java.io.
File]	at org.jboss.reflect.plugins.introspection.ReflectionUtils.handleErrors(ReflectionUtils.java:395)
	at org.jboss.reflect.plugins.introspection.ReflectionUtils.newInstance(ReflectionUtils.java:153)
	at org.jboss.reflect.plugins.introspection.ReflectConstructorInfoImpl.newInstance(ReflectConstructorInfoImpl.java:106)
	at org.jboss.joinpoint.plugins.BasicConstructorJoinPoint.dispatch(BasicConstructorJoinPoint.java:80)
	at org.jboss.aop.microcontainer.integration.AOPConstructorJoinpoint.createTarget(AOPConstructorJoinpoint.java:282)
	at org.jboss.aop.microcontainer.integration.AOPConstructorJoinpoint.dispatch(AOPConstructorJoinpoint.java:103)
	at org.jboss.kernel.plugins.dependency.KernelControllerContextAction$JoinpointDispatchWrapper.execute(KernelControllerContextActio
n.java:241)	at org.jboss.kernel.plugins.dependency.ExecutionWrapper.execute(ExecutionWrapper.java:47)
	at org.jboss.kernel.plugins.dependency.KernelControllerContextAction.dispatchExecutionWrapper(KernelControllerContextAction.java:1
09)	at org.jboss.kernel.plugins.dependency.KernelControllerContextAction.dispatchJoinPoint(KernelControllerContextAction.java:70)
	at org.jboss.kernel.plugins.dependency.InstantiateAction.installActionInternal(InstantiateAction.java:66)
	at org.jboss.kernel.plugins.dependency.InstallsAwareAction.installAction(InstallsAwareAction.java:54)
	at org.jboss.kernel.plugins.dependency.InstallsAwareAction.installAction(InstallsAwareAction.java:42)
	at org.jboss.dependency.plugins.action.SimpleControllerContextAction.simpleInstallAction(SimpleControllerContextAction.java:62)
	at org.jboss.dependency.plugins.action.AccessControllerContextAction.install(AccessControllerContextAction.java:71)
	at org.jboss.dependency.plugins.AbstractControllerContextActions.install(AbstractControllerContextActions.java:51)
	at org.jboss.dependency.plugins.AbstractControllerContext.install(AbstractControllerContext.java:348)
	at org.jboss.dependency.plugins.AbstractController.install(AbstractController.java:1631)
	at org.jboss.dependency.plugins.AbstractController.incrementState(AbstractController.java:934)
	at org.jboss.dependency.plugins.AbstractController.resolveContexts(AbstractController.java:1082)
	at org.jboss.dependency.plugins.AbstractController.resolveContexts(AbstractController.java:984)
	at org.jboss.dependency.plugins.AbstractController.install(AbstractController.java:774)
	at org.jboss.dependency.plugins.AbstractController.install(AbstractController.java:540)
	at org.jboss.kernel.plugins.deployment.AbstractKernelDeployer.deployBean(AbstractKernelDeployer.java:319)
	at org.jboss.kernel.plugins.deployment.AbstractKernelDeployer.deployBeans(AbstractKernelDeployer.java:297)
	at org.jboss.kernel.plugins.deployment.AbstractKernelDeployer.deploy(AbstractKernelDeployer.java:130)
	at org.jboss.kernel.plugins.deployment.BasicKernelDeployer.deploy(BasicKernelDeployer.java:76)
	at org.jboss.bootstrap.microcontainer.TempBasicXMLDeployer.deploy(TempBasicXMLDeployer.java:91)
	at org.jboss.bootstrap.microcontainer.TempBasicXMLDeployer.deploy(TempBasicXMLDeployer.java:161)
	at org.jboss.bootstrap.microcontainer.ServerImpl.doStart(ServerImpl.java:138)
	at org.jboss.bootstrap.AbstractServerImpl.start(AbstractServerImpl.java:450)
	at org.jboss.Main.boot(Main.java:221)
	at org.jboss.Main$1.run(Main.java:556)
	at java.lang.Thread.run(Thread.java:748)
Failed to boot JBoss:
java.lang.IllegalStateException: Incompletely deployed:

```










# <span id="inline-blue">解决方案</span>
修改以下文件对应节点内容：/usr/local/GRM/jboss-5.1.0.GA/server/default/conf/bootstrap/profile.xml
修改前：
```shell
<!-- The attachment store -->
        <bean name="AttachmentStore" class="org.jboss.system.server.profileservice.repository.AbstractAttachmentStore">
                <constructor><parameter><inject bean="BootstrapProfileFactory" property="attachmentStoreRoot" /></parameter></constructor>
                <property name="mainDeployer"><inject bean="MainDeployer" /></property>
                <property name="serializer"><inject bean="AttachmentsSerializer" /></property>
                <property name="persistenceFactory"><inject bean="PersistenceFactory" /></property>
        </bean>

```

修改后：
```shell
<!-- The attachment store -->
        <bean name="AttachmentStore" class="org.jboss.system.server.profileservice.repository.AbstractAttachmentStore">
                <constructor><parameter class="java.io.File"><inject bean="BootstrapProfileFactory" property="attachmentStoreRoot" /></parameter></constructor>
                <property name="mainDeployer"><inject bean="MainDeployer" /></property>
                <property name="serializer"><inject bean="AttachmentsSerializer" /></property>
                <property name="persistenceFactory"><inject bean="PersistenceFactory" /></property>
        </bean>

```
