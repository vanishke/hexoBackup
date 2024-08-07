---
title: Nginx基本命令
categories: 
	- Nginx
tags: 
	- Windows
	- Nginx

date: 2020-12-24 10:11:20
updated: 2020-12-24 10:11:20
---
<!-- toc -->

## <span id="inline-blue">添加nginx自启动文件</span>
```bash
#文件内容参考nginx官网设置,https://www.nginx.com/resources/wiki/start/topics/examples/redhatnginxinit/ ,注意修改其中nginx可执行文件路径和指定配置文件路径
[root@lwdCSCDN init.d]# vim /etc/init.d/nginx
```

## <span id="inline-blue">添加文件可执行权限</span>
```bash
[root@lwdCSCDN init.d]# chmod a+x /etc/init.d/nginx
```

## <span id="inline-blue">设置开启自启动</span>
```bash
[root@lwdCSCDN init.d]# chkconfig --add /etc/init.d/nginx
[root@lwdCSCDN init.d]# chkconfig nginx on
```

## <span id="inline-blue">验证服务是否添加成功</span>
```bash
[root@lwdCSCDN init.d]# service nginx start;
正在启动 nginx：                                           [确定]
```

## <span id="inline-blue">查询nginx是否启动</span>
```bash
[root@lwdCSCDN init.d]# ps -ef | grep nginx
root     19139     1  0 17:58 ?        00:00:00 nginx: master process /usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
root     19140 19139  0 17:58 ?        00:00:00 nginx: worker process                                          
root     19226 15760  0 17:59 pts/0    00:00:00 grep nginx
```


## <span id="inline-blue">重新加载nginx配置文件</span>
```bash
[root@lwdCSCDN init.d]# service nginx reload
nginx: the configuration file /usr/local/nginx/conf/nginx.conf syntax is ok
nginx: configuration file /usr/local/nginx/conf/nginx.conf test is successful
重新载入 nginx：                                           [确定]
You have new mail in /var/spool/mail/root
```

## <span id="inline-blue">停止nginx服务</span>
```bash
[root@lwdCSCDN init.d]# service nginx stop
停止 nginx：                                               [确定]
```


