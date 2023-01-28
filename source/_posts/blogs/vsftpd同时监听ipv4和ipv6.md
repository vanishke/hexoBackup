---
title: vsftpd同时监听ipv4和ipv6
categories: 
	- FTP
tags: 
	- Linux
	- FTP
date: 2022-04-21 18:10:12
---
 

## <span id="inline-blue">vsftpd配置文件说明</span>
文件名称：vsftpd.conf
文件路径：/etc/vsftpd/vsftpd.conf
配置说明：
不监听ipv6
listen_ipv6=NO
监听ipv4
listen_ipv4=YES
listen_ipv6和listen_ipv4配置项不能同时启用，需要配置两份配置文件vsftpd.conf和vsftpd_ipv6.conf(直接拷贝一份vsftpd.conf并改名,修改对应配置项放在同级目录即可)

vsftpd.conf
```shell
##不监听ipv6
listen_ipv6=NO
##监听ipv4
listen_ipv4=YES
```
vsftpd_ipv6.conf
```shell
##监听ipv6
listen_ipv6=YES
##不监听ipv4
listen_ipv4=NO
```
## <span id="inline-blue">重启vsftpd服务</span>
```shell
[root@lwdCSCDN vsftpd]# service vsftpd restart
关闭 vsftpd：                                              [确定]
为 vsftpd 启动 vsftpd：                                    [确定]
为 vsftpd_ipv6 启动 vsftpd：                               [确定]
```
## <span id="inline-blue">ipv4格式</span>

ftp://oracle:oracle@10.9.216.12:21
![ipv4格式访问](/images/linux/LF_20220422_001.png)
## <span id="inline-blue">ipv6格式</span>
ipv6格式访问xftp需要xftp5版本支持
ftp://oracle:oracle@[10:9:216::12]:21
![ipv6格式访问](/images/linux/LF_20220422_002.png)



