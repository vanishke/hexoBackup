---
title: MySQL导出数据库指定忽略多张表
categories:
	- MySQL

date: 2023-12-18 16:21:20
tags: 
	- MySQL
---
<!-- toc -->

# <span id="inline-blue">环境</span>
MySQL : 5.7
# <span id="inline-blue">背景</span>
导出现网数据库数据，发现数据量过大，排除一些和核心业务无关的表
# <span id="inline-blue">实现</span>
查询当前需要进行导出的数据库各个表的空间占用情况
```sql
SELECT
a.table_schema,
a.table_name,
round( sum( DATA_LENGTH / 1024 / 1024 ) + sum( INDEX_LENGTH / 1024 / 1024 ), 2 )  AS total_size_MB,
 round( sum( DATA_LENGTH / 1024 / 1024 ), 2 ) AS data_size_MB,
round( sum( INDEX_LENGTH / 1024 / 1024 ), 2 ) AS index_size_MB
FROM information_schema.TABLES a
WHERE a.table_schema = 'love_home'
GROUP BY a.table_name
ORDER BY total_size_MB
DESC;
```
table_schema指定查询当前love_home数据库

数据库导出执行语句如下：
```sql
mysqldump -u root -pcoship love_home --ignore-table=love_home.sys_log_api --ignore-table=love_home.sys_job_log > /tmp/DB/test/love_home.sql;
```
--ignore-table指定导出时需要忽略的表名称
