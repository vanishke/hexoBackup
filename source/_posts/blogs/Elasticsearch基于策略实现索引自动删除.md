---
title: Elasticsearch基于策略实现索引自动删除
categories:
	- Elasticsearch
tags: 
	- Elasticsearch

date: 2025-11-24 17:34:09
updated: 2025-11-24 17:34:09
---
<!-- toc -->

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

zipkin-dependency索引模板设置
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

zipkin-span索引模板设置
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

上述索引策略设置对后续自动生成的索引生效，之前已经存在的索引无效，将已存在的索引关联自动删除策略，方法如下：

zipkin-span索引设置

```shell
PUT http://120.76.251.149:9200/zipkin-span-*/_settings
{
  "index": {
    "lifecycle": {
      "name": "zipkin_delete_policy"
    }
  }
}
```

zipkin-dependency索引设置

```shell
PUT http://120.76.251.149:9200/zipkin-dependency-*/_settings
{
  "index": {
    "lifecycle": {
      "name": "zipkin_delete_policy"
    }
  }
}
```

索引生命周期检测自动删除的检测机制是10分钟执行一次
![Zipkin索引自动删除_01](/images/Zipkin/Zipkin_20251124_006.png)


## <span id="inline-blue">验证</span>
![Zipkin索引自动删除_02](/images/Zipkin/Zipkin_20251124_007.png)