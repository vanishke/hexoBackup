---
title: 每天一个linux命令
categories: Linux
date: 2020-11-17 11:27:20
tags: Linux
top: 2
---
<!-- toc -->

# <span id="inline-blue">文件和目录管理 </span>

## <span id="inline-blue">unlink命令</span>

**作用**
删除指定的文件，功能和rm命令一样。

**选项**
```shell
--version 
--help
```
**示例**
```shell
[root@lwdCSCDN tmp]# ls
a.txt  elasticsearch-2738171260560954631  erm_gd  jna-3246  mysql.sock  parentDir  pulse-24KvvDfOHjjf  report  v8-compile-cache-0
[root@lwdCSCDN tmp]# unlink a.txt 
[root@lwdCSCDN tmp]# ls
elasticsearch-2738171260560954631  erm_gd  jna-3246  mysql.sock  parentDir  pulse-24KvvDfOHjjf  report  v8-compile-cache-0
```


## <span id="inline-blue">mkdir命令</span>

**作用**
mkdir用来创建dirname指定的目录。

**选项**
```shell
-Z：设置安全上下文，当使用SELinux时有效；
-m<目标属性>或--mode<目标属性>建立目录的同时设置目录的权限；
-p或--parents 若所要建立目录的上层目录目前尚未建立，则会一并建立上层目录；
--version 显示版本信息。
```

**示例**
```shell
# 不指定目录的情况下，默认当前目录
[root@lwdCSCDN tmp]# mkdir report

# 父级目录不存在，创建多级目录报错
[root@lwdCSCDN tmp]# mkdir ./parentDir/newDir
mkdir: 无法创建目录"./parentDir/newDir": 没有那个文件或目录

# 指定-p选项，创建多级目录
[root@lwdCSCDN tmp]# mkdir -p ./parentDir/newDir
[root@lwdCSCDN tmp]# ls
elasticsearch-2738171260560954631  erm_gd  jna-3246  mysql.sock  parentDir  pulse-24KvvDfOHjjf  report  v8-compile-cache-0
```

## <span id="inline-blue">chown命令</span>

**作用**
```shell
chown命令用于改变一个文件或目录的所有者或用户组，用户可以是用户名或者用户ID，群组可以是群组名或者群组ID，文件名可以是空格分割的文件列表，也可以是通配符描述的集合，只有文件主和超级用户才可以使用该命令。
```
**选项**

-c:与-v命令相似，仅显示变更的内容。
-f:不显示错误信息。
-h:只对符号链接文件做修改，不改变其对应的原始文件。
-R:递归处理，将命令目录下的所有文件和子目录一并处理。
-v:显示命令执行详细过程。
--reference=<参考文件或目录>：把指定文件或目录的拥有者与所属群组全部设成和参考文件或目录的拥有者与所属群组相同。
--help:在线帮助。
--version:显示版本信息。


**示例**
```shell
# 将erm_gd目录下的文件和目录所属者更改为report_cd,群组修改为report_cd
[root@lwdCSCDN tmp]# chown -R report_cd:report_cd erm_gd
[root@lwdCSCDN tmp]# cd erm_gd/
You have new mail in /var/spool/mail/root
[root@lwdCSCDN erm_gd]# ll
总用量 210608
-rw-r--r-- 1 report_cd report_cd 214757130 1月   5 17:47 dg_erm_mysql.sql
-rw-r--r-- 1 report_cd report_cd    681075 1月   5 17:47 dg_global.sql
```

## <span id="inline-blue">chgrp命令</span>

**作用**
```shell
chgrp用来变更文件或目录的所属群组。
组名可以是用户组的id,也可以是用户组的名称，文件名可以是空格分割的文件列表，也可以是通配符描述的集合，只有文件主和超级用户才可以使用该命令。
```
**选项**
-c:与-v命令像相似，仅显示变更的部分。
-f:不显示错误信息。
-h:只对符号链接文件做修改，不改变其对应的原始文件。
-R:递归处理，对指令目录下的文件及目录一并处理。
-v:显示命令执行的详细过程。
--reference=<参考文件或目录>:把指定文件或目录设置成参考文件或目录相同的群组。

**示例**
```shell
# 将erm_gd目录的群组递归更改为report_hrb,显示详细的处理过程。
[root@lwdCSCDN tmp]# ls
elasticsearch-2738171260560954631  erm_gd  mysql.sock  pulse-24KvvDfOHjjf  v8-compile-cache-0
[root@lwdCSCDN tmp]# chgrp -vR report_hrb erm_gd
"erm_gd/dg_global.sql" 的所属组已更改为report_hrb
"erm_gd/dg_erm_mysql.sql" 的所属组已更改为report_hrb
"erm_gd" 的所属组已更改为report_hrb
```
## <span id="inline-blue">chattr命令</span>

**作用**
```shell
chattr命令用来更改文件属性，这项指令可更改ext32文件系统文件或目录属性，属性一共以下8种模式：
a:限制文件或目录仅提供附加用途。
b:不更新文件或目录的最后存取时间。
c:将文件和目录压缩后存放。
d:将文件或目录排除在倾倒操作之外。
i:不得更改文件和目录。
s:保密性删除文件或目录。
S:及时更新文件或目录。
u:预防意外性删除。
```
**选项**

-R:将命令目录下的所有文件和子目录一并处理。
-v<版本号>:指定文件或目录的版本信息。
+属性：开启文件或目录的该项属性。
-属性：关闭文件或目录的该项属性。
=属性：指定文件或目录的该项属性。

**示例**
```shell
# 防止系统中某个文件系统内容被更改。
[root@lwdCSCDN erm_gd]# chattr +i a.txt 
You have new mail in /var/spool/mail/root
[root@lwdCSCDN erm_gd]# rm -rf a.txt 
rm: 无法删除"a.txt": 不允许的操作

# 限制a.txt文件只能进行附加操作
[root@lwdCSCDN erm_gd]# chattr +a a.txt 
[root@lwdCSCDN erm_gd]# echo "cover the file a.txt" > a.txt
-bash: a.txt: 不允许的操作
You have new mail in /var/spool/mail/root

# 采用附加方式添加内容
[root@lwdCSCDN erm_gd]# echo "append content to file a.txt" >> a.txt
You have new mail in /var/spool/mail/root
[root@lwdCSCDN erm_gd]# vim a.txt 

:ewewqfdsf
append content to file a.txt

# 不可随意更动文件或目录
[root@lwdCSCDN erm_gd]# chattr +i a.txt
[root@lwdCSCDN erm_gd]# rename a.txt aa.txt a.txt 
rename: renaming a.txt to aa.txt failed: 不允许的操作
You have new mail in /var/spool/mail/root
```


## <span id="inline-blue">stat命令</span>

**作用**
	显示文件状态信息，stat命令的输出信息比ls命令的输出信息要更详细。

**选项**

-L : 支持符号链接
-t : 以简洁方式显示输出信息。
-f : 显示文件系统状态而不是文件状态。
--version : 显示命令版本。
--help : 显示命令帮助信息。


**示例**

```shell
#显示文件状态
[root@lwdCSCDN log1]# stat ETL.log
  File: "ETL.log"
  Size: 7341608   	Blocks: 14352      IO Block: 4096   普通文件
Device: 804h/2052d	Inode: 10495794    Links: 3
Access: (0777/-rwxrwxrwx)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2020-12-28 11:06:47.226634512 +0800
Modify: 2020-12-18 14:47:43.471294256 +0800
Change: 2020-12-18 14:55:58.935352996 +0800
You have new mail in /var/spool/mail/root

#显示文件系统状态
[root@lwdCSCDN log1]# stat -f ETL.log
  File: "ETL.log"
    ID: abb37a7c2e029036 Namelen: 255     Type: ext2/ext3
Block size: 4096       Fundamental block size: 4096
Blocks: Total: 45356622   Free: 29156603   Available: 26852603
Inodes: Total: 11526144   Free: 10551557

#以简洁方式展现文件状态信息
[root@lwdCSCDN log1]# stat -t ETL.log
ETL.log 7341608 14352 81ff 0 0 804 10495794 3 0 0 1609124807 1608274063 1608274558 4096
```

## <span id="inline-blue">file命令</span>

**作用**
    file命令用于探测文件类型，file命令分为文件系统、魔法幻数检查及语言检查3个过程.
**选项**


-b : 列出结果时，不显示文件名称。
-i : 探测文件结果以MIME字符串展示。
-L : 检测链接文件，并给出链接原始文件的类型。
-v : file命令版本信息。
-z : 尝试探测压缩类型文件。
-m : 指定魔法幻数文件。
-f : 指定文件，如果文件内容中有其他文件，依序辨识这些文件，输出格式为每列一个文件。
-c : 显示命令执行的详细过程。

**示例**

```shell
#显示文件类型
[root@lwdCSCDN log1]# file ETL.log
ETL.log: ASCII English text, with very long lines

# 不显示文件名称
[root@lwdCSCDN log1]# file -b ETL.log
ASCII English text, with very long lines

#以MIME格式展现探测结果
[root@lwdCSCDN log1]# file -b -i record.ini 
text/plain; charset=us-ascii
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

## <span id="inline-blue">more命令</span>

**作用**
	基于vi编辑文本过滤器，以全屏幕分页显示文件内容，支持vi模式下关键字定位操作。
	快捷键功能  
	enter :显示文本下一行内容 
	space : 显示下一屏文本  
	q:退出more命令 
	b:返回上一屏文本内容 
	h:显示帮助命令
	按斜线符/:接着输入一个模式，可以在文本中寻找下一个相匹配的模式。

**选项**
-d :输出帮助信息
-c :不进行滚屏，每次刷新这个屏幕。
-s :合并多余的空白行。
-u :禁止下划线
-n ：n代表每一屏展示的文本行数。

**示例**
```shell
# 一屏显示10行文本内容，文本空白行合并，显示提示信息，不进行滚屏，每次刷新整个屏幕。
[root@lwdCSCDN conf]# more -dsc -10 nginx.conf

#user  nobody;
user root;
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;
--More--(5%)[Press space to continue, 'q' to quit.]

# 搜索字符串‘limit’所在位置，按键盘上n键，可定位到下一个位置。
#user  nobody;
user root;
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;
/limit
```
## <span id="inline-blue">touch命令

**作用**
更改已存在文件的时间戳为当前时间戳，或创建新的文件
**选项**
-a :只变更访问时间
-m :只变更修改时间
-c :不创建新的文件
-r :更新指定文件或目录下的所有文件的时间戳。
-d :指定更新的时间戳字符串
-t :指定时间戳格式，MMDDhhmm 
**示例**

```shell
# 创建新的文件
[root@lwdCSCDN bin]# touch b.txt
[root@lwdCSCDN bin]# ll
总用量 3080
-rw-r--r-- 1 root root       0 12月 21 16:53 a.txt
drwxr-xr-x 4 root root    4096 12月 21 14:40 bi_common
-rw-r--r-- 1 root root   32279 10月  6 2016 bootstrap.jar
-rw-r--r-- 1 root root       0 12月 21 16:58 b.txt
-rw-r--r-- 1 root root   15026 10月  6 2016 catalina.bat
-rwxr-xr-x 1 root root   22443 10月  6 2016 catalina.sh

# -d指定更新的时间戳
[root@lwdCSCDN bin]# touch -d 2020-12-21 b.txt
[root@lwdCSCDN bin]# ll
总用量 3084
-rw-r--r-- 1 root root       0 12月 21 17:02 12211621
-rw-r--r-- 1 root root       0 12月 21 17:00 2020-12-21
-rw-r--r-- 1 root root       0 12月 21 16:53 a.txt
drwxr-xr-x 4 root root    4096 12月 21 14:40 bi_common
-rw-r--r-- 1 root root   32279 10月  6 2016 bootstrap.jar
-rw-r--r-- 1 root root       5 12月 21 00:00 b.txt


# -t指定更新时间
[root@lwdCSCDN bin]# touch -t 12211630 b.txt
[root@lwdCSCDN bin]# ll
总用量 3084
-rw-r--r-- 1 root root       0 12月 21 17:02 12211621
-rw-r--r-- 1 root root       0 12月 21 17:00 2020-12-21
-rw-r--r-- 1 root root       0 12月 21 16:53 a.txt
drwxr-xr-x 4 root root    4096 12月 21 14:40 bi_common
-rw-r--r-- 1 root root   32279 10月  6 2016 bootstrap.jar
-rw-r--r-- 1 root root       5 12月 21 16:30 b.txt
```

## <span id="inline-blue">pwd命令</span>

**作用**
	以绝对路径显示当前用户的所在目录
**选项**
-L :打印逻辑上的工作目录
-P :打印物理上的工作目录
**示例**
```shell
# 显示当前工作目录
[root@lwdCSCDN bin]# pwd
/usr/local/BI/hrb_BI/v300r002b210/apache-tomcat-8.0.38/bin
```

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

## <span id="inline-blue">ls命令</span>

**作用**
显示目标文件列表

**选项**
```shell
-a：显示所有文件和目录（ls内定将档案名或目录名称为“.”的视为影藏，不会列出）；
-A：显示除影藏文件“.”和“..”以外的所有文件列表；
-C：多列显示输出结果。这是默认选项；
-l：与“-C”选项功能相反，所有输出信息用单列格式输出，不输出为多列；
-F：在每个输出项后追加文件的类型标识符，具体含义：“*”表示具有可执行权限的普通文件，“/”表示目录，“@”表示符号链接，“|”表示命令管道FIFO，“=”表示sockets套接字。当文件为普通文件时，不输出任何标识符；
-b：将文件中的不可输出的字符以反斜线“”加字符编码的方式输出；
-c：与“-lt”选项连用时，按照文件状态时间排序输出目录内容，排序的依据是文件的索引节点中的ctime字段。与“-l”选项连用时，则排序的一句是文件的状态改变时间；
-d：仅显示目录名，而不显示目录下的内容列表。显示符号链接文件本身，而不显示其所指向的目录列表；
-f：此参数的效果和同时指定“aU”参数相同，并关闭“lst”参数的效果；
-i：显示文件索引节点号（inode）。一个索引节点代表一个文件；
--file-type：与“-F”选项的功能相同，但是不显示“*”；
-k：以KB（千字节）为单位显示文件大小；
-l：以长格式显示目录下的内容列表。输出的信息从左到右依次包括文件名，文件类型、权限模式、硬连接数、所有者、组、文件大小和文件的最后修改时间等；
-m：用“,”号区隔每个文件和目录的名称；
-n：以用户识别码和群组识别码替代其名称；
-r：以文件名反序排列并输出目录内容列表；
-s：显示文件和目录的大小，以区块为单位；
-t：用文件和目录的更改时间排序；
-L：如果遇到性质为符号链接的文件或目录，直接列出该链接所指向的原始文件或目录；
-R：递归处理，将指定目录下的所有文件及子目录一并处理；
--full-time：列出完整的日期与时间；
--color[=WHEN]：使用不同的颜色高亮显示不同类型的。
```
**示例**
```shell

#显示当前目录下的非隐藏文件和目录
[root@lwdCSCDN usr]# ls
aaalog  bin  etc  games  include  lib  lib64  libexec  local  lost+found  man  sbin  share  src  tmp

#显示当前目录下的文件和目录，包含隐藏文件
[root@lwdCSCDN usr]# ls -a
.  ..  aaalog  bin  etc  games  include  lib  lib64  libexec  local  lost+found  man  sbin  share  src  tmp

# 按文件修改时间倒序显示，单列格式输出展示
[root@lwdCSCDN usr]# ls -lt
总用量 320
drwxr-xr-x.  59 root root   4096 12月 16 09:49 local
dr-xr-xr-x. 159 root root 126976 10月 23 10:14 lib64
drwxr-xr-x    3 root root   4096 10月 13 16:55 aaalog
drwxr-xr-x.   2 root root  90112 12月 16 2019 bin
drwxr-xr-x    3 root root   4096 12月  6 2019 man
dr-xr-xr-x.  32 root root   4096 12月  6 2019 lib
dr-xr-xr-x.   2 root root  20480 8月  10 2019 sbin
drwxr-xr-x. 293 root root  12288 8月   9 2019 share
drwxr-xr-x. 143 root root  12288 8月   9 2019 include
drwxr-xr-x.  33 root root  12288 11月 25 2017 libexec
lrwxrwxrwx.   1 root root     10 10月 18 2017 tmp -> ../var/tmp
drwxr-xr-x.   4 root root   4096 10月 18 2017 src
drwx------.   2 root root  16384 10月 18 2017 lost+found
drwxr-xr-x.   2 root root   4096 6月  28 2011 etc
drwxr-xr-x.   2 root root   4096 6月  28 2011 games

# 按照特殊字符对文件进行分类
[root@lwdCSCDN usr]# ls -F
aaalog/  bin/  etc/  games/  include/  lib/  lib64/  libexec/  local/  lost+found/  man/  sbin/  share/  src/  tmp@

#仅显示目录名，不显示目录下的内容列表
[root@lwdCSCDN usr]# ls -ld aaalog
drwxr-xr-x 3 root root 4096 10月 13 16:55 aaalog

#显示文件索引节点
[root@lwdCSCDN script]# ls -i
10495811 etlD.sh  10495809 etl.sh   10495840 isFileExists.sh       10496106 reportSource.sh  10496118 stop.sh
10495812 etlP.sh  10495822 etlS.sh  10495887 mysqld_kill_sleep.sh  10496112 stat.sh


```

## <span id="inline-blue">ln命令</span>

**作用**
	为指定文件创建链接文件，链接类型分为硬链接和符号链接，默认是硬链接，如果要添加符号链接需要加上-s 选项。
**选项**

```shell
-b或--backup：删除，覆盖目标文件之前的备份；
-d或-F或——directory：建立目录的硬连接；
-f或——force：强行建立文件或目录的连接，不论文件或目录是否存在；
-i或——interactive：覆盖既有文件之前先询问用户；
-n或--no-dereference：把符号连接的目的目录视为一般文件；
-s或——symbolic：对源文件建立符号连接，而非硬连接；
-S<字尾备份字符串>或--suffix=<字尾备份字符串>：用"-b"参数备份目标文件后，备份文件的字尾会被加上一个备份字符串，预设的备份字符串是符号“~”，用户可通过“-S”参数来改变它；
-v或——verbose：显示指令执行过程；
-V<备份方式>或--version-control=<备份方式>：用“-b”参数备份目标文件后，备份文件的字尾会被加上一个备份字符串，这个字符串不仅可用“-S”参数变更，当使用“-V”参数<备份方式>指定不同备份方式时，也会产生不同字尾的备份字符串；
--help：在线帮助；
--version：显示版本信息。
```

**示例**
```shell
# 给文件建立软链接
[root@lwdCSCDN tmp]# ln -s readme.txt  readme.log
[root@lwdCSCDN tmp]# ll
总用量 292
drwx------  2 elasticsearch elasticsearch   4096 11月 19 10:02 elasticsearch-2738171260560954631
srwxrwxrwx  1 mysql         mysql              0 12月 23 2019 mysql.sock
-rw-r--r--  1 root          root              64 12月 16 16:00 patch.sql
drwx------. 2 root          root            4096 10月 19 2017 pulse-24KvvDfOHjjf
lrwxrwxrwx  1 root          root              10 12月 16 18:00 readme.log -> readme.txt
-rw-r--r--  1 root          root             744 12月 16 16:00 readme.txt
-rw-r--r--  1 root          root          133889 12月 10 12:22 scs1.sql
drwxr-xr-x  4 root          root            4096 12月 16 16:00 sql
-rw-rw----  1 mysql         mysql           8602 12月 16 17:58 #sqla5f_879_0.frm
-rw-rw----  1 mysql         mysql         114688 12月 16 17:58 #sqla5f_879_0.ibd
-rw-r--r--  1 root          root              98 12月 16 16:00 update.sql
drwxr-xr-x  3 root          root            4096 1月  21 2020 v8-compile-cache-0

# 给文件建立硬链接
[root@lwdCSCDN tmp]# ln  readme.txt log.txt
[root@lwdCSCDN tmp]# ll
总用量 611180
drwx------  2 elasticsearch elasticsearch      4096 11月 19 10:02 elasticsearch-2738171260560954631
-rw-r--r--  2 root          root                744 12月 16 16:00 log.txt
srwxrwxrwx  1 mysql         mysql                 0 12月 23 2019 mysql.sock
-rw-r--r--  1 root          root                 64 12月 16 16:00 patch.sql
drwx------. 2 root          root               4096 10月 19 2017 pulse-24KvvDfOHjjf
lrwxrwxrwx  1 root          root                 10 12月 16 18:00 readme.log -> readme.txt
-rw-r--r--  2 root          root                744 12月 16 16:00 readme.txt
-rw-r--r--  1 root          root             133889 12月 10 12:22 scs1.sql
drwxr-xr-x  4 root          root               4096 12月 16 16:00 sql
-rw-rw----  1 mysql         mysql          32473128 12月 16 18:04 #sql_a5f_0.MYD
-rw-rw----  1 mysql         mysql              1024 12月 16 18:04 #sql_a5f_0.MYI
-rw-rw----  1 mysql         mysql         592436800 12月 16 18:04 #sql_a5f_1.MYD
-rw-rw----  1 mysql         mysql              1024 12月 16 18:04 #sql_a5f_1.MYI
-rw-rw----  1 mysql         mysql              8602 12月 16 17:58 #sqla5f_879_0.frm
-rw-rw----  1 mysql         mysql            114688 12月 16 17:58 #sqla5f_879_0.ibd
-rw-r--r--  1 root          root                 98 12月 16 16:00 update.sql
drwxr-xr-x  3 root          root               4096 1月  21 2020 v8-compile-cache-0

# 建立硬链接前询问用户是否覆盖已有链接，并创建备份
[root@lwdCSCDN etl]# ln -b -i logs/ETL.log log/a.log 
ln：是否替换"log/a.log"？ y

# 生成的备份文件，文件后缀默认为~
[root@lwdCSCDN log]# ls
a.log  a.log~

# 为logs目录下的record.ini文件在log目录下建立record.ini文件硬链接 强制执行
[root@lwdCSCDN etl]# ln -f -d  logs/record.ini log1/record.ini
[root@lwdCSCDN etl]# ls
common  config  log  log1  logs  script  tmp
[root@lwdCSCDN etl]# cd log1
You have new mail in /var/spool/mail/root
[root@lwdCSCDN log1]# ll
总用量 7188
-rwxrwxrwx 3 root root 7341608 12月 18 14:47 ETL.log
-rwxrwxrwx 2 root root    8505 12月 18 14:23 record.ini
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

## <span id="inline-blue">mv命令</span>

**作用**
	移动文件或将文件改名

**选项**

```shell
-b 为每个已存在的目标文件创建备份
-f 覆盖前不询问
-i 覆盖前询问
-u 只更新源文件时间戳比目标文件时间戳新的文件或者目标文件不存在才覆盖更新
-v 显示详细进行的步骤
```
**实例**
```shell
#将a.sh更名为new.sh
[root@demo_mdn script]# mv a.sh new.sh
[root@demo_mdn script]# ll
总用量 68
-rw-r--r-- 1 root root     0 12月 10 16:35 b.sh
-rw-r--r-- 1 root root   112 12月 10 16:12 etlD.sh
-rw-r--r-- 1 root root   246 12月 10 16:12 etlP.sh
-rw-r--r-- 1 root root 34622 12月 10 16:12 etl.sh
-rw-r--r-- 1 root root    78 12月 10 16:12 etlS.sh
-rw-r--r-- 1 root root   513 12月 10 16:12 isFileExists.sh
-rw-r--r-- 1 root root   366 12月 10 16:12 mysqld_kill_sleep.sh
-rw-r--r-- 1 root root     0 12月 10 16:35 new.sh
-rw-r--r-- 1 root root    94 12月 10 16:12 reportSource.sh
-rw-r--r-- 1 root root   642 12月 10 16:12 stat.sh
-rw-r--r-- 1 root root   157 12月 10 16:12 stop.sh

#将oldDir目录移动到newDir目录
[root@demo_mdn script]# mv oldDir/ newDir/
[root@demo_mdn script]# ll
总用量 72
-rw-r--r-- 1 root root     0 12月 10 16:35 b.sh
-rw-r--r-- 1 root root   112 12月 10 16:12 etlD.sh
-rw-r--r-- 1 root root   246 12月 10 16:12 etlP.sh
-rw-r--r-- 1 root root 34622 12月 10 16:12 etl.sh
-rw-r--r-- 1 root root    78 12月 10 16:12 etlS.sh
-rw-r--r-- 1 root root   513 12月 10 16:12 isFileExists.sh
-rw-r--r-- 1 root root   366 12月 10 16:12 mysqld_kill_sleep.sh
drwxr-xr-x 3 root root  4096 12月 10 16:37 newDir
-rw-r--r-- 1 root root     0 12月 10 16:35 new.sh
-rw-r--r-- 1 root root    94 12月 10 16:12 reportSource.sh
-rw-r--r-- 1 root root   642 12月 10 16:12 stat.sh
-rw-r--r-- 1 root root   157 12月 10 16:12 stop.sh

#打印文件移动的详细信息
[root@demo_mdn script]# mv -v *.sh newDir/
"b.sh" -> "newDir/b.sh"
"etlD.sh" -> "newDir/etlD.sh"
"etlP.sh" -> "newDir/etlP.sh"
"etl.sh" -> "newDir/etl.sh"
"etlS.sh" -> "newDir/etlS.sh"
"isFileExists.sh" -> "newDir/isFileExists.sh"
"mysqld_kill_sleep.sh" -> "newDir/mysqld_kill_sleep.sh"
"new.sh" -> "newDir/new.sh"
"reportSource.sh" -> "newDir/reportSource.sh"
"stat.sh" -> "newDir/stat.sh"
"stop.sh" -> "newDir/stop.sh"

# -i 交互模式 确认是否覆盖同名文件
[root@demo_mdn script]# mv -i  new.sh newDir
mv：是否覆盖"newDir/new.sh"？ y

# -f 强制覆盖，不进行提示
[root@demo_mdn script]# mv -f  new.sh newDir
[root@demo_mdn script]# 

# 不覆盖同名文件，new.sh在newDir目录已存在，没有覆盖
[root@demo_mdn script]# mv -nv *.sh newDir
"b.sh" -> "newDir/b.sh"
"etlD.sh" -> "newDir/etlD.sh"
"etlP.sh" -> "newDir/etlP.sh"
"etl.sh" -> "newDir/etl.sh"
"etlS.sh" -> "newDir/etlS.sh"
"isFileExists.sh" -> "newDir/isFileExists.sh"
"mysqld_kill_sleep.sh" -> "newDir/mysqld_kill_sleep.sh"
"reportSource.sh" -> "newDir/reportSource.sh"
"stat.sh" -> "newDir/stat.sh"
"stop.sh" -> "newDir/stop.sh"

# -u 只覆盖源文件比目标文件时间戳新的文件, newDir目录已经存在1.txt文件且时间戳晚于源文件，所以没有操作
[root@demo_mdn script]# mv -uv *.txt newDir
[root@demo_mdn script]# 

# -b 对目标文件进行备份，目标目录生成1.txt~文件备份
[root@demo_mdn script]# mv -bv *.txt newDir
mv：是否覆盖"newDir/1.txt"？ y
"1.txt" -> "newDir/1.txt" (备份："newDir/1.txt~")
[root@demo_mdn newDir]# ls
1.txt  1.txt~  oldDir
```
## <span id="inline-blue">find命令</span>

**作用**
	find命令用来在指定目录下查找对应的文件，如果不设置任何参数的话，则在当前目录下查找，并将结果全部显示。
**语法**
find path -option [   -print ]   [ -exec   -ok   command ]   {} \;
**选项**
```shell
find 根据下列规则判断 path 和 expression，在命令列上第一个 - ( ) , ! 之前的部份为 path，之后的是 expression。如果 path 是空字串则使用目前路径，如果 expression 是空字串则使用 -print 为预设 expression。

expression 中可使用的选项有二三十个之多，在此只介绍最常用的部份。

-mount, -xdev : 只检查和指定目录在同一个文件系统下的文件，避免列出其它文件系统中的文件

-amin n : 在过去 n 分钟内被读取过

-anewer file : 比文件 file 更晚被读取过的文件

-atime n : 在过去n天内被读取过的文件

-cmin n : 在过去 n 分钟内被修改过

-cnewer file :比文件 file 更新的文件

-ctime n : 在过去n天内被修改过的文件

-empty : 空的文件-gid n or -group name : gid 是 n 或是 group 名称是 name

-ipath p, -path p : 路径名称符合 p 的文件，ipath 会忽略大小写

-name name, -iname name : 文件名称符合 name 的文件。iname 会忽略大小写

-size n : 文件大小 是 n 单位，b 代表 512 位元组的区块，c 表示字元数，k 表示 kilo bytes，w 是二个位元组。

-type c : 文件类型是 c 的文件。

d: 目录

c: 字型装置文件

b: 区块装置文件

p: 具名贮列

f: 一般文件

l: 符号连结

s: socket

-pid n : process id 是 n 的文件

你可以使用 ( ) 将运算式分隔，并使用下列运算。

exp1 -and exp2

! expr

-not expr

exp1 -or exp2

exp1, exp2	
```

**实例**

```shell
#/etc、/root 目录下查找passwd字符串，不区分大小写
[root@demo_mdn ~]# find /etc /root -iname passwd
/etc/pam.d/passwd
/etc/passwd
/root/.vnc/passwd

#/etc目录下查找passwd字符串，？代表通配单个字符
[root@demo_mdn ~]# find /etc -name "passwd?"
/etc/passwd-

#/etc目录下查找passwd字符串，[]代表通配任意字符
[root@demo_mdn script]# find /BI/hrb_BI/etl/script -name "[ab].sh"
/BI/hrb_BI/etl/script/a.sh
/BI/hrb_BI/etl/script/b.sh

#-a 连接两个不同的条件（两个条件必须同时满足）
[root@demo_mdn script]# find /BI/hrb_BI/etl/script -name "*S.sh" -a -user root
/BI/hrb_BI/etl/script/etlS.sh

#查找/tmp下一般类型文件
[root@demo_mdn script]# find /tmp -type f
/tmp/pulse-ft3VHPly7Wmg/pid
/tmp/orbit-gdm/bonobo-activation-register-914f9f817ba337d787f3493d0000001b.lock
/tmp/orbit-gdm/bonobo-activation-server-914f9f817ba337d787f3493d0000001b-ior
/tmp/.X0-lock

#查找/BI/hrb_BI/etl/script 目录下超过30天没有访问过的文件，{} 代表查找到的文件，{}和\之间有空格
[root@demo_mdn script]# find /BI/hrb_BI/etl/script -atime +30 -exec ls {} \;
/BI/hrb_BI/etl/script/mysqld_kill_sleep.sh
/BI/hrb_BI/etl/script/etlP.sh
/BI/hrb_BI/etl/script/reportSource.sh
/BI/hrb_BI/etl/script/etlD.sh
/BI/hrb_BI/etl/script/isFileExists.sh
/BI/hrb_BI/etl/script/etlS.sh
/BI/hrb_BI/etl/script/stop.sh

#查找/BI/hrb_BI/etl/script 目录下等于2k的文件
[root@demo_mdn script]# find /BI/hrb_BI/etl/script/  -size 2M
[root@demo_mdn script]# 

#查找/BI/hrb_BI/etl/script 目录下大于2k的文件 
[root@demo_mdn script]# find /BI/hrb_BI/etl/script/  -size +2k
/BI/hrb_BI/etl/script/
/BI/hrb_BI/etl/script/etl.sh

#查找/BI/hrb_BI/etl/script 目录下小于2k的文件
[root@demo_mdn script]# find /BI/hrb_BI/etl/script/  -size -2k
/BI/hrb_BI/etl/script/mysqld_kill_sleep.sh
/BI/hrb_BI/etl/script/etlP.sh
/BI/hrb_BI/etl/script/reportSource.sh
/BI/hrb_BI/etl/script/etlD.sh
/BI/hrb_BI/etl/script/a.sh
/BI/hrb_BI/etl/script/b.sh
/BI/hrb_BI/etl/script/isFileExists.sh
/BI/hrb_BI/etl/script/ab.sh
/BI/hrb_BI/etl/script/stat.sh
/BI/hrb_BI/etl/script/etlS.sh
/BI/hrb_BI/etl/script/stop.sh
```
## <span id="inline-blue">whereis命令 </span>

**作用**
	定位二进制程序文件、man手册、源代码文件所在位置，搜索效率比find命令高，因为查找的是数据库索引文件，和locate命令同理，但索引内容不是实时更新。
	
**选项**
```shell
-b 只搜索二进制文件
-B 指定搜索的二进制文件所在的目录
-m 只搜索man帮助文件
-M 指定man文件所在的目录
-f 定义搜索范围
-s 只搜索源代码文件
-S 指定搜索源代码文件所在的目录
（-BMS 必须和-f 选项同时使用）
```
**实例**
```shell
#搜索ls命令相关文件所在的位置
[root@demo_mdn /]# whereis ls
ls: /bin/ls /usr/share/man/man1/ls.1.gz /usr/share/man/man1p/ls.1p.gz

#只搜索指定路径下ls相关二进制文件所在位置,只搜索当前指定路径不进行递归搜索
[root@demo_mdn /]# whereis -b -B /bin -f ls
ls: /bin/ls

#只搜索指定路径下的ls相关帮助文件,只搜索当前指定路径不进行递归搜索
[root@demo_mdn /]# whereis -m -M /usr/share/man/man1 -f ls
ls: /usr/share/man/man1/ls.1.gz
```

## <span id="inline-blue">locate命令</span>

**作用**
	查找文件或目录所在位置（locate 命令实际是查找的/var/lib/mlocate/mlocate.db 文件，所以查找速度比find命令快的多）
	
**选项**

```shell
 -V 显示版本信息
 -d dir 指定搜索的数据库文件所在位置
```

 **实例**
 ```shell
 #指定mlocate.db 文件目录，查找portalOrderInfoTask_0_20201110_010000_0 文件所在位置
 [root@demo_mdn mlocate]# locate -d /var/lib/mlocate/mlocate.db portalOrderInfoTask_0_20201110_010000_0
 /home/report_cd/dhm/portalOrderInfoTask/2020/11/10/portalOrderInfoTask_0_20201110_010000_0

 #显示locate 命令版本信息
 [root@demo_mdn mlocate]# locate -V
mlocate 0.22.2
Copyright (C) 2007 Red Hat, Inc. All rights reserved.
This software is distributed under the GPL v.2.

This program is provided with NO WARRANTY, to the extent permitted by law.
 ```

## <span id="inline-blue">which命令

**作用**
查找命令所在的绝对路径（包含命令别名）。

**选项**

```shell
  --version, -[vV] Print version and exit successfully.
  --help,          Print this help and exit successfully.
  --skip-dot       Skip directories in PATH that start with a dot.
  --skip-tilde     Skip directories in PATH that start with a tilde.
  --show-dot       Don't expand a dot to current directory in output.
  --show-tilde     Output a tilde for HOME directory for non-root.
  --tty-only       Stop processing options on the right if not on tty.
  --all, -a        Print all matches in PATH, not just the first
  --read-alias, -i Read list of aliases from stdin.
  --skip-alias     Ignore option --read-alias; don't read stdin.
  --read-functions Read shell functions from stdin.
  --skip-functions Ignore option --read-functions; don't read stdin.
```

**实例**

```shell
#查找ls命令的绝对路径
[root@demo_mdn user]# which ls
alias ls='ls --color=auto'
	/bin/ls
```
## <span id="inline-blue">strings命令</span>

**作用**
在对象或二进制文件中查找可打印的字符串，字符可以是由4个或者更多字符组成的字符序列，以换行符或空字符结束。

**选项**
```shell
	-a 扫描整个文件内容而不是仅仅文件初始化和装载段。
	-f 显示查找到的字符串之前先打印文件名称。
	-n number 查找长度为number及以上的字符串序列。
	-t --radix={o,d,x} ：输出字符的位置，基于八进制，十进制或者十六进制
	-o 等价于--radix=o
	-T --target= ：指定二进制文件格式
	-e --encoding={s,S,b,l,B,L} ：选择字符大小和排列顺序:s = 7-bit, S = 8-bit, {b,l} = 16-bit, {B,L} = 32-bit
```

**实例**

```shell
#以10进制为偏移量，查找profile文件中长度大于60的字符串,输出字符所在文件名称。
[root@demo_mdn ~]# strings -f -t o -60 /etc/profile
/etc/profile:      20 # System wide environment and startup programs, for login setup
/etc/profile:     173 # It's NOT a good idea to change this file unless you know what you
/etc/profile:     277 # are doing. It's much better to create a custom.sh shell script in
/etc/profile:     403 # /etc/profile.d/ to make custom changes to your environment, as this
/etc/profile:    3100 # By default, we want umask to get set. This sets it for login shell

#以16进制为偏移量，查找当前目录下jpg文件中长度大于50的字符串，输出所在文件名称。
[root@demo_mdn user]# strings -f -t o -n 50 *.jpg
20190605165252_529.jpg:     153 !22222222222222222222222222222222222222222222222222
20190605165255_799.jpg:     153 !22222222222222222222222222222222222222222222222222
20190605165256_156.jpg:     153 !22222222222222222222222222222222222222222222222222
20190605165256_210.jpg:     153 !22222222222222222222222222222222222222222222222222
20190605165256_391.jpg:     153 !22222222222222222222222222222222222222222222222222
20190605165256_561.jpg:     153 !22222222222222222222222222222222222222222222222222
20190605171455_354.jpg:     153 !22222222222222222222222222222222222222222222222222
20190605171455_551.jpg:     153 !22222222222222222222222222222222222222222222222222
20190605171455_574.jpg:     153 !22222222222222222222222222222222222222222222222222
20190605171455_668.jpg:     153 !22222222222222222222222222222222222222222222222222
20190605171455_74.jpg:     153 !22222222222222222222222222222222222222222222222222
20190605171506_75.jpg:     153 !22222222222222222222222222222222222222222222222222
```
## <span id="inline-blue">dirname命令

***作用***
去除参数里面非目录部分
特殊情况1 最后一个字符是"/",则截断到倒数第二个"/",并忽略之后的全部字符。
特殊情况2 如果参数没有目录对应则返回当前目录。

***实例***

```shell
[root@demo_mdn user]# dirname /a/b/file1.txt
/a/b

[root@demo_mdn user]# dirname /a/b
/a 

[root@demo_mdn user]# dirname /a/b/
/a

#没有目录对应的情况下，返回当前目录。
[root@demo_mdn user]# dirname a
. 
```

## <span id="inline-blue">iconv命令</span>

***作用***
	转换文件编码

***选项***
```shell
	-f 源文件编码方式
	-t 目的文件编码方式
	-s 忽略告警信息，但不包括错误信息
	-o 指明编码后的输出文件
	-c 忽略非法字符
	-l 列出当前支持的编码方式
```
***实例***


```shell
#列出所有支持的编码方式
[root@demo_mdn user]# iconv -l

The following list contain all the coded character sets known.  This does
not necessarily mean that all combinations of these names can be used for
the FROM and TO command line parameters.  One coded character set can be
listed with several different names (aliases).

  437, 500, 500V1, 850, 851, 852, 855, 856, 857, 860, 861, 862, 863, 864, 865,
  866, 866NAV, 869, 874, 904, 1026, 1046, 1047, 8859_1, 8859_2, 8859_3, 8859_4,
  8859_5, 8859_6, 8859_7, 8859_8, 8859_9, 10646-1:1993, 10646-1:1993/UCS4

#将文件file.txt 由gbk2312编码转换为UTF-8，并输出到file2.txt
[root@demo_mdn user]# icon file1.txt -f gbk2312 -t UTF-8 -o file2.txt 
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






***解压缩***

```shell
　命令格式：tar -zxvf  压缩文件名.tar.gz
　
　解压缩后的文件只能放在当前的目录。

  示例：tar -zxvf etl.V300R002B042.tar.gz 
```





