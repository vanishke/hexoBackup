---
title: Docker pull错误 Error response from
categories:
	- Docker
tags: 
	- Docker

date: 2023-06-30 14:49:20
updated: 2023-06-30 14:49:20
---
<!-- toc -->
# <span id="inline-blue">环境</span>
	Windows7
	DockerToolbox-18.03.0-ce.exe
# <span id="inline-blue">现象</span>
执行以下命令拉取nginx镜像提示
```shell
 docker pull nginx 
```
Error response from daemon: Get https://registry-1.docker.io/v2/: dial tcp: look
up registry-1.docker.io on 10.0.2.3:53: read udp 10.0.2.15:54424->10.0.2.3:53: i
# <span id="inline-blue">原因</span>
这类错误，因为虚拟机启动后默认使用10.0.2.3作为dns首选解析地址，这个地址在虚拟机肯定是不能识别的，得用8.8.8.8和114.114.114.114。在这里被坑了好久，对于Docker Toolbox来说，需要修改的是DNS域名解析，具体文件是/etc/resolv.conf，但是修改的是哪个resolv.conf文件需要明确。
使用Docker Quickstart Terminal启动的是VirtualBox。VirtualBox是一个开源的虚拟机软件，可在其上启动更多操作系统。在VirtualBox的目录下，也有/etc/resolv.conf这个文件，但是在VirtualBox启动一个新的操作系统后，若操作系统内部也有/etc/resolv.conf，就会覆盖VirtualBox目录下的有/etc/resolv.conf。，之前一直在修改VirtualBox目录下的/etc/resolv.conf，导致dns解析一直失败。

# <span id="inline-blue">解决办法</span>
使用docker-machine ssh  命令进入自建的操作系统，因为resolv.conf是只读的，因此需要输入sudo vi /etc/resolv.conf开始修改。修改完成后，按ESC输入 :wq 保存。
![Docker镜像](/images/docker/docker_20230630_001.png)

