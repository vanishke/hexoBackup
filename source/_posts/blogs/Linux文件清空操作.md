---
title: Linux文件清空操作
tags:
	- Linux
categories: 
	- Linux

date: 2023-03-17 17:44:20
updated: 2023-03-17 17:44:20
---
## <span id="inline-blue">文件清空</span>
windows7 64

### <span id="inline-blue">使用重定向的方法</span>
```shell
> test.txt 
```

### <span id="inline-blue">使用true命令重定向清空文件</span>
```shell
true > test.txt
```

### <span id="inline-blue">使用cat/cp/dd命令及/dev/null设备来清空文件</span>
```shell
cat /dev/null >  test.txt
cp -f /dev/null test.txt 
dd if=/dev/null of=test.txt
```
### <span id="inline-blue">使用echo命令清空文件</span>
```shell
echo -n "" > test.txt    ==>要加上"-n"参数，默认情况下会"\n"，也就是回车符
```

### <span id="inline-blue">使用truncate命令清空文件</span>
```shell
 truncate -s 0 test.txt   -s参数用来设定文件的大小，清空文件，就设定为0；
```