---
title: Elasticsearch导入导出
tags: 
	- Elasticsearch
categories: 
	- Elasticsearch
	
date: 2021-01-06 14:32:27
---


## 环境
linux 


## 部署
下载工具压缩包
下载地址：https://pan.baidu.com/s/1V3If_94FJZRx-004ycLIaQ 
提取码：qlpg

EsToolNew.zip上传服务器,解压
```shell
[root@demo_mdn EsToolNew]#unzip EsToolNew.zip
```

![部署目录](/images/elasticsearch/es_20210226_001.png)

config:配置需要访问的elasticsearch实际地址
start.sh: 启动脚本
stop.sh: 停止脚本
json: 需要导入的数据脚本
默认访问端口：8056
### 启动方式
```shell
[root@demo_mdn EsToolNew]# sh start.sh
```
## 访问
![访问](/images/elasticsearch/es_20210226_002.png)

## 导入
![导入](/images/elasticsearch/es_20210226_003.png)

## 导入
![导出](/images/elasticsearch/es_20210226_004.png)
