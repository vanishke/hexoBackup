---
title: ElasticSearch-8.8.0实现分词插件支持
categories:
	- ElasticSearch
tags: 
	- ElasticSearch
	
date: 2025-05-23 15:24:54
updated: 2025-05-23 15:24:54
---
<!-- toc -->
# <span id="inline-blue">环境</span>
Linux：CentOS Linux release 7.9.2009 (Core)
ElasticSearch： 8.8.0

# <span id="inline-blue">插件安装</span>

Elasticsearch为了索引支持中文拼音分词，简繁转换，需要安装analysis-ik、analysis-pinyin、analysis-stconvert插件，上述插件都没有8.8.0版本，下载8.8.1版本，通过修改插件版本配置描述文件更改版本校验，使得ElasticSearch启动能够兼容，并正常使用。
插件下载地址：https://release.infinilabs.com/
插件下载完成之后解压上传到Elasticsearch plugins目录下，并修改插件对应文件夹为ik、pinyin、stconvert，如下图所示：
![Elasticsearch](/images/elasticsearch/20250523/es_20250523_001.png)

plugin-descriptor.properties文件修改内容如下：
![Elasticsearch](/images/elasticsearch/20250523/es_20250523_002.png)

参照上述配置文件，analysis-ik、analysis-pinyin、analysis-stconvert插件都需要更改，修改完成之后，重启ElasticSearch.

```shell
su - es

cd /home/ELK/elasticsearch-8.8.0/bin  

./elasticsearch -d

```
# <span id="inline-blue">索引字段映射</span>
http://10.9.216.14:9200/asset?pretty
```json
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 0,
		"refresh_interval": "5s",
    "index.translog.durability": "async",
    "index.translog.sync_interval": "10s",
    "analysis": {
            "analyzer": {
                "ik_smart_analyzer": {
                    "type": "custom",
                    "tokenizer": "ik_smart",
									  "filter": ["lowercase"]
                },
                "ik_max_word_analyzer": {
                    "type": "custom",
                    "tokenizer": "ik_max_word",
									  "filter": ["lowercase"]
                },
						   "pinyin_full_analyzer": {
												"type": "custom",
												"tokenizer": "pinyin_full_tokenizer",
											  "filter": ["lowercase"]
								},
						   "pinyin_abbr_analyzer": {
												"type": "custom",
												"tokenizer": "pinyin_abbr_tokenizer",
											  "filter": ["lowercase"]
								}
						},
            "tokenizer": {
                "pinyin_full_tokenizer": {
                    "type" : "pinyin",
                    "keep_full_pinyin": true,
										"keep_joined_full_pinyin": true,
										"keep_original": false,
										"limit_first_letter_length": 16,
                    "lowercase" : true,
                    "remove_duplicated_term" : true 
                },
							"pinyin_abbr_tokenizer": {
                    "type" : "pinyin",
								    "keep_full_pinyin": false,
                    "keep_first_letter": true,
										"keep_joined_full_pinyin": false,
										"keep_original": false,
										"limit_first_letter_length": 16,
								    "lowercase" : true,
                    "remove_duplicated_term" : true 
                }
            },
					"normalizer": {
					"lowercase_normalizer": {
						"type": "custom",
						"filter": ["lowercase"]
						}
					}
    }
  },
  "mappings": {
    "properties": {

      "resourceId": { "type": "keyword" },
      "assetName":  { 
				"type": "text", 
				"analyzer": "ik_max_word_analyzer",
				"search_analyzer":"ik_smart_analyzer",
																	"fields": {
																		"pinyin": { "type": "text", "analyzer": "pinyin_full_analyzer" },
																		"abbr":   { "type": "text", "analyzer": "pinyin_abbr_analyzer" },
																		"keyword": { "type": "keyword" }
																	}
			},
      "letterFull":        { "type": "keyword" },
      "initialLetter":     { "type": "keyword" },
      "headLetter":        { "type": "keyword" },
      "headLetterLength":  { "type": "short" },
      "actorDirectorLetter": { "type": "keyword" },
      
      "year":              { "type": "integer" },
      "vodCount":          { "type": "integer" },
      "userRecommendLevel": { "type": "short" },
      "recommendationLevel": { "type": "short" },
      "resourceRank":      { "type": "integer" },
      "score":             { "type": "float" },
      "virrecommandcount": { "type": "integer" },
      
      
      "createTime":      { "type": "date", "format": "epoch_millis" },
      "publishDate":     { "type": "date", "format": "epoch_millis" },
      "optTime":         { "type": "date", "format": "epoch_millis" },
      
      "showType":        { "type": "keyword" },
      "originName":      { 
			"type":   "text",
			"analyzer":"ik_max_word_analyzer",
			"search_analyzer":"ik_smart_analyzer" ,
				"fields": 
													  {
																		"pinyin": { "type": "text", "analyzer": "pinyin_full_analyzer" },
																		"abbr":   { "type": "text", "analyzer": "pinyin_abbr_analyzer" },
																		"keyword": { "type": "keyword" }
														}
			},
      "videoType":       { "type": "keyword" },
      "assetTypes":      { "type": "keyword" },
      "packaged":        { "type": "keyword" },
      "tag":             { "type": "keyword" },
      "tagYear":         { "type": "keyword" },
      "platform":        { "type": "keyword" },
      "siteId":          { "type": "keyword" },
      
      
      "director":        { 
				"type": "text", 
				"analyzer":"ik_max_word_analyzer",
				"search_analyzer":"ik_smart_analyzer",
												 	 "fields": 
													  {
																		"pinyin": { "type": "text", "analyzer": "pinyin_full_analyzer" },
																		"abbr":   { "type": "text", "analyzer": "pinyin_abbr_analyzer" },
																		"keyword": { "type": "keyword" }
														}
												 },
      "leadingActor":    { 
				"type": "text",
				"analyzer":"ik_max_word_analyzer",
				"search_analyzer":"ik_smart_analyzer",
												    "fields": 
													  {
																		"pinyin": { "type": "text", "analyzer": "pinyin_full_analyzer" },
																		"abbr":   { "type": "text", "analyzer": "pinyin_abbr_analyzer" },
																		"keyword": { "type": "keyword" }
														}
												 },
      "keyword":         { 
				"type": "text" , 
				"analyzer":"ik_max_word_analyzer",
				"search_analyzer":"ik_smart_analyzer",
												 		"fields": 
													  {
																		"pinyin": { "type": "text", "analyzer": "pinyin_full_analyzer" },
																		"abbr":   { "type": "text", "analyzer": "pinyin_abbr_analyzer" },
																		"keyword": { "type": "keyword" }
														}
												 },
      
      "columnId":        { "type": "keyword" },
      "columnID":        { "type": "keyword" }  
    }
  }
}
```

上述索引映射配置，支持ik_smart_analyzer、ik_max_word_analyzer、pinyin_full_analyzer、pinyin_abbr_analyzer

## <span id="inline-blue">ik_smart</span>
ik_smart_analyzer:粗粒度分词，分词效果如下：
http://10.9.216.14:9200/asset/_analyze

```json
{
  "text": ["音乐人生"],
  "field": "assetName",
  "analyzer": "ik_smart_analyzer"
}
```

返回结果：
```json
{
	"tokens": [
		{
			"token": "音乐",
			"start_offset": 0,
			"end_offset": 2,
			"type": "CN_WORD",
			"position": 0
		},
		{
			"token": "人生",
			"start_offset": 2,
			"end_offset": 4,
			"type": "CN_WORD",
			"position": 1
		}
	]
}
```
## <span id="inline-blue">ik_max_word</span>
ik_max_word_analyzer:细粒度分词，分词效果如下：
http://10.9.216.14:9200/asset/_analyze

```json
{
  "text": ["音乐人生"],
  "field": "assetName",
	"analyzer": "ik_max_word_analyzer"
}
```

返回结果：
```json
{
	"tokens": [
		{
			"token": "音乐人",
			"start_offset": 0,
			"end_offset": 3,
			"type": "CN_WORD",
			"position": 0
		},
		{
			"token": "音乐",
			"start_offset": 0,
			"end_offset": 2,
			"type": "CN_WORD",
			"position": 1
		},
		{
			"token": "人生",
			"start_offset": 2,
			"end_offset": 4,
			"type": "CN_WORD",
			"position": 2
		}
	]
}
```
## <span id="inline-blue">pinyin_full</span>
pinyin_full_analyzer:拼音全拼分词器，分词效果如下：
http://10.9.216.14:9200/asset/_analyze

```json
{
  "text": ["音乐人生"],
  "field": "assetName",
	"analyzer": "pinyin_full_analyzer"
}
```

返回结果：
```json
{
	"tokens": [
		{
			"token": "yin",
			"start_offset": 0,
			"end_offset": 0,
			"type": "word",
			"position": 0
		},
		{
			"token": "yinyuerensheng",
			"start_offset": 0,
			"end_offset": 0,
			"type": "word",
			"position": 0
		},
		{
			"token": "yyrs",
			"start_offset": 0,
			"end_offset": 0,
			"type": "word",
			"position": 0
		},
		{
			"token": "yue",
			"start_offset": 0,
			"end_offset": 0,
			"type": "word",
			"position": 1
		},
		{
			"token": "ren",
			"start_offset": 0,
			"end_offset": 0,
			"type": "word",
			"position": 2
		},
		{
			"token": "sheng",
			"start_offset": 0,
			"end_offset": 0,
			"type": "word",
			"position": 3
		}
	]
}
```

## <span id="inline-blue">pinyin_abbr</span>
pinyin_abbr_analyzer:拼音首字母分词器，分词效果如下：
http://10.9.216.14:9200/asset/_analyze

```json
{
  "text": ["音乐人生"],
  "field": "assetName",
	"analyzer": "pinyin_abbr_analyzer"
}
```

返回结果：
```json
{
	"tokens": [
		{
			"token": "yyrs",
			"start_offset": 0,
			"end_offset": 0,
			"type": "word",
			"position": 0
		}
	]
}
```