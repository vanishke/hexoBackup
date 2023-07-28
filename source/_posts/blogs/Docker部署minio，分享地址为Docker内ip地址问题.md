---
title: Docker部署minio，分享地址为Docker内ip地址问题
categories: 
	- Minio
tags: 
	- Docker
	- Minio
date: 2023-07-18 17:45:20
---
<!-- toc -->

## <span id="inline-blue">背景</span>
通过Docker拉取minio镜像，生成容器访问后发现分享的地址是docker容器内部的ip地址，导致无法访问

## <span id="inline-blue">解决办法</span>
拉取minio镜像
```shell
docker pull minio/minio
```
生成容器并后台启动
```shell
docker run -d -p 9000:9000 -p 9091:9091 --name=minio --restart=always -e "MINIO_SERVER_URL=http://192.168.99.100:9000" -e "MINIO_ACCESS_KEY=admin" -e "MINIO_SECRET_KEY=admin123" -v /d/minio/upload/data:/data -v /d/minio/upload/data:/root/.minio  minio/minio server /data --console-address ":9091" --address ":9000"
```

-e "MINIO_SERVER_URL=http://192.168.99.100:9000"  参数指定生成minio应用程序分享地址环境变量

## <span id="inline-blue">验证</span>
再次上传文件并分享后分享图片链接地址
```shell
http://192.168.99.100:9000/test/logo.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=YLMFB2ERQR4GQDRZ0IRA%2F20230718%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20230718T081006Z&X-Amz-Expires=604800&X-Amz-Security-Token=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NLZXkiOiJZTE1GQjJFUlFSNEdRRFJaMElSQSIsImV4cCI6MTY4OTY3MTI1MSwicGFyZW50IjoiYWRtaW4ifQ.hiSBI9bahX8crhponMuIglPWArfm5Y4-PcW5MTdPsKdXnWJeyiIDumvCTh9Pg1eNsnHkKxNQnx-yOeWfUgIU1g&X-Amz-SignedHeaders=host&versionId=null&X-Amz-Signature=139e32da7c2541b2cc16d01d2157256196711f24afb8034046eebbccf6e728ef


```

