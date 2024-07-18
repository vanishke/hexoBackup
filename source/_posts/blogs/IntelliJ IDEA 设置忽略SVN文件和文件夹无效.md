---
title: IntelliJ IDEA 设置忽略SVN文件和文件夹无效.
categories:
	- IntelliJ
tags: 
	- IntelliJ
	
date: 2023-12-08 9:21:20
updated: 2023-12-08 9:21:20
---
<!-- toc -->

# <span id="inline-blue">环境</span>
SpringBoot: 2.2.6.RELEASE
SpringCloud: 2021.0.5
nacos: nacos-2.1.1
mybatis-plus: 3.3.1
Java： 1.8
idea: 2018.2.1
# <span id="inline-blue">背景</span>
idea设置了SVN忽略target目录，但发现部分模块设置之后没有效果，即使新增了changelist，也会自动恢复到默认变更列表。
# <span id="inline-blue">原因</span>
Intellij idea中设置忽略提交svn文件和文件夹，通过Settings -> Version Control -> Ignored Files设置

![SVN设置忽略目录](/images/intelliJ/intelliJ_2023_12_08_001.png)

新增忽略设置
![SVN设置忽略目录](/images/intelliJ/intelliJ_2023_12_08_002.png)
 这里有三个单选框，功能从上到下依次是
忽略指定的文件；
忽略文件夹下所有文件；
忽略符合匹配规则的文件。

设置完成后发现对应模块下，target目录下的内容依旧出现在变更列表里面,查询SVN上的模块的上传记录，发现target目录的文件已经被上传到了SVN服务器，导致intelj设置的忽略完全没用作用
# <span id="inline-blue">解决办法</span>
通过tortoiseSVN登陆远程SVN目录，删除对应模块target目录，然后项目的本地目录执行SVN更新，将删除的target目录同步信息更新到本地，忽略就可以成功了。