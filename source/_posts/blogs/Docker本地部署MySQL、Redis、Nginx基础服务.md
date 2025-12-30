---
title: Docker本地部署MySQL、Redis、Nginx基础服务
categories: 
	- Docker
tags: 
	- MySQL
	- Nginx
	- Redis
	- Elasticsearch
	
date: 2025-12-29 17:52:08
updated: 2025-12-29 17:52:08
---
<!-- toc -->

# <span id="inline-blue">环境</span>

OS： Windows10
MySQL： 5.7.41、8.0
Redis: 5.0.14
Elasticsearch： 8.8.0


# <span id="inline-blue">背景</span>

在现代软件开发中，本地开发环境往往需要部署多种基础服务，如MySQL、Redis、Elasticsearch、Nginx等。选择合适的部署方式对于提升开发效率和维护成本至关重要。下面我们将对比传统本地安装方式和Docker容器化部署方式的优缺点。

## <span id="inline-blue">传统本地安装方式</span>

### 优点

- **性能优势**：直接运行在宿主机上，没有容器虚拟化层的性能开销
- **资源占用**：无需额外的容器运行时环境，资源占用相对较小
- **系统集成**：可以更好地与操作系统集成，便于系统级监控和管理

### 缺点

- **安装复杂**：需要下载安装包、配置环境变量、修改系统配置等，步骤繁琐
- **版本管理困难**：不同版本之间切换需要卸载重装，无法同时运行多个版本
- **环境污染**：安装过程中会在系统目录留下大量文件，卸载时容易产生残留
- **配置分散**：配置文件、数据文件、日志文件分散在系统各处，管理不便
- **跨平台差异**：Windows、Linux、macOS上的安装和配置方式差异较大
- **团队协作困难**：不同开发者的环境配置可能不一致，导致"在我机器上能跑"的问题
- **清理困难**：卸载服务后，注册表、配置文件、日志等残留文件难以彻底清理

## <span id="inline-blue">Docker容器化部署方式</span>

### 优点

- **快速部署**：一条命令即可启动服务，无需复杂的安装配置过程，几分钟内完成环境搭建
- **环境隔离**：每个服务运行在独立的容器中，互不干扰，避免版本冲突和依赖问题
- **版本灵活**：可以同时运行多个版本的服务（如MySQL 5.7和8.0），通过端口映射轻松区分
- **易于管理**：可以轻松启动、停止、删除容器，一键清理，不会在系统中留下残留文件
- **配置集中**：通过数据卷挂载，配置文件、数据、日志统一管理，结构清晰
- **跨平台一致性**：Docker镜像在不同操作系统上表现一致，减少环境差异带来的问题
- **团队协作**：使用相同的镜像和配置，确保团队成员环境一致，避免环境问题
- **数据持久化**：通过数据卷挂载，确保数据安全可靠，容器删除不影响数据
- **资源可控**：可以限制容器的CPU、内存使用，更好地管理系统资源

### 缺点

- **性能开销**：存在容器虚拟化层的性能开销，但对于开发环境影响可忽略不计
- **学习成本**：需要学习Docker的基本概念和命令，有一定的学习曲线
- **资源占用**：需要运行Docker守护进程，占用一定的系统资源
- **网络配置**：容器网络配置相对复杂，需要理解端口映射、网络模式等概念

## <span id="inline-blue">为什么选择Docker部署</span>

综合对比两种方式，**对于本地开发环境，Docker容器化部署方式具有明显优势**：

1. **开发效率优先**：开发环境更注重快速搭建和灵活切换，而非极致性能。Docker的一条命令部署相比传统方式的繁琐安装，能显著提升开发效率。

2. **多版本共存需求**：在实际开发中，经常需要同时测试不同版本的服务（如MySQL 5.7和8.0），Docker可以轻松实现，而传统方式几乎不可能。

3. **环境一致性保障**：团队协作中，Docker确保所有开发者使用相同的环境配置，减少"环境问题"导致的bug，提高协作效率。

4. **清理和维护便利**：开发环境经常需要重置和重建，Docker的容器化特性使得清理和维护变得极其简单，不会污染系统。

5. **学习成本可控**：虽然需要学习Docker，但一旦掌握，可以应用到所有服务的部署，学习成本分摊后非常值得。

6. **生产环境对接**：使用Docker部署本地环境，可以更好地模拟生产环境的容器化部署，减少开发和生产环境的差异。

因此，**本文选择使用Docker方式部署本地开发环境**，帮助开发者快速、灵活、一致地搭建基础服务环境。

本文将详细介绍如何在Windows环境下使用Docker部署MySQL、Redis、Elasticsearch和Nginx等常用基础服务，提供完整的部署步骤和配置说明。



 # <span id="inline-blue">实现</span>
 
 ## <span id="inline-blue">MySQL</span>
 
 MySQL部署常用版本分为5.7和8.0，两个版本部署方式分别介绍如下：
 
 ### <span id="inline-blue">MySQL-5.7</span>
 
 在部署MySQL 5.7之前，需要先在Windows系统上创建对应的目录用于数据持久化：
 
 - `D:/dockerVolume/mysql7/conf/` - 配置文件目录
 - `D:/dockerVolume/mysql7/data` - 数据存储目录
 - `D:/dockerVolume/mysql7/log` - 日志目录
 
 执行以下命令启动MySQL 5.7容器：
 
 ```bash
 docker run -v D:/dockerVolume/mysql7/conf/:/etc/mysql/mysql.conf.d \
   -v D:/dockerVolume/mysql7/data:/var/lib/mysql \
   -v D:/dockerVolume/mysql7/log:/var/log/mysql \
   --name mysql5.7 \
   -e MYSQL_ROOT_PASSWORD=coship \
   -p 3307:3306 \
   -d mysql:5.7.41
 ```
 
 **参数说明：**
 - `-v D:/dockerVolume/mysql7/conf/:/etc/mysql/mysql.conf.d` - 挂载配置文件目录
 - `-v D:/dockerVolume/mysql7/data:/var/lib/mysql` - 挂载数据目录，实现数据持久化
 - `-v D:/dockerVolume/mysql7/log:/var/log/mysql` - 挂载日志目录
 - `--name mysql5.7` - 容器名称
 - `-e MYSQL_ROOT_PASSWORD=coship` - 设置root用户密码
 - `-p 3307:3306` - 端口映射，将容器3306端口映射到主机3307端口
 - `-d` - 后台运行
 
 **配置文件位置：**
 
 MySQL 5.7的配置文件位于 `D:/dockerVolume/mysql7/conf/` 目录下，可根据需要进行自定义配置。
 
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

#设置不区分大小写
# 必须在安装好MySQL后 修改mySQL配置文件设置为不敏感，一旦启动后，再设置是无效的，而且启动报错；
# 如果已经晚了，那必须把MySQL数据库文件全部 删除，修改配置文件再启动。
lower_case_table_names=1

[mysqld]
# 错误日志（必须开启）
log-error = /var/log/mysql/error.log  
# 慢查询日志（可选，需开启）
slow_query_log = 1  
slow_query_log_file = /var/log/mysql/slow.log 
# 超过2秒的查询记录为慢查询 
long_query_time = 2  
# 二进制日志（可选，需开启）
log-bin = /var/lib/mysql/mysql-bin  
binlog_format = ROW  


 ```
 
 ### <span id="inline-blue">MySQL-8.0</span>
 
 MySQL 8.0的部署方式与5.7类似，同样需要创建对应的目录：
 
 - `D:/dockerVolume/mysql8/conf/` - 配置文件目录
 - `D:/dockerVolume/mysql8/data` - 数据存储目录
 - `D:/dockerVolume/mysql8/log` - 日志目录
 
 执行以下命令启动MySQL 8.0容器：
 
 ```bash
 docker run -v D:/dockerVolume/mysql8/conf/:/etc/mysql/conf.d \
   -v D:/dockerVolume/mysql8/data:/var/lib/mysql \
   -v D:/dockerVolume/mysql8/log:/var/log/mysql \
   --name mysql8 \
   -e MYSQL_ROOT_PASSWORD=coship \
   -p 3308:3306 \
   -d mysql:8.0
 ```
 
 **参数说明：**
 - `-v D:/dockerVolume/mysql8/conf/:/etc/mysql/conf.d` - 挂载配置文件目录（8.0版本配置路径与5.7不同）
 - `-v D:/dockerVolume/mysql8/data:/var/lib/mysql` - 挂载数据目录
 - `-v D:/dockerVolume/mysql8/log:/var/log/mysql` - 挂载日志目录
 - `--name mysql8` - 容器名称
 - `-e MYSQL_ROOT_PASSWORD=coship` - 设置root用户密码
 - `-p 3308:3306` - 端口映射，将容器3306端口映射到主机3308端口（避免与5.7版本冲突）
 - `-d` - 后台运行
 
 **配置文件位置：**
 
 MySQL 8.0的配置文件位于 `D:/dockerVolume/mysql8/conf/` 目录下，可根据需要进行自定义配置。
 
 ## <span id="inline-blue">Redis</span>
 
 Redis部署前需要准备配置文件和数据目录：
 
 - `D:/dockerVolume/redis/data` - 数据存储目录
 - `D:/dockerVolume/redis/conf/redis.conf` - Redis配置文件
 
 执行以下命令启动Redis容器：
 
 ```bash
 docker run -d --name redis \
   -p 6379:6379 \
   -v D:/dockerVolume/redis/data:/data \
   -v D:/dockerVolume/redis/conf/redis.conf:/etc/redis/redis.conf \
   redis:5.0.14 \
   redis-server /etc/redis/redis.conf
 ```
 
 **参数说明：**
 - `-d` - 后台运行
 - `--name redis` - 容器名称
 - `-p 6379:6379` - 端口映射，Redis默认端口
 - `-v D:/dockerVolume/redis/data:/data` - 挂载数据目录
 - `-v D:/dockerVolume/redis/conf/redis.conf:/etc/redis/redis.conf` - 挂载配置文件
 - `redis-server /etc/redis/redis.conf` - 使用指定配置文件启动Redis服务
 
 **配置文件位置：**
 
 Redis配置文件位于 `D:/dockerVolume/redis/conf/redis.conf`，可根据需要进行自定义配置。
 
 **Redis配置文件示例：**
 
 ```conf
# 请使用 redis-server 配置文件路径 来启动redis

# 请注意一下配置文件的数据单位，大小写不敏感
# 1k => 1000 bytes
# 1kb => 1024 bytes
# 1m => 1000000 bytes
# 1mb => 1024*1024 bytes
# 1g => 1000000000 bytes
# 1gb => 1024*1024*1024 bytes

################################################################################
#                               redis 的基础配置                                 #
################################################################################

# 是否作为守护进程运行，生产环境用yes
daemonize no

# 如果作为守护进程运行的话，redis会把pid打印到这个文件
# 主要多实例的时候需要写成不同的文件
pidfile /var/run/redis_6379.pid

# redis监听的端口，注意多实例的情况
port 6379

# 允许访问redis的ip
# 测试环境注释该选项，生产环境把所有允许访问的ip都打一次
bind 0.0.0.0

# 关闭无消息的客户端的间隔，0为关闭该功能
timeout 0

# 对客户端发送ACK信息，linux中单位为秒
tcp-keepalive 0

# 数据库的数量，我们的游戏建议为1，然后多开实例
databases 16

################################################################################
#                              redis 的持久化配置                                #
################################################################################

# save 间隔 最小更新操作
# 900秒（15分钟）之后，且至少1次变更
# 300秒（5分钟）之后，且至少10次变更
# 60秒之后，且至少10000次变更
# 如果完全作为缓存开启把save全删了
save 900 1
save 300 10
save 60 10000

# 持久化失败以后，redis是否停止
stop-writes-on-bgsave-error no

# 持久化的时候是否运行对字符串对象进行压缩，算法为LZF
rdbcompression yes

# 文件末尾是否包含一个CRC64的校验和
rdbchecksum yes

# redis存储数据的文件，注意多实例的时候该不同名字或者用不同的工作目录
dbfilename dump.rdb

# redis的工作目录，注意多实例的时候该不同名字或者用不同的工作目录
# 建议用不同的工作目录
dir /data


################################################################################
#                                 redis 的限制                                  #
################################################################################

# 设置最多同时连接客户端数量。
# 默认没有限制，这个关系到Redis进程能够打开的文件描述符数量。
# 特殊值"0"表示没有限制。
# 一旦达到这个限制，Redis会关闭所有新连接并发送错误"达到最大用户数上限（max number of
# clients reached）"
#
# maxclients 128

# 不要用比设置的上限更多的内存。一旦内存使用达到上限，Redis会根据选定的回收策略
#（参见：maxmemmory-policy）删除key。
#
# 如果因为删除策略问题Redis无法删除key，或者策略设置为 "noeviction"，Redis会回复需要更多内存
# 的错误信息给命令。
# 例如，SET,LPUSH等等。但是会继续合理响应只读命令，比如：GET。
#
# 在使用Redis作为LRU缓存，或者为实例设置了硬性内存限制的时候（使用 "noeviction" 策略）的时候，
# 这个选项还是满有用的。
#
# 警告：当一堆slave连上达到内存上限的实例的时候，响应slave需要的输出缓存所需内存不计算在使用内存
# 当中。
# 这样当请求一个删除掉的key的时候就不会触发网络问题／重新同步的事件，然后slave就会收到一堆删除指
# 令，直到数据库空了为止。
#
# 简而言之，如果你有slave连上一个master的话，那建议你把master内存限制设小点儿，确保有足够的系统
# 内存用作输出缓存。
# （如果策略设置为"noeviction"的话就不无所谓了）
#
maxmemory 1gb

# 内存策略：如果达到内存限制了，Redis如何删除key。你可以在下面五个策略里面选：
#
# volatile-lru -> 根据LRU算法生成的过期时间来删除。
# allkeys-lru -> 根据LRU算法删除任何key。
# volatile-random -> 根据过期设置来随机删除key。
# allkeys->random -> 无差别随机删。
# volatile-ttl -> 根据最近过期时间来删除（辅以TTL）
# noeviction -> 谁也不删，直接在写操作时返回错误。
#
# 注意：对所有策略来说，如果Redis找不到合适的可以删除的key都会在写操作时返回一个错误。
#
#     这里涉及的命令：set setnx setex append
#     incr decr rpush lpush rpushx lpushx linsert lset rpoplpush sadd
#     sinter sinterstore sunion sunionstore sdiff sdiffstore zadd zincrby
#     zunionstore zinterstore hset hsetnx hmset hincrby incrby decrby
#     getset mset msetnx exec sort
#
# 默认值如下：
#
# maxmemory-policy volatile-lru

maxmemory-policy allkeys-lru

# LRU和最小TTL算法的实现都不是很精确，但是很接近（为了省内存），所以你可以用样例做测试。
# 例如：默认Redis会检查三个key然后取最旧的那个，你可以通过下面的配置项来设置样本的个数。
#
# maxmemory-samples 3

################################################################################
#                               redis 的累加模式                                 #
################################################################################

# 默认情况下，Redis是异步的把数据导出到磁盘上。这种情况下，当Redis挂掉的时候，最新的数据就丢了。
# 如果不希望丢掉任何一条数据的话就该用纯累加模式：一旦开启这个模式，Redis会把每次写入的数据在接收
# 后都写入 appendonly.aof 文件。
# 每次启动时Redis都会把这个文件的数据读入内存里。
#
# 注意，异步导出的数据库文件和纯累加文件可以并存（你得把上面所有"save"设置都注释掉，关掉导出机制）。
# 如果纯累加模式开启了，那么Redis会在启动时载入日志文件而忽略导出的 dump.rdb 文件。
#
# 重要：查看 BGREWRITEAOF 来了解当累加日志文件太大了之后，怎么在后台重新处理这个日志文件。
appendonly yes

# 纯累加文件名字（默认："appendonly.aof"）
appendfilename appendonly.aof

# 纯累加文件的flush频率
# always    ->  每次写入都flush，最安全，资源开销最大
# everysec  ->  每秒 (推荐)
# no        ->  由系统确定

# appendfsync always
appendfsync everysec
# appendfsync no

# 当纯累加文件进行rewrite时，是否需要fsync
# 当且仅当appendfsync = always || everysec 时该参数生效
no-appendfsync-on-rewrite no

# 纯累加文件下次rewrite的比例，与纯累加文件文件的最小size
# 下面的参数意味着纯累加文件会在512mb的时候进行一次rewrite
# 若rewrite后的文件大小为x mb，则下次纯累加文件将会在2x mb时rewrite
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 128mb

################################################################################
#                                redis 的高级配置                                #
################################################################################

# 如果hash中的数量超出hash-max-ziplist-entries，或者value的长度超出
# hash-max-ziplist-value，将改成保存dict，否则以ziphash的方式存储以节省空间。以下同理。
hash-max-ziplist-entries 64
hash-max-ziplist-value 128

list-max-ziplist-entries 64
list-max-ziplist-value 128

set-max-intset-entries 64

zset-max-ziplist-entries 64
zset-max-ziplist-value 128

# 是否resize hash? 如果你设置成no需要在源码做一定的修改以防止有人进行hash攻击
activerehashing yes

################################################################################
#                               redis 的日志配置                                 #
################################################################################

# 日志等级 debug, verbose, notice, warning。生产环境建议用notice
loglevel notice

# 日志输出的文件名
logfile ""

# 是否将日志写入系统日志，默认为no，建议为no
syslog-enabled no

# 在系统日志中的标识
# syslog-ident redis

# 写到哪个系统日志中 USER或者LOCAL0-LOCAL7.
# syslog-facility local0

################################################################################
#                               redis 的主从配置                                 #
################################################################################

# 主从同步。通过 slaveof 配置来实现Redis实例的备份。本实例作为远程redis的从服务器。
# 注意，这里是本地从远端复制数据。也就是说，本地可以有不同的数据库文件、绑定不同的IP、监听不同的
# 端口。
# 注意如果不在本机的话，需要bind ip
#
# slaveof <masterip> <masterport>

# 如果master设置了密码（通过下面的 "requirepass" 选项来配置），那么slave在开始同步之前必须
# 进行身份验证，否则它的同步请求会被拒绝。
#
# masterauth <master-password>

# 当一个slave失去和master的连接，或者同步正在进行中，slave的行为有两种可能：
#
# 1) 如果 slave-serve-stale-data 设置为 "yes" (默认值)，slave会继续响应客户端请求，可能
# 是正常数据，也可能是还没获得值的空数据。
# 2) 如果 slave-serve-stale-data 设置为 "no"，slave会回复"正在从master同步（SYNC with
# master in progress）"来处理各种请求，除了 INFO 和 SLAVEOF 命令。
#
# slave-serve-stale-data yes

# 从数据库是否只读
#slave-read-only yes

# slave根据指定的时间间隔向服务器发送ping请求。
# 时间间隔可以通过 repl_ping_slave_period 来设置。
# 默认10秒。
#
# repl-ping-slave-period 10

# 下面的选项设置了大块数据I/O、向master请求数据和ping响应的过期时间。
# 默认值60秒。
#
# 一个很重要的事情是：确保这个值比 repl-ping-slave-period 大，否则master和slave之间的传输
# 过期时间比预想的要短。
#
# repl-timeout 60

# 主服务器是否将部分数据包合并成一个大的数据包再发出
# 在内网情况请设置为no
#repl-disable-tcp-nodelay no

# 从服务器的优先级，默认为100。
# 当主服务器挂掉的时候，选择哪个从服务器作为主服务器，优先级数字低的会优先成为主服务器。
# 0代表永远不做主服务器。
#slave-priority 100

# 对客户端输出缓冲进行限制可以强迫那些就不从服务器读取数据的客户端断开连接。对于normal client，
# 第一个0表示取消hard limit，第二个0和第三个0表示取消soft limit，normal client默认取消限
# 制，因为如果没有寻问，他们是不会接收数据的。
#client-output-buffer-limit normal 0 0 0
# 对于slave client和MONITER client，如果client-output-buffer一旦超过256mb，又或者超过
# 64mb持续60秒，那么服务器就会立即断开客户端连接。
#client-output-buffer-limit slave 256mb 64mb 60
# 对于pubsub client，如果client-output-buffer一旦超过32mb，又或者超过8mb持续60秒，那么
# 服务器就会立即断开客户端连接。
#client-output-buffer-limit pubsub 32mb 8mb 60


################################################################################
#                               redis 的安全配置                                 #
################################################################################

# 要求客户端在处理任何命令时都要验证身份和密码。
# 这在你信不过来访者时很有用。
#
# 为了向后兼容的话，这段应该注释掉。而且大多数人不需要身份验证（例如：它们运行在自己的服务器上。）
#
# 警告：因为Redis太快了，所以居心不良的人可以每秒尝试150k的密码来试图破解密码。
# 这意味着你需要一个高强度的密码，否则破解太容易了。
#
requirepass coshipOk698?

# 命令重命名
# 当redis至于外网环境的时候需要重命名一些危险的命令如CONFIG:
# rename-command CONFIG b840fc02d524045429941cc15f59e41cb7be6c52
 ```
 
 ## <span id="inline-blue">Elasticsearch</span>
 
 Elasticsearch部署需要先从一个临时容器中拷贝默认配置，然后再启动正式容器。
 
 **步骤1：启动临时容器并拷贝配置**
 
 首先启动一个临时Elasticsearch容器（容器ID示例：0133）：
 
 ```bash
 docker run -d --name elasticsearch-temp elasticsearch:8.8.0
 ```
 
 从临时容器中拷贝配置、数据和日志目录到本地：
 
 ```bash
 docker cp 0133:/usr/share/elasticsearch/data D:/dockerVolume/elasticsearch/
 docker cp 0133:/usr/share/elasticsearch/config D:/dockerVolume/elasticsearch/
 docker cp 0133:/usr/share/elasticsearch/logs D:/dockerVolume/elasticsearch/
 ```
 
 拷贝完成后，删除临时容器：
 
 ```bash
 docker rm -f elasticsearch-temp
 ```
 
 **步骤2：启动正式容器**
 
 执行以下命令启动Elasticsearch容器：
 
 ```bash
 docker run -v D:/dockerVolume/elasticsearch/data/:/usr/share/elasticsearch/data \
   -v D:/dockerVolume/elasticsearch/config/:/usr/share/elasticsearch/config \
   -v D:/dockerVolume/elasticsearch/logs/:/usr/share/elasticsearch/logs \
   --name elasticsearch \
   -p 9200:9200 \
   -p 9300:9300 \
   -d elasticsearch:8.8.0
 ```
 
 **参数说明：**
 - `-v D:/dockerVolume/elasticsearch/data/:/usr/share/elasticsearch/data` - 挂载数据目录
 - `-v D:/dockerVolume/elasticsearch/config/:/usr/share/elasticsearch/config` - 挂载配置目录
 - `-v D:/dockerVolume/elasticsearch/logs/:/usr/share/elasticsearch/logs` - 挂载日志目录
 - `--name elasticsearch` - 容器名称
 - `-p 9200:9200` - HTTP API端口映射
 - `-p 9300:9300` - 节点间通信端口映射
 - `-d` - 后台运行
 
 **配置文件位置：**
 
 Elasticsearch配置文件位于 `D:/dockerVolume/elasticsearch/config/` 目录下，可根据需要进行自定义配置。
 
 **Elasticsearch配置文件示例：**
 
 ```yaml
 cluster.name: "docker-cluster"
network.host: 0.0.0.0

#----------------------- BEGIN SECURITY AUTO CONFIGURATION -----------------------
#
# The following settings, TLS certificates, and keys have been automatically      
# generated to configure Elasticsearch security features on 17-10-2025 08:20:43
#
# --------------------------------------------------------------------------------

# Enable security features
xpack.security.enabled: false

xpack.security.enrollment.enabled: false

# Enable encryption for HTTP API client connections, such as Kibana, Logstash, and Agents
xpack.security.http.ssl:
  enabled: false
  keystore.path: certs/http.p12

# Enable encryption and mutual authentication between cluster nodes
xpack.security.transport.ssl:
  enabled: false
  verification_mode: certificate
  keystore.path: certs/transport.p12
  truststore.path: certs/transport.p12
# Create a new cluster with the current node only
# Additional nodes can still join the cluster later
cluster.initial_master_nodes: ["01334468b92f"]

#----------------------- END SECURITY AUTO CONFIGURATION -------------------------
 ```
 
 ## <span id="inline-blue">Nginx</span>
 
 Nginx部署同样需要先从临时容器中拷贝默认配置，然后再启动正式容器。
 
 **步骤1：启动临时容器并拷贝配置**
 
 首先启动一个临时Nginx容器（容器ID示例：a904）：
 
 ```bash
 docker run -d --name nginx-temp nginx:1.28-alpine
 ```
 
 从临时容器中拷贝配置、静态资源和日志目录到本地：
 
 ```bash
 docker cp a904:/usr/share/nginx/html/ D:/dockerVolume/nginx/
 docker cp a904:/etc/nginx/conf.d/ D:/dockerVolume/nginx/
 docker cp a904:/var/log/nginx/ D:/dockerVolume/nginx/logs/
 ```
 
 拷贝完成后，删除临时容器：
 
 ```bash
 docker rm -f nginx-temp
 ```
 
 **步骤2：启动正式容器**
 
 执行以下命令启动Nginx容器：
 
 ```bash
 docker run -v D:/dockerVolume/nginx/conf.d/:/etc/nginx/conf.d \
   -v D:/dockerVolume/nginx/html:/usr/share/nginx/html/ \
   -v D:/dockerVolume/nginx/logs:/var/log/nginx \
   --name nginx \
   -p 80:80 \
   -d nginx:1.28-alpine
 ```
 
 **参数说明：**
 - `-v D:/dockerVolume/nginx/conf.d/:/etc/nginx/conf.d` - 挂载配置文件目录
 - `-v D:/dockerVolume/nginx/html:/usr/share/nginx/html/` - 挂载静态资源目录
 - `-v D:/dockerVolume/nginx/logs:/var/log/nginx` - 挂载日志目录
 - `--name nginx` - 容器名称
 - `-p 80:80` - 端口映射，HTTP默认端口
 - `-d` - 后台运行
 
 **配置文件位置：**
 
 Nginx配置文件位于 `D:/dockerVolume/nginx/conf.d/` 目录下，可根据需要进行自定义配置。
 
 
# <span id="inline-blue">参考</span>

参考：https://www.cnblogs.com/chen2ha/p/15914157.html
