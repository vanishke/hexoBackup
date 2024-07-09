---
title: Elasticsearch-SQL插件安装.
categories:
	- Elasticsearch

date: 2023-08-02 14:35:20
tags: 
	- Elasticsearch
---
<!-- toc -->
# <span id="inline-blue">环境</span>
Elasticsearch-7.15.1
# <span id="inline-blue">插件</span>
Elasticsearch-SQL-7.15.1.0 : es SQL查询插件
es-sql-site-standalone ： es SQL查询前端
下载地址：链接：https://pan.baidu.com/s/1wyUFPOU6uywOOAhw2f9QEA 
提取码：z2od
# <span id="inline-blue">Elasticsearch-SQL在线安装</span>
```shell
#Elasticsearch主目录下执行
./bin/elasticsearch-plugin install https://github.com/NLPchina/elasticsearch-sql/releases/download/7.15.1.0/elasticsearch-sql-7.15.1.0.zip
```

# <span id="inline-blue">Elasticsearch-SQL离线安装</span>
```shell
#自行下载对应压缩包https://github.com/NLPchina/elasticsearch-sql/releases/download/7.15.1.0/elasticsearch-sql-7.15.1.0.zip,并将其上传至服务器/home目录，执行以下命令
cd /usr/local/ELK/elasticsearch-7.15.1/
./bin/elasticsearch-plugin install file:/home/elasticsearch-sql-7.15.1.0.zip
```
# <span id="inline-blue">es-sql-site-standalone安装</span>
在Elasticsearch主目录下创建文件夹global_plugins,将es-sql-site-standalone.zip上传到该目录下，执行以下命令
```shell
unzip es-sql-site-standalone.zip -d es-sql-site
```
修改访问的配置端口：
/usr/local/ELK/elasticsearch-7.15.1/global_plugins/es-sql-site/site-server/site_configuration.json
```shell
{
        "port":8080
}
```
Elasticsearch-SQL api访问路径变更：
```shell
Since 7.5.0.0, the path /_sql is changed to /_nlpcn/sql, and the path /_sql/_explain is changed to /_nlpcn/sql/explain.
```
修改/usr/local/ELK/elasticsearch-7.15.1/global_plugins/es-sql-site/_site/controllers.js
184行和250行分别将_sql路径变更为_nlpcn/sql、_sql/_explain变更为_nlpcn/sql/explain

修改es配置：
ES的elasticsearch.yml，增加跨域的配置(需要重启es才能生效) 
```shell
http.cors.enabled: true  
http.cors.allow-origin: "*"
```
编辑controllers.js文件,修改es访问地址：/usr/local/ELK/elasticsearch-7.15.1/global_plugins/es-sql-site/_site/controllers.js
```shell
  if (location.protocol == "file") {
                                url = "http://localhost:9200"
                        }
                        else {
                                url = location.protocol+'//' + location.hostname + (location.port ? ':'+location.port : '');
                        }
                }
```
修改url地址为ES服务器的地址：
```shell
 if (location.protocol == "file") {
                                url = "http://10.9.216.12:9200"
                        }
                        else {
                                url = "http://10.9.216.12:19200";
                        }
                }

```
# <span id="inline-blue">es-sql-site-standalone启动</span>
es-sql-site-standalone插件需要node环境支持，除此之外需要连接外网
有外网的情况下启动：
```shell
 cd /usr/local/ELK/elasticsearch-7.15.1/global_plugins/es-sql-site/site-server
 npm install express --save
 node node-server.js
```
访问验证：
![Elasticsearch-SQL](/images/elasticsearch/es_20230802_001.png)
无外网的情况下，将es-sql-site-standalone.zip上传到tomcat的webapps目录下解压,将es-sql-site-standalone作为一个web服务对外提供访问
```shell
cd /usr/local/tomcat8/webapps/
unzip es-sql-site-standalone.zip -d sql
```
端口和es访问地址及api接口路径修改方式和上述相同，自行修改。

访问验证：
启动tomcat，访问 ip:端口/sql/_site/ 
![Elasticsearch-SQL](/images/elasticsearch/es_20230802_002.png)

# <span id="inline-blue">Elasticsearch-SQL和x-pack-sql差异</span>
Elasticsearch-SQL接口访问
访问地址
http://10.26.0.22:9200/_nlpcn/sql
参数信息,直接写查询SQL
{
	SELECT * FROM nginx-error-2023.08.01
}


![Elasticsearch-SQL](/images/elasticsearch/es_20230802_003.png)
x-pack-sql接口访问
访问地址
http://10.26.0.22:9200/_sql
参数信息,索引需要用\转义双引号包起来，否则查询失败
{
  "query": "SELECT * FROM \"nginx-error-2023.08.01\" "
}

![Elasticsearch-SQL](/images/elasticsearch/es_20230802_004.png)