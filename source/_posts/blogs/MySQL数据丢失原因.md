---
title: MySQL数据丢失原因
categories:
	- MySQL
tags:
	- Linux
	- MySQL

date: 2022-05-27 14:23:20
---
<!-- toc -->

# 概述

用 `mysqldump` 导出的 SQL 导入本地时，若脚本里带有 `DROP DATABASE`，而你只改了后面的库名却没改 DROP 目标，就可能把**源库名对应的库**删掉。本文还原一次真实踩坑的因果链，并给出安全导入清单。

| 项 | 说明 |
| --- | --- |
| 现象 | 导入「改名后的库」时，原始库被删除 |
| 根因 | `--add-drop-database` 生成了 `DROP DATABASE IF EXISTS \`原库名\``；改名只改了 `CREATE DATABASE`，未改 DROP |
| 适用边界 | MySQL / MariaDB；`mysqldump --databases` + `--add-drop-database` 场景 |
| 不适用 | 仅表级 dump（无 DATABASE 语句）、或导入前已手工剔除 DROP 的脚本 |

# 环境与前置

- 导出端具备对应库读权限
- 导入端账号具备 `DROP` / `CREATE` 权限（这也是风险来源）
- 操作前确认：**导入目标是否允许执行 DROP DATABASE**

# 现象复现要点

导出命令示例：

```bash
mysqldump -uroot -p --single-transaction --add-drop-database --databases iepg > iepg.sql
```

导出片段常见形态：

```sql
/*!40000 DROP DATABASE IF EXISTS `iepg`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `iepg_xw` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `iepg_xw`;
```

若导入前只把 `CREATE DATABASE` / `USE` 改成了 `iepg_xw`，却留下：

```sql
DROP DATABASE IF EXISTS `iepg`;
```

则导入时会先删掉 **`iepg`**，再创建 `iepg_xw`——于是表现为「改名导入却把原库干掉了」。

![MySQL数据丢失](/images/Linux/Linux_MySQL_20220527_001.png)

# 原理要点

## 1. 真正的风险语句是 DROP DATABASE

`--add-drop-database` 的设计意图是：导入同名库前先清掉旧库，保证幂等。它**不会**自动跟着你手工改过的新库名走。

## 2. `/*! ... */` 不是「普通注释」

MySQL 条件注释形如：

```sql
/*!40000 DROP DATABASE IF EXISTS `iepg`*/;
```

对支持该版本特性的 MySQL 服务端，其中的语句**会被执行**。把它贴进客户端执行「居然成功」并不奇怪——它本来就不是被忽略的备注。

> 因此：看到 `/*!40000 DROP DATABASE ...*/` 必须按**可执行 DDL** 对待，不能当文档注释跳过。

## 3. 完整因果链

```text
mysqldump --add-drop-database
  → 脚本含 DROP DATABASE `iepg`
  → 人工只改 CREATE/USE 为 iepg_xw
  → 导入账号有 DROP 权限
  → 执行 DROP iepg + CREATE iepg_xw
  → 原库 iepg 数据丢失
```

# 安全导入清单

1. **导入前全文搜索**：`DROP DATABASE` / `DROP SCHEMA`，确认目标库名是否符合预期。  
2. **改名导入时同步改三处**：`DROP DATABASE`、`CREATE DATABASE`、`USE`。  
3. **更稳妥**：导出时去掉 `--add-drop-database`；或导入前删除全部 DROP DATABASE 行。  
4. **权限收敛**：导入账号尽量无 `DROP` 库级权限（开发机另议）。  
5. **先干跑**：在临时实例导入；或对脚本做 `grep -n "DROP DATABASE"` 人工复核。  
6. **生产库禁止**直接拿「改过库名的 dump」盲导。

# 验证清单

| 检查项 | 期望 |
| --- | --- |
| 导入前 `SHOW DATABASES` | 记录原有库列表 |
| 脚本扫描 | 无意外 `DROP DATABASE` |
| 导入后 | 目标库存在；**不应消失的库仍在** |
| 表数量 / 抽样数据 | 与导出端一致 |

# 常见问题

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 只想换库名却删了旧库 | DROP 仍指向旧名 | 同步修改或删除 DROP 行 |
| 以为 `/*! */` 不会执行 | 误判为普通注释 | 按可执行 SQL 审核 |
| 本地误删无法恢复 | 无备份 | 从导出源或备份集恢复；建立导入前快照习惯 |

# 小结

1. **丢数据的直接原因是 DROP DATABASE，不是「注释语法好奇」本身。**  
2. `--add-drop-database` 与「手工改库名」组合时，必须把 DROP 目标一并改对或去掉。  
3. 条件注释 `/*! ... */` 在 MySQL 中可执行——审核 dump 时按 DDL 风险等级处理。
