---
title: ElasticSearch开机自启动
categories: 
	- Elasticsearch
tags: 
	- Elasticsearch
	
date: 2024-01-17 16:11:35
updated: 2024-01-17 16:11:35
---
<!-- toc -->

# <span id="inline-blue">创建elasticsearch启动配置文件</span>
```shell
# 系统自启动服务目录
cd /etc/init.d 
# 创建服务文件
vim elasticsearch
```
脚本内容如下：
```shell
#!/bin/bash
#chkconfig: 345 63 37
#description: elasticsearch
#processname: elasticsearch-2.4.4

# elasticsearch目录
export ES_HOME=/usr/local/elasticsearch-2.4.4
#java目录
export JAVA_HOME=/usr/local/java/jdk1.8.0_171
#需要创建对应es用户
case $1 in
start)
    su es<<!
    cd $ES_HOME
    ./bin/elasticsearch -d -p pid
    exit
!
    echo "elasticsearch is started"
    ;;
stop)
    pid=`cat $ES_HOME/pid`
    kill -9 $pid
    echo "elasticsearch is stopped"
    ;;
restart)
    pid=`cat $ES_HOME/pid`
    kill -9 $pid
    echo "elasticsearch is stopped"
    sleep 1
    su es<<!
    cd $ES_HOME
    ./bin/elasticsearch -d -p pid
    exit
!
    echo "elasticsearch is started"
    ;;
*)
    echo "start|stop|restart"
    ;;
esac
exit 0

```
# <span id="inline-blue">修改文件权限</span>
```shell
	chmod 777 elasticsearch
```

# <span id="inline-blue">添加和删除自启动服务</span>
```shell
#添加服务
chkconfig --add elasticsearch
#删除服务
chkconfig --del elasticsearch
```
# <span id="inline-blue">开启和关闭服务</span>
```shell
# 启动
service elasticsearch start
#关闭
service elasticsearch stop
#查看状态
service elasticsearch status
```
# <span id="inline-blue">设置服务开启自启动</span>
```shell
#开启
chkconfig elasticsearch  on
#关闭
chkconfig elasticsearch  off
#查看自启动服务状态
chkconfig  --list
```








