---
title: Hexo添加hexo-neat插件
categories: 
	- Hexo
tags: 
	- Hexo
	- Next
date: 2021-01-15 15:46:20
updated: 2021-01-15 15:46:20
---

## <span id="inline-blue">安装插件</span>

```shell
npm install hexo-neat --save
```
## <span id="inline-blue">站点配置</span>
hexo _config.yml文件添加
```shell
# hexo-neat
# 博文压缩
neat_enable: true
# 压缩html
neat_html:
  enable: true
  exclude:
# 压缩css  
neat_css:
  enable: true
  exclude:
    - '**/*.min.css'
# 压缩js
neat_js:
  enable: true
  mangle: true
  output:
  compress:
  exclude:
    - '**/*.min.js'
	- '**/*.min.css'
    - '**/jquery.fancybox.pack.js'
    - '**/index.js'
	- '**/comments.gitalk.js'
```