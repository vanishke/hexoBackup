---
title: Linux-文档编辑
categories: Linux
date: 2022-05-19 11:27:20
tags: Linux
top: 2
---
<!-- toc -->

## <span id="inline-blue">vim命令</span>

**作用**
vi命令是unix和类unix系统通用全屏幕文本编辑器，vim是vi的加强版，与vi完全兼容，并添加了很多增强功能。
**选项**
```shell
crtl+u: 向文件首翻半屏。
crtl+d: 此文件尾翻半屏。
crtl+f: 向文件首翻一屏。
crtl+b: 向文件尾翻一屏。
ESC:从编辑模式切换到命令模式。
:行号 :光标跳到指定行的行首。
:$ :光标跳到文件尾。
/字符串 :文本查找操作，从光标所在当前位置向文件尾部查找指定的字符串，查找到的字符串高亮显示。
:wq :命令模式下，执行存盘并退出。
:q :命令模式下，执行退出。
:w! :命令模式下，强制执行存盘操作。
:q! :命令模式下，强制执行退出vi命令。
:set number :命令模式下，显示行号。
:set nonumber :命令模式下，不显示行号。
```
**示例**
```shell

# 显示行号
  1 [20201203] 16:47:12 Begin
  2 [20201203] 16:47:13 Import assetFileTask_0_20201203_010000_3
  3 [20201203] 16:47:16 Import assetFileTask_0_20201203_010020_4
  4 [20201203] 16:47:22 Import assetMapAssetTypeTask_0_20201203_010000_3
  5 [20201203] 16:47:24 Import assetMapAssetTypeTask_0_20201203_010003_4
  6 [20201203] 16:47:26 Import assetOrAssetFileTask_0_20201203_010000_9
  7 [20201203] 16:47:28 Import assetOrAssetFileTask_0_20201203_010040_10
  8 [20201203] 16:47:30 Import assetOrAssetFileTask_0_20201203_010047_11
  9 [20201203] 16:47:32 Import assetOrAssetFileTask_0_20201203_010055_12
 10 [20201203] 16:47:34 Import assetTask_0_20201203_010000_3
 11 [20201203] 16:47:38 Import assetTask_0_20201203_010019_4
 12 [20201203] 16:47:41 Import assetTypeTask_0_20201203_010000_0
 13 [20201203] 16:47:43 Import cdrTask_0_20201203_020000_15
 14 [20201203] 16:47:46 Import cdrTask_0_20201203_021042_16
 15 [20201203] 16:47:52 Import cdrTask_0_20201203_021201_17
 16 [20201203] 16:47:59 Import cdrTask_0_20201203_021321_18
 17 [20201203] 16:48:06 Import cdrTask_0_20201203_021441_19
 18 [20201203] 16:48:14 Import cdrTask_0_20201203_021600_20
 19 [20201203] 16:48:20 Import channelTask_0_20201203_010000_0
 20 [20201203] 16:48:22 Import cmsDictTask_0_20201203_010000_0
 21 [20201203] 16:48:23 Import columnTask_0_20201203_010000_0
 22 [20201203] 16:48:25 Import orderTask_0_20201203_010000_0
 23 [20201203] 16:48:27 Import portalOrderInfoTask_0_20201203_010000_0
 24 [20201203] 16:48:28 Import productColumnTask_0_20201203_010000_0
 25 [20201203] 16:48:29 Import productResourceTask_0_20201203_010000_0
 26 [20201203] 16:48:30 Import productSpecMapTask_0_20201203_010000_0
 27 [20201203] 16:48:32 Import programGuideTask_0_20201203_010000_0
 28 [20201203] 16:48:33 Import providerTask_0_20201203_010000_0
 29 [20201203] 16:48:34 Import resColumnTask_0_20201203_010000_0
 30 [20201203] 16:48:38 Import resourcePkgTask_0_20201203_010000_0
 31 [20201203] 16:48:41 Import serviceProductInfo_0_20201203_010000_0
 32 [20201203] 16:48:42 Import serviceResourceInfo_0_20201203_010000_0
 33 [20201203] 16:48:44 Import userRelationTask_0_20201203_010000_0
 34 [20201203] 16:48:45 Import userTask_0_20201203_010000_69
 35 [20201203] 16:48:48 Import userTask_0_20201203_010117_70
:set number   

# 查找columnTask字符串对应的内容。
  1 [20201203] 16:47:12 Begin
  2 [20201203] 16:47:13 Import assetFileTask_0_20201203_010000_3
  3 [20201203] 16:47:16 Import assetFileTask_0_20201203_010020_4
  4 [20201203] 16:47:22 Import assetMapAssetTypeTask_0_20201203_010000_3
  5 [20201203] 16:47:24 Import assetMapAssetTypeTask_0_20201203_010003_4
  6 [20201203] 16:47:26 Import assetOrAssetFileTask_0_20201203_010000_9
  7 [20201203] 16:47:28 Import assetOrAssetFileTask_0_20201203_010040_10
  8 [20201203] 16:47:30 Import assetOrAssetFileTask_0_20201203_010047_11
  9 [20201203] 16:47:32 Import assetOrAssetFileTask_0_20201203_010055_12
 10 [20201203] 16:47:34 Import assetTask_0_20201203_010000_3
 11 [20201203] 16:47:38 Import assetTask_0_20201203_010019_4
 12 [20201203] 16:47:41 Import assetTypeTask_0_20201203_010000_0
 13 [20201203] 16:47:43 Import cdrTask_0_20201203_020000_15
 14 [20201203] 16:47:46 Import cdrTask_0_20201203_021042_16
 15 [20201203] 16:47:52 Import cdrTask_0_20201203_021201_17
 16 [20201203] 16:47:59 Import cdrTask_0_20201203_021321_18
 17 [20201203] 16:48:06 Import cdrTask_0_20201203_021441_19
 18 [20201203] 16:48:14 Import cdrTask_0_20201203_021600_20
 19 [20201203] 16:48:20 Import channelTask_0_20201203_010000_0
 20 [20201203] 16:48:22 Import cmsDictTask_0_20201203_010000_0
 21 [20201203] 16:48:23 Import columnTask_0_20201203_010000_0
 22 [20201203] 16:48:25 Import orderTask_0_20201203_010000_0
 23 [20201203] 16:48:27 Import portalOrderInfoTask_0_20201203_010000_0
 24 [20201203] 16:48:28 Import productColumnTask_0_20201203_010000_0
 25 [20201203] 16:48:29 Import productResourceTask_0_20201203_010000_0
 26 [20201203] 16:48:30 Import productSpecMapTask_0_20201203_010000_0
 27 [20201203] 16:48:32 Import programGuideTask_0_20201203_010000_0
 28 [20201203] 16:48:33 Import providerTask_0_20201203_010000_0
 29 [20201203] 16:48:34 Import resColumnTask_0_20201203_010000_0
 30 [20201203] 16:48:38 Import resourcePkgTask_0_20201203_010000_0
 31 [20201203] 16:48:41 Import serviceProductInfo_0_20201203_010000_0
 32 [20201203] 16:48:42 Import serviceResourceInfo_0_20201203_010000_0
 33 [20201203] 16:48:44 Import userRelationTask_0_20201203_010000_0
 34 [20201203] 16:48:45 Import userTask_0_20201203_010000_69
 35 [20201203] 16:48:48 Import userTask_0_20201203_010117_70
/columnTask
```

## <span id="inline-blue">head命令</span>

**作用**
	显示文件开头内容，默认显示前10行

**选项**

-n<数字> :指定显示的行数
-c<数字> :指定显示的字符数
-v :显示文件头部信息
-q :不显示文件头部信息

**示例**
```shell

# 显示my.cnf.bak文件的前3行内容
[root@dap mysql]# head -3 my.cnf.bak 
# For advice on how to change settings please see
# http://dev.mysql.com/doc/refman/5.6/en/server-configuration-defaults.html

# 显示100个字符
# For advi[root@dap mysql]# head -c 100 my.cnf.bak 
# For advice on how to change settings please see
# http://dev.mysql.com/doc/refman/5.6/en/server-co

#显示my.cnf.bak 文件头部信息
[root@dap mysql]# head -v my.cnf.bak 
==> my.cnf.bak <==
# For advice on how to change settings please see
# http://dev.mysql.com/doc/refman/5.6/en/server-configuration-defaults.html

[mysqld]

# Remove leading # and set to the amount of RAM for the most important data
# cache in MySQL. Start at 70% of total RAM for dedicated server, else 10%.
# innodb_buffer_pool_size = 128M

# Remove leading # to turn on a very important data integrity option: logging


#不显示my.cnf.bak文件头部信息
[root@dap mysql]# head -q my.cnf.bak 
# For advice on how to change settings please see
# http://dev.mysql.com/doc/refman/5.6/en/server-configuration-defaults.html

[mysqld]

# Remove leading # and set to the amount of RAM for the most important data
# cache in MySQL. Start at 70% of total RAM for dedicated server, else 10%.
# innodb_buffer_pool_size = 128M

# Remove leading # to turn on a very important data integrity option: logging

```

## <span id="inline-blue">rm命令 </span>

**作用**
	删除一个目录下的多个文件或目录，对于链接文件，只删除整个链接文件，而原有文件不变。

**选项** 
```shell
-d 直接把目录的硬链接数删除为0，删除该目录。
-f 强制删除该目录。
-i 删除前先询问是否删除。
-r 递归删除目录下的文件和子目录。
-v 显示详细的删除信息
```
**示例**
```shell
# 删除b.sh文件
[root@demo_mdn script]# rm b.sh
rm：是否删除普通空文件 "b.sh"？y

# 强制删除b.sh文件
[root@demo_mdn script]# rm -f b.sh
[root@demo_mdn script]# 

# 强制递归删除newDir目录，并显示详细信息
[root@demo_mdn script]# rm -rfv newDir
已删除"newDir/1.txt"
已删除"newDir/1.txt~"
已删除目录："newDir/oldDir"
已删除目录："newDir"

```

## <span id="inline-blue">cat命令</span>

***作用***
	合并文件内容并显示
	
***选项***
```shell
	-A //显示特殊字符	
	-n //对所有输出的行编号
```

***实例***

```shell
#显示特殊字符
[root@demo_mdn user]# cat -A jdbc1.properties
dbSrc=mysql$

#对输出行编号
[root@demo_mdn user]# cat -n jdbc2.properties 
 1	dbUrl=jdbc:mysql://10.9.216.14:3306/test?useUnicode=true&amp;characterEncoding=UTF-8
 2	dbUserName=root

#合并jdbc1.properties、jdbc2.properties 文件内容到jdbc.properties并输出
[root@demo_mdn user]# cat jdbc1.properties jdbc2.properties >jdbc.properties
dbSrc=mysql
dbUrl=jdbc:mysql://10.9.216.14:3306/test?useUnicode=true&amp;characterEncoding=UTF-8
dbUserName=root
```

## <span id="inline-blue">tar命令</span>

选项
```shell
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
```
***压缩***
```shell
命令格式：tar -czf  压缩文件名.tar.gz  被压缩文件名

可先切换到当前目录下。压缩文件名和被压缩文件名都可加入路径。

示例：tar -czf etl.V300R002B042.tar.gz etl.V300R002B042/
```





