---
title: Elasticsearch基于策略实现索引自动删除
categories:
	- Elasticsearch
tags: 
	- Elasticsearch
	- Zipkin

date: 2025-11-24 17:34:09
updated: 2025-11-24 17:34:09
---
<!-- toc -->

# <span id="inline-blue">环境</span>

Zipkin: zipkin-server-2.26.0
Elasticsearch: 8.8.0
# <span id="inline-blue">背景</span>

微服务基于zipkin上述微服务调用链路追踪信息，数据存储Elasticsearch之后没有自动删除机制导致数据越来越多，已经快要超过数据节点设置的分片大小导致数据写入失败，接下来借助Elasticsearch生命周期管理实现自动清除过期的索引。

# <span id="inline-blue">实现</span>

## <span id="inline-blue">创建生命周期</span>

```shell
PUT http://120.76.251.149:9200/_ilm/policy/zipkin_delete_policy

{
  "policy": {
    "phases": {
      "delete": {
        "min_age": "7d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}

```
上述命令表示创建zipkin_delete_policy策略，最大保存索引时间为7天。

## <span id="inline-blue">索引模板关联策略</span>

Elasticsearch索引模板关联删除策略一定是在模板完整配置内容中添加删除策略才是正确的方法，如果使用以下方式进行关联，虽然策略能够正常关联上，但这种设置会导致其他有关索引动态字段映射的相关内容全部丢失，导致zipkin后台查询总是报错，通过比对不同日期的索引发现索引字段traceId字段的类型不一致。

### <span id="inline-blue">zipkin-dependency_template</span>

错误的方式:

```shell
PUT http://120.76.251.149:9200/_template/zipkin-dependency_template
{
  "index_patterns": ["zipkin-dependency-*"],
  "settings": {
		"index": {
      "lifecycle": {
        "name": "zipkin_delete_policy"
      }
    },
    "number_of_shards": 1,          
    "number_of_replicas": 0,       
    "index.refresh_interval": "30s" 
  }
}
```

正确的方式:

先查询出对应模板的映射设置

```shell
GET http://120.76.251.149:9200/_template/zipkin-dependency_template
{
  "zipkin-dependency_template": {
    "order": 0,
    "index_patterns": [
      "zipkin-dependency-*"
    ],
    "settings": {
      "index": {
        "requests": {
          "cache": {
            "enable": "true"
          }
        },
        "number_of_shards": "3",
        "number_of_replicas": "0"
      }
    },
    "mappings": {
      "enabled": false
    },
    "aliases": { }
  }
}
```

为zipkin-dependency_template索引模板添加删除策略

在上述查询获取到的索引模板内容添加索引删除策略，并将最外层的zipkin-dependency_template节点信息去除，然后执行以下命令

```shell
PUT http://120.76.251.149:9200/_template/zipkin-dependency_template
{
    "order": 0,
    "index_patterns": [
      "zipkin-dependency-*"
    ],
    "settings": {
      "index": {
				"lifecycle":
				{
					"name": "zipkin_delete_policy"
				},
        "number_of_shards": "3",
        "number_of_replicas": "0",
        "requests": {
          "cache": {
            "enable": "true"
          }
        }
      }
    },
    "mappings": {
      "enabled": false
    },
    "aliases": { }
  }

```

### <span id="inline-blue">zipkin-span_template</span>

错误的方式:

```shell
PUT http://120.76.251.149:9200/_template/zipkin-span_template
{
  "index_patterns": ["zipkin-span-*"],
  "settings": {
		"index": {
      "lifecycle": {
        "name": "zipkin_delete_policy"
      }
    },
    "number_of_shards": 1,          
    "number_of_replicas": 0,       
    "index.refresh_interval": "30s" 
  }
}
```

正确的方式:

先查询出对应模板的映射设置

```shell
GET http://120.76.251.149:9200/_template/zipkin-span_template
{
  "zipkin-span_template": {
    "order": 0,
    "index_patterns": [
      "zipkin-span-*"
    ],
    "settings": {
      "index": {
        "requests": {
          "cache": {
            "enable": "true"
          }
        },
        "number_of_shards": "3",
        "number_of_replicas": "0"
      }
    },
    "mappings": {
      "_source": {
        "excludes": [
          "_q"
        ]
      },
      "dynamic_templates": [
        {
          "strings": {
            "mapping": {
              "norms": false,
              "ignore_above": 256,
              "type": "keyword"
            },
            "match_mapping_type": "string",
            "match": "*"
          }
        }
      ],
      "properties": {
        "traceId": {
          "norms": false,
          "type": "keyword"
        },
        "duration": {
          "type": "long"
        },
        "remoteEndpoint": {
          "dynamic": false,
          "type": "object",
          "properties": {
            "serviceName": {
              "norms": false,
              "type": "keyword"
            }
          }
        },
        "localEndpoint": {
          "dynamic": false,
          "type": "object",
          "properties": {
            "serviceName": {
              "norms": false,
              "type": "keyword"
            }
          }
        },
        "_q": {
          "norms": false,
          "type": "keyword"
        },
        "timestamp_millis": {
          "format": "epoch_millis",
          "type": "date"
        },
        "name": {
          "norms": false,
          "type": "keyword"
        },
        "annotations": {
          "enabled": false
        },
        "tags": {
          "enabled": false
        }
      }
    },
    "aliases": { }
  }
}
```

为zipkin-span_template索引模板添加删除策略

在上述查询获取到的索引模板内容添加索引删除策略，并将最外层的zipkin-span_template节点信息去除，然后执行以下命令

```shell
PUT http://120.76.251.149:9200/_template/zipkin-span_template
 {
    "order": 0,
    "index_patterns": [
      "zipkin-span-*"
    ],
    "settings": {
      "index": {
				"lifecycle":
				{
					"name": "zipkin_delete_policy"
				},
        "number_of_shards": "3",
        "number_of_replicas": "0",
        "requests": {
          "cache": {
            "enable": "true"
          }
        }
      }
    },
    "mappings": {
      "_source": {
        "excludes": [
          "_q"
        ]
      },
      "dynamic_templates": [
        {
          "strings": {
            "mapping": {
              "norms": false,
              "ignore_above": 256,
              "type": "keyword"
            },
            "match_mapping_type": "string",
            "match": "*"
          }
        }
      ],
      "properties": {
        "traceId": {
          "norms": false,
          "type": "keyword"
        },
        "duration": {
          "type": "long"
        },
        "remoteEndpoint": {
          "dynamic": false,
          "type": "object",
          "properties": {
            "serviceName": {
              "norms": false,
              "type": "keyword"
            }
          }
        },
        "localEndpoint": {
          "dynamic": false,
          "type": "object",
          "properties": {
            "serviceName": {
              "norms": false,
              "type": "keyword"
            }
          }
        },
        "_q": {
          "norms": false,
          "type": "keyword"
        },
        "timestamp_millis": {
          "format": "epoch_millis",
          "type": "date"
        },
        "name": {
          "norms": false,
          "type": "keyword"
        },
        "annotations": {
          "enabled": false
        },
        "tags": {
          "enabled": false
        }
      }
    },
    "aliases": { }
  }

```

索引生命周期检测自动删除的检测机制是10分钟执行一次
![Zipkin索引自动删除_01](/images/Zipkin/Zipkin_20251124_006.png)

## <span id="inline-blue">已存在索引关联删除策略方式</span>

上述操作只能保证新生成的索引能够自动关联删除策略，之前生成的索引无法自动应用上述删除策略，解决办法如下：

zipkin-span相关索引：

```shell
PUT  http://47.89.174.246:9200/zipkin-span-*/_settings
{
  "index": {
    "lifecycle": {
      "name": "zipkin_delete_policy"
    }
  }
}
```

zipkin-dependency相关索引：

```shell
PUT http://47.89.174.246:9200/zipkin-dependency-*/_settings
{
  "index": {
    "lifecycle": {
      "name": "zipkin_delete_policy"
    }
  }
}
```

## <span id="inline-blue">验证</span>
![Zipkin索引自动删除_02](/images/Zipkin/Zipkin_20251124_007.png)


参考：https://github.com/openzipkin/zipkin-support/issues/23