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
	cp('-R', 'G:/hexo/public/*', 'D:/nginx-1.16.1/nginx-1.16.1/blog');
	echo("====================== Copy resources to nginx end ===========================");
}
function run() {
	
	copy();
    if (!which('git')) {
        echo('Sorry, this script requires git');
        exit(1);
    } else {
        echo("======================Auto Backup Begin===========================");
        cd('G:/hexo');    //此处修改为Hexo根目录路径
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