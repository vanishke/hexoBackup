---
title: Elasticsearch导入导出
tags: 
	- Elasticsearch
categories: 
	- Elasticsearch
	
date: 2021-01-06 14:32:27
updated: 2021-01-06 14:32:27
---

## <span id="inline-blue">环境</span>
linux 


## <span id="inline-blue">部署</span>
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
### <span id="inline-blue">启动方式</span>
```shell
[root@demo_mdn EsToolNew]# sh start.sh
```
## <span id="inline-blue">访问</span>
![访问](/images/elasticsearch/es_20210226_002.png)

## <span id="inline-blue">导入</span>
![导入](/images/elasticsearch/es_20210226_003.png)

## <span id="inline-blue">导入</span>
![导出](/images/elasticsearch/es_20210226_004.png)


