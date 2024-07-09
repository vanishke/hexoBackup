---
title: MySQL存储过程全量导出csv数据文件
categories:
	- MySQL

date: 2023-11-10 15:55:20
tags: 
	- MySQL
---
<!-- toc -->

# <span id="inline-blue">环境</span>
MySQL:5.7
# <span id="inline-blue">背景</span>
将数据库指定表全量导出到csv文件，并上传至指定位置，采用存储过程实现。

# <span id="inline-blue">实现</span>

## MySQL开启导出配置
![导出配置](/images/mysql/mysql_20231110_001.png)

查看官方文档，secure_file_priv参数用于限制LOAD DATA, SELECT …OUTFILE, LOAD_FILE()传到哪个指定目录。

secure_file_priv 为 NULL 时，表示限制mysqld不允许导入或导出。
secure_file_priv 为 /tmp 时，表示限制mysqld只能在/tmp目录中执行导入导出，其他目录不能执行。
secure_file_priv 没有值时，表示不限制mysqld在任意目录的导入导出，但必须为mysql用户赋予对应目录权限，否则提示权限不足。

为mysql用户赋予导出目录权限命令如下：
```shell
chown -R mysql:mysql /dataExport  
```
## 导入存储过程

将存储过程SQL脚本上传至MySQL服务器/tmp目录下
```shell
	cd /tmp  
	mysql -uroot -pcoship  
	use nanjing_iepg;  
	source ExportOnlineTvBox.sql;  
	exit;  
```
存储过程内容如下：
```SQL
/*
SQLyog Ultimate v12.3.1 (64 bit)
MySQL - 5.7.33-log : Database - nanjing_iepg_v270
*********************************************************************
*/


/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/* Procedure structure for procedure `ExportOnlineTvBox` */

/*!50003 DROP PROCEDURE IF EXISTS  `ExportOnlineTvBox` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`root`@`%` PROCEDURE `ExportOnlineTvBox`(IN PATH varchar(255),IN size INT(10))
BEGIN

	 

	 /**

		数据文件导出日期 eg:2023-11-08

	 **/

	 DECLARE exportDate VARCHAR(64);

	 /**

	  数据文件导出路径 eg:/dataExport/2023-11-08

	 **/

	 DECLARE exportPath VARCHAR(255);

	 /**

		数据文件导出文件名 eg:onlineTvBox_2023-11-08_142358_0.csv

	 **/

	 DECLARE exportFileName VARCHAR(255);

	 /**

		分页参数,页数

	 **/

	 DECLARE pageNum INT(4) DEFAULT 0;

	 /**

		分页参数,总记录数

	 **/

   DECLARE totalSize INT(20) DEFAULT 0;

	 /**

		分页参数,分页大小

	 **/

   DECLARE pageSize INT(10) DEFAULT 500000;

	 /**

		分页参数,总页数

	 **/

   DECLARE totalPage INT(4) DEFAULT 0;

	 /**

			分页查询，起始下标

	 **/

   DECLARE startIndex INT(10) DEFAULT 0;

	 /**

			文件序号

	 **/

   DECLARE fileNum INT(10) DEFAULT 0;

	 

	 /**

		设置文件导出日期目录

	 **/

	 SELECT CURRENT_DATE() INTO exportDate;

	 /**

		设置分页大小

	 **/

	 IF size > 0 

	 THEN 

			SET pageSize = size;

	 END IF;

	 

	 /**

		获取需要导出的总记录数

	 **/

	 SELECT count(*) FROM smartcard_district_relation T WHERE T.appType = 0  INTO   totalSize; 

	 /**

	 分页参数,设置总页数

	 **/

	 IF totalSize%pageSize=0

	 THEN

		 	SET totalPage =  TRUNCATE(totalSize/pageSize, 0);

	 ELSE

			SET totalPage = TRUNCATE(totalSize/pageSize, 0) +1;

	 END IF;

	  

	 

	WHILE (pageNum < totalPage)   do

	

		/**

		   对分页的起始下标计算，以便分页查询时使用

		**/

		SET startIndex = pageNum *pageSize;

		/**

				设置导出文件名,onlineTvBox_2023-11-08_142358_0.csv

		**/

		SET exportFileName = CONCAT("onlineTvBox_",DATE_FORMAT(CURRENT_TIMESTAMP,"%Y-%m-%d_%H%i%s"),"_",fileNum,".csv");

		/**

			设置导出文件的绝对路径，兼容@@secure_file_priv为空和非"/"结尾的情况

		**/

		IF path = ''  THEN

			 SET exportPath = CONCAT("/tmp/",exportFileName);

	 ELSEIF (SUBSTRING(path,-1) ='/') = 0 THEN

			SET exportPath = CONCAT(path,"/",exportFileName);

	 ELSE

			SET exportPath = CONCAT(path,exportFileName);

	 END IF;

		

	 

	 /**

			文件导出,SELECT INTO OUTFILE 采用预编译方式执行，规避导出文件路径不支持变量

	 **/

		SET @executeSql=CONCAT("SELECT 'ID','智能卡号','区域名称','区域码','状态码','盒子类型','厂商名称','硬件型号','芯片型号','硬件版本','软件版本','mac地址','机顶盒序列号','创建时间'

UNION ALL

select S.ID,S.smartCardId,S.districtCodeName,S.districtCode,S.statusCode,S.appType,S.factoryName,S.model,S.socmodel,S.hdVersion,S.softwareVersion,S.mac,S.sn,S.createTime from

(

		SELECT T.ID,T.smartCardId,IFNULL(T.districtCodeName,'') AS districtCodeName,IFNULL(T.districtCode,'') AS districtCode,IFNULL(T.statusCode,'') AS statusCode,IFNULL(T.appType,'') AS appType,IFNULL(T.factoryName,'') AS factoryName,IFNULL(T.model,'') AS model,			IFNULL(T.socmodel,'') AS socmodel,IFNULL(T.hdVersion,'') AS hdVersion,IFNULL(T.softwareVersion,'') AS softwareVersion,IFNULL(T.mac,'') AS mac,IFNULL(T.sn,'') AS sn,T.createTime  AS createTime

		FROM smartcard_district_relation T 

		WHERE T.appType=0 LIMIT ",startIndex,",",pageSize," ) S "," INTO OUTFILE \"",exportPath,"\" FIELDS TERMINATED BY ',' 

		OPTIONALLY ENCLOSED BY '\"' 

		LINES TERMINATED BY '\r\n' ");

		PREPARE stmt FROM @executeSql;

		EXECUTE stmt;

		DEALLOCATE PREPARE stmt;

			/**

				页码自增

			**/

		 SET pageNum = pageNum + 1;	

		 /**

				文件序号自增

		 **/

		 SET fileNum = fileNum + 1;

		 

	END WHILE;

END */$$
DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

```

## 调用存储过程

Navicate客户端，新建查询，执行如下命令：
```shell
call ExportOnlineTvBox("/dataExport/", 500000);
```
ExportOnlineTvBox存储过程参数说明
 path: 导出文件的路径，该路径mysql用户必须赋予权限
size: 导出单个文件的记录数，excel单个文件的行数有限制，最大不能超过1048576

## 配置系统定时任务
```shell
vim /etc/crontab
```
	  
添加如下内容：
```shell
#每晚凌晨一点之点执行
0 1 * * * root /root/exportCsv.sh > /dev/null 2>&1
```

exportCsv定时脚本内容如下：
```shell
#!/bin/sh
exportPath="/dataExport/"
#20231110
currentDate=`date +%Y%m%d`
mkdir -p $exportPath$currentDate
/usr/bin/chown -R mysql:mysql $exportPath
#添加"\""转义,导出路径参数path必须使用双引号引起来，否则作为调用报错
mysql -uroot -pcoship -e "use nanjing_iepg_v270; call ExportOnlineTvBox("\"${exportPath}${currentDate}\"",500000);"
```


