---
title: Jetty访问jsp失败原因分析
categories:
	- Jetty
tags: 
	- Linux
	- Jetty
	
date: 2022-07-06 11:32:20
updated: 2022-07-06 11:32:20
---
<!-- toc -->

# <span id="inline-blue">现象</span>
```shell
HTTP ERROR 404

Problem accessing /cache/cosole.jsp. Reason:

Not Found
```
# <span id="inline-blue">原因分析</span>
应用部署到Jetty之后，因为jetty没有work目录的原因，导致jetty使用的是/tmp目录
对应jetty配置文件内容如下：
文件路径：/usr/local/iepg-jetty/bin/jetty.sh
```shell
209 ##################################################
210 # Set tmp if not already set.
211 ##################################################
212 TMPDIR=${TMPDIR:-/tmp}
213 
```

从以上脚本文件设置得知jetty确实使用的是系统临时文件目录,查看对应目录缺失没有jsp编译生成的class文件，猜测可能是系统定时任务会自动清理对应的临时文件目录。
查看系统对应的定时任务设置，查找到对应的内容信息。
系统临时目录清除任务路径：/etc/cron.daily/
系统临时目录清除任务名称：tmpwatch
 
```shell
#! /bin/sh
flags=-umc
/usr/sbin/tmpwatch "$flags" -x /tmp/.X11-unix -x /tmp/.XIM-unix \
        -x /tmp/.font-unix -x /tmp/.ICE-unix -x /tmp/.Test-unix \
        -X '/tmp/hsperfdata_*' 10d /tmp
/usr/sbin/tmpwatch "$flags" 30d /var/tmp
for d in /var/{cache/man,catman}/{cat?,X11R6/cat?,local/cat?}; do
    if [ -d "$d" ]; then
        /usr/sbin/tmpwatch "$flags" -f 30d "$d"
    fi
done
```
tmpwatch脚本作用是根据创建时间清除/tmp目录下指定时间没有被访问过的文件(10天)
命令参数详情如下：
```shell
-u, --atime		基于访问时间来删除文件，默认的。
-m, --mtime		基于修改时间来删除文件。
-c, --ctime		基于创建时间来删除文件，对于目录，基于mtime。
-M, --dirmtime	删除目录基于目录的修改时间而不是访问时间。
-a, --all		删除所有的文件类型，不只是普通文件，符号链接和目录。
-d, --nodirs	不尝试删除目录，即使是空目录。
-d, --nosymlinks	不尝试删除符号链接。
-f, --force		强制删除。
-q, --quiet		只报告错误信息。
-s, --fuser		如果文件已经是打开状态在删除前，尝试使用“定影”命令。默认不启用。
-t, --test		仅作测试，并不真的删除文件或目录。
-U, --exclude-user=user	不删除属于谁的文件。
-v, --verbose	打印详细信息。
-x, --exclude=path	排除路径，如果路径是一个目录，它包含的所有文件被排除了。如果路径不存在，它必须是一个绝对路径不包含符号链接。
-X, --exclude-pattern=pattern	排除某规则下的路径。
```
# <span id="inline-blue">解决方案</span>

***方案1***
jetty主目录下新建work目录
![Jetty临时目录设置](/images/jetty/jetty_2022_07_06_001.png)

***方案2***
重新指定jetty临时文件目录
编辑bin目录下jetty.sh文件
```shell
TMPDIR=${TMPDIR:-/tmp}
改为
TMPDIR=${TMPDIR:-/usr/local/tmp}
```



