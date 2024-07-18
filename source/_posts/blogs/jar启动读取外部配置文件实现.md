---
title: jar启动读取外部配置文件实现
categories:
	- Java
tags: 
	- Java
	
date: 2023-08-11 14:35:20
updated: 2023-08-11 14:35:20
---
<!-- toc -->
# <span id="inline-blue">背景</span>
项目编译打成jar包后，配置文件包含在jar包内部不方便修改，希望实现本地启动读取classpath路径下的配置信息，在生产环境部署的情况下读取同级目录下的配置信息
# <span id="inline-blue">实现</span>
通过静态工具类读取配置信息
1、本地开发时读取资源目录下的配置文件信息
2、打成jar包部署时，资源文件放置在jar包同级conf目录下

maven打包时将配置文件拷贝至target目录下，依赖以下插件实现：
```xml
<plugin>
            <artifactId>maven-resources-plugin</artifactId>
            <version>2.6</version>
            <executions>
                <execution>
                    <id>copy-resources</id>
                    <phase>package</phase>
                    <goals>
                        <goal>copy-resources</goal>
                    </goals>
                    <configuration>
						<!-- 拷贝至target目录 -->
                        <outputDirectory>${build.directory}</outputDirectory>
                        <resources>
                            <resource>
								<!-- 资源文件原始路径 -->
                                <directory>src/main/resources</directory>
                            </resource>
                        </resources>
                    </configuration>
                </execution>
            </executions>
      </plugin>
```
PropertiesUtil工具类实现
```java
package com.coship.base.util;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class PropertiesUtil {

    private static final Logger logger = LoggerFactory.getLogger(PropertiesUtil.class);
    private static Map<String, String> configMap = null;


    static {
        loadProperties();
    }

    /**
     * 初始化propertiies
     *
     * @return
     */
    public static Properties loadProperties() {
        Properties properties = new Properties();
        InputStream in = null;

        //优先从jar包同级conf目录获取配置文件
        String confPath = System.getProperty("user.dir");
        confPath = confPath + File.separator +"conf"+ File.separator+ "application.properties";
        File file = new File(confPath);
        if (file.exists()) {
            logger.info("配置文件路径---->>" + confPath);
            try {
                in = new FileInputStream(new File(confPath));
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            }
        }
        //未传入路径时，读取项目classpath路径下配置文件信息
        else {
            logger.info("项目路径[" + confPath + "]下无连接信息，从classpath路径下加载");
            in = PropertiesUtil.class.getClassLoader().getResourceAsStream("conf/application.properties");
        }
        try {
            properties.load(in);
            configMap = new HashMap<>(properties.keySet().size());
            logger.info("init properties");
            for (Object keyObj : properties.keySet()) {
                String key = keyObj.toString();
                Object objs = properties.get(key);
                logger.info(key + ":" + objs);
                configMap.put(key.trim(), objs.toString());
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return properties;
    }

    private static String getSimpleValue(String key, String defaultValue) {
        String value = configMap.get(key);
        if (value == null || value.trim().length() == 0) {
            value = defaultValue;
        }
        assert StringUtils.isNotBlank(value);
        return value;
    }


    private static String getSimpleValue(String key) {
        return configMap.get(key).toString();
    }


    public static int getHttpPort() {
        return Integer.valueOf(getSimpleValue("server.http.port", "8056")).intValue();
    }

    public static String getEsSQLPath() {
        return getSimpleValue("es.sql.path","/_sql");
    }

    public static String getEsSQLExplainPath() {
        return getSimpleValue("es.sql.explain.path","/_sql/_explain");
    }


}

```
 jar包启动命令，启动时指定log4j.properties配置文件
 ```shell
//file:标识必须存在，表示从本地路径加载  &代表后台启动，否则xshell窗口关闭的情况下，进程停止
 java -jar -Dlog4j.configuration=file:./conf/log4j.properties XXX.jar &
 ```
 
 # <span id="inline-blue">启动命令</span>
 start.sh
 ```shell
 #!/bin/sh
BINDIR=`dirname $0`
if [ -n "$BINDIR" ] ; then
    BINDIR=`cd $BINDIR > /dev/null 2>&1 && pwd`
fi
cd $BINDIR
(java -jar -Dlog4j.configuration=file:./conf/log4j.properties EsTool_V1.0.0.jar &)
 ```
 stop.sh
 ```shell
 #!/bin/sh
ps -ef|grep 'EsTool_V1.0.0.jar' | grep -v "grep" | awk '{print $2}' | xargs kill -9
 ```