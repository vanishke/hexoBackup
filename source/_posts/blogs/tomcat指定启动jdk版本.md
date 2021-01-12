---
title: Tomcat 指定启动JDK版本
categories: Tomcat
date: 2020-11-17 10:23:20
tags: Tomcat
---

## <span id="inline-blue">linux环境</span>

```shell
假设jdk版本7，目录为/home/user1/jdk
进入到tomcat的bin目录下，修改setclasspath.sh文件，在文件首部添加两行代码

export JAVA_HOME=/home/user/jdk
export JRE_HOME=/home/user/jdk/jre
```



## <span id="inline-blue">windows</span>


修改bin目录下的setclasspath.bat文件，注意linux的是sh，Windows的是bat。将上述两行代码的export换成set填入该文件首部保存（注意实际路径的替换）



