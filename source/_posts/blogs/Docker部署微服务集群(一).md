---
title: Docker部署微服务集群(一)
categories:
	- Docker

tags: 
	- Docker
	- SpringCloud
	
date: 2024-11-24 16:12:05
updated: 2024-11-24 16:12:49
---
<!-- toc -->
# <span id="inline-blue">环境</span>
    Docker: 26.1.4
	
# <span id="inline-blue">背景</span>
项目模块打包后希望能通过Docker构建镜像部署，包括微服务模块以及基础服务模块（MySQL、redis、elasticsearch等）

# <span id="inline-blue">构建基础镜像</span>

## <span id="inline-blue">MySQL</span>
构建镜像上下文文件预览：
![Dockerfile MySQL](/images/docker/20241124/Docker_MySQL_20241124_001.png)
```Dockerfile
# 基础镜像
FROM mysql:5.7
# author
MAINTAINER 909754 <18685129726@163.com>
#工作目录
WORKDIR /docker-entrypoint-initdb.d
#编码
ENV LANG=C.UTF-8
# 拷贝初始化脚本
ADD db/init/start.sql /docker-entrypoint-initdb.d/
#拷贝SQL脚本
ADD db/sql/*.sql /opt/sql/
```
/docker-entrypoint-initdb.d/ : MySQL容器初始化执行的SQL脚本
db/sql/*.sql: 目录包含启动SQL文件start.sql,内容如下：
```mysql
source /opt/sql/nacos_config.sql;
source /opt/sql/init_table.sql;
source /opt/sql/init_data.sql;
```
MySQL配置文件my.cnf如下：
```shell
# Example MySQL config file for very large systems.
#
# This is for a large system with memory of 1G-2G where the system runs mainly
# MySQL.
#
# MySQL programs look for option files in a set of
# locations which depend on the deployment platform.
# You can copy this option file to one of those
# locations. For information about these locations, see:
# http://dev.mysql.com/doc/mysql/en/option-files.html
#
# In this file, you can use all long options that a program supports.
# If you want to know which options a program supports, run the program
# with the "--help" option.

# The following options will be passed to all MySQL clients
[client]
#password	= your_password
port		= 3306
#socket		= /home/mysqldata/mysql.sock
default-character-set=utf8

# Here follows entries for some specific programs

# The MySQL server
[mysqld]
port		= 3306
#socket		= /home/mysqldata/mysql.sock
lower_case_table_names=1
sql_mode="NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION"
#skip_grant_tables
datadir=/var/mysql/data
skip-external-locking
key_buffer_size = 384M
max_allowed_packet = 1000M
table_open_cache = 512
sort_buffer_size = 2M
read_buffer_size = 2M
read_rnd_buffer_size = 8M
myisam_sort_buffer_size = 64M
thread_cache_size = 8
query_cache_size = 32M
# Try number of CPU's*2 for #thread_concurrency
#thread_concurrency = 8
default-storage-engine=INNODB
innodb-file-per-table=1
event_scheduler = 1
max_connections = 1000
character_set_server = utf8
#log-bin="/var/log/mysql-bin.log"
#read-only=0
#binlog-do-db=sync_test
#binlog-ignore-db=mysql
max_binlog_size = 500M
expire_logs_days = 7
log_bin_trust_function_creators=TRUE
#log_error=/var/mysql/log/mysql-error.log
log_timestamps=SYSTEM
# Don't listen on a TCP/IP port at all. This can be a security enhancement,
# if all processes that need to connect to mysqld run on the same host.
# All interaction with mysqld must be made via Unix sockets or named pipes.
# Note that using this option without enabling named pipes on Windows
# (via the "enable-named-pipe" option) will render mysqld useless!
#
#skip-networking

# Replication Master Server (default)
# binary logging is required for replication
#log-bin=mysql-bin

# required unique id between 1 and 2^32 - 1
# defaults to 1 if master-host is not set
# but will not function as a master if omitted
server-id	= 1

# Replication Slave (comment out master section to use this)
#
# To configure this host as a replication slave, you can choose between
# two methods :
#
# 1) Use the CHANGE MASTER TO command (fully described in our manual) -
#    the syntax is:
#
#    CHANGE MASTER TO MASTER_HOST=<host>, MASTER_PORT=<port>,
#    MASTER_USER=<user>, MASTER_PASSWORD=<password> ;
#
#    where you replace <host>, <user>, <password> by quoted strings and
#    <port> by the master's port number (3306 by default).
#
#    Example:
#
#    CHANGE MASTER TO MASTER_HOST='125.564.12.1', MASTER_PORT=3306,
#    MASTER_USER='joe', MASTER_PASSWORD='secret';
#
# OR
#
# 2) Set the variables below. However, in case you choose this method, then
#    start replication for the first time (even unsuccessfully, for example
#    if you mistyped the password in master-password and the slave fails to
#    connect), the slave will create a master.info file, and any later
#    change in this file to the variables' values below will be ignored and
#    overridden by the content of the master.info file, unless you shutdown
#    the slave server, delete master.info and restart the slaver server.
#    For that reason, you may want to leave the lines below untouched
#    (commented) and instead use CHANGE MASTER TO (see above)
#
# required unique id between 2 and 2^32 - 1
# (and different from the master)
# defaults to 2 if master-host is set
# but will not function as a slave if omitted
#server-id       = 2
#
# The replication master for this slave - required
#master-host     =   <hostname>
#
# The username the slave will use for authentication when connecting
# to the master - required
#master-user     =   <username>
#
# The password the slave will authenticate with when connecting to
# the master - required
#master-password =   <password>
#
# The port the master is listening on.
# optional - defaults to 3306
#master-port     =  <port>
#
# binary logging - not required for slaves, but recommended
#log-bin=mysql-bin
#
# binary logging format - mixed recommended
binlog_format=ROW
binlog_row_image=FULL

# Uncomment the following if you are using InnoDB tables
#innodb_data_home_dir = /data/mysqldata/mysql
#innodb_data_file_path = ibdata1:2000M;ibdata2:10M:autoextend
#innodb_log_group_home_dir = /data/mysqldata/mysql
# You can set .._buffer_pool_size up to 50 - 80 %
# of RAM but beware of setting memory usage too high
innodb_buffer_pool_size = 384M
#innodb_additional_mem_pool_size = 20M
# Set .._log_file_size to 25 % of buffer pool size
#innodb_log_file_size = 100M
#innodb_log_buffer_size = 8M
#innodb_flush_log_at_trx_commit = 1
#innodb_lock_wait_timeout = 50
#secure-file-priv=""
[mysqldump]
quick
max_allowed_packet = 16M

[mysql]
no-auto-rehash
# Remove the next comment character if you are not familiar with SQL
#safe-updates

[myisamchk]
key_buffer_size = 256M
sort_buffer_size = 256M
read_buffer = 2M
write_buffer = 2M

[mysqlhotcopy]
interactive-timeout
```
/opt/sql/: 数据库初始化脚本nacos_config.sql、init_table.sql、init_data.sql所在位置

## <span id="inline-blue">Redis</span>
构建镜像上下文文件预览：
![Dockerfile Redis](/images/docker/20241124/Docker_Redis_20241124_002.png)
```Dockerfile
#基础镜像
FROM redis:5.0.14
#author
MAINTAINER 909754 <18685129726@163.com>
#拷贝配置文件
COPY ./conf/redis.conf /etc/redis/redis.conf
#暴露服务端口
EXPOSE 6379
# 启动Redis服务器
CMD [ "redis-server", "/etc/redis/redis.conf" ]
```