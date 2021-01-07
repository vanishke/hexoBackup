---
title: Windows创建FTP
categories: FTP
date: 2020-12-24 10:11:20
tags: Windows,FTP
---
<!-- toc -->

## 创建FTP用户

1. 打开计算机管理，依次打开本地用户和组->用户，右键新增用户，用户和密码自行定义即可，选项设置用户不可更改密码和密码永不过期

![新建用户](/images/Windows/FTP/WF_20201230_01.png)
![用户信息](/images/Windows/FTP/WF_20201230_02.png)

2. 创建FTP用户report_cd对应的目录H:\home\report_cd

![用户工作目录](/images/Windows/FTP/WF_20201230_04.png)

##  开启FTP服务

![开启FTP服务](/images/Windows/FTP/WF_20201230_03.png)



## 创建FTP_SERVER网站

![创建FTP_SERVER](/images/Windows/FTP/WF_20201230_05.png)



## FTP_SERVER网站添加FTP站点

![创建FTP_SERVER](/images/Windows/FTP/WF_20201230_06.png)
![创建FTP_SERVER](/images/Windows/FTP/WF_20201230_07.png)

## 设置访问路径共享

![创建FTP_SERVER](/images/Windows/FTP/WF_20201230_08.png)

## 验证FTP用户访问

```bash
ftp://report_cd:report_cd@10.9.212.55:21
```

![验证](/images/Windows/FTP/WF_20201230_09.png)