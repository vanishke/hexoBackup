---
title: Linux创建FTP
categories: 
	- FTP
tags: 
	- Linux
	- FTP
date: 2020-12-24 10:11:20
---
<!-- toc -->

## <span id="inline-blue">创建FTP用户组</span>
```shell
#添加ftp用户组
groupadd ftp
```
## <span id="inline-blue">创建FTP用户</span>
```shell
useradd -G ftp -d /home/oracle -s /sbin/nologin  oracle

# -G 指定用户所在用户组
# -d 指定用户工作目录
# -s  /sbin/nologin 不允许用户xshell方式登陆
# oracle 创建FTP用户名

#设置用户密码
passwd oracle
```
## <span id="inline-blue">vsftpd参数及配置文件说明</span>

ftpusers: 用户黑名单
user_list: 用户是否受到限制只能访问主目录，与参数chroot_local_user配合使用，chroot_local_user=yes,表示user_list里面的用户不受限制，chroot_local_user=NO,表示user_list里面的用户受限制，只能访问主目录
chroot_list：表示FTP用户只能访问自己的工作目录，与参数chroot_list_enable和chroot_list_file配合使用

## <span id="inline-blue">验证</span>
![FTP验证](/images/linux/ftp_20211118_001.png)