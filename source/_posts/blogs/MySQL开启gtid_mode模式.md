---
title: MySQL开启gtid_mode模式
categories:
	- MySQL
tags: 
	- MySQL
	
date: 2024-08-12 10:03:47	
updated: 2024-08-12 10:03:47
---
<!-- toc -->
# <span id="inline-blue">环境</span>
MySQL: 5.7
# <span id="inline-blue">背景</span>
使用OpenGauss数据库迁移工具chameleon迁移MySQL全量数据需要MySQL支持gtid_mode模式。
# <span id="inline-blue">实现</span>
尝试在mysql控制台设置环境变量，被告知只读变量，通过配置文件又无法启动。
## <span id="inline-blue">在线修改</span>
需要以root身份在mysql服务器端的mysql控制台进行如下操作，其实就是gtid_mode不能直接设置为ON。按下列步骤依次操作即可。
```shell
set global gtid_mode=on;
--  ERROR 1788 (HY000): The value of @@GLOBAL.GTID_MODE can only be changed one step at a time: OFF <-> OFF_PERMISSIVE <-> ON_PERMISSIVE <-> ON. Also note that this value --  must be stepped up or down simultaneously on all servers. See the Manual for instructions.
set global gtid_mode=OFF_PERMISSIVE;
set global gtid_mode=ON_PERMISSIVE;
set global gtid_mode=ON; 
-- 此处会有提示信息，必须要先设置 enforce_gtid_consistency=on
-- ERROR 3111 (HY000): SET @@GLOBAL.GTID_MODE = ON is not allowed because ENFORCE_GTID_CONSISTENCY is not ON.
set global enforce_gtid_consistency=on;
set global gtid_mode=ON;
```