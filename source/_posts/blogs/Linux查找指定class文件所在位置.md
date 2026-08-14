---
title: Linux查找指定class文件所在位置
categories:
	- Linux
tags: 
	- Linux
	- Java
	
date: 2022-07-15 9:55:20
---

<!-- toc -->

# 使用场景
线上应用异常日志打印信息关联某个class文件，但不确定具体存在那个jar包

# 命令调用
```shell
ls *.jar | while read jarfile; do
    echo "$jarfile"
    jar -tf $jarfile | grep "Integer.class"
done
```
# 查询结果
![Jboss容器自启动](/images/linux/Linux_20220715_001.png)
