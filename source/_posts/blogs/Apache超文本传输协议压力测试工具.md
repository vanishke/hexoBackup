---
title: Apache超文本传输协议压力测试工具
categories:
	- Apache
tags: 
	- Apache
	
date: 2024-01-03 9:20:20
updated: 2024-01-03 9:20:20

---
<!-- toc -->

# <span id="inline-blue">环境</span>
linux : CentOS Linux release 7.7.1908 (Core)
# <span id="inline-blue">apache bench</span>
ApacheBench 简称 ab，是 Apache HTTP Server 中的一个性能测试工具，可单独安装，在命令行中直接使用，可基于 HTTP 接口对任意 HTTP 服务器进行性能测试，得到每秒请求数（RPS）、平均请求响应时间等性能指标。
# <span id="inline-blue">安装</span>
```shell
yum -y install httpd-tools
```
# <span id="inline-blue">语法</span>
```shell
ab [options] [http[s]://]hostname[:port]/path
$ ab -h
Usage: ab [options] [http[s]://]hostname[:port]/path
Options are:
    -n requests     Number of requests to perform
    -c concurrency  Number of multiple requests to make at a time
    -t timelimit    Seconds to max. to spend on benchmarking
                    This implies -n 50000
    -s timeout      Seconds to max. wait for each response
                    Default is 30 seconds
    -b windowsize   Size of TCP send/receive buffer, in bytes
    -B address      Address to bind to when making outgoing connections
    -p postfile     File containing data to POST. Remember also to set -T
    -u putfile      File containing data to PUT. Remember also to set -T
    -T content-type Content-type header to use for POST/PUT data, eg.
                    'application/x-www-form-urlencoded'
                    Default is 'text/plain'
    -v verbosity    How much troubleshooting info to print
    -w              Print out results in HTML tables
    -i              Use HEAD instead of GET
    -x attributes   String to insert as table attributes
    -y attributes   String to insert as tr attributes
    -z attributes   String to insert as td or th attributes
    -C attribute    Add cookie, eg. 'Apache=1234'. (repeatable)
    -H attribute    Add Arbitrary header line, eg. 'Accept-Encoding: gzip'
                    Inserted after all normal header lines. (repeatable)
    -A attribute    Add Basic WWW Authentication, the attributes
                    are a colon separated username and password.
    -P attribute    Add Basic Proxy Authentication, the attributes
                    are a colon separated username and password.
    -X proxy:port   Proxyserver and port number to use
    -V              Print version number and exit
    -k              Use HTTP KeepAlive feature
    -d              Do not show percentiles served table.
    -S              Do not show confidence estimators and warnings.
    -q              Do not show progress when doing more than 150 requests
    -l              Accept variable document length (use this for dynamic pages)
    -g filename     Output collected data to gnuplot format file.
    -e filename     Output CSV file with percentages served
    -r              Don't exit on socket receive errors.
    -m method       Method name
    -h              Display usage information (this message)
    -I              Disable TLS Server Name Indication (SNI) extension
    -Z ciphersuite  Specify SSL/TLS cipher suite (See openssl ciphers)
    -f protocol     Specify SSL/TLS protocol
                    (TLS1, TLS1.1, TLS1.2 or ALL)
    -E certfile     Specify optional client certificate chain and private key
```
# <span id="inline-blue">实例</span>
指定url请求1000次，并发100
```shell
ab -c100 -n1000 http://10.9.216.12:8098/oms-pic/10146.png
This is ApacheBench, Version 2.3 <$Revision: 1430300 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 10.9.216.12 (be patient)
Completed 100 requests
Completed 200 requests
Completed 300 requests
Completed 400 requests
Completed 500 requests
Completed 600 requests
Completed 700 requests
Completed 800 requests
Completed 900 requests
Completed 1000 requests
Finished 1000 requests


Server Software:        nginx/1.18.0
Server Hostname:        10.9.216.12
Server Port:            8098

Document Path:          /oms-pic/10146.png
Document Length:        7289 bytes

Concurrency Level:      100
Time taken for tests:   0.122 seconds
Complete requests:      1000
Failed requests:        0
Write errors:           0
Total transferred:      7524000 bytes
HTML transferred:       7289000 bytes
Requests per second:    8201.97 [#/sec] (mean)
Time per request:       12.192 [ms] (mean)
Time per request:       0.122 [ms] (mean, across all concurrent requests)
Transfer rate:          60265.22 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    1   1.0      0       5
Processing:     3   11   2.4     11      15
Waiting:        0   11   2.4     11      15
Total:          7   11   1.9     11      15

Percentage of the requests served within a certain time (ms)
  50%     11
  66%     12
  75%     13
  80%     13
  90%     15
  95%     15
  98%     15
  99%     15
 100%     15 (longest request)
```