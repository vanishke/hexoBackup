---
title: Rsync实现服务器目录同步
categories:
	- Rsync

date: 2024-01-03 14:50:20
tags: 
	- Rsync
---
<!-- toc -->

# <span id="inline-blue">环境</span>
linux : CentOS Linux release 7.7.1908 (Core)
rsync : rsync-3.0.7
inotify : inotify-tools-3.13
# <span id="inline-blue">目的</span>
管理后台上传到FTP的图片目录，需要通过使用nginx代理给接口下载使用，但nginx如果采用回源方案的话导致在接口大量并发的情况下，nginx源服务器出现报错，代理下载nginx服务器缓存出现异常，不能正常提供下载服务。所以将nginx都修改为代理本地服务器的目录，通过rsync将上传文件的FTP目录同步到nginx服务器，减少回源的时间。
# <span id="inline-blue">实现</span>
1、先查看linux的内核是否支持inotify，支持inotify的内核最小为2.6.13，输入命令：uname –a。如下图所示，内核为3.10.0，支持inotify：
```shell
Linux S21614 3.10.0-1062.el7.x86_64 #1 SMP Wed Aug 7 18:08:02 UTC 2019 x86_64 x86_64 x86_64 GNU/Linux
```
2、建立同步ssh信任关系，输入命令：cd  $HOME，进入用户根目录。
输入命令：ssh-keygen -t rsa (会出现几个提示信息，一直按回车即可)。
会在$HOME/.ssh/目录下生成2个文件id_rsa、id_rsa.pub。
输入命令：cp  id_rsa.pub  authorized_keys，将id_rsa.pub拷贝成authorized_keys。
将授权密钥分发到nginx服务器(192.168.100.101)上，输入命令：
scp  ~/.ssh/authorized_keys root@192.168.100.101:/root/.ssh/
如果有多台下载服务器，每台都须运行一次上面的密钥下发命令。
3、通过如下命令查看系统是否支持inotify：ll /proc/sys/fs/inotify
如果有如下输出，表示系统内核已经支持inotify：
```shell
total 0
-rw-r--r-- 1 root root 0 Jan  2 14:59 max_queued_events
-rw-r--r-- 1 root root 0 Jan  2 14:59 max_user_instances
-rw-r--r-- 1 root root 0 Jan  2 14:59 max_user_watches
```
5、取得软件包inotify-tools-3.13.tar.gz，放在/tmp下。
6、输入命令：tar zvxf inotify-tools-3.13.tar.gz，解压软件包。
7、输入命令：cd inotify-tools-3.13，进入解压后的目录。
8、输入命令：./configure
9、输入命令：make
10、输入命令：make install 
11、在系统下执行命令：man inotify、 man inotifywait、 man inotifywatch即可得到相应的帮助信息，表示inotify安装成功。
12、输入命令：rsync，查看rsync是否安装。
rsync一般是系统默认安装，如果没有安装就取得软件包，安装方法同inotify。

1、取得syncapps.sh、versService.dat脚本。
syncapps.sh脚本内容如下：
```shell
#!/bin/sh
# Copyright 2010 Shenzhen Coship Electronics Co.,Ltd.
# All Rights Reserved

############################################################
#FROM: The source directory of iEPGM synchronized to iEPG.
#TO:   The purpose file of iEPGM synchronized to iEPG
############################################################
FROM=/home/iepgm/iepgm-jetty/sys/pages/
TO=iEPGService.dat

PID_FILE=syncapps.pid

function sync_files
{
   cat $TO | while read DST 
   do
   rsync -avzq  --delete --exclude '/.version' --exclude '/.bak' $FROM $DST
   done
}

function inotify_func
{
    inotifywait -mrq -e modify,delete,create ${FROM} | while read D E F;do
        # echo "$D : $E : $F"
        sync_files
    done
}

function stop
{
    pkill inotifywait &>/dev/null && rm -f ${PID_FILE} &> /dev/null
}

case $1 in
    stop)
        echo -n "Stopping sync service..."
        if [ -e ${PID_FILE} ]; then
            stop
            echo "Stopped"
            exit 0
        else
            echo "pid file not found"
            exit 2
        fi
        ;;
    start) 
        echo -n "Starting sync service..."
        if [ -f ${PID_FILE} ] && ((`ps awux | grep -v grep | grep -c inotifywait`)); then
            echo " already running: pid file found ($PID_FILE) and an inotifywait process is running"
            exit 1
        elif [ -f ${PID_FILE} ]; then
            echo -n "(stale pid file)"
        fi

        sync_files
        inotify_func&
        
        pid="$!"
        ps --ppid $pid -o pid,cmd | grep inotifywait | awk '{print $1}' > ${PID_FILE}
        
        echo "Started"
        ;;
    restart)
        $0 stop
        $0 start
        exit 0
        ;;
    status)
        echo -n "Getting status for syncer service... "
        pid=`cat ${PID_FILE} 2>/dev/null`
        if [ -f ${PID_FILE} ] && ((`ps awux | grep -v grep | egrep -c "$pid.*inotifywait"`)); then
            echo "running (pid $pid)"
            exit 0
        elif [ -f ${PID_FILE} ]; then
            echo "not runing (pid file found $pid)"
            exit 3
        elif ((`ps awux | grep -v grep | egrep -c "$pid.*inotifywait"`)); then
            echo "not running (inotifywait procs found)"
            exit 4
        else
            echo "not running"
            exit 5
        fi
        ;;
                
    *)
        echo "Usage error"
        echo "Usage: $0 <start|stop|restart|status>"
        ;;
esac

```
versService.dat脚本脚本内容如下：
```shell
root@172.30.209.43:/usr/local/iepg-jetty/webapps/iepg/pages/
```
2、编辑syncapps.sh、versService.dat文件中的同步目录及同步主机节点
3、输入命令：chmod  +x  *.sh，给文件赋可执行权限。
4、输入命令：./syncapps.sh start，启动同步工具。
启动同步工具的输入命令：./syncapps.sh start
停止同步工具的输入命令：./syncapps.sh stop
重启同步工具的输入命令：./syncapps.sh restart
查看同步工具状态的输入命令：./syncapps.sh status
