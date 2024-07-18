---
title: Windows Nginx代理Hexo静态文件部署访问
categories:
	- Hexo
tags: 
	- Hexo
	- Nginx
	- Windows
	
date: 2024-07-09 14:10:20
updated: 2024-07-09 14:10:20
---
<!-- toc -->
# <span id="inline-blue">背景</span>
hexo打包启动之后本地访问特别慢，通过nginx代理静态文件优化访问速度
# <span id="inline-blue">实现</span>
Hexo所在根目录执行Hexo deploy命令之后在public目录生成静态文件，将其拷贝至nginx主目录
Hexo静态文件生成目录图
![Hexo优化](/images/hexo/nginx/hexo_nginx_20240709_001.png)

静态文件所在nginx目录结构图
![Hexo优化](/images/hexo/nginx/hexo_nginx_20240709_002.png)

nginx新增配置如下：
```shell
server {
        listen       8888;
        server_name  10.9.212.55;

        charset utf-8;

        access_log  logs/host.access.log ;

        location / {
			charset utf-8;
			autoindex on;
            alias  blog/;
        }
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
```
# <span id="inline-blue">hexo部署自动同步nginx</span>
hexo内容变动之后nginx对应静态资源同步更新，利用hexo deploy事件完成自动备份hexo的基础上实现，hexo根目录增加scripts/auto_backup.js
```javascript
require('shelljs/global');
try {
	/*
	hexo.on('generateAfter', function() {//当generate完成后拷贝静态文件到nginx主目录
        copy();
    });
	*/
    hexo.on('deployAfter', function() {//当deploy完成后执行备份
        run();
    });

} catch (e) {
    console.log("产生了一个错误啊<(￣3￣)> !，错误详情为：" + e.toString());
}
function copy()
{
	echo("====================== Copy resources to nginx start ===========================");
	cp('-R', 'H:/hexo/public/*', 'D:/nginx-1.16.1/nginx-1.16.1/blog');
	echo("====================== Copy resources to nginx end ===========================");
}
function run() {
	
	copy();
    if (!which('git')) {
        echo('Sorry, this script requires git');
        exit(1);
    } else {
        echo("======================Auto Backup Begin===========================");
        cd('H:/hexo');    //此处修改为Hexo根目录路径
        if (exec('git add .').code !== 0) {
            echo('Error: Git add failed');
            exit(1);
        }
        if (exec('git commit -am "blog auto backup script\'s commit"').code !== 0) {
            echo('Error: Git commit failed');
            exit(1);
        }
        if (exec('git push origin --force --all').code !== 0) {
            echo('Error: Git push failed');
            exit(1);
        }
        echo("==================Auto Backup Complete============================")
    }
	
}
```
