---
title: MySQL注册为Windows服务
categories:
	- Windows
	- MySQL
date: 2022-05-26 18:23:20
tags: 
	- Windows
	- MySQL
---
<!-- toc -->

# <span id="inline-blue">配置环境变量</span>
新建系统变量名：MySQL_HOME:
路径：D:\MySQL5.6\mysql-5.6.41-winx64\mysql-5.6.41-winx64
![MySQL注册服务](/images/Windows/MySQL/WM_20220523_001.png)

# <span id="inline-blue">注册服务</span>
```bat
#cd命令进入MySQL bin目录，执行以下命令
#MySQL为注册的服务名称
#--defaults-file参数指定对应启动配置文件
#注意生成的默认密码
mysqld install MySQL --defaults-file="D:\MySQL5.6\mysql-5.6.41-winx64\mysql-5.6.41-winx64\my-default.ini"
```

# <span id="inline-blue">修改密码</span>
```sql
#方式一
mysql> set password for 用户名@localhost = password('新密码');
#方式二
mysql> mysqladmin -u用户名 -p旧密码 password 新密码;
#方式三
mysql> use mysql;
mysql> update user set password=password('123456') where user='root' and host='localhost';
mysql> flush privileges;
```


