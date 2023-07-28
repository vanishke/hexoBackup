---
title: Windows删除文件失败解决办法
categories:
	- Windows

date: 2023-03-02 10:25:20
tags: 
	- Windows
---
<!-- toc -->

# <span id="inline-blue">现象</span>
远程工具向日葵采用复制粘贴方式拷贝文件至远程vpn环境卡死，取消一直不能成功的情况下在系统进程结束相关的进程，结果eclipse开发工具编译相关的项目文件提示之前拷贝文件的目录在执行mvn clean命令过程中无法删除，在工具外部执行强制删除也是一样的现象，无法修改文件的属性（不能变更文件夹的所有者和权限信息）
# <span id="inline-blue">问题原因</span>
文件夹被远程工具占用
定位方法：
windows任务栏右键启动任务管理器，打开资源监视器
搜索框填写被占用的文件夹名称，查找出对应的句柄，右键结束占用即可。
![任务管理器](/images/Windows/Windows_20230302_001.png)
![资源监视器](/images/Windows/Windows_20230302_002.png)
