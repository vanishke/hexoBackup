---
title: Hexo安装Next问题
tags: 
	- Hexo
categories: 
	- Hexo

date: 2022-05-16 18:01:17
updated: 2022-05-16 18:01:17
---

## <span id="inline-blue">问题描述</span>

```shell
Cloning into 'themes/next'...
remote: Enumerating objects: 12037, done.
error: RPC failed; curl 18 transfer closed with outstanding read data remaining
error: 1285 bytes of body are still expected
fetch-pack: unexpected disconnect while reading sideband packet
fatal: early EOF
fatal: index-pack failed

```



## <span id="inline-blue">问题原因</span>

curl的postBuffer的默认值太小，我们需要调整它的大小，在终端重新配置大小

## <span id="inline-blue">解决办法</span>

```shell
git config --global http.postBuffer 524288000  //设置为500M

# 查看参数配置
$ git config --list
diff.astextplain.textconv=astextplain
filter.lfs.clean=git-lfs clean -- %f
filter.lfs.smudge=git-lfs smudge -- %f
filter.lfs.process=git-lfs filter-process
filter.lfs.required=true
http.sslbackend=openssl
http.sslcainfo=D:/Git/mingw64/ssl/certs/ca-bundle.crt
core.autocrlf=true
core.fscache=true
core.symlinks=false
pull.rebase=false
credential.helper=manager-core
credential.https://dev.azure.com.usehttppath=true
init.defaultbranch=master
user.name=vanishke
user.email=18685129726@163.com
http.postbuffer=524288000

```



