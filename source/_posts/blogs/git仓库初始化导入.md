---
title: Git仓库初始化导入
tags: 
	- Git
categories: 
	- Git

date: 2021-03-15 15:23:32	
updated: 2021-03-15 15:23:32
---
# <span id="inline-blue">创建本地仓库</span> 
```shell
git init  //当前目录初始化版本库

git add . //将当前路径下的所有文件添加到版本库

git commit -m "first commit" //文件提交到版本库，并添加备注
```
# <span id="inline-blue">远程仓库推送</span> 
```shell
git remote add origin "远程仓库地址" //关联远程仓库

 git add -u origin master //首次推送需要加-u参数，其他情况不需要

```

# <span id="inline-blue">推送报错解决</span> 
推送报错信息如下：
git push error: failed to push some refs to

问题原因： 远程仓库增加了README.md文件在本地仓库下不存在，需要先将远程仓库的内容更新下来，在执行推送

解决方案：
```shell
git pull --rebase origin master
```
再次提交
```shell
git push -u origin master
```
