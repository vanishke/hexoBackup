---
title: MySQL基于存储过程实现大表数据清理
tags:
	- MySQL
categories: 
	- MySQL
	
date: 2024-06-06 13:46:20
updated: 2024-06-06 13:46:20
---
## <span id="inline-blue">环境</span>
MySQL:5.7
### <span id="inline-blue">背景</span>
数据库大表中出现了垃圾数据导致业务调用异常，希望通过存储过程清理满足特定条件的数据记录。
ipqam_usage表记录按照ipqam_id字段进行分组统计,prog_no字段升序排序，清理对应分组记录数多余16的记录
表字段如下：
```MySQL
CREATE TABLE `ipqam_usage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ipqam_id` int(11) unsigned NOT NULL DEFAULT '0' COMMENT 'constant field',
  `prog_no` int(11) unsigned NOT NULL DEFAULT '2' COMMENT 'constant field',
  `port_no` int(11) unsigned NOT NULL DEFAULT '258' COMMENT 'constant field',
  `prog_bitrate` int(11) unsigned NOT NULL DEFAULT '0' COMMENT 'kbps',
  `owner_id` bigint(20) unsigned NOT NULL DEFAULT '0',
  `last_use_time` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_ipqam_usage_1` (`ipqam_id`,`prog_bitrate`),
  KEY `idx_onwer_id` (`owner_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9028760 DEFAULT CHARSET=gbk;
```
#### <span id="inline-blue">实现思路</span>
借助MySQL游标，先查询出ipqam_id对应记录大于16的ipqam_id，并开启游标遍历操作，然后根据需要进行清理数据的ipqam_id,查询出16条记录数之外的ID暂存到临时表上，最后根据临时表上的id进行删除即可。
如下是存储过程实现：
```MySQL

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Procedure structure for `clearIpqamInvalidProgram`
-- ----------------------------
DROP PROCEDURE IF EXISTS `clearIpqamInvalidProgram`;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `clearIpqamInvalidProgram`()
BEGIN


	  /*  游标异常停止标识  */
	  DECLARE v_clear_stop_flag INT DEFAULT 0;
	  /* ipqam_id  */
	  DECLARE v_ipqam_id VARCHAR(60) DEFAULT NULL;
	  /* 任务完成标识 */
	  DECLARE out_done INT DEFAULT FALSE ; 
	  /*  定义游标 */
      DECLARE out_cursor CURSOR FOR (SELECT tq.ipqam_id FROM ( SELECT t.ipqam_id,COUNT(*) nums FROM ipqam_usage t GROUP BY t.ipqam_id ) tq WHERE tq.nums > 16);
	  /* 循环结束标识 */
	  DECLARE CONTINUE HANDLER FOR NOT FOUND SET out_done = TRUE ; 
	   /* 创建临时表  记录需要清理的ipqam_usage id*/
	  DROP  TABLE IF EXISTS temp_ipqam_use_id;
	  CREATE  TABLE temp_ipqam_use_id 
			(
			  ipqam_use_id INT DEFAULT 0 PRIMARY KEY
			);
		/* 遍历游标 */
		OPEN out_cursor ; 
		WHILE NOT out_done DO 
				FETCH out_cursor INTO v_ipqam_id; 
				IF NOT out_done THEN 	
						REPLACE INTO temp_ipqam_use_id
						SELECT id
						FROM ipqam_usage
						WHERE ipqam_id = v_ipqam_id
						ORDER BY prog_no
						ASC 
						LIMIT 16,2000; 
				END IF; 
		END WHILE; 
		CLOSE out_cursor ;
		/* 清理对应记录 ipqam_usage */
		DELETE FROM ipqam_usage where id in (select distinct ipqam_use_id from temp_ipqam_use_id );
		DROP  TABLE IF EXISTS temp_ipqam_use_id;

END
;;
DELIMITER ;

SET FOREIGN_KEY_CHECKS=1;
```
#### <span id="inline-blue">验证</span>
![MySQL大表清理](/images/mysql/mysql_20240606_001.png)

