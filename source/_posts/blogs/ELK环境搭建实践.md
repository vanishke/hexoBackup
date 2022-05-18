---
title: ELK环境搭建实践
categories: 
	- ElasticSearch
tags: 
	- ElasticSearch
	- logstash
	- kibana
	
date: 2021-11-09 11:11:20
---


## <span id="inline-blue">工具安装包下载</span>
<a id="download" href="https://www.elastic.co/cn/what-is/elk-stack"><i class="fa fa-download"></i><span>elasticsearch官方地址</span> </a>
<a id="download" href="https://pan.baidu.com/s/1oaa1tRrbKokXyE1ZqEHpSg"><i class="fa fa-download"></i><span>百度云地址</span> </a>  提取码：op7h

Elasticsearch、logstash、kibana 三者使用同一版本7.15.1


## <span id="inline-blue">Elasticsearch</span>
	上传安装包到指定的目录 /usr/local/ELK/ 
![ELK安装目录](/images/elasticsearch/es_20211009_001.png)	

解压elasticsearch安装包，cd命令进入解压目录/usr/local/ELK/elasticsearch-7.15.1

ElasticSearch 配置文件实例
```yml
# ======================== Elasticsearch Configuration =========================
#
# NOTE: Elasticsearch comes with reasonable defaults for most settings.
#       Before you set out to tweak and tune the configuration, make sure you
#       understand what are you trying to accomplish and the consequences.
#
# The primary way of configuring a node is via this file. This template lists
# the most important settings you may want to configure for a production cluster.
#
# Please consult the documentation for further information on configuration options:
# https://www.elastic.co/guide/en/elasticsearch/reference/index.html
#
# ---------------------------------- Cluster -----------------------------------
#
# Use a descriptive name for your cluster:
#
cluster.name: my-application
#
# ------------------------------------ Node ------------------------------------
#
# Use a descriptive name for the node:
#
node.name: node-1
#
# Add custom attributes to the node:
#
#node.attr.rack: r1
#
# ----------------------------------- Paths ------------------------------------
#
# Path to directory where to store the data (separate multiple locations by comma):
#
path.data: /usr/local/ELK/elasticsearch-7.15.1/data/
#
# Path to log files:
#
path.logs: /usr/local/ELK/elasticsearch-7.15.1/logs
#
# ----------------------------------- Memory -----------------------------------
#
# Lock the memory on startup:
#
#bootstrap.memory_lock: true
#
# Make sure that the heap size is set to about half the memory available
# on the system and that the owner of the process is allowed to use this
# limit.
#
# Elasticsearch performs poorly when the system is swapping the memory.
#
# ---------------------------------- Network -----------------------------------
#
# By default Elasticsearch is only accessible on localhost. Set a different
# address here to expose this node on the network:
#绑定访问IP地址  
network.host: 10.9.216.12
#
# By default Elasticsearch listens for HTTP traffic on the first free port it
# finds starting at 9200. Set a specific HTTP port here:
# 访问端口
http.port: 9200
#
# For more information, consult the network module documentation.
#
# --------------------------------- Discovery ----------------------------------
#
# Pass an initial list of hosts to perform discovery when this node is started:
# The default list of hosts is ["127.0.0.1", "[::1]"]
# 集群节点IP地址
discovery.seed_hosts: ["10.9.216.12"]
#
# Bootstrap the cluster using an initial set of master-eligible nodes:
#节点名称
cluster.initial_master_nodes: ["node-1"]
#
# For more information, consult the discovery and cluster formation module documentation.
#
# ---------------------------------- Various -----------------------------------
#
# Require explicit names when deleting indices:
#
#action.destructive_requires_name: true
# 解决 system call filters failed to install; check the logs and fix your configuration or disable system call filters at your own risk
bootstrap.system_call_filter: false
# 是否支持跨域，默认为false
http.cors.enabled: true 
# 当设置允许跨域，默认为*,表示支持所有域名，如果我们只是允许某些网站能访问，那么可以使用正则表达式。比如只允许本地地址。 /https?:\/\/localhost(:[0-9]+)?/
http.cors.allow-origin: "*"
# kibana页面警告 x设置为true则在节点上启用X-Pack安全特性，false表示禁用X-Pack安全特性。（PS：推荐明确设置这个值）
pack.security.enabled: false

```
## <span id="inline-blue">安装head插件</span>

head插件地址：git://github.com/mobz/elasticsearch-head.git
下载之后将插件上传到Elasticsearch目录，创建一个自定义目录（放在原有plugins目录启动会报错）
global_plugins为自行创建目录，plugins为原有目录
![head插件目录](/images/elasticsearch/es_20211009_002.png)
head插件启动需要nodeJs环境，没有的情况下安装一下
```nodejs
[root@lwdCSCDN global_plugins]# node -v
v10.15.3
```

ElasticSearch不能以Root用户启动，创建指定ElasticSearch用户
```shell
# 添加群组
groupadd es
# 添加用户指定群组和密码
useradd es -g es -p es
# 给对应目录赋予权限
chown -R es:es /usr/local/ELK/elasticsearch-7.15.1/
# 切换到es用户
su es
```

更改es用户默认文件数配置
```shell
vim /etc/security/limits.conf 
# 添加如下内容
# max open files config for elasticsearch

es soft noproc 65536
es hard noproc 131072
es soft nofile 65536
es hard nofile 65536

 vim /etc/security/limits.d/90-nproc.conf
 
es soft noproc 65536
es hard noproc 131072
es soft nofile 65536
es hard nofile 65536

```

修改完上述文件重启服务器才能生效，使用ulimit -a 命令查看对应用户的参数是否生效
```shell
-bash-4.1$ ulimit -a
core file size          (blocks, -c) 0
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 255258
max locked memory       (kbytes, -l) 64
max memory size         (kbytes, -m) unlimited
open files                      (-n) 65535
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) unlimited
cpu time               (seconds, -t) unlimited
max user processes              (-u) 10000
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited
```

如果上述修改没有生效，可能/etc/profile 内部有做特殊指定,修改对应配置后执行source /etc/profile命令后生效(只能在当前窗口生效，之前打开的窗口没有作用)
```shell
cat /etc/profile
export REDIS_HOME=/usr/local/bin/redis
export PATH=$PATH:$REDIS_HOME/bin

ulimit -u 10000
ulimit -n 65535
ulimit -d unlimited
ulimit -m unlimited
ulimit -s unlimited
ulimit -t unlimited
ulimit -v unlimited 
```
提供临时设置的命令(当前窗口生效)
```shell
ulimit -HSn 65535
```

修改ElasticSearch启动jdk配置，7.15.1版本默认自带jDK，修改启动脚本，指定JDK路径ES_JAVA_HOME(必须为ES_JAVA_HOME,JAVA_HOME Elasticsearch不识别)
cd /usr/local/ELK/elasticsearch-7.15.1/bin
```shell
[root@lwdCSCDN bin]# vim elasticsearch

#!/bin/bash

# CONTROLLING STARTUP:
#
# This script relies on a few environment variables to determine startup
# behavior, those variables are:
#
#   ES_PATH_CONF -- Path to config directory
#   ES_JAVA_OPTS -- External Java Opts on top of the defaults set
#
# Optionally, exact memory values can be set using the `ES_JAVA_OPTS`. Example
# values are "512m", and "10g".
#
#   ES_JAVA_OPTS="-Xms8g -Xmx8g" ./bin/elasticsearch

export ES_JAVA_HOME="/usr/local/ELK/elasticsearch-7.15.1/jdk"
source "`dirname "$0"`"/elasticsearch-env
```

启动elsaticsearch
```shell
-bash-4.1$ ./elasticsearch
WARNING: A terminally deprecated method in java.lang.System has been called
WARNING: System::setSecurityManager has been called by org.elasticsearch.bootstrap.Elasticsearch (file:/usr/local/ELK/elasticsearch-7.15.1/lib/elasticsearch-7.15.1.jar)
WARNING: Please consider reporting this to the maintainers of org.elasticsearch.bootstrap.Elasticsearch
WARNING: System::setSecurityManager will be removed in a future release
/usr/local/ELK/elasticsearch-7.15.1/modules/x-pack-ml/platform/linux-x86_64/bin/controller: /lib64/libz.so.1: no version information available (required by /usr/local/ELK/elasticsearch-7.15.1/modules/x-pack-ml/platform/linux-x86_64/bin/../lib/libxml2.so.2)
WARNING: A terminally deprecated method in java.lang.System has been called
WARNING: System::setSecurityManager has been called by org.elasticsearch.bootstrap.Security (file:/usr/local/ELK/elasticsearch-7.15.1/lib/elasticsearch-7.15.1.jar)
WARNING: Please consider reporting this to the maintainers of org.elasticsearch.bootstrap.Security
WARNING: System::setSecurityManager will be removed in a future release
[2021-11-09T11:04:38,343][INFO ][o.e.n.Node               ] [node-1] version[7.15.1], pid[24509], build[default/tar/83c34f456ae29d60e94d886e455e6a3409bba9ed/2021-10-07T21:56:19.031608185Z], OS[Linux/2.6.32-279.el6.x86_64/amd64], JVM[Eclipse Adoptium/OpenJDK 64-Bit Server VM/17/17+35]
[2021-11-09T11:04:38,345][INFO ][o.e.n.Node               ] [node-1] JVM home [/usr/local/ELK/elasticsearch-7.15.1/jdk], using bundled JDK [true]
[2021-11-09T11:04:38,345][INFO ][o.e.n.Node               ] [node-1] JVM arguments [-Xshare:auto, -Des.networkaddress.cache.ttl=60, -Des.networkaddress.cache.negative.ttl=10, -XX:+AlwaysPreTouch, -Xss1m, -Djava.awt.headless=true, -Dfile.encoding=UTF-8, -Djna.nosys=true, -XX:-OmitStackTraceInFastThrow, -XX:+ShowCodeDetailsInExceptionMessages, -Dio.netty.noUnsafe=true, -Dio.netty.noKeySetOptimization=true, -Dio.netty.recycler.maxCapacityPerThread=0, -Dio.netty.allocator.numDirectArenas=0, -Dlog4j.shutdownHookEnabled=false, -Dlog4j2.disable.jmx=true, -Djava.locale.providers=SPI,COMPAT, --add-opens=java.base/java.io=ALL-UNNAMED, -XX:+UseG1GC, -Djava.io.tmpdir=/tmp/elasticsearch-11155009717091530414, -XX:+HeapDumpOnOutOfMemoryError, -XX:HeapDumpPath=data, -XX:ErrorFile=logs/hs_err_pid%p.log, -Xlog:gc*,gc+age=trace,safepoint:file=logs/gc.log:utctime,pid,tags:filecount=32,filesize=64m, -Xms15963m, -Xmx15963m, -XX:MaxDirectMemorySize=8371830784, -XX:InitiatingHeapOccupancyPercent=30, -XX:G1ReservePercent=25, -Des.path.home=/usr/local/ELK/elasticsearch-7.15.1, -Des.path.conf=/usr/local/ELK/elasticsearch-7.15.1/config, -Des.distribution.flavor=default, -Des.distribution.type=tar, -Des.bundled_jdk=true]
[2021-11-09T11:04:41,505][INFO ][o.e.p.PluginsService     ] [node-1] loaded module [aggs-matrix-stats]
[2021-11-09T11:04:41,506][INFO ][o.e.p.PluginsService     ] [node-1] loaded module [analysis-common]
```

访问验证
![ElasticSearch启动验证](/images/elasticsearch/es_20211009_003.png)

Head插件配置，修改Elasticsearch地址
文件所在位置：/usr/local/ELK/elasticsearch-7.15.1/global_plugins/elasticsearch-head/_site/app.js
搜索localhost:9200，将其改为对应地址即可

Head插件启动
```shell
# cd/usr/local/ELK/elasticsearch-7.15.1/global_plugins/elasticsearch-head
# npm install
-bash-4.1$ npm run start

> elasticsearch-head@0.0.0 start /usr/local/ELK/elasticsearch-7.15.1/global_plugins/elasticsearch-head
> grunt server

Running "connect:server" (connect) task
Waiting forever...
Started connect web server on http://localhost:9100
```

![head插件访问](/images/elasticsearch/es_20211009_004.png)


## <span id="inline-blue">logstash安装</span>

解压安装包，进入对应的目录
```shell
[root@lwdCSCDN ELK]# tar -zxvf logstash-7.15.1-linux-x86_64.tar.gz
[root@lwdCSCDN ELK]# cd logstash-7.15.1
#指定JDK地址
[root@lwdCSCDN bin]# vim logstash
[root@lwdCSCDN bin]# vim logstash

#!/bin/bash
# Run logstash
#
# Usage:
#   bin/logstash <command> [arguments]
#
# See 'bin/logstash --help' for a list of commands.
#
# Supported environment variables:
#   LS_JAVA_OPTS="xxx" to append extra options to the JVM options provided by logstash
#
# Development environment variables:
#   DEBUG=1 to output debugging information
export JAVA_HOME="/usr/local/ELK/logstash-7.15.1/jdk"
```
在/usr/local/ELK/logstash-7.15.1/config对应目录下，创建logstash.conf配置文件
```shell
input{
    file{
        path =>"/usr/local/ELK/logstash-7.15.1/logs/test.log"
        start_position=>"beginning"
    }
}

filter{
    grok{
        match=>{
            "message"=>"%{DATA:clientIp} - - \[%{HTTPDATE:accessTime}\] \"%{DATA:method} %{DATA:requestPath} %{DATA:httpversion}\" %{DATA:retcode} %{DATA:size} \"%{DATA:fromHtml}\" \"%{DATA:useragent}\""
        }

        remove_field=>"message"
    }
    date{
        match=>["accessTime","dd/MMM/yyyy:HH:mm:ss Z"]
    }
}

output{
    stdout{
        codec=>rubydebug
    }
}
input {
    stdin{
    }
}
output {
    elasticsearch {
                  hosts => ["10.9.216.12:9200"]
                  index => "test_index"
          }
          stdout { codec => rubydebug}
}
```

创建测试日志文件，与配置文件指定一致/usr/local/ELK/logstash-7.15.1/logs，日志内容如下：
```shell
ot@cdh4 test]# vim access_log.2018-04-10.log
10.2.17.9 - - [10/Apr/2018:09:06:22 +0800] "GET /static/logshow/css/component.css HTTP/1.1" 304 -
10.2.17.9 - - [10/Apr/2018:09:06:22 +0800] "GET /static/logshow/js/EasePack.min.js HTTP/1.1" 304 -
10.2.17.9 - - [10/Apr/2018:09:06:22 +0800] "GET /static/logshow/js/TweenLite.min.js HTTP/1.1" 304 -
10.2.17.9 - - [10/Apr/2018:09:06:22 +0800] "GET /static/logshow/js/rAF.js HTTP/1.1" 304 -
10.2.17.9 - - [10/Apr/2018:09:06:22 +0800] "GET /static/logshow/js/demo-1.js HTTP/1.1" 304 -
10.2.17.9 - - [10/Apr/2018:09:06:22 +0800] "GET /static/logshow/img/demo-1-bg.jpg HTTP/1.1" 304 -
10.2.17.9 - - [10/Apr/2018:09:06:30 +0800] "GET / HTTP/1.1" 302 -
10.2.17.9 - - [10/Apr/2018:09:06:30 +0800] "GET /login HTTP/1.1" 200 3271
10.2.17.9 - - [10/Apr/2018:09:06:36 +0800] "POST /login HTTP/1.1" 302 -
10.2.17.9 - - [10/Apr/2018:09:06:36 +0800] "GET / HTTP/1.1" 200 11776
10.2.17.9 - - [10/Apr/2018:09:06:36 +0800] "GET /static/css/font-awesome.min.css?v=4.4.0 HTTP/1.1" 304 -
```

logstash启动
```shell
[root@lwdCSCDN bin]# ./logstash -f ../config/logstash.conf
Using JAVA_HOME defined java: /usr/local/ELK/logstash-7.15.1/jdk
WARNING, using JAVA_HOME while Logstash distribution comes with a bundled JDK
OpenJDK 64-Bit Server VM warning: Option UseConcMarkSweepGC was deprecated in version 9.0 and will likely be removed in a future release.
Sending Logstash logs to /usr/local/ELK/logstash-7.15.1/logs which is now configured via log4j2.properties
[2021-11-09T14:48:34,143][INFO ][logstash.runner          ] Log4j configuration path used is: /usr/local/ELK/logstash-7.15.1/config/log4j2.properties
[2021-11-09T14:48:34,188][INFO ][logstash.runner          ] Starting Logstash {"logstash.version"=>"7.15.1", "jruby.version"=>"jruby 9.2.19.0 (2.5.8) 2021-06-15 55810c552b OpenJDK 64-Bit Server VM 11.0.12+7 on 11.0.12+7 +indy +jit [linux-x86_64]"}
[2021-11-09T14:48:34,571][WARN ][logstash.config.source.multilocal] Ignoring the 'pipelines.yml' file because modules or command line options are specified
[2021-11-09T14:48:36,409][INFO ][logstash.agent           ] Successfully started Logstash API endpoint {:port=>9600}
[2021-11-09T14:48:37,287][INFO ][org.reflections.Reflections] Reflections took 138 ms to scan 1 urls, producing 120 keys and 417 values 
[2021-11-09T14:48:39,422][INFO ][logstash.outputs.elasticsearch][main] New Elasticsearch output {:class=>"LogStash::Outputs::ElasticSearch", :hosts=>["//10.9.216.12:9200"]}
[2021-11-09T14:48:39,926][INFO ][logstash.outputs.elasticsearch][main] Elasticsearch pool URLs updated {:changes=>{:removed=>[], :added=>[http://10.9.216.12:9200/]}}
[2021-11-09T14:48:40,123][WARN ][logstash.outputs.elasticsearch][main] Restored connection to ES instance {:url=>"http://10.9.216.12:9200/"}
[2021-11-09T14:48:40,184][INFO ][logstash.outputs.elasticsearch][main] Elasticsearch version determined (7.15.1) {:es_version=>7}
[2021-11-09T14:48:40,186][WARN ][logstash.outputs.elasticsearch][main] Detected a 6.x and above cluster: the `type` event field won't be used to determine the document _type {:es_version=>7}
[2021-11-09T14:48:40,414][INFO ][logstash.outputs.elasticsearch][main] Using a default mapping template {:es_version=>7, :ecs_compatibility=>:disabled}
[2021-11-09T14:48:40,616][INFO ][logstash.javapipeline    ][main] Starting pipeline {:pipeline_id=>"main", "pipeline.workers"=>8, "pipeline.batch.size"=>125, "pipeline.batch.delay"=>50, "pipeline.max_inflight"=>1000, "pipeline.sources"=>["/usr/local/ELK/logstash-7.15.1/config/logstash.conf"], :thread=>"#<Thread:0xc0227a3 run>"}
[2021-11-09T14:48:42,101][INFO ][logstash.javapipeline    ][main] Pipeline Java execution initialization time {"seconds"=>1.48}
[2021-11-09T14:48:42,199][INFO ][logstash.inputs.file     ][main] No sincedb_path set, generating one based on the "path" setting {:sincedb_path=>"/usr/local/ELK/logstash-7.15.1/data/plugins/inputs/file/.sincedb_564ad11bfc2bcd7fe5ec10ca0ee07d07", :path=>["/usr/local/ELK/logstash-7.15.1/logs/test.log"]}
WARNING: An illegal reflective access operation has occurred
WARNING: Illegal reflective access by com.jrubystdinchannel.StdinChannelLibrary$Reader (file:/usr/local/ELK/logstash-7.15.1/vendor/bundle/jruby/2.5.0/gems/jruby-stdin-channel-0.2.0-java/lib/jruby_stdin_channel/jruby_stdin_channel.jar) to field java.io.FilterInputStream.in
WARNING: Please consider reporting this to the maintainers of com.jrubystdinchannel.StdinChannelLibrary$Reader
WARNING: Use --illegal-access=warn to enable warnings of further illegal reflective access operations
WARNING: All illegal access operations will be denied in a future release
[2021-11-09T14:48:42,292][INFO ][logstash.javapipeline    ][main] Pipeline started {"pipeline.id"=>"main"}
The stdin plugin is now waiting for input:
[2021-11-09T14:48:42,375][INFO ][logstash.agent           ] Pipelines running {:count=>1, :running_pipelines=>[:main], :non_running_pipelines=>[]}
[2021-11-09T14:48:42,381][INFO ][filewatch.observingtail  ][main][9a1656b2353e9b2608f8d58d6e356237ac498ca7b95fbed910c53ba565f0606a] START, creating Discoverer, Watch with file and sincedb collections
```
-f 参数指定启动配置文件
启动成功后，logstash监控控制台输出，在控制台随意输入一些信息，logstash会将信息存入Elasticsearch,可以通过Head插件查看

## <span id="inline-blue">kibana安装</span>

解压对应安装包，进入对应目录
```shell
[root@lwdCSCDN ELK]# tar -zxvf kibana-7.15.1-linux-x86_64.tar.gz
[root@lwdCSCDN ELK]# cd kibana-7.15.1-linux-x86_64
#编辑配置文件，配置ElasticSearch地址、修改语言配置、启用默认端口
[root@lwdCSCDN config]# vim /usr/local/ELK/kibana-7.15.1-linux-x86_64/config/kibana.yml
# Kibana is served by a back end server. This setting specifies the port to use.
server.port: 5601

# Specifies the address to which the Kibana server will bind. IP addresses and host names are both valid values.
# The default is 'localhost', which usually means remote machines will not be able to connect.
# To allow connections from remote users, set this parameter to a non-loopback address.
server.host: "0.0.0.0"

# Enables you to specify a path to mount Kibana at if you are running behind a proxy.
# Use the `server.rewriteBasePath` setting to tell Kibana if it should remove the basePath
# from requests it receives, and to prevent a deprecation warning at startup.
# This setting cannot end in a slash.
#server.basePath: ""

# Specifies whether Kibana should rewrite requests that are prefixed with
# `server.basePath` or require that they are rewritten by your reverse proxy.
# This setting was effectively always `false` before Kibana 6.3 and will
# default to `true` starting in Kibana 7.0.
#server.rewriteBasePath: false

# Specifies the public URL at which Kibana is available for end users. If
# `server.basePath` is configured this URL should end with the same basePath.
#server.publicBaseUrl: ""

# The maximum payload size in bytes for incoming server requests.
server.maxPayload: 1048576

# The Kibana server's name.  This is used for display purposes.
server.name: "kibana"

# The URLs of the Elasticsearch instances to use for all your queries.
elasticsearch.hosts: ["http://10.9.216.12:9200"]

# Kibana uses an index in Elasticsearch to store saved searches, visualizations and
# dashboards. Kibana creates a new index if the index doesn't already exist.
kibana.index: ".kibana"

# The default application to load.
kibana.defaultAppId: "home"

# If your Elasticsearch is protected with basic authentication, these settings provide
# the username and password that the Kibana server uses to perform maintenance on the Kibana
# index at startup. Your Kibana users still need to authenticate with Elasticsearch, which
# is proxied through the Kibana server.
#elasticsearch.username: "kibana_system"
#elasticsearch.password: "pass"

# Kibana can also authenticate to Elasticsearch via "service account tokens".
# If may use this token instead of a username/password.
# elasticsearch.serviceAccountToken: "my_token"

# Enables SSL and paths to the PEM-format SSL certificate and SSL key files, respectively.
# These settings enable SSL for outgoing requests from the Kibana server to the browser.
#server.ssl.enabled: false
#server.ssl.certificate: /path/to/your/server.crt
#server.ssl.key: /path/to/your/server.key

# Optional settings that provide the paths to the PEM-format SSL certificate and key files.
# These files are used to verify the identity of Kibana to Elasticsearch and are required when
# xpack.security.http.ssl.client_authentication in Elasticsearch is set to required.
#elasticsearch.ssl.certificate: /path/to/your/client.crt
#elasticsearch.ssl.key: /path/to/your/client.key

# Optional setting that enables you to specify a path to the PEM file for the certificate
# authority for your Elasticsearch instance.
#elasticsearch.ssl.certificateAuthorities: [ "/path/to/your/CA.pem" ]

# To disregard the validity of SSL certificates, change this setting's value to 'none'.
#elasticsearch.ssl.verificationMode: full

# Time in milliseconds to wait for Elasticsearch to respond to pings. Defaults to the value of
# the elasticsearch.requestTimeout setting.
#elasticsearch.pingTimeout: 1500

# Time in milliseconds to wait for responses from the back end or Elasticsearch. This value
# must be a positive integer.
#elasticsearch.requestTimeout: 30000

# List of Kibana client-side headers to send to Elasticsearch. To send *no* client-side
# headers, set this value to [] (an empty list).
#elasticsearch.requestHeadersWhitelist: [ authorization ]

# Header names and values that are sent to Elasticsearch. Any custom headers cannot be overwritten
# by client-side headers, regardless of the elasticsearch.requestHeadersWhitelist configuration.
#elasticsearch.customHeaders: {}

# Time in milliseconds for Elasticsearch to wait for responses from shards. Set to 0 to disable.
#elasticsearch.shardTimeout: 30000

# Logs queries sent to Elasticsearch. Requires logging.verbose set to true.
#elasticsearch.logQueries: false

# Specifies the path where Kibana creates the process ID file.
#pid.file: /run/kibana/kibana.pid

# Enables you to specify a file where Kibana stores log output.
#logging.dest: stdout

# Set the value of this setting to true to suppress all logging output.
#logging.silent: false

# Set the value of this setting to true to suppress all logging output other than error messages.
#logging.quiet: false

# Set the value of this setting to true to log all events, including system usage information
# and all requests.
#logging.verbose: false

# Set the interval in milliseconds to sample system and process performance
# metrics. Minimum is 100ms. Defaults to 5000.
#ops.interval: 5000

# Specifies locale to be used for all localizable strings, dates and number formats.
# Supported languages are the following: English - en , by default , Chinese - zh-CN .
i18n.locale: "zh-CN"
```
启动kibana 
```shell
[root@lwdCSCDN bin]# cd /usr/local/ELK/kibana-7.15.1-linux-x86_64/bin
[root@lwdCSCDN bin]# ./kibana
启动报错，提示缺失文件
![kibana启动报错](/images/elasticsearch/es_20211009_005.png)
glibc版本升级到glibc-2.17
#cd到该路径下
cd /usr/local
#下载
wget https://ftp.gnu.org/gnu/glibc/glibc-2.17.tar.gz
#解压
tar -zxvf glibc-2.17.tar.gz
#进入到解压文件中
#创建路径
mkdir build  
#进入到build路径下
../configure --prefix=/usr --disable-profile --enable-add-ons --with-headers=/usr/include --with-binutils=/usr/bin
#安装
make && make install
```
验证
```shell
[root@lwdCSCDN lib64stdc]# strings /lib64/libc.so.6|grep GLIBC
GLIBC_2.2.5
GLIBC_2.2.6
GLIBC_2.3
GLIBC_2.3.2
GLIBC_2.3.3
GLIBC_2.3.4
GLIBC_2.4
GLIBC_2.5
GLIBC_2.6
GLIBC_2.7
GLIBC_2.8
GLIBC_2.9
GLIBC_2.10
GLIBC_2.11
GLIBC_2.12
GLIBC_2.13
GLIBC_2.14
GLIBC_2.15
GLIBC_2.16
GLIBC_2.17
GLIBC_PRIVATE
```
lib64stdc++升级到gcc4.8
<a id="download" href="http://ftp.de.debian.org/debian/pool/main/g/gcc-4.8/"><i class="fa fa-download"></i><span>gcc4.8下载地址</span> </a>
服务器创建临时目录lib64stdc，上传压缩包解压
```shell
# 解压
[root@lwdCSCDN lib64stdc]# ar -x lib64stdc++6-4.8-dbg_4.8.4-1_i386.deb
[root@lwdCSCDN lib64stdc]# tar xvf data.tar.xz 
[root@lwdCSCDN lib64stdc]# cd usr/lib64/debug/
# 覆盖/usr/lib、/usr/lib64对应库文件
[root@lwdCSCDN debug]# cp libstdc++.so /usr/lib
[root@lwdCSCDN debug]# cp libstdc++.so /usr/lib64
[root@lwdCSCDN debug]# cp libstdc++.so.6 /usr/lib
[root@lwdCSCDN debug]# cp libstdc++.so.6 /usr/lib64
# 验证
[root@lwdCSCDN debug]# strings /usr/lib/libstdc++.so.6 | grep GLIBCXX
GLIBCXX_3.4
GLIBCXX_3.4.1
GLIBCXX_3.4.2
GLIBCXX_3.4.3
GLIBCXX_3.4.4
GLIBCXX_3.4.5
GLIBCXX_3.4.6
GLIBCXX_3.4.7
GLIBCXX_3.4.8
GLIBCXX_3.4.9
GLIBCXX_3.4.10
GLIBCXX_3.4.11
GLIBCXX_3.4.12
GLIBCXX_3.4.13
GLIBCXX_3.4.14
GLIBCXX_3.4.15
GLIBCXX_3.4.16
GLIBCXX_3.4.17
GLIBCXX_3.4.18
GLIBCXX_3.4.19
GLIBCXX_DEBUG_MESSAGE_LENGTH
```
重新启动成功
```shell
[root@lwdCSCDN bin]# ./kibana --allow-root
  log   [10:25:07.263] [info][plugins-service] Plugin "metricsEntities" is disabled.
  log   [10:25:07.508] [info][server][Preboot][http] http server running at http://0.0.0.0:5601
  log   [10:25:07.788] [warning][config][deprecation] plugins.scanDirs is deprecated and is no longer used
  log   [10:25:07.789] [warning][config][deprecation] "kibana.index" is deprecated. Multitenancy by changing "kibana.index" will not be supported starting in 8.0. See https://ela.st/kbn-remove-legacy-multitenancy for more details
  log   [10:25:07.789] [warning][config][deprecation] kibana.defaultAppId is deprecated and will be removed in 8.0. Please use the `defaultRoute` advanced setting instead
  log   [10:25:07.790] [warning][config][deprecation] Config key [monitoring.cluster_alerts.email_notifications.email_address] will be required for email notifications to work in 8.0."
  log   [10:25:07.790] [warning][config][deprecation] "xpack.reporting.roles" is deprecated. Granting reporting privilege through a "reporting_user" role will not be supported starting in 8.0. Please set "xpack.reporting.roles.enabled" to "false" and grant reporting privileges to users using Kibana application privileges **Management > Security > Roles**.
  log   [10:25:07.790] [warning][config][deprecation] Session idle timeout ("xpack.security.session.idleTimeout") will be set to 1 hour by default in the next major version (8.0).
```
访问kibana主页
http://10.9.216.12:5601/app/home#/

![kibana启动报错](/images/elasticsearch/es_20211009_006.png)



