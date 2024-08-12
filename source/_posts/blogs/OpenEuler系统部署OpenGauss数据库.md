---
title: OpenEuler系统部署OpenGauss数据库
categories:
	- OpenGauss
tags: 
	- OpenEuler
	- OpenGauss
	
date: 2024-08-09 15:42:21	
updated: 2024-08-09 15:42:21
---
<!-- toc -->
# <span id="inline-blue">环境</span>
系统：openEuler release 20.03 (LTS-SP3)
数据库： openGauss-6.0.0-RC1
# <span id="inline-blue">背景</span>
项目应用为集成国产系统和数据库，基于安全和性能上考虑选择openEuler系统和openGauss数据库
# <span id="inline-blue">实现</span>

## <span id="inline-blue">关闭防火墙</span>
```shell
[root@openeuler172 ~]# systemctl stop firewalld.service
[root@openeuler172 ~]# systemctl status firewalld.service
● firewalld.service - firewalld - dynamic firewall daemon
   Loaded: loaded (/usr/lib/systemd/system/firewalld.service; disabled; vendor preset: enabled)
   Active: inactive (dead)
     Docs: man:firewalld(1)

8月 09 16:05:33 openeuler172 systemd[1]: Starting firewalld - dynamic firewall daemon...
8月 09 16:05:34 openeuler172 systemd[1]: Started firewalld - dynamic firewall daemon.
8月 09 16:05:36 openeuler172 systemd[1]: Stopping firewalld - dynamic firewall daemon...
8月 09 16:05:37 openeuler172 systemd[1]: firewalld.service: Succeeded.
8月 09 16:05:37 openeuler172 systemd[1]: Stopped firewalld - dynamic firewall daemon.
```

## <span id="inline-blue">设置字符集和环境变量</span>
```shell
[root@openeuler172 ~]# vim /etc/profile
#文件末尾添加如下内容,packagePath为安装后OpenGauss所在位置，根据实际安装路径修改
export LANG=zh_CN.UTF‐8
export packagePath=/data/openGauss
export LD_LIBRARY_PATH=$packagePath/script/gspylib/clib:$LD_LIBRARY_PATH
#配置重新加载生效
[root@openeuler172 ~]# source /etc/profile
#验证环境配置是否生效
[root@openeuler172 ~]# echo $LD_LIBRARY_PATH
/data/openGauss/script/gspylib/clib
```
## <span id="inline-blue">下载数据库安装包</span>
将openGauss安装包上传至/data/openGauss
openGauss下载地址：https://opengauss.org/zh/download/
下载页面，架构选择X86_64,系统选择openEuler release 20.03
架构和系统一定要和实际安装一致，否则安装过程会出现依赖缺失问题。
## <span id="inline-blue">安装OpenGauss数据库</span>
```shell
#创建openGauss管理员用户组
[root@openeuler172 ~]# groupadd dbgroup
#创建openGauss管理员omm
[root@openeuler172 ~]# useradd -g dbgroup omm
#设置密码要求8位字符
[root@openeuler172 ~]# passwd omm
#创建openGauss安装路径/data/openGauss
[root@openeuler172 ~]# mkdir -p /data/openGauss
[root@openeuler172 ~]# cd /data/openGauss
#将数据库安装包上传至/data/openGauss
#解压压缩包
[root@openeuler172 ~]#tar -zxvf openGauss-6.0.0-RC1-openEuler-64bit-all.tar.gz
#再次解压
[root@openeuler172 ~]#tar -zxvf openGauss-6.0.0-RC1-openEuler-64bit-om.tar.gz
#创建openGauss集群配置文件clusterconfig.xml
[root@openeuler172 ~]# vim clusterconfig.xml
```
clusterconfig.xml文件内容如下：
```shell
<?xml version="1.0" encoding="UTF-8"?>
<ROOT>
 <!-- openGauss 整体信息 -->
 <CLUSTER>
 <!-- 数据库名称 -->
 <PARAM name="clusterName" value="dbCluster" />
  <!-- 数据库节点名称(hostname) -->
 <PARAM name="nodeNames" value="openeuler172" />
 <!-- 节点IP,与数据库节点名称列表一一对应 -->
 <PARAM name="backIp1s" value="10.9.216.172"/>
 <!-- 数据库安装目录 -->
 <PARAM name="gaussdbAppPath" value="/data/openGauss/gaussdb/app" />
 <!-- 数据库日志目录 -->
 <PARAM name="gaussdbLogPath" value="/var/log/gaussdb" />
 <!-- 数据库工具目录 -->
 <PARAM name="gaussdbToolPath" value="/data/openGauss/wisequery" />
 <!-- 数据库core文件目录 -->
 <PARAM name="corePath" value="/data/openGauss/corefile"/>
 <!-- 单机部署 -->
 <PARAM name="clusterType" value="single-inst"/>
 </CLUSTER>
 <!-- 每台服务器上的节点部署信息 -->
 <DEVICELIST>
 <!-- node1 上的节点部署信息 -->
 <DEVICE sn="1000001">
 <!-- 节点1的部署信息 -->
 <PARAM name="name" value="openeuler172"/>
 <!-- 节点1的所在的AZ及AZ优先级 -->
 <PARAM name="azName" value="AZ1"/>
 <PARAM name="azPriority" value="1"/>
 <!-- 如果服务器只有一个网卡可用，将 backIP1 和 sshIP1 配置成同一个 IP -->
 <PARAM name="backIp1" value="10.9.216.172"/>
 <PARAM name="sshIp1" value="10.9.216.172"/>

 <!--dbnode-->
 <PARAM name="dataNum" value="1"/>
 <!-- 服务端口 -->
 <PARAM name="dataPortBase" value="5432"/>
 <!-- 数据库实例目录 -->
 <PARAM name="dataNode1" value="/data/openGauss/gaussdb/data/db1"/>
 </DEVICE>
 </DEVICELIST>
</ROOT>
```
hosts文件增加openGauss节点主机名
```shell
[omm@openeuler172 bin]$ vim /etc/hosts
10.9.216.172 db1 db1.opengauss.com
```

解压后生成的文件目录内容如下，script目录存放进行安装的脚本工具
```shell
[root@openeuler172 openGauss]# pwd
/data/openGauss
[root@openeuler172 openGauss]# ls
clusterconfig.xml  openGauss-6.0.0-RC1-openEuler-64bit-all.tar.gz  openGauss-6.0.0-RC1-openEuler-64bit.sha256   upgrade_sql.tar.gz
corefile           openGauss-6.0.0-RC1-openEuler-64bit-cm.sha256   openGauss-6.0.0-RC1-openEuler-64bit.tar.bz2  version.cfg
gaussdb            openGauss-6.0.0-RC1-openEuler-64bit-cm.tar.gz   openGauss-Package-bak_ed7f8e37.tar.gz        wisequery
lib                openGauss-6.0.0-RC1-openEuler-64bit-om.sha256   script
libcgroup          openGauss-6.0.0-RC1-openEuler-64bit-om.tar.gz   upgrade_sql.sha256
```
执行预安装命令：
```shell
#进入script目录
[root@openeuler172 openGauss]# cd /data/openGauss/script/
[root@openeuler172 openGauss]# ./python_gs_preinstall -U omm -G dbgroup -X /data/openGauss/clusterconfig.xml
```

执行初始化数据库命令：
```shell
[root@openeuler172 openGauss]# cd /data/openGauss/script/ 
[root@openeuler172 openGauss]# ./gs_install -X /data/openGauss/clusterconfig.xml --gsinit-parameter="--encoding=UTF8" --dn-guc="max_process_memory=8GB" --dn-guc="shared_buffers=512MB" --dn-guc="bulk_write_ring_size=128MB" --dn-guc="cstore_buffers=64MB"
```
执行过程中会提示设置omm管理用户的密码，设置完成后记住就行。


## <span id="inline-blue">数据库基本操作</span>
```shell
#将openGauss数据库安装目录的所属群组赋予omm:dbgroup，并给与相应读写、执行权限
[root@openeuler172 openGauss]# cd /data/openGauss/script/
[root@openeuler172 openGauss]# chown -R omm:dbgroup /data/openGauss
[root@openeuler172 openGauss]# chmod  755 -R /data/openGauss
#登陆数据库
[root@openeuler172 openGauss]# su - omm
#切换到脚本目录
[omm@openeuler172 script]$ cd /data/openGauss/script/ 
#启动openGauss
[omm@openeuler172 script]$ ./gs_om -t start
#停止openGauss
[omm@openeuler172 script]$ ./gs_om -t stop
#重启openGauss
[omm@openeuler172 script]$ ./gs_om -t restart
#使用omm管理员用户登录
[omm@openeuler172 script]$ gsql -p 5432 -U omm -W test@123 -r
#更改管理员用户密码
openGauss=> alter role omm identified by 'admin@123' replace 'test@123';
#创建数据库用户
openGauss=> create user admin with password "admin@123";
#创建数据库
openGauss=> create database test owner admin;
#退出数据库
openGauss=> \q
#使用admin账号登陆数据库
openGauss=> gsql -d test -p 5432 -U admin -W admin@123 -r;
#创建schema
openGauss=> create schema admin authorization admin;
#创建表mytable
openGauss=> create table mytable(firstcol int);
#插入表数据
openGauss=> insert into mytable values(100);
#查询mytable表数据
openGauss=> select * from  mytable;
# 查看对象
openGauss=# \l #查看数据库
openGauss=# \c test #查看数据库
openGauss=# \dt #查看数据库所有表名
openGauss=# \d mytable #查看表结构
openGauss=# \d+ mytable #查看表结构
```
参考官方文档：<a id="download" href="/images/OpenGauss/openEuler-openGauss.pdf"><i class="fa fa-download"></i><span>官方文档</span> </a>


