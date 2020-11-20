---
title: Oracle查看表空间使用情况
categories: Oracle
date: 2020-11-17 11:10:12
tags: Oracle
---

##  1. 统计



```sql
SELECT a.tablespace_name "表空间名",
a.bytes / 1024 / 1024 "表空间大小(M)",
(a.bytes - b.bytes) / 1024 / 1024 "已使用空间(M)",
b.bytes / 1024 / 1024 "空闲空间(M)",
round(((a.bytes - b.bytes) / a.bytes) * 100, 2) "使用比"
FROM (SELECT tablespace_name, sum(bytes) bytes
FROM dba_data_files
GROUP BY tablespace_name) a,
(SELECT tablespace_name, sum(bytes) bytes, max(bytes) largest
FROM dba_free_space
GROUP BY tablespace_name) b
WHERE a.tablespace_name = b.tablespace_name
ORDER BY ((a.bytes - b.bytes) / a.bytes) DESC;
```



​	

