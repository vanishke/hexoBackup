---
title: WildFly请求过滤重写实现
categories:
	- WildFly
tags: 
	- WildFly
	
date: 2023-07-28 17:49:20
updated: 2023-07-28 17:49:20
---
<!-- toc -->
# <span id="inline-blue">背景</span>
WildFly容器部署项目偶现400 Bad request请求，在排查环境没有结果的情况下希望通过记录wildFly的请求，分析请求内容处理这一异常请求。

# <span id="inline-blue">WildFly过滤器实现</span>
初始化maven项目custom-filter
pom.xml文件定义如下：
```shell
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">

    <name>custom-undertow-filter</name>

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.coship.wildfly.undertow.custom.filter</groupId>
    <artifactId>custom-undertow-filter</artifactId>
    <packaging>jar</packaging>

    <version>1.0</version>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <slf4j-version>1.7.12</slf4j-version>
        <undertow-core-version>2.2.16.Final</undertow-core-version>
    </properties>

    <build>
        <!--
            We want to exclude module.xml from the artifact, it does not belong there.
        -->
        <resources>
            <resource>
                <directory>src/main/resources</directory>
                <excludes>
                    <exclude>module.xml</exclude>
                </excludes>
            </resource>
        </resources>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <configuration>
                        <source>1.8</source>
                        <target>1.8</target>
                    </configuration>
                </plugin>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-source-plugin</artifactId>
                    <executions>
                        <execution>
                            <id>attach-sources</id>
                            <phase>package</phase>
                            <goals>
                                <goal>jar</goal>
                            </goals>
                        </execution>
                    </executions>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.slf4j</groupId>
                <artifactId>slf4j-api</artifactId>
                <version>${slf4j-version}</version>
            </dependency>
            <dependency>
                <groupId>org.slf4j</groupId>
                <artifactId>slf4j-log4j12</artifactId>
                <version>${slf4j-version}</version>
                <scope>provided</scope>
            </dependency>
            <dependency>
                <groupId>io.undertow</groupId>
                <artifactId>undertow-core</artifactId>
                <version>${undertow-core-version}</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
        </dependency>
        <dependency>
            <groupId>io.undertow</groupId>
            <artifactId>undertow-core</artifactId>
        </dependency>
        <dependency>
            <groupId>commons-lang</groupId>
            <artifactId>commons-lang</artifactId>
            <version>2.4</version>
        </dependency>
    </dependencies>
</project>
```
项目只包含一个java类RewriteRequestURLHandler,实现如下：
```java
package com.coship.wildfly.undertow.custom.filter;

import io.undertow.server.HttpHandler;
import io.undertow.server.HttpServerExchange;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.commons.lang.StringEscapeUtils;

public class RewriteRequestURLHandler implements HttpHandler {

    private static final Logger log = LoggerFactory.getLogger(RewriteRequestURLHandler.class);

     private HttpHandler next;
    /**
     * Illegal whitespace encoding at the beginning and end of the URL
     */
    private  String escapedCharactersInUrl;

    public  String getEscapedCharactersInUrl() {
        return escapedCharactersInUrl;
    }

    public  void setEscapedCharactersInUrl(String param) {
        this.escapedCharactersInUrl = param;
    }

    public RewriteRequestURLHandler(HttpHandler next) {
        this.next = next;
    }
      @Override
    public void handleRequest(HttpServerExchange exchange) throws Exception {

        String requestURI = exchange.getRequestURI();
        String requestPath = exchange.getRequestPath();
        String relativePath = exchange.getRelativePath();
        log.info("rewrite before: requestURI"+requestURI+",length:"+requestURI.length());
        log.info("rewrite before: requestPath"+requestPath+",length:"+requestPath.length());
        log.info("rewrite before: relativePath"+relativePath+",length:"+relativePath.length());
        if(!isEmpty(escapedCharactersInUrl)){
            String [] escapedCharacters   = escapedCharactersInUrl.split(",");
            for(String escapedCharacter : escapedCharacters){
                if(requestURI.indexOf(escapedCharacter) == 0 || requestURI.lastIndexOf(escapedCharacter) != -1){
                    requestURI = trim(requestURI,escapedCharacter);
                    exchange.setRequestURI(requestURI);
                }
                if(requestPath.indexOf(escapedCharacter) == 0 || requestPath.lastIndexOf(escapedCharacter) != -1){
                    requestPath = trim(requestPath,escapedCharacter);
                    exchange.setRequestPath(requestPath);
                }
                if(relativePath.indexOf(escapedCharacter) == 0 || relativePath.lastIndexOf(escapedCharacter) != -1){
                    relativePath = trim(relativePath,escapedCharacter);
                    exchange.setRelativePath(relativePath);
                }

            }
        }

        log.info("rewrite after: requestURI"+requestURI+",length:"+requestURI.length());
        log.info("rewrite after: requestPath"+requestPath+",length:"+requestPath.length());
        log.info("rewrite after: relativePath"+relativePath+",length:"+relativePath.length());
        next.handleRequest(exchange);
    }

    /**
     * Remove illegal characters that appear at the beginning and end of the request URL
     * @param str
     * @param substr
     * example http://10.9.212.55:28080/GettItemData%20 ->  http://10.9.212.55:28080/GettItemData
     * @return
     */
    public static String trim(String str, String substr){
        boolean beginIndexFlag;
        boolean endIndexFlag;
        do{
            int beginIndex = str.indexOf(substr) == 0 ? substr.length() : 0;
            int endIndex = str.lastIndexOf(substr) + substr.length() == str.length() ? str.lastIndexOf(substr) : str.length();
            str = str.substring(beginIndex, endIndex);
            beginIndexFlag = (str.indexOf(substr) == 0);
            endIndexFlag = (str.lastIndexOf(substr) + substr.length() == str.length());
        } while (beginIndexFlag || endIndexFlag);
        return str;
    }

    /**
     * determine if the string is empty
     * @param str
     * @return
     */
    public static Boolean isEmpty(String str)
    {
        return (str == null || str.isEmpty());
    }
}
```
项目配置文件module.xml如下：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<module xmlns="urn:jboss:module:1.6" name="com.coship.wildfly.undertow.custom.filter">
    <resources>
        <resource-root path="custom-undertow-filter-1.0.jar"/>
    </resources>
    <dependencies>
        <module name="io.undertow.core"/>
        <module name="org.slf4j"/>
    </dependencies>
</module>
```
以上就是自定义过滤器的实现，但是想要让WildFly加载自定义过滤器还需要做一下准备工作。
1、将custom-filter项目通过maven install打包后生成custom-filter-1.0.jar和module.xml文件上传服务器，在WildFly的主目录下module子目录下创建custom-filter项目的包目录,并创建子目录main,上传刚才打包的jar包和module.xml到main目录下
```shell
cd /usr/local/fujian_sdp/wildfly26-portal/modules
mkdir com/coship/wildfly/undertow/custom/filter/main
```
custom-filter项目的包目录：com.coship.wildfly.undertow.custom.filter
WIldFly的module目录：/usr/local/fujian_sdp/wildfly26-portal/modules
如下图所示：
![WildFly过滤器重写](/images/WildFly/WildFly_20230728_001.png)

# <span id="inline-blue">配置undertow子系统</span>
在undertow子系统声明filter,文件所在路径参考：/usr/local/fujian_sdp/wildfly26-portal/standalone/configuration/standalone.xml
```xml
...
<subsystem xmlns="urn:jboss:domain:undertow:3.0">
   ...
   <filters>
      ...
      <filter name="response-time" 
              module="com.novaordis.playground.wildfly.undertow.customfilter:1" 
              class-name="com.novaordis.playground.wildfly.undertow.customfilter.ResponseTimeHandler"/>
    </filters>
</subsystem>
...
```
配置filter额外参数
```xml
 <filter name="..." ...>
         <param name="param1" value="value1">
         ...
     </filter>
```

为明确主机请求声明过滤器引用
```xml
...
<subsystem xmlns="urn:jboss:domain:undertow:3.0">
   <server name="...">
      ...
      <host name="...">
           <location .../>
           ...
           <filter-ref name="response-time"/>
           ...
      </host>
   </server>
   ...
</subsystem>
...
```
