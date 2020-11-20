---
title: Oracle清理系统僵死SQl进程
categories: Oracle
date: 2020-11-17 11:23:20
tags: Oracle
---

##  1.清理

```sql
SELECT l.session_id sid,  
       s.serial#,  
       l.locked_mode 锁模式,  
       l.oracle_username 登录用户,  
       l.os_user_name 登录机器用户名,  
       s.machine 机器名,  
       s.terminal 终端用户名,  
       o.object_name 被锁对象名,  
       s.logon_time 登录数据库时间  
FROM v$locked_object l, all_objects o, v$session s  
WHERE l.object_id = o.object_id  
   AND l.session_id = s.sid  
ORDER BY sid, s.serial#; 

kill掉当前的锁对象
alter system kill session sid,serial';
```



​	

