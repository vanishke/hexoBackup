---
title: mayfly-go登录提示database is locked(SQLITE_BUSY)
categories:
	- Mayfly-go
tags: 
	- Sqlite
	- Mayfly-go
	
date: 2025-03-06 17:46:28
updated: 2025-03-06 17:46:28
---
<!-- toc -->
# <span id="inline-blue">环境</span>
linux: centos7.9
mayfly-go: 1.9.3

# <span id="inline-blue">现象</span>
mayfly-go登录提示database is locked(SQLITE_BUSY)

# <span id="inline-blue">原因</span>
sqlite只支持库级锁，当多线程并发访问sqlite导致触发锁定。

# <span id="inline-blue">解决办法</span>

## <span id="inline-blue">修改sqlite模式</span>
```shell
#打开指定sqlite数据库文件
sqlite3 mayfly-go.sqlite3
#查看数据库信息
.databases
#查看当前模式
PRAGMA journal_mode;
#变更模式
PRAGMA journal_mode=WAL;
```
sqlite WAL:
WAL 的全称是 Write Ahead Logging（预写日志），它是很多数据库中用于实现原子事务的一种机制。SQLite 在 3.7.0 版本引入该特性，在此之前 SQLite 实现原子提交和回滚的方法是 rollback journal（回滚日志）。

优点：
1、读操作不会阻塞写操作，同时写操作也不会阻塞读操作。这是并发管理的“黄金准则”。
2、在大多数操作场景中，与回滚日志相比，WAL 相当快。
3、磁盘 I/O 变得更可预见，更少的 fsync 系统调用，因为所有的 WAL 写操作是线性写入日志文件，很多 I/O 变的连续并能够按计划执行。

缺点：
1、所有的处理被绑定到单个主机上。也就是说，不能再如 NFS 这样的网络文件系统上使用 WAL。
2、为满足 WAL 和相关共享内存的需要，使用 WAL 引入了里两个额外的半持久性文件-wal 和-shm。对于那些使用SQLite 数据库作为应用程序文件格式是不具有吸引力的。这也影响了只读环境，因为-shm文件必须是可写的，并且/或数据库所在目录也必须是可写的。
3、对于非常大的事务，WAL 的性能将会降低。虽然 WAL 是一个高性能选项，但是非常大或运行时间非常长的事务会引入额外的开销。


## <span id="inline-blue">添加查询超时时间</span>

修改busy_timeout参数为5000毫秒,该参数设置了等待其他进程或线程释放数据库锁的时间，单位为毫秒。如果在指定的时间内锁定依然无法释放，则会继续报错
```shell
sqlite3 mayfly-go.sqlite3
sqlite>PRAGMA busy_timeout;
sqlite>PRAGMA busy_timeout=5000;
```