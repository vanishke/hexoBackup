---
title: MySQL 导入导出
categories: MySQL
date: 2020-11-17 12:23:20
tags: MySQL
---
<!-- toc -->

# 导出数据库中的表：

```sql
mysqldump -u root -p report_hrb140 > report_hrb140.sql;
```



# 导出数据库中的存储过程和事务：

```sql
mysqldump -uroot -pcoship -ntd -R report_hrb121> report_hrb121_FP.sql;

其中-ntd代表导入存储过程。-R代表导入功能函数。
```



# 导入数据库表结构和数据：

```sql
mysql -u root -p
password:*******
mysql>use 数据库(数据库的名称)
然后使用source命令,后面参数为脚本文件(report_hrb140.sql)
mysql>source report_hrb140.sql;
导入存储过程及事务的SQL命令：
mysql -u root -p
password:*******
mysql>use 数据库(数据库的名称)
然后使用source命令,后面参数为脚本文件(report_hrb121_FP.sql)
mysql>source report_hrb121_FP.sql;
```

