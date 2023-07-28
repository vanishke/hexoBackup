---
title: Docker容器实现自定义IP
categories: 
	- Docker
tags: 
	- Docker
	- Docker
date: 2023-07-21 17:13:20
---
<!-- toc -->

## <span id="inline-blue">背景</span>
应用使用docker容器化后，需要跨宿主机访问，实现要求是宿主机和内部容器可以互通，且外部主机可以直接访问容器服务

## <span id="inline-blue">工具</span>
bridge-util : linux系统网桥管理工具
pipework : Docker 网络增强插件

## <span id="inline-blue">bridge-util安装</span>
```shell
yum搜索bridge-util所在源
[root@S21614 ~]# yum search bridge
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
==================================================================== N/S matched: bridge ====================================================================
bridge-utils.x86_64 : Utilities for configuring the linux ethernet bridge
cockpit-bridge.x86_64 : Cockpit bridge server-side component
at-spi2-atk.x86_64 : A GTK+ module that bridges ATK to D-Bus at-spi
at-spi2-atk-devel.x86_64 : A GTK+ module that bridges ATK to D-Bus at-spi
ebtables.x86_64 : Ethernet Bridge frame table administration tool
kaccessible.x86_64 : An accessibility bridge plugin

  Name and summary matches only, use "search all" for everything.
  #独立安装bridge-utils.x86_64
[root@S21614 ~]# yum -y install bridge-utils.x86_64
```
如果没有yum环境可以使用离线安装方式，离线安装包地址：
https://www.linuxfromscratch.org/blfs/view/svn/basicnet/bridge-utils.html

## <span id="inline-blue">pipework安装</span>
<a id="download" href="/images/docker/pipwork/pipework"><i class="fa fa-download"></i><span>pipework下载</span> </a>
上传至服务器/usr/bin/目录下，并执行一下命令赋予可执行权限
```shell
chmod a+x /usr/bin/pipework
```

## <span id="inline-blue">容器自定义IP</span>
```shell
#拉取nginx镜像
docker pull centos
#生成容器centos7_1、centos7_2
docker run -itd --name centos7_1 --net=none eeb6ee3f44bd /bin/bash
docker run -itd --name centos7_2 --net=none eeb6ee3f44bd /bin/bash
#生成网桥，并将容器ip与网桥添加关联，为容器设置自定义IP 10.9.216.101对应设置IP地址,10.9.216.254是网关
pipework br0 centos7_1 10.9.216.101/24@10.9.216.254
pipework br0 centos7_2 10.9.216.102/24@10.9.216.254
[root@S21614 ~]# ifconfig
br0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.9.216.14  netmask 255.255.255.0  broadcast 0.0.0.0
        inet6 fe80::cd2:b8ff:fe65:6480  prefixlen 64  scopeid 0x20<link>
        inet6 10:9:216:0:10a5:faff:fe02:85b9  prefixlen 64  scopeid 0x0<global>
        ether 12:a5:fa:02:85:b9  txqueuelen 1000  (Ethernet)
        RX packets 66482  bytes 3751391 (3.5 MiB)
        RX errors 0  dropped 490  overruns 0  frame 0
        TX packets 64499  bytes 87368127 (83.3 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

docker0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
        ether 02:42:66:bb:45:a6  txqueuelen 0  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

eno1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet6 10:9:216:0:42f2:e9ff:fe0d:cfb4  prefixlen 64  scopeid 0x0<global>
        inet6 fe80::42f2:e9ff:fe0d:cfb4  prefixlen 64  scopeid 0x20<link>
        ether 40:f2:e9:0d:cf:b4  txqueuelen 1000  (Ethernet)
        RX packets 72999  bytes 5265597 (5.0 MiB)
        RX errors 0  dropped 8  overruns 0  frame 0
        TX packets 92671  bytes 93048588 (88.7 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device memory 0xa9a60000-a9a7ffff  
#将eno1网卡的ip地址移植到bro网桥,添加bro和eno1网关关联，为bro网桥和网关添加路由，以下命令必须在一行执行，否则会出现ssh断掉不能连接的情况
ip addr add 10.9.216.14/24 dev br0; \
ip addr del 10.9.216.14/24 dev eno1; \
brctl addif br0 eno1; \
route del default; \
route add default gw 10.9.216.254 dev br0

#删除网桥和网卡eno1关联(如果ssh断掉的情况下需要执行以下命令删除网卡和网桥关联，这一步需要机房登陆服务器操作)
brctl delif br0 eno1;

#brctl 相关命令

参数	说明	示例
addbr <bridge>	创建网桥	brctl addbr br10
delbr <bridge>	删除网桥	brctl delbr br10
addif <bridge> <device>	将网卡接口接入网桥	brctl addif br10 eth0
delif <bridge> <device>	删除网桥接入的网卡接口	brctl delif br10 eth0
show <bridge>	查询网桥信息	brctl show br10
stp <bridge> {on|off}	启用禁用 STP	brctl stp br10 off/on
showstp <bridge>	查看网桥 STP 信息	brctl showstp br10
setfd <bridge> <time>	设置网桥延迟	brctl setfd br10 10
showmacs <bridge>	查看 mac 信息	brctl showmacs br10
```
## <span id="inline-blue">验证</span>
宿主机访问容器centos7_1: 10.9.216.101
```shell
[root@S21614 ~]# ping 10.9.216.101
PING 10.9.216.101 (10.9.216.101) 56(84) bytes of data.
64 bytes from 10.9.216.101: icmp_seq=1 ttl=64 time=0.162 ms
64 bytes from 10.9.216.101: icmp_seq=2 ttl=64 time=0.047 ms
64 bytes from 10.9.216.101: icmp_seq=3 ttl=64 time=0.048 ms
64 bytes from 10.9.216.101: icmp_seq=4 ttl=64 time=0.048 ms
^X64 bytes from 10.9.216.101: icmp_seq=5 ttl=64 time=0.067 ms
64 bytes from 10.9.216.101: icmp_seq=6 ttl=64 time=0.048 ms
```

宿主机访问容器centos7_2: 10.9.216.102
```shell
[root@S21614 ~]# ping 10.9.216.102
PING 10.9.216.102 (10.9.216.102) 56(84) bytes of data.
64 bytes from 10.9.216.102: icmp_seq=1 ttl=64 time=0.160 ms
64 bytes from 10.9.216.102: icmp_seq=2 ttl=64 time=0.052 ms
64 bytes from 10.9.216.102: icmp_seq=3 ttl=64 time=0.048 ms
64 bytes from 10.9.216.102: icmp_seq=4 ttl=64 time=0.048 ms
64 bytes from 10.9.216.102: icmp_seq=5 ttl=64 time=0.048 ms
```

容器centos7_1访问宿主机10.9.216.14
```shell
#进入容器centos7_1内部
[root@S21614 ~]# docker exec -it centos7_1 /bin/bash
[root@f843b5d71fdb /]# ping 10.9.216.14
PING 10.9.216.14 (10.9.216.14) 56(84) bytes of data.
64 bytes from 10.9.216.14: icmp_seq=1 ttl=64 time=0.109 ms
64 bytes from 10.9.216.14: icmp_seq=2 ttl=64 time=0.059 ms
64 bytes from 10.9.216.14: icmp_seq=3 ttl=64 time=0.056 ms
64 bytes from 10.9.216.14: icmp_seq=4 ttl=64 time=0.058 ms
64 bytes from 10.9.216.14: icmp_seq=5 ttl=64 time=0.056 ms
64 bytes from 10.9.216.14: icmp_seq=6 ttl=64 time=0.056 ms
```
容器centos7_1(10.9.216.101)访问容器centos7_2(10.9.216.102)
```shell
[root@f843b5d71fdb /]# ping 10.9.216.102
PING 10.9.216.102 (10.9.216.102) 56(84) bytes of data.
64 bytes from 10.9.216.102: icmp_seq=1 ttl=64 time=0.197 ms
64 bytes from 10.9.216.102: icmp_seq=2 ttl=64 time=0.075 ms
64 bytes from 10.9.216.102: icmp_seq=3 ttl=64 time=0.070 ms
64 bytes from 10.9.216.102: icmp_seq=4 ttl=64 time=0.069 ms
```
容器centos7_2访问宿主机10.9.216.14
```shell
[root@9210f0ab69fe /]# ping 10.9.216.14 
PING 10.9.216.14 (10.9.216.14) 56(84) bytes of data.
64 bytes from 10.9.216.14: icmp_seq=1 ttl=64 time=0.088 ms
64 bytes from 10.9.216.14: icmp_seq=2 ttl=64 time=0.060 ms
64 bytes from 10.9.216.14: icmp_seq=3 ttl=64 time=0.057 ms
64 bytes from 10.9.216.14: icmp_seq=4 ttl=64 time=0.070 ms
```
容器centos7_2(10.9.216.101)访问容器centos7_1(10.9.216.102)
```shell
#进入容器centos7_2内部
[root@S21614 ~]# docker exec -it centos7_2 /bin/bash
[root@9210f0ab69fe /]# ping 10.9.216.101
PING 10.9.216.101 (10.9.216.101) 56(84) bytes of data.
64 bytes from 10.9.216.101: icmp_seq=1 ttl=64 time=0.114 ms
64 bytes from 10.9.216.101: icmp_seq=2 ttl=64 time=0.082 ms
64 bytes from 10.9.216.101: icmp_seq=3 ttl=64 time=0.072 ms
64 bytes from 10.9.216.101: icmp_seq=4 ttl=64 time=0.070 ms
```
服务器重启之后网桥信息会丢失，需要重新配置