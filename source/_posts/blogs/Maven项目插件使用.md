---
title: Maven项目插件使用
tags: 
	- Maven
categories: 
	- Maven

date: 2022-12-23 15:31:49
updated: 2022-12-23 15:31:49
---
# <span id="inline-blue">maven生成war包包含空文件</span> 
```xml
<plugin>
	<artifactId>maven-war-plugin</artifactId>
	<configuration>
		<includeEmptyDirectories>true</includeEmptyDirectories>
	</configuration>
</plugin>
```
# <span id="inline-blue">maven生成war包包含子模块资源文件</span> 
```xml
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
	<artifactId>maven-resources-plugin</artifactId>
	<executions>
	    <execution>
	        <id>copy-resources</id>
	        <phase>process-sources</phase>
	        <goals>
	           <goal>copy-resources</goal>
	        </goals>
	        <configuration>
				<outputDirectory>${basedir}/target/classes/</outputDirectory>
				<resources>
					<resource>
						<directory>${pom.basedir}/../action.portal.operators/src/main/resources</directory>
					</resource>
					<resource>
						<directory>${basedir}/../bss.common/src/main/resources</directory>
						<excludes>
							<exclude>**/*.src</exclude>
						</excludes>
					</resource>
					<resource>
						<directory>${basedir}/../bss.dao.oracle/src/main/resources</directory>
					</resource> 
				<resources>
	        </configuration>
	    </execution>
	</executions>
</plugin>
```
# <span id="inline-blue">maven生成war包子模块jar包依赖以class文件呈现</span> 
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-dependency-plugin</artifactId>
    <executions>
        <execution>
            <id>unpack</id>
            <phase>prepare-package</phase>
            <goals>
                <goal>unpack</goal>
            </goals>
            <configuration>
                <artifactItems>
                    <artifactItem>
                        <groupId>com.coship.sdp.fj.sme</groupId>
                        <artifactId>bss.common</artifactId>
                        <version>0.0.1-SNAPSHOT</version>
                        <type>jar</type>
                        <includes>**/*.class</includes>
                        <overWrite>false</overWrite>
                        <outputDirectory>${project.build.directory}/classes</outputDirectory>
                    </artifactItem>
                    <artifactItem>
                        <groupId>com.coship.sdp.fj.sme</groupId>
                        <artifactId>bss.dao.oracle</artifactId>
                        <version>0.0.1-SNAPSHOT</version>
                        <type>jar</type>
                        <includes>**/*.class</includes>
                        <overWrite>false</overWrite>
                        <outputDirectory>${project.build.directory}/classes</outputDirectory>
                    </artifactItem>
                </artifactItems>
            </configuration>
        </execution>
    </executions>
</plugin>
```
# <span id="inline-blue">解决本地依赖导致模块之间传递依赖失效</span>
pom.xml文件内正常使用依赖
```xml
<dependency>
            <groupId>com.coship.sdp.fj</groupId>
            <artifactId>sdp-cbb-rights</artifactId>
			<version>V300R003B065</version>
 </dependency>
```
添加maven-install-plugin实现本地jar注册
```xml
<plugin>
		    <groupId>org.apache.maven.plugins</groupId>
		    <artifactId>maven-install-plugin</artifactId>
		    <executions>
		        <execution>
		            <id>install-sdp-cbb-rights</id>
		            <phase>clean</phase>
		            <configuration>
		                <file>${pom.basedir}/../bss.parent/lib/sdp-cbb-rights-V300R003B065.jar</file>
		                <repositoryLayout>default</repositoryLayout>
		                <groupId>com.coship.sdp.fj</groupId>
		    			<artifactId>sdp-cbb-rights</artifactId>
		                <version>V300R003B065</version>
		                <packaging>jar</packaging>
		                <generatePom>true</generatePom>
		            </configuration>
		            <goals>
		                <goal>install-file</goal>
		            </goals>
		        </execution>
		    </executions>
		</plugin>
```
添加完成之后执行如下命令
```xml
mvn clean
```
右键项目maven->update project,勾选Force update Snapshots/Release

# <span id="inline-blue">war包生成指定忽略指定目录</span>
添加maven-war-plugin插件,指定忽略/WEB-INF/lib_bak目录下的jar包
```xml
<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-war-plugin</artifactId>
				<version>3.0.0</version>
				<configuration>
					<warSourceExcludes>
					   	**/WEB-INF/lib_bak/*.jar
					</warSourceExcludes>
				</configuration>
			</plugin>
```




