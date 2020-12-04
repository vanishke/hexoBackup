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

## find命令

**作用**

**选项**

**实例**

## whereis命令 

**作用**
	定位二进制程序文件、man手册、源代码文件所在位置，搜索效率比find命令高，因为查找的是数据库索引文件，和locate命令同理，但索引内容不是实时更新。
	
**选项**
```bash
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
```bash
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

## locate命令

**作用**
	查找文件或目录所在位置（locate 命令实际是查找的/var/lib/mlocate/mlocate.db 文件，所以查找速度比find命令快的多）
	
**选项**

```bash
 -V 显示版本信息
 -d dir 指定搜索的数据库文件所在位置
 ```
 
 **实例**
 ```bash
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
 
## which命令

**作用**
查找命令所在的绝对路径（包含命令别名）。

**选项**

```bash
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

```bash
#查找ls命令的绝对路径
[root@demo_mdn user]# which ls
alias ls='ls --color=auto'
	/bin/ls
```
## strings命令

**作用**
在对象或二进制文件中查找可打印的字符串，字符可以是由4个或者更多字符组成的字符序列，以换行符或空字符结束。

**选项**
```bash
	-a 扫描整个文件内容而不是仅仅文件初始化和装载段。
	-f 显示查找到的字符串之前先打印文件名称。
	-n number 查找长度为number及以上的字符串序列。
	-t --radix={o,d,x} ：输出字符的位置，基于八进制，十进制或者十六进制
	-o 等价于--radix=o
	-T --target= ：指定二进制文件格式
	-e --encoding={s,S,b,l,B,L} ：选择字符大小和排列顺序:s = 7-bit, S = 8-bit, {b,l} = 16-bit, {B,L} = 32-bit
```

**实例**

```bash
#以10进制为偏移量，查找profile文件中长度大于20的字符串,输出字符所在文件名称。
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
## dirname命令

***作用***
去除参数里面非目录部分
特殊情况1 最后一个字符是"/",则截断到倒数第二个"/",并忽略之后的全部字符。
特殊情况2 如果参数没有目录对应则返回当前目录。

***实例***

```bash
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

## iconv命令

***作用***
	转换文件编码

***选项***
```bash
	-f 源文件编码方式
	-t 目的文件编码方式
	-s 忽略告警信息，但不包括错误信息
	-o 指明编码后的输出文件
	-c 忽略非法字符
	-l 列出当前支持的编码方式
```
***实例***
 

```bash
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


## cat命令

***作用***
	合并文件内容并显示
	
***选项***
```bash
	-A //显示特殊字符	
	-n //对所有输出的行编号
```

***实例***
 
```bash
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

## tar命令

选项
```bash
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





