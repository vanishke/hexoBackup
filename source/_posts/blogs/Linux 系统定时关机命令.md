---
title: Linux 系统定时关机命令
categories:
	- Linux

date: 2024-06-14 15:03:20
tags: 
	- Linux
---
<!-- toc -->
# <span id="inline-blue">目的</span>
	Linux服务器空闲时间点自动关机
# <span id="inline-blue">实现</span>
添加系统定时任务
```shell
vim /etc/crontab
# Example of job definition:
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name  command to be executed
#每天18:20自动关机
20 18 * * * root /sbin/init 0 > /dev/null 2>&1 &
每天23:15自动关机
15 23 * * * root /sbin/shutdown -h now
#周一至周五 每天23:15自动关机
15 23 * * 1-5 root /sbin/shutdown -h now
```
