---
title: MySQL导入报错解决
tags: 
	- MySQL
categories: 
	- MySQL

date: 2022-04-12 10:20:07	
updated: 2022-04-12 10:20:07
---
# <span id="inline-blue">现象</span> 
![导入报错](/images/mysql/mysql_20211022_001.png)

# <span id="inline-blue">原因</span> 
脚本内容如下
```sql
source ./sql/01_create_table_squence.sql;
source ./sql/02_create_table_operate.sql;
source ./sql/03_create_table_sysinit.sql;
source ./sql/04_init_data.sql;
source ./sql/05_urm_data.sql;
```
source 命令将分号作为文件名称解析导致导入报错，调整后导入正常

source命令记录
导入脚本所在路径与执行脚本位置在同一路径(绝对路径和相对路径均可，引用正确即可)
source命令后不可有分号，否则导入失败





