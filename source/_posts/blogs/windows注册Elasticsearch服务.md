---
title: windows注册Elasticsearch服务
categories: 
	- Elasticsearch
tags: 
	- Elasticsearch
	- Windows
		
date: 2020-12-31 17:32:20
updated: 2020-12-31 17:32:20
---
<!-- toc -->

# <span id="inline-blue">环境</span>
windows 7
elasticsearch-2.4.4

# <span id="inline-blue">elasticsearch下载</span>

[官方下载地址](https://www.elastic.co/cn/downloads/past-releases/elasticsearch-2-4-4)
笔者使用的elasticsearch-2.4.4版本

# <span id="inline-blue">elasticsearch注册</span>

1.运行windows cmd命令，进入nginx安装目录D:\ElasticSearch.2.4.4\elasticsearch-2.4.4\elasticsearch-2.4.4\bin

2.执行注册服务命令 elasticsearch.bat install

3.如果需要卸载elasticsearch服务，执行elasticsearch.bat uninstall

# <span id="inline-blue">elasticsearch服务自启动设置</span>

![elasticsearch服务设置](/images/elasticsearch/es_20201231_01.png)
![elasticsearch服务设置](/images/elasticsearch/es_20201231_02.png)

# <span id="inline-blue">elasticsearch服务验证</span>

![elasticsearch服务验证](/images/elasticsearch/es_20201231_03.png)
