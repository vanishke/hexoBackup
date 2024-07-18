---
title: MySQL运算符对NULL值处理
categories: 
	- MySQL
tags: 
	- MySQL

date: 2020-11-17 10:10:12
updated: 2020-11-17 10:10:12
---
 

1. A,B,C作为列名时

   ​	任意一项为null 则A+B+C为null;

2. count对于null值处理;

   ​	count(*)包含null项；count(具体列名)忽略null项;count(null)为0

3. avg,max,min,sum对于null值处理

   ​	计算时全部忽略null项;对于avg(null),max(null),min(null),sum(null)为null

4. group by对于null值处理

   ​    将其单独作为一项置于首位

   ​    distinct对于null值处理与group by类似



