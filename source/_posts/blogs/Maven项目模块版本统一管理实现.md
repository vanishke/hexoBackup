---
title: Maven项目模块版本统一管理实现
categories:
	- Maven
tags: 
	- Maven
	- Flatten-maven-plugin
	
date: 2024-09-23 14:30:03
updated: 2024-09-23 14:30:03
---
<!-- toc -->

# <span id="inline-blue">环境</span>
Java : 1.8
Flatten-maven-plugin: 1.3.0
SpringBoot: 2.6.6
SpringCloud: 2021.0.6
Maven: 3.5.4
# <span id="inline-blue">背景</span>
微服务项目集成模块越来越多，公共模块的版本管理很麻烦，通过集成Flatten-maven-plugin插件，实现版本号统一管理
# <span id="inline-blue">Flatten-maven-plugin插件</span>
项目父级pom.xml引入Flatten-maven-plugin插件及版本占位符${revision}定义
```xml
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.vanishke</groupId>
  <artifactId>common-platform</artifactId>
  <version>${revision}</version>
  <name>common-platform</name>
  <properties>
  <flatten-maven-plugin.version>1.3.0</flatten-maven-plugin.version>
  <revision>0.0.1-SNAPSHOT</revision>
  ...
  </properties>
  ...
  <build>
  <plugins>
      <plugin>
        <groupId>org.codehaus.mojo</groupId>
        <artifactId>flatten-maven-plugin</artifactId>
        <version>${flatten-maven-plugin.version}</version>
        <configuration>
          <updatePomFile>true</updatePomFile>
          <flattenMode>resolveCiFriendliesOnly</flattenMode>
        </configuration>
        <executions>
          <execution>
            <id>flatten</id>
            <phase>process-resources</phase>
            <goals>
              <goal>flatten</goal>
            </goals>
          </execution>
          <execution>
            <id>flatten.clean</id>
            <phase>clean</phase>
            <goals>
              <goal>clean</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
```
注意点：
父子模块遵循层级定义
父模块引入插件定义
模块${revision}版本号占位符不可与明确字符串版本号混用，否则报错

# <span id="inline-blue">子模块版本号定义</span>
子模块引用${revision}占位符，替代父项目的版本号
```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.vanishke</groupId>
        <artifactId>common-platform</artifactId>
        <version>${revision}</version>
        <relativePath>../pom.xml</relativePath> 
    </parent>
    <artifactId>common-log</artifactId>
    <packaging>jar</packaging>
	...
</project>
```
idea忽略Flatten-maven-plugin生成的.flattened-pom.xml文件
添加Flatten-maven-plugin插件之后，Maven项目父级pom.xml执行install命令，各个模块会生成.flattened-pom.xml文件，文件内部是通过占位符替换，将${revision}替换成实际的版本，
模块打包实际执行的pom文件是模块下.flattened-pom.xml
![Maven统一版本号管理](/images/Maven/Flatten-maven-plugin/Maven_Flattened_20240923_001.png)

如果在项目内部模块间相互引用不想再填写版本号，可通过以下方法实现
在公共模块下新增一个模块管理
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.vanishke</groupId>
    <artifactId>common-bom</artifactId>
    <version>${revision}</version>
    <name>common-bom</name>
    <packaging>pom</packaging>
    <description>
        common-bom common依赖项版本管理
    </description>
    <properties>
        <revision>0.0.1-SNAPSHOT</revision>
    </properties>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>com.vanishke</groupId>
                <artifactId>common-base</artifactId>
                <version>${revision}</version>
            </dependency>
            <dependency>
                <groupId>com.vanishke</groupId>
                <artifactId>common-config</artifactId>
                <version>${revision}</version>
            </dependency>
            <dependency>
                <groupId>com.vanishke</groupId>
                <artifactId>common-dao</artifactId>
                <version>${revision}</version>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```
注意：
这个模块没有父级，打包方式是pom,公共模块依赖背dependencyManagement节点统一管理

父级项目pom.xml需要import这个模块的依赖管理，类似于MavenimportSpringBoot、SpringCloud的pom依赖关系一样
```xml
<dependency>
        <groupId>com.vanishke</groupId>
        <artifactId>common-bom</artifactId>
        <version>${revision}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>
```

后续项目模块间相互依赖只需要使用下面的引用方式即可，不用再填写版本
```xml
	<dependency>
        <groupId>com.vanishke</groupId>
        <artifactId>common-redis</artifactId>
      </dependency>
```
# <span id="inline-blue">插件使用过程中的问题记录</span>

## <span id="inline-blue">revision变量爆红</span>
	
${revision}占位符支持需要升级Maven到3.5.2及以上，并且需要手动变更下idea的目录引用设置，如下图：

![Maven统一版本号管理](/images/Maven/Flatten-maven-plugin/Maven_Flattened_20240923_002.png)


参考：https://www.mojohaus.org/flatten-maven-plugin/usage.html