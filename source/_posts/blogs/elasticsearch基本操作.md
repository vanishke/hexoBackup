---
title: ElasticSearch基本操作
categories: ElasticSearch
tags: ElasticSearch,NoSQL
---
<!-- toc -->

# 查看所有索引信息

http://10.9.217.3:9200/_cat/indices

# 创建索引

POST http://10.9.217.3:9200/coseelog

# 删除索引

DELETE http://10.9.217.3:9200/coseelog

# 创建索引mapping

## 2.4版本

```json
POST http://10.9.217.3:9200/coseelog/doc/_mapping?pretty
{"doc": {
	"properties":  {
		"logId": {
			"type": "string"
		},
		"logTime": {
			"type": "date",
			"format": "yyyy-MM-dd HH:mm:ss"
		},
		"ip": {
		"type": "string"
		},
		"userName": {
		"type": "string"
		},
		"moduleId": {
			"type": "long"
			},
		"actionId": {
			"type": "long"
			},
		"content": {
			"type": "string"
			},
		"orgId": {
			"type": "long"
			}
		}
	}
}
```

## 5.0 版本

```json
mapping POST http://10.9.217.3:9200/coseelog/doc/_mapping?pretty
{"doc": {
	"properties":  {
		"logId": {
			"type": "string"
		},
		"logTime": {
			"type": "date",
			"format": "yyyy-MM-dd HH:mm:ss"
		},
		"ip": {
		"type": "keyword"
		},
		"userName": {
		"type": "keyword"
		},
		"moduleId": {
			"type": "long"
			},
		"actionId": {
			"type": "long"
			},
		"content": {
			"type": "keyword"
			},
		"orgId": {
			"type": "long"
			}
		}
	}
}
```

# 创建模板

```json
POST http://120.77.8.170:9200/_template/vistors_flow_total/

{
	"template" : "vistors_flow_total_*",
  	"settings": {
    "index": {
      "number_of_shards" : "3",
      "number_of_replicas": "1",
      "translog.flush_threshold_size" : "1024mb"
    }
  },
  "mappings": {
			"doc": {
				"_all": { "enabled": false },
				"properties": {
					"deviceKey": {
						"type": "string","index": "not_analyzed"
					},
					"productKey": {
						"type": "string","index": "not_analyzed"
					},
					"deviceName": {
						"type": "string","index": "not_analyzed"
					},
					"type": {
						"type": "string","index": "not_analyzed"
					},
					"statisticNum": {
						"type": "string","index": "not_analyzed"
					}
					"statisticTime": {
						"type": "date",
						"format": "yyyy-MM-dd HH:mm:ss"
					}
					
				}
			}
		}
}

```

