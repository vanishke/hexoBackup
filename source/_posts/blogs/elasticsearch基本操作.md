---
title: ElasticSearch基本操作
categories: 
	- Elasticsearch
tags: 
	- Elasticsearch
	
date: 2024-06-13 10:34:23
updated: 2024-06-13 10:34:23
---
<!-- toc -->

# <span id="inline-blue">查看所有索引信息</span>

http://10.0.0.14:9200/_cat/indices

# <span id="inline-blue">查看指定索引映射Mapping详情</span>

http://10.0.0.14:9200/${indexName}?pretty

# <span id="inline-blue">创建索引</span>

POST http://10.0.0.14:9200/${indexName}

# <span id="inline-blue">删除索引</span>

DELETE http://10.0.0.14:9200/${indexName}

# <span id="inline-blue">查看模板配置</span>

GET http://10.0.0.14:9200/_template/*

# <span id="inline-blue">查看集群配置</span>

GET http://10.0.0.14:9200/_cluster/settings

# <span id="inline-blue">查看集群健康状态</span>

GET http://10.0.0.14:9200/_cluster/health

# <span id="inline-blue">查看节点索引分片状态</span>

GET http://10.0.0.14:9200/_cat/shards?v&h=index,shard,prirep,state,unassigned.reason

# <span id="inline-blue">创建索引mapping</span>

## <span id="inline-blue">2.4版本</span>

```json
POST http://10.0.0.14:9200/coseelog/doc/_mapping?pretty
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

## <span id="inline-blue">5.0 版本</span>

```json
mapping POST http://10.0.0.14:9200/coseelog/doc/_mapping?pretty
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

# <span id="inline-blue">创建模板</span>

```json
POST http://10.0.0.14:9200/_template/vistors_flow_total/

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

