---
title: Linux RabbitMQ安装部署
categories:
	- RabbitMQ
tags: 
	- Linux
	- RabbitMQ
	
date: 2024-09-20 14:14:20
updated: 2024-09-20 14:14:20
---
<!-- toc -->

# <span id="inline-blue">环境</span>

Linux: CentOS Linux release 7.4.1708 (Core) 
Erlang: erlang-21.3.8.16-1.el7.x86_64.rpm
RabbitMQ: rabbitmq-server-3.8.8-1.el7.noarch.rpm
# <span id="inline-blue">安装包下载</span>
RabbitMQ安装需要依赖Erlang环境，两者版本对应关系如下：
![RabbitMQ&Erlang版本关系](/images/RabbitMQ/RabbitMQ_20240920_001.png)
版本对应详情地址：https://www.rabbitmq.com/docs/which-erlang
选择安装版本如下：
Erlang: 21.3.8.16
RabbitMQ：3.8.8
Erlang下载地址：
https://packagecloud.io/rabbitmq/erlang/packages/el/7/erlang-21.3.8.16-1.el7.x86_64.rpm
RabbitMQ下载地址：
https://github.com/rabbitmq/rabbitmq-server/releases/download/v3.8.8/rabbitmq-server-3.8.8-1.el7.noarch.rpm

# <span id="inline-blue">Erlang安装</span>
创建RabbitMQ安装包存放路径
```shell
mkdir /usr/local/rabbitMQ
```
将erlang-21.3.8.16-1.el7.x86_64.rpm、rabbitmq-server-3.8.8-1.el7.noarch.rpm对应安装包文件通过xftp上传至/usr/local/rabbitMQ路径
执行安装命令
```shell
rpm -ivh erlang-21.3.8.16-1.el7.x86_64.rpm
#安装完成验证是否安装成功
erl -v
Erlang/OTP 21 [erts-10.3.5.12] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [hipe]

Eshell V10.3.5.12  (abort with ^G)
```

# <span id="inline-blue">RabbitMQ安装</span>

RabbitMQ安装过程中需要依赖socat插件，安装命令如下：
```shell
yum install socat -y
```
安装RabbitMQ命令如下：
```shell
rpm -ivh rabbitmq-server-3.8.8-1.el7.noarch.rpm
```

RabbitMQ服务相关命令：
```shell
# 加入系统自启动
systemctl enable rabbitmq-server
# 启动服务
systemctl start rabbitmq-server
# 停止服务
systemctl stop rabbitmq-server
# 查看服务状态
systemctl status rabbitmq-server
```
![RabbitMQ状态信息](/images/RabbitMQ/RabbitMQ_20240920_003.png)

## <span id="inline-blue">RabbitMQ后台管理及授权</span>

RabbitMQ通信端口：5672
RabbitMQ后台访问web端口：15672
RabbitMQ后台管理相关插件默认没有开启，开启管理后台web服务的命令如下：
```shell
#开启插件
rabbitmq-plugins enable rabbitmq_management
#重启服务
systemctl restart rabbitmq-server
```
RabbitMQ默认用户guest仅限于localhost主机访问，添加管理用户并赋予权限用于管理后台操作
```shell
# 创建账号admin、密码admin
rabbitmqctl add_user admin admin

# 设置用户admin角色
rabbitmqctl set_user_tags admin administrator

# 为用户添加资源权限，添加配置、写、读权限
# set_permissions [-p <vhostpath>] <user> <conf> <write> <read>
rabbitmqctl set_permissions -p "/" admin ".*" ".*" ".*"
```
角色固定有四种级别：
administrator：可以登录控制台、查看所有信息、并对rabbitmq进行管理
monToring：监控者；登录控制台，查看所有信息
policymaker：策略制定者；登录控制台指定策略
managment：普通管理员；登录控制

添加完用户后访问管理后台http://127.0.0.1:15672
![RabbitMQ后台管理](/images/RabbitMQ/RabbitMQ_20240920_003.png)

# <span id="inline-blue">安装过程中问题总结</span>

## <span id="inline-blue">unknown command: erl. Perhaps you have to reshim?</span>
错误提示貌似看着是Erlang环境的问题，实际是RabbitMQ安装之后的相关命令和之前卸载遗留的文件冲突导致
本次安装RabbitMQ生成命令所在位置/usr/lib/bin,命令如下：
![RabbitMQ后台管理](/images/RabbitMQ/RabbitMQ_20240920_004.png)
遗留的命令文件所在位置/usr/sbin
比对之后发现两个位置的文件大小和时间不一致

解决办法：
删除/usr/sbin目录下的rabibtmq相关命令
通过软连接命令ln -s 将/usr/lib/bin路径下的文件链接到/usr/sbin（软连接命令使用绝对路径、否则因为文件层级太多可能导致报错）
```shell
ln -s /usr/lib/rabbitmq/lib/rabbitmq_server-3.8.8/sbin/rabbitmqctl /usr/sbin/rabbitmqctl
ln -s /usr/lib/rabbitmq/lib/rabbitmq_server-3.8.8/sbin/rabbitmq-defaults /usr/sbin/rabbitmq-defaults
ln -s /usr/lib/rabbitmq/lib/rabbitmq_server-3.8.8/sbin/rabbitmq-diagnostics /usr/sbin/rabbitmq-diagnostics
ln -s /usr/lib/rabbitmq/lib/rabbitmq_server-3.8.8/sbin/rabbitmq-env /usr/sbin/rabbitmq-env
ln -s /usr/lib/rabbitmq/lib/rabbitmq_server-3.8.8/sbin/rabbitmq-plugins /usr/sbin/rabbitmq-plugins
ln -s /usr/lib/rabbitmq/lib/rabbitmq_server-3.8.8/sbin/rabbitmq-queues /usr/sbin/rabbitmq-queues
ln -s /usr/lib/rabbitmq/lib/rabbitmq_server-3.8.8/sbin/rabbitmq-server /usr/sbin/rabbitmq-server
ln -s /usr/lib/rabbitmq/lib/rabbitmq_server-3.8.8/sbin/rabbitmq-upgrade /usr/sbin/rabbitmq-upgrade
```
## <span id="inline-blue">Authentication failed (rejected by the remote node), please check the Erlang cookie</span>
错误信息如下：
```shell
rabbit@izrj9fqhk4voecczvplwe1z:
  * connected to epmd (port 4369) on izrj9fqhk4voecczvplwe1z
  * epmd reports node 'rabbit' uses port 25672 for inter-node and CLI tool traffic 
  * TCP connection succeeded but Erlang distribution failed 

  * Authentication failed (rejected by the remote node), please check the Erlang cookie
```
问题原因是因为erlang生成的.erlang.cookie文件和之前生成不一致导致

本次安装生成.erlang.cookie所在位置:/var/lib/rabbitmq/.erlang.cookie

卸载残留文件所在位置:/root

比对之后发现两个位置的文件不一致，.erlang.cookie是实现分布式一致性的关键所在

解决办法：
将/var/lib/rabbitmq/.erlang.cookie拷贝一份到/root目录下即可。

参考：https://www.cnblogs.com/crysmile/p/9471456.html
