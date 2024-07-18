---
title: Vue项目实战
tags: 
	- Vue
categories: 
	- Vue

date: 2021-03-11 17:42:32	
updated: 2021-03-11 17:42:32
---

# <span id="inline-blue">Vue项目实战movieServer</span> 

## <span id="inline-blue">项目环境</span> 
vue 2.9.6
node 12.18.3
npm 6.14.6
MongoDB 4.0.10

## 

## <span id="inline-blue">说明</span>
book_service 后台接口

book_view 前端页面

项目地址：https://github.com/vanishke/movieServer.git

## <span id="inline-blue">后端启动</span>
```shell
cd book_service 
set DEBUG=book_service & npm start
```
## <span id="inline-blue">mongoDB安装包下载</span>
下载地址：https://pan.baidu.com/s/1ivw4tmwJUPZLQtqzxCFlLg
提取码：zs5e
安装包说明：
mongodb-win32-x86_64-2008plus-ssl-4.0.10-signed.msi MongoDB安装包
mongodb-compass-1.19.12-win32-x64.msi MongoDB可视化工具

## <span id="inline-blue">接口测试工具</span>
下载地址：https://pan.baidu.com/s/1JmO94M6iCLpeNDIjtxxi-Q 提取码：zi8w
Insomnia.Core-2021.1.0.exe ：目前使用的最新版本
xdowns.com_Insomnia_Setup_4.2.5.exe： 历史版本
Insomnia_2021-03-11.json: 接口测试数据样例



### <span id="inline-blue">导入接口样例</span>
![导入](/images/vue/vue_20210311_001.gif)


## <span id="inline-blue">前端启动</span>
```shell
cd book_view
npm run dev
```

## <span id="inline-blue">访问</span>
http://localhost:8000/#/
![首页](/images/vue/vue_20210311_002.png)
