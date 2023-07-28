---
title: Linux环境查看class文件编译版本信息
date: 2023-03-17 17:44:20
tags:
	- Linux
	- Java
categories: Linux
---
## <span id="inline-blue">查看class文件编译版本信息</span>
```shell
[root@lwdCSCDN common]# javap -v CommonContent.class 
Classfile /usr/local/moui_nanjing/V242/coship-oms/webapps/oms/WEB-INF/classes/com/coship/oms/common/CommonContent.class
  Last modified 2021-11-16; size 474 bytes
  MD5 checksum def74d7189fc3d20401e9070e4c8ad37
  Compiled from "CommonContent.java"
public class com.coship.oms.common.CommonContent
  minor version: 0
  major version: 52
# major version: 52  代表是java编译版本为1.8
```
## <span id="inline-blue">Java编译器版本对应关系</span>

	Unsupported major.minor version 52.0 对应于 JDK1.8（JRE1.8） 

　　Unsupported major.minor version 51.0 对应于 JDK1.7（JRE1.7） 

　　Unsupported major.minor version 50.0 对应于 JDK1.6（JRE1.6） 

　　Unsupported major.minor version 49.0 对应于 JDK1.5（JRE1.5）

## <span id="inline-blue">兼容关系</span>
Java低版本编译的jar包，可以在高版本Java编译环境下运行，反之，Java高版本编译的jar包不能在低版本Java环境运行