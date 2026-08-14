---
title: Oracle禁用外键约束
tags:
	- Oracle
categories: 
	- Oracle
	
date: 2024-06-07 09:14:20
---

## 环境
Oracle:11.2.0.4.0
### 背景
业务需要变更表字段，关联表存在外键依赖，需要禁用外键依赖，数据修改完成后再恢复。
#### 禁用外键
```sql
#表名t_aaa_price_policy  外键约束名FK_T_AAA_PR_REFERENCE_T_AAA_PR
alter table t_aaa_price_policy disable constraint FK_T_AAA_PR_REFERENCE_T_AAA_PR
```

#### 启用外键
```sql
#表名t_aaa_price_policy  外键约束名FK_T_AAA_PR_REFERENCE_T_AAA_PR
alter table t_aaa_price_policy enable constraint FK_T_AAA_PR_REFERENCE_T_AAA_PR 
```
