---
title: Dokcer镜像导入导出
categories:
	- Docker
tags: 
	- Docker
	
date: 2023-07-10 14:49:20
---

<!-- toc -->
# 环境
	Windows7
	DockerToolbox-18.03.0-ce.exe
# 导出
```shell
#!/bin/bash
rm -rf  images
docker images > images.txt
awk '{print $1}' images.txt > REPOSITORY.txt
sed -i '1d' REPOSITORY.txt
mkdir images
touch tarname.txt
while read LINE
do
docker save $LINE > ./images/${LINE//\//_}.tar
echo "${LINE//\//_}.tar" >> tarname.txt
done < REPOSITORY.txt
rm -rf images.txt REPOSITORY.txt
cp import.sh ./images/
echo "images export finish"
```
# 导入
```shell
#!/bin/bash
while read LINE
do
docker  load -i ./images/$LINE
echo ok
done < tarname.txt
echo finish

```
