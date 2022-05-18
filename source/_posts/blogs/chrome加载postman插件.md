---
title: chrome加载postman插件
tags: 
	- chrome
	- postman
categories: 插件
---
## <span id="inline-blue">安装环境</span>
windows7 64

## <span id="inline-blue">下载插件</span>
https://pan.baidu.com/s/1R_KgYR3-QK3e8tufvBlcNQ
提取码：pvc4

## <span id="inline-blue">加载插件</span>
chrome地址栏访问chrome://extensions/,打开chrome扩展程序
![扩展程序](/images/chrome/chrome_2021_02_22_001.png)

解压下载的插件压缩包，开启开发者模式，加载Postman_v4.1.3插件文件夹
![扩展程序](/images/chrome/chrome_2021_02_22_002.png)

加载之后，提示报错，报错信息如下：
```html
Ignored insecure CSP value "https://ssl.google-analytics.com/ga.js" in directive 'script-src'.
```
找到插件解压后根目录下的manifest.json文件，打开找到sandbox节点
修改前：
```json
"sandbox": {
      "pages": ["html/tester_sandbox.html", "snippet_sandbox.html"],
      "content_security_policy": "sandbox allow-scripts allow-popups; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ssl.google-analytics.com/ga.js;"
    }
```
修改后
```json
 "sandbox": {
      "pages": ["html/tester_sandbox.html", "snippet_sandbox.html"],
      "content_security_policy": "sandbox allow-scripts allow-popups; script-src 'self' 'unsafe-inline' 'unsafe-eval' "
    }
```
加载https://ssl.google-analytics.com/ga.js报错，去掉就可以

## <span id="inline-blue">验证</span>
chrome左上角点击应用，找到postman插件点击运行，成功运行如下图
![验证](/images/chrome/chrome_2021_02_22_003.png)
![验证](/images/chrome/chrome_2021_02_22_004.png)

