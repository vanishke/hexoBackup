---
title: Windows环境Docker拉取MySQL镜像
categories: 
	- Docker
tags: 
	- Docker
	- Windows

date: 2021-06-08 15:47:21
updated: 2021-06-08 15:47:21
---

# 拉取镜像
![docker拉取mysql镜像01](/images/docker/docker_2021_06_07_015.png)

# 镜像参数设置

## 密码参数
```shell
MYSQL_ROOT_PASSWORD=coship
```
![docker拉取mysql镜像02](/images/docker/docker_2021_06_07_016.png)

# 镜像运行
![docker拉取mysql镜像03](/images/docker/docker_2021_06_07_017.png)


## 远程连接权限设置
![docker拉取mysql镜像04](/images/docker/docker_2021_06_07_018.png)
镜像运行成功后生成MySQL端口和IP地址映射192.168.99.100:32772
点击EXEC按钮生成mysql命令行窗口,登陆mysql并赋予远程登陆权限

```shell
	mysql -uroot -pcoship;
	GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'coship' WITH GRA
NT OPTION;
```
## navicate连接
设置对应参数测试连接
![docker拉取mysql镜像05](/images/docker/docker_2021_06_07_019.png)












