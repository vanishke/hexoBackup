---
title: Linux-文件传输
categories: 
	- Linux
tags: 
	- Linux
top: 2

date: 2023-01-29 16:40:20
updated: 2023-01-29 16:40:20
---
<!-- toc -->


## <span id="inline-blue">ftp命令 </span>

**作用**
	本地和远程服务器之间上传和下载文件，实现两端服务通信。

**选项** 
```shell
-d 开启debug模式
-i 关闭交互模式（不再询问用户）
-n 禁用自动登陆
-v 显示详细操作信息
-g 关闭文件名替换
-t 激活数据包跟踪
```
**示例**
```shell
[root@demomdn ~]# ftp 10.9.212.55
Connected to 10.9.212.55.
220 Microsoft FTP Service
504 Security mechanism not implemented.
Name (10.9.212.55:root): report_cd     
331 Password required for report_cd.
Password:
230 User logged in.
Remote system type is Windows_NT.
ftp> dir
227 Entering Passive Mode (10,9,212,55,203,83).
125 Data connection already open; Transfer starting.
03-15-22  05:18PM                27446 11479.jpg
03-15-22  05:24PM                24242 11481.jpg
03-15-22  05:29PM                57438 11597.jpg
03-15-22  05:29PM                 3710 13683.jpg
03-15-22  05:29PM                 9836 14716.jpg
03-15-22  05:29PM                47496 15221.jpg
03-15-22  05:29PM                29992 15475.jpg
03-15-22  05:29PM                52790 16238.jpg
03-15-22  05:29PM                52735 16393.jpg
03-15-22  05:29PM                23356 16636.jpg
04-22-22  09:23AM       <DIR>          aspnet_client
08-02-20  09:41PM       <DIR>          oms-pic
12-30-20  05:40PM       <DIR>          upload
10-15-21  02:28PM       <DIR>          verms
226 Transfer complete.

#下载文件，16636.jpg存放在登陆FTP的当前目录下
ftp> get 16636.jpg
local: 16636.jpg remote: 16636.jpg
227 Entering Passive Mode (10,9,212,55,203,96).
125 Data connection already open; Transfer starting.
WARNING! 70 bare linefeeds received in ASCII mode
File may not have transferred correctly.
226 Transfer complete.
23356 bytes received in 0.05 seconds (4.6e+02 Kbytes/s)
ftp> quit
221 Goodbye.
[root@demomdn ~]# ls
16636.jpg        Downloads  Pictures         sda1.blktrace.2  sda1.blktrace.7  sda4.blktrace.4  Templates
anaconda-ks.cfg  ftp        Public           sda1.blktrace.3  sda4.blktrace.0  sda4.blktrace.5  Videos
boss.0.json      ISSClient  receiveMsg       sda1.blktrace.4  sda4.blktrace.1  sda4.blktrace.6  VirtualBox VMs
Desktop          logs       sda1.blktrace.0  sda1.blktrace.5  sda4.blktrace.2  sda4.blktrace.7
Documents        Music      sda1.blktrace.1  sda1.blktrace.6  sda4.blktrace.3  store

#上传文件16637.jpg，16637.jpg文件位于登陆ftp的当前目录下
ftp> put 16637.jpg     
local: 16637.jpg remote: 16637.jpg
227 Entering Passive Mode (10,9,212,55,203,149).
125 Data connection already open; Transfer starting.
226 Transfer complete.
23425 bytes sent in 0.0021 seconds (1.1e+04 Kbytes/s)
ftp> dir
227 Entering Passive Mode (10,9,212,55,203,151).
150 Opening ASCII mode data connection.
03-15-22  05:18PM                27446 11479.jpg
03-15-22  05:24PM                24242 11481.jpg
03-15-22  05:29PM                57438 11597.jpg
03-15-22  05:29PM                 3710 13683.jpg
03-15-22  05:29PM                 9836 14716.jpg
03-15-22  05:29PM                47496 15221.jpg
03-15-22  05:29PM                29992 15475.jpg
03-15-22  05:29PM                52790 16238.jpg
03-15-22  05:29PM                52735 16393.jpg
03-15-22  05:29PM                23356 16636.jpg
01-29-23  04:48PM                23425 16637.jpg
04-22-22  09:23AM       <DIR>          aspnet_client
08-02-20  09:41PM       <DIR>          oms-pic
12-30-20  05:40PM       <DIR>          upload
10-15-21  02:28PM       <DIR>          verms
226 Transfer complete.
```

## <span id="inline-blue">rsync命令 </span>

**作用**
	rsync命令来自于英文词组“remote sync”的缩写，其功能是用于远程数据同步。rsync命令能够基于网络（含局域网和互联网）快速的实现多台主机间的文件同步工作，并与scp或ftp发送完整文件不同，rsync有独立的文件内容差异算法，会在传送前对两个文件进行比较，只传送两者内容间的差异部分，因此速度更快。

**选项** 
```shell
-v	详细模式输出
-z	压缩文件
-o	保留文件原始所有者身份
-g	保留文件原始所有组身份
-p	保留文件原始权限信息
-b	备份目标文件
-r	递归目录文件（传输目录内的子文件）
-d	不递归目录文件（不传输目录内的子文件）
-P	显示进度信息
-q	精简输出模式
-h	显示帮助信息
```
**示例**
```shell
#查看本地同步文件内容
[root@lwdCSCDN /]rsync rsync_dir1
#查看远程同步文件内容
[root@lwdCSCDN /]rsync 10.9.216.12:/tmp
#同步本地文件夹
[root@lwdCSCDN /]rsync -r rsync_dir1 rsync_dir2
#同步远程文件夹
[root@lwdCSCDN /]rsync -r rsync_dir1 10.9.216.12:/rsync_dir2
```




