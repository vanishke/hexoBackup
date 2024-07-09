---
title: Linux curl命令GET&POST请求示例
categories:
	- Linux

date: 2023-08-01 11:29:20
tags: 
	- Linux
---
<!-- toc -->
# <span id="inline-blue">目的</span>
	因为VPN的原因导致不能直接通过第三方工具请求接口数据，需要直接在服务器上请求对应服务接口
# <span id="inline-blue">curl命令</span>
选项
 -X  指定请求的方式  GET/POST
 -H  指定请求的头部信息
 -d  指定请求的参数内容
 
 # <span id="inline-blue">GET请求示例</span>
 ```shell
 curl htttp://10.9.216.12:8080/iepg/getMarquee?terminalType=1&version=20000
 ```
 # <span id="inline-blue">POST请求示例</span>
 向指定接口发送xml报文并指定头部请求信息
 ```shell
 curl -X POST http://10.9.219.31:8080/GetItemData \
   -H "Content-Type: application/xml" \
   -H "Host: 10.9.212.55:8080" \
   -H "Connection: Keep-Alive" \
   -d "<GetItemData titleAssetId='OTHE0000000001237979' portalId='1' client='8591102716069168' account='8591102716069168' languageCode='Zh-CN' profile='1' />"
 ```