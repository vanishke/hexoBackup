---
title: 每天一个linux命令
categories: 
	- Linux
date: 2020-11-17 11:27:20
tags: Linux
top: 2
---
[toc]
# 文件和目录管理

## cat命令

***作用***
	合并文件内容并显示
	
***参数***
-A //显示特殊字符	
-n //对所有输出的行编号

***实例***
cat -A jdbc1.properties 
```bash
// 显示特殊字符
dbSrc=mysql$
```
cat -n jdbc2.properties 	
```bash
// 对输出行编号
 1	dbUrl=jdbc:mysql://10.9.216.14:3306/test?useUnicode=true&amp;characterEncoding=UTF-8
 2	dbUserName=root
```
cat jdbc1.properties jdbc2.properties >jdbc.properties
```bash
//合并jdbc1.properties、jdbc2.properties 文件内容到jdbc.properties并输出
dbSrc=mysql
dbUrl=jdbc:mysql://10.9.216.14:3306/test?useUnicode=true&amp;characterEncoding=UTF-8
dbUserName=root
```

## tar命令

参数说明：
运行tar时必须要有下列参数中的至少一个才可运行：
-A | --catenate | --concatenate 将一存档与已有的存档合并
-c | --create 建立新的存档
-d | --diff, --compare 比较存档与当前文件的不同之处
--delete 从存档中删除
-r | --append 附加到存档结尾
-t | --list 列出存档中文件的目录
-u |--update 仅将较新的文件附加到存档中
-x | --extract | --get 从存档展开文件
-z | --gzip | --ungzip 用gzip对存档压缩或解压
-f | --file [HOSTNAME:]F 指定存档或设备（缺省为 /dev/rmt0）
-x | --extract | --get 从存档展开文件
-v | --verbose 详细显示处理的文件

***压缩***
```shell
命令格式：tar -czf  压缩文件名.tar.gz  被压缩文件名

可先切换到当前目录下。压缩文件名和被压缩文件名都可加入路径。

示例：tar -czf etl.V300R002B042.tar.gz etl.V300R002B042/
```






***解压缩***

```shell
　命令格式：tar -zxvf  压缩文件名.tar.gz
　
　解压缩后的文件只能放在当前的目录。

  示例：tar -zxvf etl.V300R002B042.tar.gz 
```





