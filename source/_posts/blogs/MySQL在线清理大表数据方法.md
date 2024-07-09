---
title: MySQL在线清理大表数据方法
categories: 
	- Linux
tags: 
	- Linux
date: 2024-03-01 17:11:20
---
<!-- toc -->

## <span id="inline-blue">环境</span>
Linux : CentOS Linux release 7.6.1810 (Core) 
MySQL : 5.7
## <span id="inline-blue">背景</span>
现网模块在运行一段时间之后发现产生大量业务日志，占用系统硬盘空间，需要在线将历史数据清除，只保留1年的记录
## <span id="inline-blue">实现</span>
按日期统计查询t_sys_log表数据
```sql
select DATE_FORMAT(t.createTime,"%Y-%m-%d") date,count(*) num from t_sys_log t
group by DATE_FORMAT(t.createTime,"%Y-%m-%d")
order by num
desc;
```

创建一张和原始表一样结构的新表
```sql
CREATE TABLE `t_sys_log_new` (
  `id` bigint(13) NOT NULL AUTO_INCREMENT COMMENT '编号',
  `moduleName` varchar(50) DEFAULT NULL COMMENT '模块名称',
  `moduleType` varchar(50) DEFAULT NULL COMMENT '模块类型',
  `action` varchar(30) NOT NULL COMMENT '操作类型',
  `operatorType` varchar(20) DEFAULT NULL COMMENT '操作员类型',
  `operatorName` varchar(100) DEFAULT NULL COMMENT '操作员名称',
  `operatorId` varchar(64) DEFAULT NULL COMMENT '操作员ID',
  `operatorIp` varchar(20) DEFAULT NULL COMMENT '操作员IP',
  `logText` longtext COMMENT '日志信息',
  `createTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `index_sys_log_moduleType` (`moduleType`) USING BTREE,
  KEY `index_sys_log_action` (`action`) USING BTREE,
  KEY `index_sys_log_operatorName` (`operatorName`) USING BTREE,
  KEY `index_sys_log_createTime` (`createTime`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='日志信息表';
```
将2023年的业务日志记录暂存到t_sys_log_new
```sql
replace into t_sys_log_new
select * from t_sys_log t
where t.createTime >="2023-01-01 00:00:00";
```

清空原始表
删除原始表
```sql
truncate table t_sys_log;
drop table t_sys_log;
```

将新表重命名为原始表
```sql
rename table t_sys_log_new to t_sys_log;
```





