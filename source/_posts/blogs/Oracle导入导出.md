---
title: Oracle导入导出
categories:
	- Oracle
tags:
	- Oracle

date: 2020-11-17 9:10:12
---
<!-- toc -->

# 概述

使用 Data Pump（`expdp` / `impdp`）在库间迁移 Schema 时，需要先准备表空间与用户，再通过 `DIRECTORY` 对象定位 dump 文件，必要时用 `remap_schema` / `remap_tablespace` 做映射。本文给出可复用的导入/导出顺序与校验点。

| 项 | 说明 |
| --- | --- |
| 场景 | 源 Schema 迁移到目标库新用户 / 新表空间 |
| 做法 | 建表空间 → 建用户授权 → 确认 DIRECTORY → impdp/expdp |
| 适用边界 | Oracle 11g+ Data Pump；操作者具备 DBA 或足够系统权限 |
| 不适用 | 仅表级逻辑导出（`exp` 旧工具）、跨大版本不兼容特性未评估的场景 |

> **危险操作**：`DROP USER ... CASCADE`、`DROP TABLESPACE ... INCLUDING CONTENTS` 会清除对象与数据文件，执行前确认环境与备份。

# 环境与前置

| 项 | 要求 |
| --- | --- |
| 工具 | `expdp` / `impdp`（与数据库版本匹配的客户端） |
| 目录 | OS 路径对 Oracle 进程可读写；已创建 DIRECTORY 对象 |
| Dump | 导入前 dump 文件已放到 DIRECTORY 对应路径 |
| 凭证 | 示例用占位符，**勿在文档/仓库写真实密码** |

**术语：**

| 词 | 含义 |
| --- | --- |
| DIRECTORY | Oracle 对象，映射到 OS 目录，供 Data Pump 读写 |
| remap_schema | 导入时把源 Schema 映射到目标 Schema |
| remap_tablespace | 导入时把源表空间映射到目标表空间 |

# 导入

## 1. 确认是否需要清理目标用户 / 表空间

仅在目标侧已存在冲突对象、且确认可销毁时执行：

```sql
SELECT username, default_tablespace FROM dba_users WHERE username = 'TARGET_USER';

-- 危险：级联删除用户及其对象
-- DROP USER TARGET_USER CASCADE;

-- 危险：删除表空间及数据文件
-- DROP TABLESPACE TARGET_DATA INCLUDING CONTENTS AND DATAFILES CASCADE CONSTRAINTS;
```

## 2. 创建数据 / 索引表空间

```sql
CREATE TABLESPACE TARGET_DATA
  DATAFILE '/u01/oradata/TARGET_DATA.dbf' SIZE 500M
  AUTOEXTEND ON NEXT 12M MAXSIZE UNLIMITED;

CREATE TABLESPACE TARGET_IDX
  DATAFILE '/u01/oradata/TARGET_IDX.dbf' SIZE 500M
  AUTOEXTEND ON NEXT 12M MAXSIZE UNLIMITED;
```

路径按实际 `ORACLE_BASE/oradata` 调整；Windows 使用对应盘符路径。

## 3. 创建用户并授权

```sql
CREATE USER TARGET_USER IDENTIFIED BY "********"
  DEFAULT TABLESPACE TARGET_DATA
  TEMPORARY TABLESPACE TEMP
  PROFILE DEFAULT;

GRANT CONNECT, RESOURCE TO TARGET_USER;
GRANT UNLIMITED TABLESPACE TO TARGET_USER;
-- 按最小权限原则追加；生产慎用 DBA
```

## 4. 确认 DIRECTORY

```sql
SELECT directory_name, directory_path FROM dba_directories;
```

![oracle数据库目录信息](/images/oracle/oracle_20201118.png)

若不存在，先创建（路径需 OS 侧已存在且权限正确）：

```sql
CREATE OR REPLACE DIRECTORY IMPDIR AS '/u01/dpump/import';
GRANT READ, WRITE ON DIRECTORY IMPDIR TO TARGET_USER;
```

## 5. 执行 impdp

```bash
impdp TARGET_USER/******** \
  DIRECTORY=IMPDIR \
  DUMPFILE=SOURCE_2020081010.dmp \
  REMAP_SCHEMA=SOURCE_USER:TARGET_USER \
  REMAP_TABLESPACE=SOURCE_DATA:TARGET_DATA,SOURCE_IDX:TARGET_IDX \
  LOGFILE=imp_TARGET_USER.log
```

| 参数 | 作用 |
| --- | --- |
| `REMAP_SCHEMA` | 源用户对象导入到目标用户 |
| `REMAP_TABLESPACE` | 源表空间映射到已创建的目标表空间（可多对） |
| `DIRECTORY` / `DUMPFILE` | 指定 dump 位置；执行前确认文件在 OS 目录中 |

# 导出

## 1. 创建导出 DIRECTORY

```sql
CREATE OR REPLACE DIRECTORY DATA_EXPDP_DIR AS '/tmp';
GRANT READ, WRITE ON DIRECTORY DATA_EXPDP_DIR TO SYSTEM;
```

## 2. 执行 expdp

```bash
expdp \'/ AS SYSDBA\' \
  SCHEMAS=TARGET_USER \
  DIRECTORY=DATA_EXPDP_DIR \
  DUMPFILE=TARGET_USER_BAK_20200607.DMP \
  LOGFILE=TARGET_USER_BAK_20200607.LOG
```

# 验证清单

| 检查项 | 期望 |
| --- | --- |
| impdp/expdp 日志 | 无 ORA- 失败；有警告需逐条评估 |
| 对象数量 | `SELECT COUNT(*) FROM all_objects WHERE owner='TARGET_USER'` 与源侧量级一致 |
| 无效对象 | `SELECT * FROM dba_objects WHERE owner='TARGET_USER' AND status='INVALID'` 为空或已知可编译 |
| 表空间 | 用户默认表空间、段所在表空间符合 remap 结果 |

# 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `ORA-39002` / 目录无效 | DIRECTORY 未建或 OS 路径不可写 | 建 DIRECTORY、修权限 |
| 表空间不存在 | 未先建目标表空间或 remap 写错 | 先建表空间再 remap |
| 权限不足 | 用户缺 CREATE TABLE 等 | 按需授权，避免一上来 GRANT DBA |
| 导入后业务连不上 | 密码/服务名/同义词未迁移 | 检查 tns、同义词、DBLink |

# 小结

1. Data Pump 迁移按 **表空间 → 用户 → DIRECTORY → impdp/expdp → 校验** 顺序执行。  
2. `remap_schema` / `remap_tablespace` 解决「源名与目标名不一致」，但目标侧对象必须先就绪。  
3. 清理用户/表空间与 dump 中的破坏性语句同等危险，生产必须有备份与变更窗口。
