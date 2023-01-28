---
title: Jboss应用接口无响应
categories: 
	- Jboss
tags: 
	- Jboss
	- Java
	- Linux

---

# <span id="inline-blue">现象</span> 
java应用程序接口请求数据无响应，抓取堆栈日志如下：

```shell

2022-11-15 13:37:15
Full thread dump Java HotSpot(TM) 64-Bit Server VM (25.131-b11 mixed mode):

"Attach Listener" #174 daemon prio=9 os_prio=0 tid=0x0000000013c90000 nid=0x2c5e waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"DestroyJavaVM" #173 prio=5 os_prio=0 tid=0x00000000135ec800 nid=0x3f64 waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"pool-3-thread-80" #171 prio=5 os_prio=0 tid=0x0000000015635000 nid=0x4012 runnable [0x000000004c29a000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000000f4b008f0> (a sun.nio.ch.Util$3)
	- locked <0x00000000f4b008e0> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000000f4b00900> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.jboss.netty.channel.socket.nio.SelectorUtil.select(SelectorUtil.java:68)
	at org.jboss.netty.channel.socket.nio.AbstractNioSelector.select(AbstractNioSelector.java:434)
	at org.jboss.netty.channel.socket.nio.AbstractNioSelector.run(AbstractNioSelector.java:212)
	at org.jboss.netty.channel.socket.nio.AbstractNioWorker.run(AbstractNioWorker.java:89)
	at org.jboss.netty.channel.socket.nio.NioWorker.run(NioWorker.java:178)
	at org.jboss.netty.util.ThreadRenamingRunnable.run(ThreadRenamingRunnable.java:108)
	at org.jboss.netty.util.internal.DeadLockProofWorker$1.run(DeadLockProofWorker.java:42)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- <0x00000000f4b009d0> (a java.util.concurrent.ThreadPoolExecutor$Worker)
	
```


搜索了下堆栈关键字信息,网上解释说这个问题是由于jdk的漏洞导致，但这个问题是最近才发现，所以继续查找对应的可能信息

# <span id="inline-blue">分析</span> 
查看文件打开数设置：
```shell
ulimit -a
```
![Jboss接口无响应](/images/Jboss/20221117_Jboss_001.png)
尝试更改/etc/profile,/etc/security/limits.conf文件,添加ulimit -HSn 65535
发现更改之后即使重启也没法生效，参考网上的解决方案：https://blog.csdn.net/Daphnisz/article/details/124079757
大概意思是PAM选项没有开启的情况下导致修改不生效(PAM，Pluggable Authentication Modules，可插拔认证模块)

添加参数支持
1、修改openssh配置文件

```shell
#在文件末尾添加：UsePAM yes
vim /etc/ssh/sshd_config

```
2、重启ssh服务

```shell
service sshd restart
```
3、验证

```shell
ulimit -n
```

发现无法生效，继续排查原因发现在系统日志目录下/var/log/messages,打印错误信息，提示UsePAM参数不支持，参考网上解决方案https://www.jianshu.com/p/db918237644a，
意思是说openssh模块开始安装的时候没有添加--with-pam 选项，导致PAM参数无法更改。

# <span id="inline-blue">解决办法</span> 
在不重装openssh模块的前提下：
应用程序的文件打开数实际是由/proc/pid/limits文件控制，如果能修改为65535，那也能规避这个问题。通过将应用重启命令加入到自启动(rc.local),添加命令内容如下：

```shell
ulimit -HSn 65535
cd /usr/local/ulms/jboss/bin;
sh start.sh;
```

这样修改之后如果重启jboss，则参数恢复到1024,将ulimit -HSn 65535添加到start.sh文件开始位置,
保证即使重启也能生效，避免应用程序接口响应现象不一致的问题。

# <span id="inline-blue">验证</span> 
20601为应用程序进程号

```shell
cat /proc/20601/limits
```

![验证](/images/Jboss/20221117_Jboss_002.png)








