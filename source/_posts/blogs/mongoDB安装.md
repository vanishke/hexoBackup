---
title: mongoDB安装
tags: mongoDB
categories: mongoDB
---

## <span id="inline-blue">安装环境</span>
windows7 64位
MongoDB 4.0.10

## <span id="inline-blue">安装包下载</span>
下载地址：https://pan.baidu.com/s/1ivw4tmwJUPZLQtqzxCFlLg
提取码：zs5e

安装包说明：
mongodb-win32-x86_64-2008plus-ssl-4.0.10-signed.msi MongoDB安装包
mongodb-compass-1.19.12-win32-x64.msi MongoDB可视化工具

## <span id="inline-blue">路径配置</span>
选择"custom"自定义模式下安装，指定安装路径
![安装路径](/images/mongoDB/mongoDB_2021_02_20_001.png)

取消可视化工具安装，后面单独安装
![安装路径](/images/mongoDB/mongoDB_2021_02_20_002.png)

## <span id="inline-blue">安装mongoDB可视化工具</span>
![可视化工具安装配置](/images/mongoDB/mongoDB_2021_02_20_003.png)
设置安装路径，安装完成。

## <span id="inline-blue">mongoDB配置</span>
mongoDB安装路径下手动创建data、log目录
![目录设置](/images/mongoDB/mongoDB_2021_02_20_004.png)
更改默认IP设置，解决远程连接问题
路径：D:\mongoDB\bin\mongod.cfg
![安装路径](/images/mongoDB/mongoDB_2021_02_20_005.png)

## <span id="inline-blue">设置mongoDB环境配置</span>
MONGODB_HOME：D:\mongoDB
![环境变量MONGODB_HOME设置](/images/mongoDB/mongoDB_2021_02_20_006.png)
```shell
Path: %JAVA_HOME%\bin;%JRE_HOME%\jre\bin;C:\Program Files (x86)\Common Files\NetSarang;%SystemRoot%\system32;%SystemRoot%;%SystemRoot%\System32\Wbem;%SYSTEMROOT%\System32\WindowsPowerShell\v1.0\;C:\Program Files\TortoiseSVN\bin;E:\st-android\android-sdk\platform-tools;%ANT_HOME%\bin;%MAVEN_HOME%/bin;%MySQL_HOME%/bin;D:\sqlite-tools;D:\redis_3.2.100\Redis-x64-3.2.100;D:\ffmpeg\bin;D:\nodeJs\;H:\Git\bin;%MONGODB_HOME%\bin;
```
![环境变量PATH设置](/images/mongoDB/mongoDB_2021_02_20_007.png)

## <span id="inline-blue">注册mongoDB服务</span>
安装过程中将mongoDB注册为windows服务失败，手动注册
修改mongoDB配置文件，将以下内容注释掉。
![mongoDB服务注册](/images/mongoDB/mongoDB_2021_02_20_008.png)

管理员模式下执行cmd命令模式，执行以下命令
```shell
mongod --install -f "D:\mongoDB\bin\mongod.cfg"
```
![mongoDB服务注册](/images/mongoDB/mongoDB_2021_02_20_009.png)
mongoDB 配置文件位置自行修改。

## <span id="inline-blue">连接异常处理</span>
mongoDB服务确认启动的情况下，cmd命令下连接异常，提示以下信息
![mongoDB连接异常](/images/mongoDB/mongoDB_2021_02_20_010.png)

修改配置文件监听IP地址，本地环回地址127.0.0.1改为0.0.0.0(监听所有IP请求)
修改前：
```xml
# network interfaces
net:
  port: 27017 
  bindIp: 127.0.0.1
```
修改后
```xml
# network interfaces
net:
  port: 27017 
  bindIp: 0.0.0.0
```

## <span id="inline-blue">服务验证</span>
![mongoDB服务验证](/images/mongoDB/mongoDB_2021_02_20_011.png)

## <span id="inline-blue">mongoDB compass验证</span>
compass安装目录下，双击MongoDBCompass.exe运行
连接信息配置如下：
![compass连接配置](/images/mongoDB/mongoDB_2021_02_20_012.png)

连接成功：
![compass测试](/images/mongoDB/mongoDB_2021_02_20_013.png)

