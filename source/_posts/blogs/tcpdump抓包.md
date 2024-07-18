---
title: Tcpdump抓包
categories:
	- Linux
tags: 
	- Linux
	- Tcpdump
	
date: 2023-07-28 14:49:20
updated: 2023-07-28 14:49:20
---
<!-- toc -->
# <span id="inline-blue">目的</span>
	抓取Linux服务器上来自某一特定IP地址和端口的请求信息
# <span id="inline-blue">tcpdump命令</span>
选项
 -i  # 指定监听网络接口
 -w  # 将捕获到的信息保存到文件中，且不分析和打印在屏幕
 -r  # 从文件中读取数据
 -n  # 不把 ip 转化成域名
 -t  # 在每行的输出中不显示时间
 -v  # 产生详细的输出
 -vv # 产生比-v选项更为详细的输出
 -c  #  指定收取数据包的次数
 -C  # 与 -w FILE 选项配合使用
 -Q  #  选择是入方向还是出方向的数据包
 -q  # 简洁地打印输出
 -s  # 指定每个包捕获的长度
 -A   # 以 ASCII 格式打印出所有的分组并且读取此文件
 -e  # 在输出行打印出数据链路层的头部信息
 -F  # 指定使用哪个文件的过滤表达式抓包
 -l  # 对标准输出进行行缓冲
 
 # <span id="inline-blue">示例</span>
 抓取源地址10.9212.55请求目的地址10.9.219.31对应8080端口请求信息
 ```shell
 tcpdump -i eth1 port 8080 and src host 10.9.212.55 and dst host 10.9.219.31 -s 0 -vv -w /tmp/1.cap
 ```
 # <span id="inline-blue">关键字搜索</span>
 报文通过wireshark打开后点击下图中的搜索图标，将搜索类型修改为字符串，在搜索框填写关键字，点击查找即开始查找。
 ![wireshark分析](/images/linux/Linux_20230728_001.png)