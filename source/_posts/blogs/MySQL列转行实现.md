---
title: MySQL列转行实现
categories:
	- MySQL
tags: 
	- MySQL
	
date: 2023-01-09 16:25:20
updated: 2023-01-09 16:25:20
---
<!-- toc -->

# <span id="inline-blue">要求</span>
将字段存储的规则信息拆分为多行
![原始表](/images/mysql/mysql_20230109_003.png)
![新表](/images/mysql/mysql_20230109_004.png)
# <span id="inline-blue">实现</span>
借助mysql.help_topic辅助表实现

```sql
SELECT b.help_topic_id+1,substring_index(substring_index(a.parentId,',',b.help_topic_id+1),',',-1) parentId
								FROM 
								(SELECT '0516,0518,0523,0513,0511,0527,0515,0519,0000,0514,025,0510,0555,0517' AS parentId) a
								JOIN
								mysql.help_topic b
								
								ON b.help_topic_id < (length(a.parentId) - length(REPLACE(a.parentId,',',''))+1)	
```
关键点：
b.help_topic_id < (length(a.parentId) - length(REPLACE(a.parentId,',',''))+1)
限制help_topic表的连接查询行数与需要拆分字段信息一致
substring_index(substring_index(a.parentId,',',b.help_topic_id+1),',',-1)
help_topic_id递增依次取到对应位置截取的数据信息
substring_index函数
作用：
	返回第 count 次出现的分隔符 delim 之前的 expr 的子字符串
参数：
	expr：一个 STRING 或 BINARY 表达式。
	delim：一个与 expr 类型（指定分隔符）匹配的表达式。
	count：用于统计分隔符数量的 INTEGER 表达式。
返回：
	结果与类型 expr 匹配。
	如果 count 为正，则返回最终的分隔符左侧的所有内容（从左侧开始计算）。
	如果 count 为负，则返回最终的分隔符右侧的所有内容（从右侧开始计算）。
用法示例：
```sql
SELECT substring_index('1,2,3,4', '.', 2);
1,2
```
	


