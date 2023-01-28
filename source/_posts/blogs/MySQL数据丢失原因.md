---
title: MySQL数据丢失原因
categories:
	- MySQL
date: 2022-05-27 14:23:20
tags: 
	- Linux
	- MySQL
---
<!-- toc -->

# <span id="inline-blue">现象</span>
线上数据使用mysqldump命令导出的脚本，导入本地MySQL数据库，发现重命名后的数据库名称居然将原始数据库删除，导出命令如下：
```sql
mysqldump -uroot -p --single-transaction  --add-drop-database --databases iepg  > iepg.sql
```
导出后的脚本文件内容如下：
```sql
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Position to start replication or point-in-time recovery from
--

-- CHANGE MASTER TO MASTER_LOG_FILE='mysql-bin.000114', MASTER_LOG_POS=146667627;

--
-- Current Database: `iepg`
--

/*!40000 DROP DATABASE IF EXISTS `iepg`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `iepg_xw` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `iepg_xw`;

--
-- Table structure for table `apkupdatedatetimerange`
--
```
将/*!40101 SET NAMES utf8 */放到MySQL控制到执行，发现居然执行成功了。
![MySQL数据丢失](/images/Linux//Linux_MySQL_20220527_001.png)

# <span id="inline-blue">原因</span>
/*! MySQL-specific code */ 这种注释是mysql注释中的特殊一种,通过使用叹号在注释中,注释中的代码就会被执行.

