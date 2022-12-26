---
title: Jboss启动加载异常处理
categories:
	- Jboss

date: 2022-08-26 16:01:20
tags: 
	- Linux
	- Jboss
---
<!-- toc -->

# <span id="inline-blue">现象</span>
```shell
2022-08-11 11:01:09,709 INFO  [org.quartz.core.QuartzScheduler] (main) Scheduler DefaultQuartzScheduler_$_NON_CLUSTERED started.
2022-08-11 11:01:09,981 ERROR [org.jboss.kernel.plugins.dependency.AbstractKernelController] (main) Error installing to Start: name=jboss:database=localDB,service=Hypersonic state=Create mode=Manual requiredState=Installed
java.sql.SQLException: error in script file line: 1 Unexpected token: TP in statement [tp]
	at org.hsqldb.jdbc.Util.sqlException(Unknown Source)
	at org.hsqldb.jdbc.jdbcConnection.<init>(Unknown Source)
	at org.hsqldb.jdbcDriver.getConnection(Unknown Source)
	at org.hsqldb.jdbcDriver.connect(Unknown Source)
	at java.sql.DriverManager.getConnection(DriverManager.java:582)
	at java.sql.DriverManager.getConnection(DriverManager.java:185)
	at org.jboss.jdbc.HypersonicDatabase.getConnection(HypersonicDatabase.java:777)
	at org.jboss.jdbc.HypersonicDatabase.startStandaloneDatabase(HypersonicDatabase.java:625)
	at org.jboss.jdbc.HypersonicDatabase.startService(HypersonicDatabase.java:568)
	at org.jboss.system.ServiceMBeanSupport.jbossInternalStart(ServiceMBeanSupport.java:376)
	at org.jboss.system.ServiceMBeanSupport.jbossInternalLifecycle(ServiceMBeanSupport.java:322)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:39)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)
	at java.lang.reflect.Method.invoke(Method.java:597)
	at org.jboss.mx.interceptor.ReflectedDispatcher.invoke(ReflectedDispatcher.java:157)
	at org.jboss.mx.server.Invocation.dispatch(Invocation.java:96)
	at org.jboss.mx.server.Invocation.invoke(Invocation.java:88)
	at org.jboss.mx.server.AbstractMBeanInvoker.invoke(AbstractMBeanInvoker.java:264)
	at org.jboss.mx.server.MBeanServerImpl.invoke(MBeanServerImpl.java:668)
	at org.jboss.system.microcontainer.ServiceProxy.invoke(ServiceProxy.java:189)
	at $Proxy38.start(Unknown Source)
	at org.jboss.system.microcontainer.StartStopLifecycleAction.installAction(StartStopLifecycleAction.java:42)
	at org.jboss.system.microcontainer.StartStopLifecycleAction.installAction(StartStopLifecycleAction.java:37)
	at org.jboss.dependency.plugins.action.SimpleControllerContextAction.simpleInstallAction(SimpleControllerContextAction.java:62)
	at org.jboss.dependency.plugins.action.AccessControllerContextAction.install(AccessControllerContextAction.java:71)
	at org.jboss.dependency.plugins.AbstractControllerContextActions.install(AbstractControllerContextActions.java:51)
	at org.jboss.dependency.plugins.AbstractControllerContext.install(AbstractControllerContext.java:348)
	at org.jboss.system.microcontainer.ServiceControllerContext.install(ServiceControllerContext.java:286)
	at org.jboss.dependency.plugins.AbstractController.install(AbstractController.java:1631)
	at org.jboss.dependency.plugins.AbstractController.incrementState(AbstractController.java:934)
	at org.jboss.dependency.plugins.AbstractController.resolveContexts(AbstractController.java:1082)
	at org.jboss.dependency.plugins.AbstractController.resolveContexts(AbstractController.java:984)
	at org.jboss.dependency.plugins.AbstractController.change(AbstractController.java:822)
	at org.jboss.dependency.plugins.AbstractController.change(AbstractController.java:553)
	at org.jboss.system.ServiceController.doChange(ServiceController.java:688)
	at org.jboss.system.ServiceController.start(ServiceController.java:460)
	at org.jboss.system.deployers.ServiceDeployer.start(ServiceDeployer.java:163)
	at org.jboss.system.deployers.ServiceDeployer.deploy(ServiceDeployer.java:99)
	at org.jboss.system.deployers.ServiceDeployer.deploy(ServiceDeployer.java:46)
	at org.jboss.deployers.spi.deployer.helpers.AbstractSimpleRealDeployer.internalDeploy(AbstractSimpleRealDeployer.java:62)
	at org.jboss.deployers.spi.deployer.helpers.AbstractRealDeployer.deploy(AbstractRealDeployer.java:50)
	at org.jboss.deployers.plugins.deployers.DeployerWrapper.deploy(DeployerWrapper.java:171)
	at org.jboss.deployers.plugins.deployers.DeployersImpl.doDeploy(DeployersImpl.java:1439)
	at org.jboss.deployers.plugins.deployers.DeployersImpl.doInstallParentFirst(DeployersImpl.java:1157)
	at org.jboss.deployers.plugins.deployers.DeployersImpl.doInstallParentFirst(DeployersImpl.java:1178)
	at org.jboss.deployers.plugins.deployers.DeployersImpl.install(DeployersImpl.java:1098)
	at org.jboss.dependency.plugins.AbstractControllerContext.install(AbstractControllerContext.java:348)
	at org.jboss.dependency.plugins.AbstractController.install(AbstractController.java:1631)
	at org.jboss.dependency.plugins.AbstractController.incrementState(AbstractController.java:934)
	at org.jboss.dependency.plugins.AbstractController.resolveContexts(AbstractController.java:1082)
	at org.jboss.dependency.plugins.AbstractController.resolveContexts(AbstractController.java:984)
	at org.jboss.dependency.plugins.AbstractController.change(AbstractController.java:822)
	at org.jboss.dependency.plugins.AbstractController.change(AbstractController.java:553)
	at org.jboss.deployers.plugins.deployers.DeployersImpl.process(DeployersImpl.java:781)
	at org.jboss.deployers.plugins.main.MainDeployerImpl.process(MainDeployerImpl.java:702)
	at org.jboss.system.server.profileservice.repository.MainDeployerAdapter.process(MainDeployerAdapter.java:117)
	at org.jboss.system.server.profileservice.repository.ProfileDeployAction.install(ProfileDeployAction.java:70)
	at org.jboss.system.server.profileservice.repository.AbstractProfileAction.install(AbstractProfileAction.java:53)
	at org.jboss.system.server.profileservice.repository.AbstractProfileService.install(AbstractProfileService.java:361)
	at org.jboss.dependency.plugins.AbstractControllerContext.install(AbstractControllerContext.java:348)
	at org.jboss.dependency.plugins.AbstractController.install(AbstractController.java:1631)
	at org.jboss.dependency.plugins.AbstractController.incrementState(AbstractController.java:934)
	at org.jboss.dependency.plugins.AbstractController.resolveContexts(AbstractController.java:1082)
	at org.jboss.dependency.plugins.AbstractController.resolveContexts(AbstractController.java:984)
	at org.jboss.dependency.plugins.AbstractController.change(AbstractController.java:822)
	at org.jboss.dependency.plugins.AbstractController.change(AbstractController.java:553)
	at org.jboss.system.server.profileservice.repository.AbstractProfileService.activateProfile(AbstractProfileService.java:306)
	at org.jboss.system.server.profileservice.ProfileServiceBootstrap.start(ProfileServiceBootstrap.java:271)
	at org.jboss.bootstrap.AbstractServerImpl.start(AbstractServerImpl.java:461)
	at org.jboss.Main.boot(Main.java:221)
	at org.jboss.Main$1.run(Main.java:556)
	at java.lang.Thread.run(Thread.java:662)
2022-08-11 11:01:09,986 ERROR 
```
# <span id="inline-blue">原因分析</span>
根据报错信息跟踪Jboss默认加载hsqldb数据库信息，查看/usr/local/sdp_trunk/usm/jboss5/server/default/data/hypersonic对应路径数据库文件，发现localDB.script文件内容输出异常。
## 异常内容
```shell
7993&weekday=7&forward=programJson&pageSize=8&curPage=3&checkFavorite=Y jump to：/data/btv_programJson.htm takes time:12ms
2015-11-22 20:21:39,791 [http-0.0.0.0-80-12] [INFO]-[com.coship.epg.action.tv.TvProgramAction exec 107]---TvProgramAction-- start userId=7305766,forward=programJson,channelId=102800
2015-11-22 20:21:39,791 [http-0.0.0.0-80-12] [INFO]-[com.coship.epg.action.tv.TvProgramAction exec 243]---TvProgramAction-- 节目单查询时间weekday=6,startTime:Fri Nov 20 00:00:00 CST 2015----toTime:Sat Nov 21 00:00:00 CST 2015
2015-11-22 20:21:39,792 [http-0.0.0.0-80-12] [INFO]-[com.coship.epg.action.tv.TvProgramAction exec 253]---TvProgramAction-- The number of queries to the program46
2015-11-22 20:21:39,792 [http-0.0.0.0-80-12] [INFO]-[com.coship.epg.action.tv.TvProgramAction exec 286]---TvProgramAction-- after removed the program which does not meet the time conditions,PageInfo pageSize=8,countPage=6
2015-11-22 20:21:39,801 [http-0.0.0.0-80-12] [INFO]-[com.coship.epg.action.tv.TvProgramAction exec 346]-Single-channel video programming background to use the time to take=10ms
2015-11-22 20:21:39,802 [http-0.0.0.0-80-12] [INFO]-[com.coship.epg.action.tv.TvProgramAction exec 356]---TvProgramAction-- end ,forward=programJson
2015-11-22 20:21:39,802 [http-0.0.0.0-80-12] [INFO]-[com.coship.epg.action.BaseAction execute 74]---------------/iPG/T-nsp/TvProgram.do?userId=7305766&channelId=102800&weekday=6&forward=programJson&pageSize=8&curPage=1&checkFavorite=Y jump to：/data/btv_programJson.htm takes time:11ms
2015-11-22 20:21:39,821 [http-0.0.0.0-80-92] [INFO]-[com.coship.ws.client.ClientProxy getAuthorizationProxy 45]-getAuthorizationProxy:userId:6790927aaa:http://10.80.0.80:8080/AAA/AuthorizationService
2015-11-22 20:21:39,824 [http-0.0.0.0-80-92] [INFO]-[com.coship.epg.service.mod.impl.AuthorityServiceImpl productAuthorizationBat 329]-productAuthorizationBat:com.coship.authorize.service.ProductAuthoReq@51040d1e[productId=100008,userId=6790927,__equalsCalc=<null>,__hashCodeCalc=false]
2015-11-22 20:21:39,827 [http-0.0.0.0-80-12] [INFO]-[com.coship.epg.action.mod.CheckBuyAction exec 105]-Authentication sateType 2: userId7435005 catalogResource ID:176964
2015-11-22 20:21:39,827 [http-0.0.0.0-80-12] [INFO]-[com.coship.ws.client.ClientProxy getAuthorizationProxy 45]-getAuthorizationProxy:userId:7435005aaa:http://10.80.0.44:8080/AAA/AuthorizationService
2015-11-22 20:21:39,830 [http-0.0.0.0-80-12] [INFO]-[com.coship.epg.service.mod.impl.AuthorityServiceImpl productAuthorizationBat 329]-productAuthorizationBat:com.coship.authorize.service.ProductAuthoReq@60f9561f[productId=100008,userId=7435005,__equalsCalc=<null>,__hashCodeCalc=false]
2015-11-22 20:21:39,831 [http-0.0.0.0-80-92] [INFO]-[com.coship.epg.service.mod.impl.AuthorityServiceImpl productAuthorizationBat 334]-pro
```
## 正常内容
```hsqldb
CREATE SCHEMA PUBLIC AUTHORIZATION DBA
CREATE MEMORY TABLE JBM_DUAL(DUMMY INTEGER NOT NULL PRIMARY KEY)
CREATE MEMORY TABLE JBM_MSG_REF(MESSAGE_ID BIGINT NOT NULL,CHANNEL_ID BIGINT NOT NULL,TRANSACTION_ID BIGINT,STATE CHAR(1),ORD BIGINT,PAGE_ORD BIGINT,DELIVERY_COUNT INTEGER,SCHED_DELIVERY BIGINT,PRIMARY KEY(MESSAGE_ID,CHANNEL_ID))
CREATE INDEX JBM_MSG_REF_TX ON JBM_MSG_REF(TRANSACTION_ID,STATE)
CREATE MEMORY TABLE JBM_MSG(MESSAGE_ID BIGINT NOT NULL PRIMARY KEY,RELIABLE CHAR(1),EXPIRATION BIGINT,TIMESTAMP BIGINT,PRIORITY TINYINT,TYPE TINYINT,HEADERS LONGVARBINARY,PAYLOAD LONGVARBINARY)
CREATE MEMORY TABLE JBM_TX(NODE_ID INTEGER,TRANSACTION_ID BIGINT NOT NULL PRIMARY KEY,BRANCH_QUAL VARBINARY(254),FORMAT_ID INTEGER,GLOBAL_TXID VARBINARY(254))
CREATE MEMORY TABLE JBM_COUNTER(NAME VARCHAR(255) NOT NULL PRIMARY KEY,NEXT_ID BIGINT)
CREATE MEMORY TABLE JBM_ID_CACHE(NODE_ID INTEGER NOT NULL,CNTR INTEGER NOT NULL,JBM_ID VARCHAR(255),PRIMARY KEY(NODE_ID,CNTR))
CREATE MEMORY TABLE JBM_USER(USER_ID VARCHAR(32) NOT NULL PRIMARY KEY,PASSWD VARCHAR(32) NOT NULL,CLIENTID VARCHAR(128))
CREATE MEMORY TABLE JBM_ROLE(ROLE_ID VARCHAR(32) NOT NULL,USER_ID VARCHAR(32) NOT NULL,PRIMARY KEY(USER_ID,ROLE_ID))
CREATE MEMORY TABLE JBM_POSTOFFICE(POSTOFFICE_NAME VARCHAR(255) NOT NULL,NODE_ID INTEGER NOT NULL,QUEUE_NAME VARCHAR(255) NOT NULL,CONDITION VARCHAR(1023),SELECTOR VARCHAR(1023),CHANNEL_ID BIGINT,CLUSTERED CHAR(1),ALL_NODES CHAR(1),PRIMARY KEY(POSTOFFICE_NAME,NODE_ID,QUEUE_NAME))
CREATE MEMORY TABLE TIMERS(TIMERID VARCHAR(80) NOT NULL,TARGETID VARCHAR(250) NOT NULL,INITIALDATE TIMESTAMP NOT NULL,TIMERINTERVAL BIGINT,INSTANCEPK VARBINARY,INFO VARBINARY,CONSTRAINT TIMERS_PK PRIMARY KEY(TIMERID,TARGETID))
CREATE USER SA PASSWORD ""
GRANT DBA TO SA
SET WRITE_DELAY 10
SET SCHEMA PUBLIC
INSERT INTO JBM_DUAL VALUES(1)
INSERT INTO JBM_COUNTER VALUES('CHANNEL_ID',120)
INSERT INTO JBM_COUNTER VALUES('MESSAGE_ID',49152)
INSERT INTO JBM_USER VALUES('dynsub','dynsub',NULL)
INSERT INTO JBM_USER VALUES('guest','guest',NULL)
INSERT INTO JBM_USER VALUES('j2ee','j2ee',NULL)
INSERT INTO JBM_USER VALUES('john','needle','DurableSubscriberExample')
INSERT INTO JBM_USER VALUES('nobody','nobody',NULL)
INSERT INTO JBM_ROLE VALUES('durpublisher','dynsub')
INSERT INTO JBM_ROLE VALUES('publisher','dynsub')
INSERT INTO JBM_ROLE VALUES('guest','guest')
INSERT INTO JBM_ROLE VALUES('j2ee','guest')
INSERT INTO JBM_ROLE VALUES('john','guest')
INSERT INTO JBM_ROLE VALUES('durpublisher','john')
INSERT INTO JBM_ROLE VALUES('publisher','john')
INSERT INTO JBM_ROLE VALUES('subscriber','john')
INSERT INTO JBM_ROLE VALUES('noacc','nobody')
INSERT INTO JBM_POSTOFFICE VALUES('JMS post office',0,'DLQ','queue.DLQ',NULL,1,'N','N')
INSERT INTO JBM_POSTOFFICE VALUES('JMS post office',0,'ExpiryQueue','queue.ExpiryQueue',NULL,0,'N','N')
```
# <span id="inline-blue">解决方案</span>
cd /usr/local/sdp_trunk/usm/jboss5/server/default/data/hypersonic 拷贝一份正常文件localDB.script，覆盖启动异常文件
重新启动Jboss



