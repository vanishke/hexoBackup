---
title: MySQL统计数据库表空间大小
categories:
	- MySQL
tags: 
	- MySQL
	
date: 2023-11-07 14:55:20
updated: 2023-11-07 14:55:20
---
<!-- toc -->

# <span id="inline-blue">环境</span>
MySQL:5.5
# <span id="inline-blue">背景</span>
导出指定数据库想要先统计一下当前数据库的各个表的大小，导出之前先用truncate命令清空多余的数据。

# <span id="inline-blue">统计SQL</span>
```sql
SELECT
a.table_schema,
a.table_name,
round( sum( DATA_LENGTH / 1024 / 1024 ) + sum( INDEX_LENGTH / 1024 / 1024 ), 2 )  AS total_size_MB,
 round( sum( DATA_LENGTH / 1024 / 1024 ), 2 ) AS data_size_MB,
round( sum( INDEX_LENGTH / 1024 / 1024 ), 2 ) AS index_size_MB
FROM information_schema.TABLES a
WHERE a.table_schema = '数据库名称'
GROUP BY a.table_name
ORDER BY total_size_MB
DESC
```


