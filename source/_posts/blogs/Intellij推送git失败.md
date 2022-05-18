---
title: IntelliJ推送git失败
tags: 
	- IntelliJ
	- Git
categories: IntelliJ
---

# <span id="inline-blue">现象</span> 
Push failed
			Fatal: HttpRequestException encountered.
			unable to access 'https://github.com/vanishke/DataStructure-Algorithm.git/': Unknown SSL protocol error in connection to github.com:443


# <span id="inline-blue">解决办法</span> 
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






