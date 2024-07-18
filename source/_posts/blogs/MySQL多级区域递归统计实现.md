---
title: MySQL多级区域递归统计实现
categories:
	- MySQL
tags: 
	- MySQL
	
date: 2023-01-09 17:25:20
updated: 2023-01-09 17:25:20
---
<!-- toc -->

# <span id="inline-blue">要求</span>
按照一级城市统计单引擎、双引擎、总数来统计盒子的数量
appType:0 单引擎
appType:1 双引擎
原始数据表结构
```sql
#区域表
CREATE TABLE `area` (
  `id` varchar(255) NOT NULL,
  `areaCode` varchar(20) DEFAULT NULL,
  `areaName` varchar(20) DEFAULT NULL,
  `parentId` varchar(20) DEFAULT NULL,
  `remark` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;	

#上报表
CREATE TABLE `smartcard_district_relation` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `smartCardId` varchar(64) NOT NULL COMMENT '智能卡号',
  `statusCode` varchar(10) NOT NULL COMMENT '状态码',
  `districtCode` varchar(100) NOT NULL COMMENT '分公司编码',
  `appType` varchar(5) NOT NULL COMMENT '盒子类型：0为传统盒子，1为智能盒子',
  `factoryName` varchar(256) NOT NULL COMMENT '厂商名称',
  `createTime` datetime NOT NULL COMMENT '创建/更新时间',
  `queryEndTime` datetime DEFAULT NULL,
  `queryStartTime` datetime DEFAULT NULL,
  `sn` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_smartCardId` (`smartCardId`)
) ENGINE=InnoDB AUTO_INCREMENT=1462231 DEFAULT CHARSET=utf8 COMMENT='智能卡和分公司编码关联表';
```
# <span id="inline-blue">实现</span>
创建caculateTVboxTotal存储过程及辅助函数queryChildren
```sql
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Procedure structure for caculateTVboxTotal
-- ----------------------------
DROP PROCEDURE IF EXISTS `caculateTVboxTotal`;
delimiter ;;
CREATE PROCEDURE `caculateTVboxTotal`()
BEGIN
		
			/*  游标异常停止标识  */
	  DECLARE v_clear_stop_flag INT(13);
		/* 区域ID  */
	  DECLARE v_areaId INT(13);		
		/* 区域码  */
	  DECLARE v_areaCode VARCHAR(60);		
		/* 任务完成标识 */
		DECLARE out_done INT DEFAULT FALSE ; 
		/*  定义游标 */
		DECLARE out_cursor CURSOR FOR (SELECT distinct areaId,areaCode FROM first_level_area );
		/* 循环结束标识 */
		DECLARE CONTINUE HANDLER FOR NOT FOUND SET out_done = TRUE ; 
		
		/*区域临时表 */
		DROP TEMPORARY TABLE IF EXISTS t_area;
		CREATE TEMPORARY TABLE `t_area` (
		`id` varchar(255),
		`areaCode` varchar(20),
		`areaName` varchar(20),
		`parentId` varchar(20),
		`remark` varchar(256),
		 KEY `id`(id),
		 KEY `areaCode`(areaCode)
	);

		/* 一级区域临时表，存储一级区域*/
		DROP TEMPORARY TABLE IF EXISTS first_level_area;
		CREATE TEMPORARY TABLE first_level_area 
			(
			 areaId INT(13),
			 areaCode VARCHAR(60),
			 KEY `areaId` (areaId)
			);
			/* 一级区域子区域关联表，存储一级区域及子区域集合的关联关系，包含一级区域名称*/
			DROP TEMPORARY TABLE IF EXISTS first_level_area_relation;
		  CREATE TEMPORARY TABLE first_level_area_relation 
			(
			 currentAreaCode VARCHAR(60),
			 childAreaCode VARCHAR(60),
			 currentAreaName VARCHAR(60),
			 KEY `relation_currentAreaCode` (currentAreaCode),
			  KEY `relation_childAreaCode` (childAreaCode)
			);
			REPLACE INTO t_area SELECT * FROM AREA;
			REPLACE INTO first_level_area  SELECT ID,areaCode FROM t_area WHERE parentId = -1;
		
		
		
			
		/* 遍历游标 */
		OPEN out_cursor ; 
		WHILE NOT out_done DO 
				FETCH out_cursor INTO v_areaId,v_areaCode; 
				IF NOT out_done THEN 	
						REPLACE INTO first_level_area_relation
						SELECT w.areaCode,h.areaCode childAreaCode,w.areaName FROM 
						(
							/* 生成一级区域和子区域集合的关联关系 */
							SELECT q.areaCode,t.childAreaId,q.areaName
							FROM
							(
								SELECT v_areaId AS current_areaId,substring_index(substring_index(a.childs,',',b.help_topic_id+1),',',-1) childAreaId
								FROM 
								(SELECT queryChildren(v_areaId) childs) a
								JOIN
								mysql.help_topic b
								ON b.help_topic_id < (length(a.childs) - length(REPLACE(a.childs,',',''))+1)
							) t,area q
							WHERE t.current_areaId = q.id
							AND t.childAreaId <> '-1'
							) w,area h
						WHERE w.childAreaId = h.id;
				END IF; 
		END WHILE; 
		CLOSE out_cursor ;
		/* 统计SQL ,利用中间表first_level_area_relation*/
		SELECT
		tq.currentAreaName AS "所属地区",
		tq.currentAreaCode AS "区域码",
		tq.currentAreaName AS "区域名称",
		sum(
			CASE
			WHEN appType = 0 THEN
				1
			ELSE
				0
			END
		) AS "单引擎数量",
		sum(
			CASE
			WHEN appType = 1 THEN
				1
			ELSE
				0
			END
		) AS "双引擎数量",
		count(*) AS "该地区盒子总数量"
	FROM
		smartcard_district_relation s,t_area a,first_level_area_relation tq
		WHERE s.districtCode = tq.childAreaCode
		AND tq.childAreaCode = a.areaCode
	GROUP BY tq.currentAreaCode
	ORDER BY  tq.currentAreaName,tq.currentAreaCode;
	
END
;;
delimiter ;

-- ----------------------------
-- Function structure for queryChildren
-- ----------------------------
DROP FUNCTION IF EXISTS `queryChildren`;
delimiter ;;
CREATE FUNCTION `queryChildren`(parameter INT)
 RETURNS varchar(4000) CHARSET utf8
BEGIN
    DECLARE sTemp TEXT(60000);
    DECLARE sTempChd TEXT(30000);
    SET sTemp = '-1';
    SET sTempChd =CAST(parameter AS CHAR);
    WHILE (sTempChd IS NOT NULL) DO
        SET sTemp = CONCAT(sTemp,',',sTempChd);
        SELECT GROUP_CONCAT(id) INTO sTempChd FROM t_area WHERE FIND_IN_SET(PARENTID,sTempChd)>0;				
    END WHILE;
    RETURN sTemp;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
```
# <span id="inline-blue">验证</span>
```sql
call caculateTVboxTotal;
```


