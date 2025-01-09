---
title: MySQL批量插入随机数据工具mysql_random_data_load
categories:
	- MySQL
tags: 
    - MySQL
	
date: 2024-12-24 16:29:41
updated: 2024-12-24 16:29:41
---
<!-- toc -->
# <span id="inline-blue">环境</span>
	Linux: CentOS Linux release 7.7.1908 (Core)
	MySQL：5.7
# <span id="inline-blue">背景</span>

线上业务需要测试MySQL归档工具pt-archiver在线删除表历史数据能力，使用自动随机生成数据工具mysql_random_data_load。

# <span id="inline-blue">mysql_random_data_load介绍</span>

github项目地址：https://github.com/Percona-Lab/mysql_random_data_load

# <span id="inline-blue">下载</span>

https://github.com/Percona-Lab/mysql_random_data_load/releases  

![MySQL随机数据生成工具](/images/mysql/20241224/mysql_20241224_001.png)
下载最新版本即可。

# <span id="inline-blue">解压</span>

```shell
tar -zxvf mysql_random_data_load_0.1.12_Linux_x86_64.tar.gz
```
# <span id="inline-blue">使用说明</span>

![MySQL随机数据生成工具](/images/mysql/20241224/mysql_20241224_002.png)


# <span id="inline-blue">示例</span>

```shell
./mysql_random_data_load -h127.0.0.1 -uroot -p'coship' --max-threads=24  --bulk-size=3000 test t_title 5000000
```
--max-threads=24: 使用24个线程来并行执行插入操作，提升数据加载的并发性。
--bulk-size=3000: 每次批量插入3000行数据减少插入频率降低连接开销。
test: 数据库名称
t_title：表名称
5000000： 生成数据总记录数

# <span id="inline-blue">验证</span>

![MySQL随机数据生成工具](/images/mysql/20241224/mysql_20241224_003.png)