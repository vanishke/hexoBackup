---
title: Linux查看当前目录空间占用
date: 2023-03-17 18:44:20
tags:
	- Linux
categories: Linux
---
## <span id="inline-blue">查看空间占用</span>
```shell
[root@lwdCSCDN elasticsearch-2.4.4]# ls
bin  config  data  EsToolNew  jdk1.7.0_67  lib  LICENSE.txt  logs  modules  NOTICE.txt  pid  plugins  README.textile
#查看当前目录占用情况
[root@lwdCSCDN elasticsearch-2.4.4]# du -sh *
336K	bin
16K	config
31G	data
20M	EsToolNew
285M	jdk1.7.0_67
25M	lib
12K	LICENSE.txt
229M	logs
5.0M	modules
4.0K	NOTICE.txt
4.0K	pid
21M	plugins
12K	README.textile
```
## <span id="inline-blue">查看指定层级空间占用</span>
```shell
[root@lwdCSCDN elasticsearch-2.4.4]# du -h --max-depth=2
6.7M	./EsToolNew/logs
4.0K	./EsToolNew/json
4.0K	./EsToolNew/arthas-output
20M	./EsToolNew
31G	./data/recommend
31G	./data
142M	./jdk1.7.0_67/jre
1.8M	./jdk1.7.0_67/man
756K	./jdk1.7.0_67/bin
208K	./jdk1.7.0_67/include
116M	./jdk1.7.0_67/lib
5.0M	./jdk1.7.0_67/db
285M	./jdk1.7.0_67
336K	./bin
229M	./logs
25M	./lib
92K	./modules/reindex
512K	./modules/lang-expression
4.4M	./modules/lang-groovy
5.0M	./modules
9.3M	./plugins/sql
9.5M	./plugins/ik
964K	./plugins/bigdesk
216K	./plugins/marvel-agent
164K	./plugins/license
21M	./plugins
4.0K	./config/scripts
16K	./config
31G	.
```
参数说明：
	-a或-all 显示目录中个别文件的大小。
-b或-bytes 显示目录或文件大小时，以byte为单位。
-c或--total 除了显示个别目录或文件的大小外，同时也显示所有目录或文件的总和。
-D或--dereference-args 显示指定符号连接的源文件大小。
-h或--human-readable 以K，M，G为单位，提高信息的可读性。
-H或--si 与-h参数相同，但是K，M，G是以1000为换算单位。
-k或--kilobytes 以1024 bytes为单位。
-l或--count-links 重复计算硬件连接的文件。
-L<符号连接>或--dereference<符号连接> 显示选项中所指定符号连接的源文件大小。
-m或--megabytes 以1MB为单位。
-s或--summarize 仅显示总计。
-S或--separate-dirs 显示个别目录的大小时，并不含其子目录的大小。
-x或--one-file-xystem 以一开始处理时的文件系统为准，若遇上其它不同的文件系统目录则略过。
-X<文件>或--exclude-from=<文件> 在<文件>指定目录或文件。
--exclude=<目录或文件> 略过指定的目录或文件。
--max-depth=<目录层数> 超过指定层数的目录后，予以忽略。
--help 显示帮助。
--version 显示版本信息。
	
	
	
	