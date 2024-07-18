---
title: 基于Jboss容器自动启动脚本工具
categories:
	- Jboss
tags: 
	- Linux
	- Jboss
	
date: 2022-07-12 17:32:20
updated: 2022-07-12 17:32:20
---
<!-- toc -->

# <span id="inline-blue">目的</span>
解决服务器同级目录下,多个模块使用Jboss容器自动启动脚本设置。

# <span id="inline-blue">脚本内容</span>

```shell
#!/bin/sh
#搜索jboss start.sh&stop.sh脚本所在目录，先执行stop.sh,两秒之后执行start.sh启动
function restart_module(){
   cd $1
   sh stop.sh > /dev/null 2>&1
   sleep 2
   sh start.sh > /dev/null 2>&1
}

p_path=`pwd`
# 去掉BAK、soft和depg目录
start_loction=`find $p_path \( -path $p_path/BAK -o -path $p_path/soft  -o -path $p_path/depg \) -prune -o -name start.sh`
for i in $start_loction; do
    if [ -f $i ]; then
       start_path=`dirname $i`
       echo $start_path
       restart_module $start_path
    fi
done
```
将脚本上传至需要设置自动启动的项目同级目录下，执行 chmod a+x *.sh
![Jboss容器自启动](/images/Jboss/Jboss_20220712_001.png)

# <span id="inline-blue">验证</span>

```shell
#startsdp.sh脚本
sh startsdp.sh
```
命令执行之后会打印启动执行的脚本所在位置。
![Jboss容器自启动](/images/Jboss/Jboss_20220712_002.png)


