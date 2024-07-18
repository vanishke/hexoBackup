---
title: Linux查看cpu配置信息
tags: 
	- Linux
categories: 
	- Linux

date: 2021-11-29 14:32:11	
updated: 2021-11-29 14:32:11
---
## <span id="inline-blue">cpu信息</span>

```script
#查看cpu信息(配置)
[root@lwdCSCDN ~]# cat /proc/cpuinfo | grep name | cut -f2 -d: | uniq -c
      8  Intel(R) Xeon(R) CPU E5-2609 0 @ 2.40GHz
	  
#查看物理cpu个数
[root@lwdCSCDN ~]# cat /proc/cpuinfo| grep "physical id"| sort| uniq| wc -l
2

# 查看每个物理CPU中core的个数(即核数)
[root@lwdCSCDN ~]# cat /proc/cpuinfo| grep "cpu cores"| uniq
cpu cores	: 4

# 查看逻辑CPU的个数
[root@lwdCSCDN ~]# cat /proc/cpuinfo| grep "processor"| wc -l
8
```





