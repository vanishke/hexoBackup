---
title: Eclipse安装Jetty插件
tags: 
	- Eclipse
	- Jetty
categories: 
	- Eclipse

date: 2021-08-31 18:07:15	
updated: 2021-08-31 18:07:15
---
# <span id="inline-blue">插件下载地址连接失败解决办法</span> 
1. 访问https://github.com.ipaddress.com/ 查找到github公网IP地址
![查找结果](/images/intelliJ/intelliJ_2021_04_29_001.png)

2. 将github网站IP地址映射添加到C:\Windows\System32\drivers\etc目录下的hosts文件中，文件末尾添加如下内容：
```shell
140.82.114.4 github.com
```
3. 刷新本地DNS缓存
cmd命令模式下执行以下命令：
```shell
ipconfig /flushdns
```

# <span id="inline-blue">在线安装</span> 
eclipse菜单栏依次点击  Help>eclipse Marketplace
安装版本选择第一项(可以切换不同的版本),安装之后重启eclispe,jetty插件才能生效
![安装步骤1](/images/eclipse/eclipse_jetty_2021_08_31_001.png)
选中项目可直接右键jetty启动
![安装步骤2](/images/eclipse/eclipse_jetty_2021_08_31_002.png)
配置jetty启动选项
![安装步骤3](/images/eclipse/eclipse_jetty_2021_08_31_003.png)
设置项目启动端口、jetty版本、访问项目名称
![安装步骤4](/images/eclipse/eclipse_jetty_2021_08_31_004.png)
配置jvm启动参数,项目对应启动配置文件所在位置、jrebel插件参数配置
![安装步骤5](/images/eclipse/eclipse_jetty_2021_08_31_005.png)
配置项目部署class文件以及依赖jar包,主要解决子项目依赖导致jar包冲突
![安装步骤6](/images/eclipse/eclipse_jetty_2021_08_31_006.png)








