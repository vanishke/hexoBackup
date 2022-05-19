---
title: 每天一个linux命令
categories: Linux
tags: Linux
top: 1
---
<!-- toc -->

# <span id="inline-blue">文件和目录管理 </span>



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








***解压缩***

```shell
　命令格式：tar -zxvf  压缩文件名.tar.gz
　
　解压缩后的文件只能放在当前的目录。

  示例：tar -zxvf etl.V300R002B042.tar.gz 
```





