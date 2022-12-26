---
title: Linux-系统管理
categories: Linux
date: 2022-06-02 17:27:20
tags: Linux
top: 2
---
<!-- toc -->

## <span id="inline-blue">reboot命令</span>


**作用**
重启
**选项**
```shell
-n ：直接重启，不保存当前资料
-w : 重启过程记录日志
-d ：重启过程不记录日志
-f : 强制重启
-i : 关闭网络服务，然后重启
```

**示例**
```shell
[root@lwdCSCDN local]# reboot
```


## <span id="inline-blue">sleep命令</span>


**作用**
延迟当前命令执行
**选项**
```shell
--help ：帮助信息
--version :版本信息
-number ：时间长度后面可跟单位smhd
-smhd : s秒 m分钟 h小时 d天
```

**示例**
```shell
#显示系统当前时间，休眠10秒钟，再次显示时间
[root@lwdCSCDN local]# date;sleep 10s;date
2022年 06月 02日 星期四 17:30:04 CST
2022年 06月 02日 星期四 17:30:14 CST
```



## <span id="inline-blue">top命令</span>


**作用**
实时显示系统运行状态
**选项**
```shell
-d ：改变更新速度
-c ：切换显示模式
-s ：安全模式，不进行交互指令
-i ：不显示任何闲置或僵死进程
-n ：设置显示的次数，完成后退出
-b ：批处理模式，不进行交互时显示
```

**示例**
```shell
# 安全模式下,批量处理每隔4秒输出一次统计结果
[root@lwdCSCDN local]# top -d 4 -c -s -i -n 6 -b
top - 17:39:17 up  8:42,  2 users,  load average: 0.06, 0.05, 0.01
Tasks: 305 total,   1 running, 304 sleeping,   0 stopped,   0 zombie
Cpu(s):  0.7%us,  0.2%sy,  0.0%ni, 98.8%id,  0.2%wa,  0.0%hi,  0.0%si,  0.0%st
Mem:  32693060k total, 12640504k used, 20052556k free,   580116k buffers
Swap: 16777208k total,        0k used, 16777208k free,  3290016k cached

  PID USER      PR  NI  VIRT  RES  SHR S %CPU %MEM    TIME+  COMMAND                                                                      
12051 root      20   0 15272 1328  892 R  1.9  0.0   0:00.01 top -d 4 -c -s -i -n 6 -b                                                    
 ***  Delay time Not changed  *** 

```



## <span id="inline-blue">who命令</span>


**作用**
查看当前登陆用户信息
**选项**
```shell
-a ：全面信息
-b : 系统启动时间
-d ：已死掉进程
-l : 系统登录进程
-H :  带有列标题打印用户名、终端和时间
-t : 上次锁定时间
-u : 查看已登录用户
```

**示例**
```shell
#查看已登录用户
[root@demomdn local]# who -u -H
NAME     LINE         TIME             IDLE          PID COMMENT
root     pts/0        2022-06-08 08:54 08:26       18361 (10.9.212.70)
root     pts/1        2022-06-08 17:05 00:33       22909 (10.9.212.52)
root     pts/2        2022-06-08 15:06   .         21935 (10.9.212.55)
#查看系统启动时间
[root@demomdn local]# who -b
system boot  2022-06-07 09:00
```
