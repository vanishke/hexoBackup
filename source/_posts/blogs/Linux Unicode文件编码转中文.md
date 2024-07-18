---
title: Linux Unicode文件编码转中文
tags:
	- Linux
categories: 
	- Linux
	
date: 2024-03-25 9:44:20
updated: 2024-03-25 9:44:20
---
## <span id="inline-blue">Unicode文件转码</span>
Linux : CentOS Linux release 7.7.1908 (Core)

### <span id="inline-blue">native2ascii</span>

**语法**
```shell
native2ascii -[options] [inputfile [outputfile]]
```
**选项**
-[options]：表示命令开关，有两个选项可供选择
-reverse：将Unicode编码转为本地或者指定编码，不指定编码情况下，将转为本地编码。
-encoding encoding_name：转换为指定编码，encoding_name为编码名称。

[inputfile [outputfile]]
inputfile：表示输入文件全名。
outputfile：输出文件名。如果缺少此参数，将输出到控制台。

**示例**
```shell
native2ascii -encoding UTF-8 -reverse I18nResource.properties I18nResource.bak
```


