---
title: Linux查找指定class文件所在位置
categories:
	- Linux
tags: 
	- Linux
	- Java
	
date: 2022-07-15 9:55:20
updated: 2022-07-15 9:55:20
---
<!-- toc -->

# <span id="inline-blue">使用场景</span>
线上应用异常日志打印信息关联某个class文件，但不确定具体存在那个jar包

# <span id="inline-blue">命令调用</span>
```shell
ls *.jar | while read jarfile; do
    echo "$jarfile"
    jar -tf $jarfile | grep "Integer.class"
done
```
# <span id="inline-blue">查询结果</span>
![Jboss容器自启动](/images/linux/Linux_20220715_001.png)


