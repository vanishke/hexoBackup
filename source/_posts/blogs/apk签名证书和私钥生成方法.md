---
title: apk签名证书和私钥生成方法
categories:
	- keyTool
tags: 
	- keyTool
	- Java

date: 2024-06-25 10:39:20
updated: 2024-06-25 10:39:20
---
<!-- toc -->
# <span id="inline-blue">背景</span>
apk应用上传缺失签名文件无法对apk进行签名导致应用上架不了
# <span id="inline-blue">解决办法</span>
## <span id="inline-blue">生成app.kestore文件</span>
```shell
keytool -genkey -v -keystore app.keystore -alias coship -keyalg RSA -validity 3650
```
执行上述命令之后在当前路径下生成文件app.kestore

## <span id="inline-blue">转换key的格式为pkcs12</span>
```shell
keytool -importkeystore -srckeystore app.keystore -destkeystore tmp.p12 -srcstoretype JKS -deststoretype PKCS12
```
控制台会提示输出tmp.p12的密码以及app.keystore的密码，输入正确之后将会生成tmp.p12文件

## <span id="inline-blue">将PKCS12格式的key dump为可直接阅读的文本</span>
```shell
openssl pkcs12 -in tmp.p12 -nodes -out tmp.rsa.pem 
```
dump过程中也会提示输入密码，正确输入之后可阅读的token会存储在tmp.rsa.pem中

## <span id="inline-blue">提取公钥</span>

 用文本编辑器打开tmp.rsa.pem，将从
 —–BEGIN PRIVATE KEY—–
 到
 —–END PRIVATE KEY—–
 这一段（包含这两个tag）的文本复制出来，新建为文件my_private.rsa.pem
 将从
 —–BEGIN CERTIFICATE—–
 到
 —–END CERTIFICATE—–
 这一段（包含这两个tag）的文本复制出来，certificate.pem （签名时用到的公钥）
 
 ## <span id="inline-blue">转换，生成pk8格式的私钥</span>
```shell
 openssl pkcs8 -topk8 -outform DER -in my_private.rsa.pem -inform PEM -out private.pk8 -nocrypt
```
 ## <span id="inline-blue">签名</span>
 ```shell
 java -jar signapk.jar certificate.pem private.pk8 my.apk my_signed.apk 
 ```
