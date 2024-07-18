---
title: 分析curl命令请求耗时
categories: 
	- Linux
tags: 
	- Linux
	- Curl
	
date: 2024-02-26 15:11:20
updated: 2024-02-26 15:11:20
---
<!-- toc -->

## <span id="inline-blue">环境</span>
Linux : CentOS Linux release 7.6.1810 (Core) 

## <span id="inline-blue">背景</span>
项目部署Linux服务器之后，接口涉及第三方请求耗时达到3秒左右，需要进一步分析耗时发生在那个阶段

## <span id="inline-blue">实现</span>
curl命令统计各阶段耗时
在当前调用curl命令路径下新建一个文件curl-format.txt，文件内部添加以下内容
```shell
time_namelookup:  %{time_namelookup}s\n
        time_connect:  %{time_connect}s\n
     time_appconnect:  %{time_appconnect}s\n
    time_pretransfer:  %{time_pretransfer}s\n
       time_redirect:  %{time_redirect}s\n
  time_starttransfer:  %{time_starttransfer}s\n
                     ----------\n
          time_total:  %{time_total}s\n
```

执行curl命令
```shell
curl -w "@curl-format.txt" -o NUL -s "http://10.9.216.12:9001/dev/appapi/tvBox/api/queryBindUsers"
```
参数说明：
-w "@curl-format.txt" 通知cURL使用格式化的输出文件
-o /dev/null 将请求的输出重定向到/dev/null
-s 通知cURL不显示进度条
"http://10.9.216.12:9001/dev/appapi/tvBox/api/queryBindUsers" 是我们请求的URL，请使用引号包围（尤其当你的URL包含&查询字符串）

调用结果分析输出
```shell
 time_namelookup: 0.000
      time_connect: 0.000
   time_appconnect: 0.000
     time_redirect: 0.000
  time_pretransfer: 0.001
time_starttransfer: 0.049
                    ----------
time_total: 0.049
```
输出内容各项释义
```shell
time_namelookup：DNS 域名解析需要的时间
time_connect：TCP 连接建立的时间，就是三次握手的时间
time_appconnect：SSL/SSH等上层协议建立连接的时间，比如 connect/handshake 的时间
time_pretransfer：从请求开始到响应开始传输的时间
time_starttransfer：从请求开始到第一个字节将要传输的时间
time_total：这次请求花费的全部时间
```





