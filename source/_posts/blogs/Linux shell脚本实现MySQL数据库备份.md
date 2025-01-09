---
title: Linux shell脚本实现MySQL数据库备份
categories:
	- MySQL
tags: 
	- Linux
	- MySQL
	
date: 2025-01-03 16:36:03
updated: 2025-01-03 16:36:03
---
<!-- toc -->
# <span id="inline-blue">环境</span>
	Linux: CentOS Linux release 7.7.1908 (Core)
	MySQL：5.7
# <span id="inline-blue">背景</span>

线上服务对应数据库没有做备份，担心故障会导致数据丢失和业务异常，所以使用shell脚本定时备份数据库。

# <span id="inline-blue">mysqlBackup.sh</span>

```shell
#!/bin/bash

# 配置部分
DB_USER="root"
DB_PASSWORD="coship"
DB_NAME_LOVEHOME="lovehome_xw"
DB_NAME_IHOME_ALBUM="ihome_album_xw"
BACKUP_DIR="/home/mysqldump/backup/"
DATE=$(date +%Y%m%d)
BACKUP_SAVE_DAYS=7

# 创建备份目录（如果不存在）
mkdir -p ${BACKUP_DIR}/${DATE}

# 执行备份lovehome_xw
/home/mysql/bin/mysqldump -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME_LOVEHOME}  --ignore-table=${DB_NAME_LOVEHOME}.sys_log_api_his  --ignore-table=${DB_NAME_LOVEHOME}.read_msg_record_his  --ignore-table=${DB_NAME_LOVEHOME}.push_record_his > ${BACKUP_DIR}/${DATE}/${DB_NAME_LOVEHOME}_${DATE}.sql


# 检查lovehome_xw备份是否成功
if [ $? -eq 0 ]; then
  echo "Backup successful: ${BACKUP_DIR}/${DATE}/${DB_NAME_LOVEHOME}_${DATE}.sql" >> ${BACKUP_DIR}/${DATE}/backup.log
else
  echo "Backup failed for ${DB_NAME_LOVEHOME} at ${DATE}" >> ${BACKUP_DIR}/${DATE}/backup.log
fi

# 执行备份ihome_album_xw
/home/mysql/bin/mysqldump -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME_IHOME_ALBUM} > ${BACKUP_DIR}${DATE}/${DB_NAME_IHOME_ALBUM}_${DATE}.sql


# 检查ihome_album_xw备份是否成功
if [ $? -eq 0 ]; then
  echo "Backup successful: ${BACKUP_DIR}/${DATE}/${DB_NAME_IHOME_ALBUM}_${DATE}.sql" >> ${BACKUP_DIR}/${DATE}/backup.log
else
  echo "Backup failed for ${DB_NAME_IHOME_ALBUM} at ${DATE}" >> ${BACKUP_DIR}/${DATE}/backup.log
fi

cd ${BACKUP_DIR}
rm -rf `find ${BACKUP_DIR}  -type d -mtime +${BACKUP_SAVE_DAYS}` >> ${BACKUP_DIR}/backupClear.log
echo "删除${BACKUP_SAVE_DAYS}天前的备份文件完成" >> ${BACKUP_DIR}/backupClear.log

```

mysqldump使用绝对路径，否则通过crontab系统定时任务支持脚本备份数据为空。
--ignore-table用于指定备份需要忽略的表项，忽略多个表的情况下指定多次。
BACKUP_SAVE_DAYS参数控制备份文件只保留7天以内。

# <span id="inline-blue">crontab定时任务</span>

```shell
0 1  * * * cd /DB  && sh mysqlBackup.sh /dev/null 2>&1
```

凌晨一点执行数据库备份脚本。

参考：

https://liam.page/2016/06/19/best-match-using-find-and-crontab-to-removed-outdated-files/

http://www.360doc.com/content/24/0701/12/83536423_1127581357.shtml
