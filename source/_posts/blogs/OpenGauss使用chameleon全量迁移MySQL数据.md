---
title: OpenGauss使用chameleon全量迁移MySQL数据
categories:
	- MySQL
tags: 
	- MySQL
	
date: 2024-08-12 10:31:29	
updated: 2024-08-12 10:31:29
---
<!-- toc -->
# <span id="inline-blue">环境</span>
MySQL: 5.7
chameleon: chameleon-6.0.0
OpenGauss: openGauss-6.0.0
# <span id="inline-blue">背景</span>
项目迁移到国产操作系统，对应的数据库也一并更换为openGauss,需要将MySQL全量数据迁移到OpenGauss

## <span id="inline-blue">安装chameleon</span>
chameleon:
chameleon是一个用Python3编写的将MySQL迁移至openGauss的实时复制工具，支持初始全量数据的复制以及后续增量数据的实时在线复制功能。chameleon通过一次初始化配置，使用只读模式，将MySQL的数据全量拉取到openGauss。支持在同一快照下，表间数据并行迁移。
全量迁移支持的功能：支持表及表数据、视图、触发器、自定义函数、存储过程的全量迁移

下载chameleon：https://opengauss.obs.cn-south-1.myhuaweicloud.com/latest/tools/openEuler20.03/chameleon-6.0.0-x86_64.tar.gz
openEuler20.03操作系统x86_64架构，如果需要其他类型的安装包切换到下面地址：https://gitee.com/opengauss/openGauss-tools-chameleon/blob/master/chameleon%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97.md
2.2节提供所有类型的安装包，可自行选择。

安装过程中，将自动安装该工具依赖的其他库，请确保本机的pip能正常下载安装相关依赖。相关依赖库及版本要求为：
PyMySQL>=0.10.0, <1.0.0
argparse>=1.2.1
mysql-replication>=0.22
py-opengauss>=1.3.1
PyYAML>=5.1.2
tabulate>=0.8.1
daemonize>=2.4.7
rollbar>=0.13.17
geomet>=0.3.0
mysqlclient>=2.1.1
mysqlclient的安装需要先使用yum安装mysql-devel，直接使用yum install mysql-devel即可。

如果对应的yum源没有以上的依赖，可通过离线安装的方式下载依赖并上传安装，下载离线镜像源的地址：https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple/

Chameleon安装需要依赖python3环境，自行安装配置即可

解压chameleon安装包
```shell
tar -zxvf chameleon-6.0.0-x86_64.tar.gz
```
解压完成后，在脚本所在目录执行离线安装脚本build.sh
```shell
cd chameleon-6.0.0
sh build.sh
```
执行完毕后通过绝对路径的方式即可调用chameleon命令（假设变色龙安装位置为/pkg）：
绝对路径查询变色龙版本号：
```shell
/chameleon/chameleon-6.0.0/venv/bin/chameleon --version 
```

如果报错信息为找不到libmysqlclient.so.*文件，例如：
```shell
ImportError: libmysqlclient.so.20: cannot open shared object file:No such file or directory
```
假设已经在chameleon所在服务器安装了mysql-devel、mysqlclient依赖，但还是提示libmysqlclient.so.20找不到，造成这个问题的原因是安装mysql-devel、mysqlclient之后对应.so文件没有被拷贝到/usr/lib64路径下，依赖没有被识别，解决办法是在安装了mysql的其他服务器上，rpm格式安装包安装的依赖在/usr/lib64路径下，采用免安装版MySQL在安装目录lib下，拷贝一份相同的文件到chameleon服务器/usr/lib64路径下
libmysqlclient.so.20文件后缀名不一致通过做软连接的方式处理下就可以了，命令如下：
```shell
ln -s libmysqlclient.so.20.3.20 libmysqlclient.so.20
```
![chameleon数据迁移](/images/Chameleon/Chameleon_20240812_001.png)

```shell
cd /chameleon/chameleon-6.0.0/
python3 -m venv venv
source venv/bin/activate
```
## <span id="inline-blue">数据迁移</span>
创建chameleon配置文件
进入Python虚拟环境安装好chameleon工具。
执行如下命令创建chameleon配置文件目录。
```shell
chameleon set_configuration_files
```
执行该命令后，将在~/.pg_chameleon/configuration目录下创建默认的配置文件模板。
执行如下命令复制一份默认的配置文件模板保存为default.yml。
```shell
cd ~/.pg_chameleon/configuration
cp config-example.yml default.yml
```
文件路径如下所示：
![chameleon数据迁移](/images/Chameleon/Chameleon_20240812_002.png)
.pg_chameleon隐藏文件需要使用ll命令才能看到，或者直接用cd命令切换到对应路径下
```shell
cd /home/omm/.pg_chameleon/configuration
```
default.yml文件内容如下：
```shell
# global settings
pid_dir: '~/.pg_chameleon/pid/'
log_dir: '~/.pg_chameleon/logs/'
log_dest: file
log_level: debug
log_days_keep: 10
rollbar_key: ''
rollbar_env: ''
dump_json: No

# type_override allows the user to override the default type conversion
# into a different one.

type_override:
#  "tinyint(1)":
#    override_to: boolean
#    override_tables:
#      - "*"

# specify the compress properties when creating tables
compress_properties:
  compresstype: 0
  compress_level: 0
  compress_chunk_size: 4096
  compress_prealloc_chunks: 0
  compress_byte_convert: false
  compress_diff_convert: false

# postgres destination connection
pg_conn:
  host: "10.9.216.172"
  port: "5432"
  user: "admin"
  password: "admin@123"
  database: "test12"
  charset: "utf8"
  params:
#    maintenance_work_mem: "1G"
#    param1: value1
#    param2: value2

sources:
  mysql:
    readers: 16
    writers: 16
    retry: 3
    db_conn:
      host: "10.9.216.14"
      port: "3306"
      user: "root"
      password: "coship"
      charset: 'utf8'
      connect_timeout: 10
    schema_mappings:
      test: test12
    limit_tables:
    skip_tables:
    enable_compress: No
    compress_tables:
    grant_select_to:
      - usr_readonly
    lock_timeout: "120s"
    my_server_id: 1
    replica_batch_size: 10000
    replay_max_rows: 10000
    batch_retention: '1 day'
    copy_max_memory: "1024M"
    copy_mode: 'direct'
    out_dir: /tmp
    csv_dir: /tmp
    contain_columns: No
    column_split: ','
    sleep_loop: 1
    on_error_replay: continue
    on_error_read: continue
    auto_maintenance: "disabled"
    index_parallel_workers: 8
    gtid_enable: false
    type: mysql
    skip_events:
      insert:
      delete:
      update:
    keep_existing_schema: No
    migrate_default_value: Yes
    mysql_restart_config: No
    is_create_index: Yes
    index_dir: '~/.pg_chameleon/index/'
    is_skip_completed_tables: No
    with_datacheck: No
    slice_size: 100000
    csv_files_threshold:
    csv_dir_space_threshold:
```

迁移数据时，MySQL侧使用的用户名密码分别是 root 和 coship。MySQL服务器的IP和port分别是10.9.216.14和3306，待迁移的数据库是test。
 openGauss侧使用的用户名密码分别是 admin/admin@123。openGauss服务器的IP和port分别是10.9.216.172和5432，目标数据库是test，同时会在test数据库创建指定shema，迁移的表都将位于该schema下。

需要注意的是，这里使用的用户需要有远程连接MySQL和openGauss的权限，以及对对应数据库的读写权限。同时对于openGauss，运行chameleon所在的机器需要在openGauss的远程访问白名单中。对于MySQL，用户还需要有RELOAD、REPLICATION CLIENT、REPLICATION SLAVE的权限。

初始化迁移
```shell
cd  /chameleon/chameleon-6.0.0/venv/bin
chameleon create_replica_schema --config default
chameleon add_source --config default --source mysql
```
复制基础数据
```shell
cd /chameleon/chameleon-6.0.0/venv/bin
./chameleon init_replica --config default --source mysql
```
该步骤完成之后，数据库表全量数据就迁移完成了

复制视图
```shell
cd /chameleon/chameleon-6.0.0/venv/bin
./chameleon start_view_replica --config default --source mysql --debug
```

复制触发器
```shell
cd /chameleon/chameleon-6.0.0/venv/bin
./chameleon start_trigger_replica --config default --source mysql --debug
```

复制自定义函数
```shell
cd /chameleon/chameleon-6.0.0/venv/bin
./chameleon start_func_replica --config default --source mysql --debug
```

复制存储过程
```shell
cd /chameleon/chameleon-6.0.0/venv/bin
./chameleon start_proc_replica --config default --source mysql --debug
```

迁移结束清理资源
```shell
chameleon stop_replica --config default --source mysql
chameleon detach_replica --config default --source mysql
chameleon drop_replica_schema --config default
```

# <span id="inline-blue">问题汇总</span>

## <span id="inline-blue">问题一</span>
chameleon执行完初始化和复制初始化数据命令之后，发现日志没有报错，但MySQL数据库中的表数据库没有迁移到openGauss,可以到openGauss的日志运行目录查看对应的日志
，日志目录：/data/openGauss/gaussdb/data/db1/pg_log

## <span id="inline-blue">问题二</span>
执行数据迁移命令后openGauss日志报错，提示数据库不兼容，原因是创建数据库时没有加上指定的兼容参数。
```shell
CREATE DATABASE database_test WITH OWNER joe ENCODING 'utf8' dbcompatibility='B';

#此处对dbcompatibility做补充
#DBCOMPATIBILITY [ = ] compatibility_type
#指定兼容的数据库的类型，默认兼容O。
#取值范围：A、B、C、PG。分别表示兼容Oracle、MySQL、Teradata和PostgreSQL
#如果不指定B，要是建表语句有COMMENT注释就会报错：
#"ERROR:  Comment is supported only in B compatible database."
```

## <span id="inline-blue">问题三</span>
执行数据迁移命令后openGauss日志报错，提示迁移用户权限不足，原因是没有给迁移用户分配足够的权限。
给迁移用户admin增加对应的权限
```shell
#赋予创建角色权限
alter user admin with Create role;
#赋予创建数据库权限
alter user admin with Create DB;
#赋予备份权限
alter user admin with Replication;
#赋予系统管理员权限
alter user admin with Sysadmin;
```
更改用户权限之后，执行\du 可以查看用户权限
![chameleon数据迁移](/images/Chameleon/Chameleon_20240812_003.png)

