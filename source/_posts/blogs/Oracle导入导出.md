---
title: Oracle导入导出
categories: Oracle
date: 2020-11-17 9:10:12
tags: Oracle
---
<!-- toc -->

#   导入

## 查看所有用户表空间

```sql
SELECT * FROM DBA_USERS  /*查看用户及其表空间信息 */

drop user SDP_CMS_HRB cascade; /* 级联删除用户信息*/

DROP TABLESPACE SDP_CMS_HRB_DATA including contents and datafiles cascade constraint; /* 删除用户所在的表空间*/
```

​	

## 创建数据和索引存储文件目录

```SQL
create tablespace SDP_CMS_HRB_DATA datafile '$ORACLE_BASE/oradata/SDP_CMS_HRB_DATA.dbf' size 500M autoextend on next 12M maxsize unlimited;
create tablespace SDP_CMS_HRB_IDX datafile '$ORACLE_BASE/oradata/SDP_CMS_HRB_IDX.dbf' size 500M autoextend on next 12M maxsize unlimited;
```

 

## 创建对应用户并赋予权限

```SQL
create user SDP_CMS_HRB identified by SDP_CMS_HRB default tablespace SDP_CMS_HRB_DATA temporary tablespace TEMP profile DEFAULT;

grant connect,resource to SDP_CMS_HRB; 
grant create any sequence to SDP_CMS_HRB; 
grant create any table to SDP_CMS_HRB; 
grant delete any table to SDP_CMS_HRB; 
grant insert any table to SDP_CMS_HRB; 
grant select any table to SDP_CMS_HRB; 
grant unlimited tablespace to SDP_CMS_HRB; 
grant execute any procedure to SDP_CMS_HRB; 
grant update any table to SDP_CMS_HRB; 
grant create any view to SDP_CMS_HRB; 
grant dba to SDP_CMS_HRB;
```



## 导入命令

```SQL
impdp  SDP_CMS_HRB/SDP_CMS_HRB  DIRECTORY=IMPDIR  DUMPFILE=SDP_CMS _2020081010.dmp remap_schema=SDP_CMS:SDP_CMS_HRB remap_tablespace=SDP_CMS_DATA:SDP_CMS_HRB_DATA,SDP_CMS_DATA:SDP_CMS_HRB_IDX
```

​	remap_schema:利用remap_schema可以把源数据库下SDP_CMS用户的数据迁移到目标数据库的SDP_CMS_HRB用户下。

​	remap_tablespace:将导出SDP_CMS _2020081010.dmp 文件中的SDP_CMS_DATA表空间 导入到目标库的 SDP_CMS_HRB_DATA中指定表空间(包含数据文件和索引文件)，导入命令执行之前必须确保引用脚本存在。



查看Oracle 用户对应目录命令

```SQL
SELECT * FROM DBA_Directories /* 查看用户相关的目录信息 */
```

![oracle数据库目录信息](/images/oracle/oracle_20201118.png)

# 导出

## 创建导出数据文件目录

```SQL
create directory DATA_EXPDP_DIR as '/tmp'; 
```

## 执行导出命令

```SQL
expdp \'/ as sysdba\' schemas=SDP_CMS_HRB DIRECTORY=DATA_EXPDP_DIR DUMPFILE=SDP_CMS_HRBBAK_20200607.DMP LOGFILE=SDP_CMS_HRBBAK_20200607.LOG
```

