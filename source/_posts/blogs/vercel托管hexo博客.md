---
title: Vercel托管Hexo博客
categories: 
	- Hexo
	- Next
tags: 
	- Hexo 
	- Next
	
date: 2021-01-15 15:46:20	
updated: 2021-01-15 15:46:20
---

## <span id="inline-blue">背景<span>
hexo发布的静态文件推送到了github pages，直接访问页面非常慢，使用vercel代理github pages，访问页面加载速度有明显提升。
##	<span id="inline-blue">注册vercel<span>
<a href="https://vercel.com/">vercel官网地址</a>

绑定github账号：
![账号绑定](/images/hexo/vercel/hexo_vercel_20210115_001.png)
注意github用户验证的邮箱账号，qq邮箱验证无法通过，网易邮箱亲测可行。

## <span id="inline-blue">导入仓库<span>

![导入仓库](/images/hexo/vercel/hexo_vercel_20210115_002.png)
这里导入的是hexo通过hexo d 部署同步到github pages上的public文件夹下的静态文件。
找到github pages上hexo博客，切换到setting选项，找到github pages 选项。
![博客代理设置](/images/hexo/vercel/hexo_vercel_20210115_003.png)
![博客代理设置](/images/hexo/vercel/hexo_vercel_20210115_004.png)

## <span id="inline-blue">验证<span>
![验证](/images/hexo/vercel/hexo_vercel_20210115_005.png)
![验证](/images/hexo/vercel/hexo_vercel_20210115_006.png)










