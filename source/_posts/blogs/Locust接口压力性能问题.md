---
title: Locust接口压力性能问题
categories:
	- Locust

date: 2023-04-21 14:07:20
tags: 
	- Locust
---
<!-- toc -->

# <span id="inline-blue">现象</span>
使用locust做接口压力测试，发现RPS在550个用户的并发压力下急剧下降，查看接口所在服务器的cpu、内存、IO、网络传输状态都是正常。
查看cpu使用情况命令：top
多核的情况下使用mpstat -P ALL 2 1000 可以查看具体每个核上的压力
查看内存使用情况命令：free -g
查看IO使用情况命令：iostat
查看磁盘使用情况命令：dstat
查看网络连接、路由表信息命令：netstat

locust的启动命令：locust -f getprograms.py -P 8888 
-P:指定启动端口
-f:指定压测脚本
上述命令在压测脚本所在目录执行。

# <span id="inline-blue">脚本内容</span>

```shell
from locust import task, between
from locust.contrib.fasthttp import FastHttpUser
from locust.user import HttpUser
import datetime
import uuid
import hashlib
import queue
import random
import time
import json

class httpResponse(HttpUser):
    network_timeout = 5.0
    connection_timeout = 5.0
    wait_time = between(0.9, 1.1)

    @task
    def GetPrograms(self):
        #put_data ="<?xml version='1.0' encoding='UTF-8' standalone='yes'?><GetPrograms client='8350110822716631' portalId='1' account='8350110822716631' languageCode='Zh-CN' regionCode='1' profile='1.0' startDateTime='20230406060000' days='0' serviceType='BTV' channelIds='103301311'/>\n"
        put_data ="<?xml version='1.0' encoding='UTF-8' standalone='yes'?><GetPrograms client='8350110822716631' portalId='1' account='8350110822716631' languageCode='Zh-CN' regionCode='1' profile='1.0' startDateTime='20230415120000' days='0' serviceType='BTV' channelIds='105523956'/>\n"
        headers = {
           "Content-Type": "application/xml"
        }
        url = 'GetPrograms'
    #     # try:
    #     #     self.client.get(url, name="layoutScheduleList")
    #     # except Exception as e:
    #     #     time.sleep(3)
    #     #     raise e
        self.client.post(url, data=put_data, headers=headers, name="GetPrograms")
```

# <span id="inline-blue">问题原因</span>

locust对多核系统支持不是很好，常规启动的情况下locust会把所有的压力给到一个cpu核心，导致单核cpu占用过高后，RPS急剧下降。

# <span id="inline-blue">解决办法</span>
采用单机主从模式或则多机主从模式
## <span id="inline-blue">单机主从模式</span>
启动主节点命令： locust -f getprograms.py -P 8888 --master
启动从节点命令： locust -f getprograms.py -P 8888 --worker
上述命令可以打开多个linux窗口，针对同一个脚本执行，不需要拷贝多份脚本。

## <span id="inline-blue">多机主从模式</span>
启动主节点命令： locust -f getprograms.py -P 8888 --master
启动从节点命令： locust -f getprograms.py -P 8888 -master-host=10.9.217.33
上述命令可以打开多个linux窗口，针对同一个脚本执行，不需要拷贝多份脚本。

# <span id="inline-blue">验证</span>
![Jboss容器自启动](/images/Locust/Locust_20230421_001.png)

