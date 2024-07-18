---
title: maven项目打包将依赖移动至外部lib目录
categories:
	- Java
tags: 
	- Java
	
date: 2023-08-11 14:56:20
updated: 2023-08-11 14:56:20
---
<!-- toc -->
# <span id="inline-blue">背景</span>
项目编译打成jar包后，依赖的lib被以源代码形式添加进了源码包目录，导致项目真实的源码目录和依赖混淆，希望能够将项目源码和依赖jar包区分开来，剔除多余的配置文件信息
# <span id="inline-blue">实现</span>
maven项目打包只保存项目的classpath信息，jar包内部MANNIFEST.MF文件信息如下：
```shell
Manifest-Version: 1.0
Archiver-Version: Plexus Archiver
Built-By: 909754
Class-Path: lib/aopalliance-1.0.jar lib/asm-5.2.jar lib/asm-tree-5.2.j
 ar lib/aspectjrt-1.6.9.jar lib/aspectjweaver-1.6.9.jar lib/c3p0-0.9.1
 .2.jar lib/cas-client-core-3.5.0.jar lib/slf4j-api-1.7.1.jar lib/cgli
 b-3.2.5.jar lib/ant-1.9.6.jar lib/ant-launcher-1.9.6.jar lib/commons-
 beanutils-1.8.3.jar lib/commons-codec-1.10.jar lib/commons-collection
 s-3.2.2.jar lib/commons-logging-1.2.jar lib/commons-net-3.5.jar lib/c
 ommons-pool2-2.4.3.jar lib/druid-1.0.8.jar lib/ehcache-2.10.1.jar lib
 /elastic-job-core-1.0.6.jar lib/lombok-1.16.4.jar lib/curator-framewo
 rk-2.10.0.jar lib/curator-client-2.10.0.jar lib/zookeeper-3.4.6.jar l
 ib/jline-0.9.94.jar lib/netty-3.7.0.Final.jar lib/curator-recipes-2.1
 0.0.jar lib/curator-test-2.10.0.jar lib/javassist-3.18.1-GA.jar lib/c
 ommons-math-2.2.jar lib/ezmorph-1.0.3.jar lib/ganymed-ssh2-build210.j
 ar lib/groovy-2.4.5.jar lib/gson-2.8.5.jar lib/guava-19.0.jar lib/hib
 ernate-jpa-2.1-api-1.0.0.Final.jar lib/javax.inject-1.jar lib/jcl-ove
 r-slf4j-1.7.7.jar lib/jdom-1.0.jar lib/jedis-2.9.1.jar lib/joda-time-
 2.9.9.jar lib/json-lib-2.1.jar lib/jsoup-1.11.1.jar lib/jstl-1.2.jar 
 lib/jta-1.1.jar lib/jzlib-1.0.7.jar lib/metrics-core-3.1.0.jar lib/mo
 ngo-java-driver-3.3.0.jar lib/mybatis-3.1.1.jar lib/mybatis-spring-1.
 1.1.jar lib/spring-core-3.1.1.RELEASE.jar lib/spring-tx-3.1.1.RELEASE
 .jar lib/mysql-connector-java-5.1.39.jar lib/ognl-3.0.1.jar lib/javas
 sist-3.11.0.GA.jar lib/ojdbc6-11.2.0.4.jar lib/ucp-11.2.0.4.jar lib/o
 raclepki-11.2.0.4.jar lib/osdt_cert-11.2.0.4.jar lib/osdt_core-11.2.0
 .4.jar lib/simplefan-11.2.0.4.jar lib/ons-11.2.0.4.jar lib/oro-2.0.8.
 jar lib/quartz-2.2.1.jar lib/rome-1.7.1.jar lib/rome-utils-1.7.1.jar 
 lib/jdom2-2.0.6.jar lib/xmemcached-1.4.2.jar lib/velocity-1.7.jar lib
 /pinyin4j-2.5.0.jar lib/spring-context-5.3.20.jar lib/spring-aop-5.3.
 20.jar lib/spring-beans-5.3.20.jar lib/spring-expression-5.3.20.jar l
 ib/spring-webmvc-5.3.20.jar lib/spring-web-5.3.20.jar lib/spring-jdbc
 -5.3.20.jar lib/spring-data-mongodb-1.9.10.RELEASE.jar lib/spring-dat
 a-mongodb-cross-store-1.9.10.RELEASE.jar lib/spring-aspects-4.2.9.REL
 EASE.jar lib/spring-orm-4.2.9.RELEASE.jar lib/spring-data-commons-1.1
 2.10.RELEASE.jar lib/commons-io-2.5.jar lib/commons-lang3-3.4.jar lib
 /jackson-annotations-2.8.8.jar lib/jackson-core-2.8.8.jar lib/jackson
 -databind-2.8.8.1.jar lib/Java-WebSocket-1.3.0.jar lib/slf4j-log4j12-
 1.7.2.jar lib/log4j-1.2.17.jar lib/poi-3.9.jar lib/poi-ooxml-3.9.jar 
 lib/poi-ooxml-schemas-3.9.jar lib/xmlbeans-2.5.0.jar lib/stax-api-1.0
 .1.jar lib/dom4j-1.6.1.jar lib/xml-apis-1.0.b2.jar lib/commons-fileup
 load-1.2.2.jar lib/commons-configuration-1.8.jar lib/commons-lang-2.5
 .jar lib/commons-collections4-4.1.jar lib/sdp-cbb-license-V300R002B01
 .jar lib/hutool-core-5.6.5.jar
Created-By: Apache Maven 3.5.4
Build-Jdk: 1.8.0_333
Main-Class: com.coship.estool.EsToolMain
```
只记录了应用的启动类com.coship.estool.EsToolMain及jar包依赖所在位置信息
maven打包插件配置如下：
```xml
<plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-jar-plugin</artifactId>
        <configuration>
          <archive>
            <manifest>
			  <!-- 添加依赖信息 -->
              <addClasspath>true</addClasspath>
			  <!-- 设置依赖所在目录 -->
              <classpathPrefix>lib/</classpathPrefix>
			  <!-- 启动类所在位置 -->
              <mainClass>com.coship.estool.EsToolMain</mainClass>
            </manifest>
          </archive>
        </configuration>
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-dependency-plugin</artifactId>
        <executions>
          <execution>
            <id>copy-dependencies</id>
            <phase>prepare-package</phase>
            <goals>
              <goal>copy-dependencies</goal>
            </goals>
            <configuration>
			  <!-- 打包后将依赖的jar包拷贝至target/lib目录 -->
              <outputDirectory>${project.build.directory}/lib</outputDirectory>
              <overWriteReleases>false</overWriteReleases>
              <overWriteSnapshots>false</overWriteSnapshots>
              <overWriteIfNewer>true</overWriteIfNewer>
            </configuration>
          </execution>
        </executions>
      </plugin>
```