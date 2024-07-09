---
title: Elasticsearch索引出现docs.deleted暴增的解决办法
categories:
	- Elasticsearch

date: 2024-01-25 15:26:20
tags: 
	- Elasticsearch
---
<!-- toc -->

# <span id="inline-blue">环境</span>
linux : CentOS Linux release 7.7.1908 (Core)
Elasticsearch : 6.8.4
# <span id="inline-blue">现象</span>
通过_update_by_query接口变更索引的属性映射，操作完成后索引新增属性成功了，但是索引对应的docs.deleted记录暴增，占用10多个G。
# <span id="inline-blue">原因</span>
由于Lucene索引中段的不可变性，删除操作并不容易。对于对原始文档的任何更改操作，例如重新索引或更新，都需要删除文档，将其标记为已删除，并在后台创建包含更改的新文档。
## <span id="inline-blue">解决办法</span>
通过Elasticsearch的接口调用强制执行分段合并。
示例：
```shell
curl -XPOST "http://10.9.216.12:9200/user_action_moui_202312/_forcemerge?max_num_segments=1"
```




