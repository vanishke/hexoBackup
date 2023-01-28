---
title: MySQL存储过程
categories: 
	- MySQL
tags: 
	- MySQL
date: 2022-04-12 10:10:12
---
 

## <span id="inline-blue">存储过程</span>
存储过程使用游标清理过期布局数据
```sql
/*
Navicat MySQL Data Transfer

Source Server         : 10.9.216.12
Source Server Version : 50560
Source Host           : 10.9.216.12:3306
Source Database       : nanjing_iepg

Target Server Type    : MYSQL
Target Server Version : 50599
File Encoding         : 65001

Date: 2022-04-12 09:59:53
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Procedure structure for `clearPubCell`
-- ----------------------------
DROP PROCEDURE IF EXISTS `clearPubCell`;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `clearPubCell`()
BEGIN
		/* 存储过程使用游标清理过期发布布局Plan
		*	pubareaversion表同一area和version条件下只保留两个最新发布布局
		*	借助临时表暂存需要清理的布局planId(解决由于select查询结果为空导致游标异常退出)
		*	通过查询出的planId清理pubareaversion、pubcell
		*/

		/*  游标异常停止标识  */
	  DECLARE v_clear_stop_flag INT DEFAULT 0;
		/* 区域码  */
	  DECLARE v_areaCode VARCHAR(60) DEFAULT NULL;
		/* 版本信息 */
	  DECLARE v_version VARCHAR(60) DEFAULT NULL;
		/* 任务完成标识 */
		DECLARE out_done INT DEFAULT FALSE ; 
		/*  定义游标 */
		DECLARE out_cursor CURSOR FOR (SELECT distinct areaCode,version FROM pubareaversion);
		/* 循环结束标识 */
		DECLARE CONTINUE HANDLER FOR NOT FOUND SET out_done = TRUE ; 
		/* 创建临时表  记录需要清理的布局planId*/
		DROP TABLE IF EXISTS temp_planId;
		 CREATE TEMPORARY TABLE temp_planId 
			(
			 planId int default 0
			);
		/* 遍历游标 */
		OPEN out_cursor ; 
		WHILE NOT out_done DO 
				FETCH out_cursor INTO v_areaCode,v_version; 
				IF NOT out_done THEN 	
						REPLACE INTO temp_planId
						SELECT planId
						FROM pubareaversion
						WHERE areaCode = v_areaCode
						AND version = v_version 
						ORDER BY updateTime
						DESC 
						LIMIT 2,2000; /* 查询从第二条记录开始的2000记录，发布布局超出2000的情况下需要做修改(limit 2,-1 这种语言高级版本MySQL已修复 ,-1表示无穷) */
				END IF; 
		END WHILE; 
		CLOSE out_cursor ;
		/* 清理pubcell、pubareaversion对应记录 */
		DELETE FROM pubcell where pubcell.planId in (select distinct planId from temp_planId );
		DELETE FROM pubareaversion where pubareaversion.planId in (select distinct planId from temp_planId );

END
;;
DELIMITER ;

```

<a id="download" href="/images/mysql/test.sql"><i class="fa fa-download"></i><span>测试数据脚本</span> </a>


