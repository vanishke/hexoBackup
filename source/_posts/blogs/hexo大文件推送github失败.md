---
title: Hexo大文件推送github失败
tags: 
	- Hexo
categories: 
	- Hexo
	
date: 2022-05-19 09:29:51
updated: 2022-05-19 09:29:51
---
## <span id="inline-blue">问题现象</span>
hexo站点根目录目录下执行hexo d命令报错
```shell
remote: Resolving deltas: 100% (405/405), done.
    remote: error: GH001: Large files detected. You may want to try Git Large File Storage - https://vanishke.github.com.
    remote: error: Trace: 09c8c1ad5d3478b3692c72197ee5a8c6e76e583e0b76a35add8ac329b445be02
    remote: error: See http://git.io/iEPt8g for more information.
    remote: error: File images/mysql/test.sql is 108.72 MB; this exceeds GitHub’s file size limit of 100.00 MB
```

## <span id="inline-blue">解决办法</span>
删除对应位置上的文件，发现部署之后仍然报错，该问题需要清空hexo根目录下.deploy_git文件夹，重新部署成功


## <span id="inline-blue">验证</span>
![分享](/images/hexo/github/hexo_github_2022_05_19_001.png)






