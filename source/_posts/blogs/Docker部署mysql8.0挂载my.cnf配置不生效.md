---
title: Docker部署mysql8.0挂载my.cnf配置不生效
categories:
	- Docker
tags: 
	- Docker
	- MySQL
	
date: 2025-10-17 14:53:11
updated: 2025-10-17 14:53:11
---
<!-- toc -->
# <span id="inline-blue">环境</span>
OS:  window10
Docker: 27.5.1


# <span id="inline-blue">现象</span>
Docker部署mysql8.0,容器启动正常，宿主机相关文件目录挂载正常，甚至进入容器内，文件的内容也是一致的，但是mysql配置参数就是不生效。
mysql对应的配置文件内容如下：
```shell
# Copyright (c) 2017, Oracle and/or its affiliates. All rights reserved.
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; version 2 of the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301 USA

#
# The MySQL  Server configuration file.
#
# For explanations see
# http://dev.mysql.com/doc/mysql/en/server-system-variables.html

[mysql]

#设置mysql客户端默认字符集
default-character-set=utf8

[mysqld]
pid-file        = /var/run/mysqld/mysqld.pid
socket          = /var/run/mysqld/mysqld.sock
datadir         = /var/lib/mysql
secure-file-priv= NULL
# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0

sql_mode="NO_ENGINE_SUBSTITUTION"
#服务端使用的字符集默认为8比特编码的latin1字符集
character_set_server = utf8

#创建新表时将使用的默认存储引擎
default-storage-engine=INNODB

#默认加密方式
default_authentication_plugin=mysql_native_password

#设置不区分大小写
# 必须在安装好MySQL后 修改mySQL配置文件设置为不敏感，一旦启动后，再设置是无效的，而且启动报错；
# 如果已经晚了，那必须把MySQL数据库文件全部 删除，修改配置文件再启动。
lower_case_table_names=1
```

docker容器部署命令如下：
```shell
docker run  -v D:/dockerVolume/mysql8/conf/:/etc/mysql/conf.d -v D:/dockerVolume/mysql8/data:/var/lib/mysql -v D:/dockerVolume/mysql8/log:/var/log/mysql  --name mysql8 -e MYSQL_ROOT_PASSWORD=coship -p 3307:3306  -d mysql:8.0
```

# <span id="inline-blue">原因</span>
进入mysql容器内部登录出现如下提示：
```shell
bash-5.1# mysql -uroot -pcoship
mysql: [Warning] World-writable config file '/etc/mysql/conf.d/my.cnf' is ignored.
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 9
Server version: 8.0.43 MySQL Community Server - GPL

Copyright (c) 2000, 2025, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
```

配置文件权限过于宽松（全局可写），MySQL 出于安全考虑忽略了这个配置文件

# <span id="inline-blue">解决办法</span>
更改文件属性，设置为只读。

![Docker mysql配置](/images/docker/docker_20251017_001.png)

