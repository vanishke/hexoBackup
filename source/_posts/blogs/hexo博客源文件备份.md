---
title: Hexo博客源文档备份
categories:
	- Hexo
tags: 
	- Hexo
	- Next

date: 2021-01-15 14:11:20
updated: 2021-01-15 14:11:20
---

## <span id="inline-blue">实现原理</span>
通过监听hexo事件完成博客源码备份，hexo主要事件如下表

|事件名称|时间发生时间|
|:---:|:---:|
|deployBefore|在部署完成前发布|  
|deployAfter|在部署成功后发布|
|exit|在 Hexo 结束前发布|
|generateBefore|在静态文档生成前发布|
|generateAfter|在静态文档生成后发布|
|new|在文章文档建立后发布|

监听deployAfter事件，hexo上传文件到github之后自动运行git备份命令，完成博客备份。

## <span id="inline-blue">hexo源码添加Git仓库</span>
 1. github仓库新建repository,命名为hexoBackup
 2. 进入本地hexo目录，执行以下命令
 ```shell
 git init
 ```
 3. 设置远程仓库地址，并更新。
 ```shell
   git remote add origin git@github.com:<YOUR_ORG_OR_USER>/hexoBackup.git //设置需要同步的远程仓库地址
   git pull origin master //将本地代码上传到远程仓库
 ```
 4. 修改 .gitignore文档（如果没有请手动创建一个），在里面加入*.log(同步日志) 和 public/ (hexo生成的html文件)以及.deploy*/。因为每次执行hexo generate命令时，上述目录都会被重写更新。因此忽略这两个目录下的文档更新，加快 push速度。
 
 5. 执行以下命令，完成本地源码提交。
 ```shell
 git add . // 提交当前路径下的源码
 git commit -m "添加hexo源码文档作为备份" // 提交日志
 ```
 6.推送到远程仓库
 ```shell
 git push origin master
 ```
 ## <span id="inline-blue">安装shelljs模块</span>

 1. 要实现这个自动备份功能，需要依赖 Node.js的一个 shelljs 模块,该模块重新包装了child_process,调用系统命令更加的方便。该模块需要安装后使用。
 
 在命令中键入以下命令，完成shelljs模块的安装：
 ```shell
  npm install --save shelljs
 ```
 2. 编写自动备份脚本
 待到模块安装完成，在Hexo根目录的scripts文档夹下新建一个js文档，文档名随意取。
然后在脚本中，写入以下内容：
```javascript
require('shelljs/global');

try {
    hexo.on('deployAfter', function() {
        run();
    });
} catch (e) {
    console.log("产生了一个错误<(￣3￣)> !，错误详情为：" + e.toString());
}

function run() {
    if (!which('git')) {
        echo('Sorry, this script requires git');
        exit(1);
    } else {
        echo("======================Auto Backup Begin===========================");
        cd('H:/hexo');    
        if (exec('git add --all').code !== 0) {
            echo('Error: Git add failed');
            exit(1);

        }
        if (exec('git commit -am "Form auto backup script's commit"').code !== 0) {
            echo('Error: Git commit failed');
            exit(1);

        }
        if (exec('git push origin master').code !== 0) {
            echo('Error: Git push failed');
            exit(1);

        }
        echo("==================Auto Backup Complete============================")
    }
}
```

修改脚本中路径，替换为对应源码路径，注意仓库分支是否为master,保存脚本并退出。

，
## <span id="inline-blue">验证</span>
执行 hexo d 命令，执行结果如下:
```shell
$ hexo d
INFO  Validating config
INFO  Deploying: git
INFO  Clearing .deploy_git folder...
INFO  Copying files from public folder...
INFO  Copying files from extend dirs...
[master 383dcf1] Site updated: 2021-01-14 16:43:22
 110 files changed, 3704 insertions(+), 32 deletions(-)
Fatal: HttpRequestException encountered.
Username for 'https://github.com': <YOUR_GITHUB_USERNAME>
Counting objects: 253, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (137/137), done.
Writing objects: 100% (253/253), 84.53 KiB | 0 bytes/s, done.
Total 253 (delta 109), reused 0 (delta 0)
remote: Resolving deltas: 100% (109/109), completed with 38 local objects.
To https://github.com/<YOUR_GITHUB_USERNAME>/hexo.git
   55364f0..383dcf1  HEAD -> master
Branch master set up to track remote branch master from https://github.com/vanishke/hexo.git.
INFO  Deploy done: git
======================Auto Backup Begin===========================
[master 9f9c64d] blog auto backup script's commit
 36 files changed, 1133 insertions(+), 11 deletions(-)
To git@github.com:<YOUR_GITHUB_USERNAME>/hexoBackup.git
   b6ccffd..9f9c64d  master -> master
==================Auto Backup Complete============================

```





