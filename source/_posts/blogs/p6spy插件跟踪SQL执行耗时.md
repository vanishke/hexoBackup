---
title: P6spy插件跟踪SQL执行耗时
categories:
	- MySQL
tags: 
	- MySQL
	- P6spy
	
date: 2023-12-26 9:50:20
updated: 2023-12-26 9:50:20
---
<!-- toc -->

# <span id="inline-blue">环境</span>
MySQL : 5.7
Mybatis-plus: 3.3.1
Mybatis：3.5.3
SpringBoot: 2.2.6.RELEASE
SpringCloud: 2021.0.5
# <span id="inline-blue">背景</span>
微服务接口模块部署到现网环境，发现接口请求大量超时，需要对接口执行耗时的原因进行分析。
# <span id="inline-blue">实现</span>

## <span id="inline-blue">引入依赖</span>

```xml
<dependency>
    <groupId>p6spy</groupId>
    <artifactId>p6spy</artifactId>
    <version>3.9.1</version>
</dependency>
```
## <span id="inline-blue">修改数据库连接</span>
```properties
#spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
#spring.datasource.url=jdbc:mysql://10.9.216.14:3306/ihome_album?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=GMT%2B8&allowMultiQueries=true
spring.datasource.driver-class-name=com.p6spy.engine.spy.P6SpyDriver
spring.datasource.url=jdbc:p6spy:mysql://10.9.216.14:3306/ihome_album?serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf8&allowMultiQueries=true
#适配p6spy更改数据库连接导致启动报错，添加数据库配置项，指定数据库连接类型
spring.datasource.db-type=mysql
```

## <span id="inline-blue">添加spy.properties配置文件</span>
一开始将p6spy配置项直接配置在application.properties文件并由nacos下发，发现启动之后sql打印日志不是期待的自定义SQL打印，后面新建了对应的配置文件之后打印正常了
```properties
# 应用的拦截模块
modulelist=com.baomidou.mybatisplus.extension.p6spy.MybatisPlusLogFactory,com.p6spy.engine.outage.P6OutageFactory
# 自定义日志打印
#logMessageFormat=com.baomidou.mybatisplus.extension.p6spy.P6SpyLogger
logMessageFormat=com.p6spy.engine.spy.appender.CustomLineFormat
#日志输出到控制台
#appender=com.baomidou.mybatisplus.extension.p6spy.StdoutLogger
# 使用日志系统记录 sql
appender=com.p6spy.engine.spy.appender.Slf4JLogger
# 设置 p6spy driver 代理
deregisterdrivers=true
# 取消JDBC URL前缀
useprefix=true
# 配置记录 Log 例外,可去掉的结果集有error,info,batch,debug,statement,commit,rollback,result,resultset.
excludecategories=info,debug,result,batch,resultset,commit,rollback,result
# 日期格式
dateformat=yyyy-MM-dd HH:mm:ss
# 实际驱动可多个
#driverlist=org.h2.Driver
driverlist=com.mysql.cj.jdbc.Driver
logfile=spy.log
# 是否开启慢SQL记录
outagedetection=true
# 慢SQL记录标准 2 秒
outagedetectioninterval=10
# 自定义日志配置
# 可用的变量为:
#   %(connectionId)            connection id
#   %(currentTime)             当前时间
#   %(executionTime)           执行耗时
#   %(category)                执行分组
#   %(effectiveSql)            提交的SQL 换行
#   %(effectiveSqlSingleLine)  提交的SQL 不换行显示
#   %(sql)                     执行的真实SQL语句，已替换占位
#   %(sqlSingleLine)           执行的真实SQL语句，已替换占位 不换行显示
customLogMessageFormat=[%(currentTime)] [%(category)-%(connectionId)] [execute time: %(executionTime) ms] execute sql:\n %(sqlSingleLine)
```

# <span id="inline-blue">验证</span>
```shell
2023-12-26 09:55:01.699 [http-nio-10050-exec-3] INFO p6spy - [2023-12-26 09:55:01] [statement-4] [execute time: 99 ms] execute sql:SELECT t . id ,
		t.uid ,
		t.tv_box_id ,
		t.name ,
		t.code ,
		t.pid ,
		t.app_user_id ,
		t.material_count ,
		t.album_count ,
		t.order_num ,
		t.is_modifiable ,
		t.create_time ,
		t.modify_time ,
		t.platform ,
		t.sort_type ,
		t.order_type ,
		t.cover_url ,
		t.is_delete ,
		t.is_trash ,
		t.delete_time ,
		level,
		 create_type,
		 user_album_level ,
		t.trash_type ,
		t.trash_time ,
		t.is_album_makable ,
		t.cover_uid ,
		t.cover_extension ,
		t.is_cover_change
FROM tbl_tv_box_album t
WHERE t.tv_box_id = 22
		AND t.is_delete = 0
		AND t.is_trash = 0
		AND t.level = 0 
		2023-12-26 09:55:01.740 [http-nio-10050-exec-3] INFO p6spy - [2023-12-26 09:55:01] [statement-4] [execute time: 5 ms] execute sql:SELECT t . id ,
		t.uid ,
		t.tv_box_id ,
		t.name ,
		t.code ,
		t.pid ,
		t.app_user_id ,
		t.material_count ,
		t.album_count ,
		t.order_num ,
		t.is_modifiable ,
		t.create_time ,
		t.modify_time ,
		t.platform ,
		t.sort_type ,
		t.order_type ,
		t.cover_url ,
		t.is_delete ,
		t.is_trash ,
		t.delete_time ,
		level,
		 create_type,
		 user_album_level ,
		t.trash_type ,
		t.trash_time ,
		t.is_album_makable ,
		t.cover_uid ,
		t.cover_extension ,
		t.is_cover_change
FROM tbl_tv_box_album t
WHERE t.pid = '20231012824517107077'
		AND t.is_delete = 0
		AND t.is_trash = 0
ORDER BY  order_num asc,id desc
```