---
title: Visio反向生成数据库模型图
categories:
	- MySQL
date: 2022-05-27 14:23:20
tags: 
	- Windows
	- MySQL
	- Visio
---
<!-- toc -->

# <span id="inline-blue">安装MySQL ODBC驱动</span>
官网地址: https://dev.mysql.com/downloads/connector/odbc/5.1.html
选择对应操作系统版本,类型安装包下载(msi格式)，下载完按照提示安装。

# <span id="inline-blue">配置数据源</span>
打开 开始菜单->控制面板-》管理工具-》数据源配置
配置详情如下图
![MySQL系统数据源配置01](/images/Windows/MySQL/WM_20220620_001.png)

数据库连接信息，信息填完之后测试一下连接是否可用，检查参数是否正常。
![MySQL系统数据源配置02](/images/Windows/MySQL/WM_20220620_002.png)

# <span id="inline-blue">Visio生成数据库模型图</span>

创建对应类型visio文件,如下图：
![MySQL系统数据源配置03](/images/Windows/MySQL/WM_20220620_003.png)

新增数据源,如下图：
![MySQL系统数据源配置04](/images/Windows/MySQL/WM_20220620_004.png)

选择数据源连接驱动类型,如下图：
![MySQL系统数据源配置05](/images/Windows/MySQL/WM_20220620_005.png)

数据库连接详情配置,如下图：
![MySQL系统数据源配置06](/images/Windows/MySQL/WM_20220620_006.png)

校验用户名和密码,如下图：
![MySQL系统数据源配置07](/images/Windows/MySQL/WM_20220620_007.png)

选择数据库反向导出设置,如下图：
![MySQL系统数据源配置08](/images/Windows/MySQL/WM_20220620_008.png)

选择需要生成关系的数据库表项,如下图：
![MySQL系统数据源配置09](/images/Windows/MySQL/WM_20220620_009.png)

导出表项在当前文件生成数据对象,如下图：
![MySQL系统数据源配置10](/images/Windows/MySQL/WM_20220620_010.png)

# <span id="inline-blue">验证</span>
![MySQL系统数据源配置11](/images/Windows/MySQL/WM_20220620_011.png)