---
title: Windows环境下FTP常用命令
categories: 
	- windows
	- FTP
tags: 
	- windows
	- FTP
date: 2022-03-15 17:11:20
---
<!-- toc -->

## <span id="inline-blue">FTP登陆</span>
FTP地址:10.9.212.55
FTP用户名:report_cd
FTP密码:report_cd

用于上传和下载的本地工作目录:E:\program

运行命令行工具cmd.exe(C:\Windows\System32\cmd.exe)

```shell
#切换目录为本地工作目录(先切盘符，再cd到具体路径)
>e:
>cd program
#FTP登陆 IP地址或域名
>ftp 10.9.212.55
```
![FTP登陆](/images/Windows/FTP/WF_20220315_001.png)

## <span id="inline-blue">上传文件</span>

### <span id="inline-blue">单个文件上传</span>
put命令或send均可实现单个文件上传
```shell
ftp> put 11479.jpg
ftp> send 11481.jpg
```
![FTP上传](/images/Windows/FTP/WF_20220315_002.png)
![FTP上传](/images/Windows/FTP/WF_20220315_003.png)


### <span id="inline-blue">批量文件上传</span>
```shell
#将批量上传用户提示关闭(prompt命令自动切换用户提示状态)
ftp> prompt
#支持通配符格式
ftp>mput *.jpg
```
![FTP上传](/images/Windows/FTP/WF_20220315_004.png)

## <span id="inline-blue">下载文件</span>

### <span id="inline-blue">单个文件下载</span>

```shell
ftp> get 101614000t5m.jpg
```
![FTP下载](/images/Windows/FTP/WF_20220315_005.png)
### <span id="inline-blue">批量文件下载</span>
```shell
ftp> mget *.jpg
```
![FTP下载](/images/Windows/FTP/WF_20220315_006.png)

## <span id="inline-blue">切换目录</span>
```shell
#directory为对应的目录名称
ftp>cd directory
```

## <span id="inline-blue">查看目录信息</span>
```shell
ftp>ls
```
## <span id="inline-blue">指定本地工作目录</span>
lcd命令可指定FTP用户的本地工作目录(上传和下载的文件均放置在这个目录)
```shell
#本地工作目录为绝对路径
ftp>lcd E:\program
```
## <span id="inline-blue">连接和关闭命令</span>
```shell
#打开连接
ftp>open 10.9.212.55
#关闭连接
ftp>close 10.9.212.55
```

## <span id="inline-blue">退出FTP命令</span>
```shell
ftp>bye
ftp>quit
```

## <span id="inline-blue">FTP命令帮助信息</span>
```shell
ftp>help
```
![FTP命令帮助信息](/images/Windows/FTP/WF_20220315_007.png)