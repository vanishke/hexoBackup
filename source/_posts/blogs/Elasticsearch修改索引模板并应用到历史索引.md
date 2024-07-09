---
title: Elasticsearch修改索引模板并应用到历史索引
categories:
	- Elasticsearch

date: 2024-01-24 11:26:20
tags: 
	- Elasticsearch
---
<!-- toc -->

# <span id="inline-blue">环境</span>
linux : CentOS Linux release 7.7.1908 (Core)
Elasticsearch : 6.8.4
# <span id="inline-blue">目的</span>
Elasticsearch统计用户的访问记录，需要在已有模板的基础上增加几个上报属性，通过head和SQL插件能够查询到新增的属性，并将新增的属性应用到已存在的历史索引
新增属性：
softwareVersion(String) : 软件版本
hdVersion(String): 硬件版本
model(String):	硬件型号
socmodel(String): 芯片型号
districtCodeName(String): 区域名称
mac(String): MAC地址
# <span id="inline-blue">实现</span>
原始模板：
```json
 {
  "order": 1,
  "index_patterns" : "user_action_*",
  "settings": {
    "index": {
      "number_of_shards" : "6",
      "number_of_replicas": "0",
      "refresh_interval" : "30s",
      "translog.flush_threshold_size" : "1024mb"
    }
  },
  "mappings": {
    "action": {
      "_all": { "enabled": false },
      "properties": {
          "eTime":       { "type": "date", "format": "yyyy-MM-dd HH:mm:ss" },
          "time" :       { "type": "long"},
          "clientIp":    { "type" : "ip"},

          "eType":       { "type": "keyword", "index": true },
          "eId":         { "type": "keyword", "index": true },
          "tId":         { "type": "keyword", "index": true },
          "tType":       { "type": "keyword", "index": true },
          "tProtocol":   { "type": "keyword", "index": true },
          "login":       { "type": "keyword", "index": true },
          "uc":          { "type": "keyword", "index": true },
          "areaCode":    { "type": "keyword", "index": true },
          "tModel":      { "type": "keyword", "index": true },
          "sceneId":     { "type": "keyword", "index": true },

          "videoId":      { "type": "keyword", "index": true },
          "pVideoId":     { "type": "keyword", "index": true },
          "videoIndex":   { "type": "keyword", "index": true },
          "videoDuration":{ "type": "keyword", "index": true },
          "tsId":         { "type": "keyword", "index": true },
          "serId":        { "type": "keyword", "index": true },
          "netId":        { "type": "keyword", "index": true },
          "chName":       { "type": "keyword", "index": true },
          "progName":     { "type": "keyword", "index": true },
          
          "aId":         { "type": "keyword", "index": true },
          "pId":         { "type": "keyword", "index": true },
          "rName":       { "type": "keyword", "index": true },
          "coId":        { "type": "keyword", "index": true },
          "rFlag":       { "type": "keyword", "index": true },
          "paId":        { "type": "keyword", "index": true },
          "ppId":        { "type": "keyword", "index": true },
          "pkgFlag":     { "type": "keyword", "index": true },
          
          "eStatus":     { "type": "keyword", "index":true },
          "uuid":        { "type": "keyword", "index":true },
          "lat":         { "type": "keyword", "index":true },
          "lng":         { "type": "keyword", "index":true },
          "netType":     { "type": "keyword", "index":true },
          "sn":          { "type": "keyword", "index":true },
          "tOS":         { "type": "keyword", "index":true },
          
          "way":         { "type": "keyword", "index":true },
          "epbt":        { "type": "keyword", "index":true },
          "epet":        { "type": "keyword", "index":true },         
          "productCode": { "type": "keyword", "index":true },
          
          "kw":          { "type": "keyword", "index": true },
          "rType":       { "type": "keyword", "index": true },
          "recomId":     { "type": "keyword", "index": true },
          "coName":      { "type": "keyword", "index": true },
          "coType":      { "type": "keyword", "index": true },
          "actionType":  { "type": "keyword", "index": true },
          "orderType":   { "type": "keyword", "index": true },
          "logicNumber": { "type": "keyword", "index": true },
          "chargeNum":   { "type" : "integer" },

          "viewType":    { "type": "keyword", "index": true },
          "viewPath":    { "type": "keyword", "index": true },

          "appId" :      { "type" : "keyword", "index" : true },
          "appName" :    { "type" : "keyword", "index" : true },
          "appType" :    { "type" : "keyword", "index" : true },
          "appVersion" : { "type" : "keyword", "index" : true },
                          
          "startTime" :  { "type" : "date", "format" : "yyyy-MM-dd HH:mm:ss" },   
          "endTime" :    { "type" : "date", "format" : "yyyy-MM-dd HH:mm:ss" },
          "duration" :   { "type" : "integer" }
      }
    }
  }
}
```
变更后模板:
```json
{
  "order": 1,
  "index_patterns" : "user_action_*",
  "settings": {
    "index": {
      "number_of_shards" : "6",
      "number_of_replicas": "0",
      "refresh_interval" : "30s",
      "translog.flush_threshold_size" : "1024mb"
    }
  },
  "mappings": {
    "action": {
      "_all": { "enabled": false },
      "properties": {
          "eTime":       { "type": "date", "format": "yyyy-MM-dd HH:mm:ss" },
          "time" :       { "type": "long"},
          "clientIp":    { "type" : "ip"},

          "eType":       { "type": "keyword", "index": true },
          "eId":         { "type": "keyword", "index": true },
          "tId":         { "type": "keyword", "index": true },
          "tType":       { "type": "keyword", "index": true },
          "tProtocol":   { "type": "keyword", "index": true },
          "login":       { "type": "keyword", "index": true },
          "uc":          { "type": "keyword", "index": true },
          "areaCode":    { "type": "keyword", "index": true },
          "tModel":      { "type": "keyword", "index": true },
          "sceneId":     { "type": "keyword", "index": true },

          "videoId":      { "type": "keyword", "index": true },
          "pVideoId":     { "type": "keyword", "index": true },
          "videoIndex":   { "type": "keyword", "index": true },
          "videoDuration":{ "type": "keyword", "index": true },
          "tsId":         { "type": "keyword", "index": true },
          "serId":        { "type": "keyword", "index": true },
          "netId":        { "type": "keyword", "index": true },
          "chName":       { "type": "keyword", "index": true },
          "progName":     { "type": "keyword", "index": true },
          
          "aId":         { "type": "keyword", "index": true },
          "pId":         { "type": "keyword", "index": true },
          "rName":       { "type": "keyword", "index": true },
          "coId":        { "type": "keyword", "index": true },
          "rFlag":       { "type": "keyword", "index": true },
          "paId":        { "type": "keyword", "index": true },
          "ppId":        { "type": "keyword", "index": true },
          "pkgFlag":     { "type": "keyword", "index": true },
          
          "eStatus":     { "type": "keyword", "index":true },
          "uuid":        { "type": "keyword", "index":true },
          "lat":         { "type": "keyword", "index":true },
          "lng":         { "type": "keyword", "index":true },
          "netType":     { "type": "keyword", "index":true },
          "sn":          { "type": "keyword", "index":true },
          "tOS":         { "type": "keyword", "index":true },
          
          "way":         { "type": "keyword", "index":true },
          "epbt":        { "type": "keyword", "index":true },
          "epet":        { "type": "keyword", "index":true },         
          "productCode": { "type": "keyword", "index":true },
          
          "kw":          { "type": "keyword", "index": true },
          "rType":       { "type": "keyword", "index": true },
          "recomId":     { "type": "keyword", "index": true },
          "coName":      { "type": "keyword", "index": true },
          "coType":      { "type": "keyword", "index": true },
          "actionType":  { "type": "keyword", "index": true },
          "orderType":   { "type": "keyword", "index": true },
          "logicNumber": { "type": "keyword", "index": true },
          "chargeNum":   { "type" : "integer" },

          "viewType":    { "type": "keyword", "index": true },
          "viewPath":    { "type": "keyword", "index": true },

          "appId" :      { "type" : "keyword", "index" : true },
          "appName" :    { "type" : "keyword", "index" : true },
          "appType" :    { "type" : "keyword", "index" : true },
          "appVersion" : { "type" : "keyword", "index" : true },
                          
          "startTime" :  { "type" : "date", "format" : "yyyy-MM-dd HH:mm:ss" },   
          "endTime" :    { "type" : "date", "format" : "yyyy-MM-dd HH:mm:ss" },
          "duration" :   { "type" : "integer" },
		  
	      "softwareVersion" : { "type" : "keyword", "index" : true },
	      "hdVersion" : { "type" : "keyword", "index" : true },
          "model" : { "type" : "keyword", "index" : true },
          "socmodel" : { "type" : "keyword", "index" : true },
          "districtCodeName" : { "type" : "keyword", "index" : true },
	      "mac" : { "type" : "keyword", "index" : true }
      }
    }
  }
}
```
删除原始模板，创新新的索引模板，模板变更之后只对新增的索引有效，历史索引依然保持之前的mapping映射。
## <span id="inline-blue">更改历史索引mapping映射</span>
索引: user_action_moui_202312

```shell
curl -X POST "http://10.9.216.12:9200/user_action_moui_202312/_update_by_query?conflicts=proceed&wait_for_completion=false&&slices=auto&scroll_size=10000" -d
'{
    "script": 
	{
        "lang": "painless",
				"source": " if (ctx._source.softwareVersion == null) {ctx._source.softwareVersion = 'NULL'} if (ctx._source.hdVersion == null) {ctx._source.hdVersion = 'NULL'} if (ctx._source.model == null) {ctx._source.model = 'NULL'} if (ctx._source.socmodel == null) {ctx._source.socmodel = 'NULL'} if (ctx._source.districtCodeName == null){ctx._source.districtCodeName = 'NULL'} if (ctx._source.mac == null) {ctx._source.mac = 'NULL'} "
    }
}'

返回示例：
{
  "task": "z4Wm_2UETI2ni9yFXxjcew:974983"
}
```
_update_by_query接口的作用：
更新user_action_moui_202312历史索引新增属性softwareVersion、hdVersion、model、socmodel、districtCodeName、mac
如果索引记录中不存在对应的记录，设置默认值'NULL'
URL携带参数释义：

conflicts=proceed : 执行过程中出现冲突不停止,继续执行
wait_for_completion=false : 后台执行，避免执行超时
slices=auto : 分片执行
scroll_size=10000 ：采用Scroll方式翻页的大小，默认为1000

接口调用之后返回对应执行任务的taskId(),可以通过_tasks接口查询对应任务的执行进度，调用方法
```shell
curl -X GET http://10.9.216.12:9200/_tasks/z4Wm_2UETI2ni9yFXxjcew:974983 
```
## <span id="inline-blue">验证</span>

通过SQL插件查询user_action_moui_*索引，验证新增字段属性是否生效
![Elasticsearch索引变更](/images/elasticsearch/es_20240116_001.png)



