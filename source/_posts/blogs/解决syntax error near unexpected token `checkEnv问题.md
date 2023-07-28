---
title: 解决syntax error near unexpected token `checkEnv问题
categories:
	- Linux

date: 2023-05-05 13:47:20
tags: 
	- Linux
---
<!-- toc -->

# <span id="inline-blue">现象</span>
windows环境下编辑修改了setup.sh脚本文件，重新打包放到linux环境安装提示syntax error near unexpected token `
```shell
: command not found
'setup.sh: line 38: syntax error near unexpeted token `checkEnv
```
# <span id="inline-blue">原因</span>
windows里写的shell脚本放到linux系统里运行就会提示上述错误,两个平台的系统换行符不一致导致
notepad++编辑器打开后，点击上方菜单栏视图->显示符号->显示所有符号
![Linux脚本编辑](/images/linux/Linux_20230505_001.png)

# <span id="inline-blue">解决办法</span>
点击上方菜单栏编辑->文档格式转换->转为unix(LF)
![Linux脚本编辑](/images/linux/Linux_20230505_002.png)

