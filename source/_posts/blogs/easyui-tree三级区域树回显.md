---
title: Easyui-tree三级区域树回显
tags: 
	- Easyui
categories: 
	- Easyui

date: 2022-01-17 16:35:12	
updated: 2022-01-17 16:35:12
---
## <span id="inline-blue">多层级区域树加载</span>

### 树的数据格式（Tree Data Format）

每个节点可以包括下列属性：

- id：节点的 id，它对于加载远程数据很重要。
- text：要显示的节点文本。
- state：节点状态，'open' 或 'closed'，默认是 'open'。当设置为 'closed' 时，该节点有子节点，并且将从远程站点加载它们。
- checked：指示节点是否被选中。
- attributes：给一个节点添加的自定义属性。
- children：定义了一些子节点的节点数组。



接口返回tree初始化数据json

```json
[{
	"select": true,
	"children": [{
		"id": 1175,
		"text": "区域测试(10110)",
		"state": "open"
	}, {
		"id": 1172,
		"text": "区域测试2(11111)",
		"state": "open"
	}, {
		"id": 1135,
		"text": "无锡市(0510)",
		"state": "closed"
	}, {
		"id": 1129,
		"text": "马鞍山市(0555)",
		"state": "closed"
	}, {
		"id": 1117,
		"text": "泰州市(0523)",
		"state": "closed"
	}, {
		"id": 1111,
		"text": "镇江市(0511)",
		"state": "closed"
	}, {
		"id": 1103,
		"text": "淮安市(0517)",
		"state": "closed"
	}, {
		"id": 1098,
		"text": "扬州市(0514)",
		"state": "closed"
	}, {
		"id": 1093,
		"text": "宿迁市(0527)",
		"state": "closed"
	}, {
		"id": 1085,
		"text": "默认布局(0000)",
		"state": "open"
	}, {
		"id": 1080,
		"text": "常州市(0519)",
		"state": "closed"
	}, {
		"id": 1071,
		"text": "盐城市(0515)",
		"state": "closed"
	}, {
		"id": 1065,
		"text": "南通市(0513)",
		"state": "closed"
	}, {
		"id": 1059,
		"text": "连云港市(0518)",
		"state": "closed"
	}, {
		"id": 1057,
		"text": "徐州市(0516)",
		"state": "closed"
	}, {
		"id": 1048,
		"text": "南京市(025)",
		"state": "closed"
	}],
	"id": "-1",
	"text": "根区域(-1)"
}]
```

选择三层叶子结点，返回回显指定区域加载异常，提示错误信息如下：

```jsavascript
jquery-1.8.3.min.js:2 Uncaught TypeError: Cannot read property 'target' of null
    at doSelectAppoint (listpage?areaId=1147:2453)
    at Object.success (listpage?areaId=1147:2088)
    at l (jquery-1.8.3.min.js:2)
    at Object.fireWith [as resolveWith] (jquery-1.8.3.min.js:2)
    at T (jquery-1.8.3.min.js:2)
    at r (jquery-1.8.3.min.js:2)
    at Object.send (jquery-1.8.3.min.js:2)
    at Function.ajax (jquery-1.8.3.min.js:2)
    at expandArea (listpage?areaId=1147:2060)
    at HTMLUListElement.onLoadSuccess (listpage?areaId=1147:1922)
```

#### 原因分析

初始化区域数据默认只给到二级节点，三级叶子节点未生成，导致调用异常，后面通过tree对应官方api文档里面append方法递归生成对应父节点集合的叶子结点，发现在叶子节点为多节点情况下递归调用发生死循环导致页面加载页面。

#### 解决方案

后台提供findById()方法，返回对应节点父节点集合，通过递归从二级节点开始加载对应的子节点集合，生成节点方法改为expandAll(),从二级节点一直加载到其对应的叶子节点，判断当前回显的叶子节点是否选中。

findById方法返回数据如下显示

```json
{
	"id": 1147,
	"createTime": "2020-11-25 14:36:24",
	"lastUpdateTime": "2021-01-05 01:27:12",
	"lastUpdateTimeStart": null,
	"lastUpdateTimeEnd": null,
	"createTimeStart": null,
	"createTimeEnd": null,
	"idList": null,
	"queryGroupId": null,
	"queryGroupIds": null,
	"notCompareId": null,
	"areaName": "江苏省公安厅视频会议",
	"areaCode": "100000000296",
	"remark": "",
	"pubState": "online",
	"relateState": "online",
	"parentId": 1143,
	"codeList": null,
	"locateNameList": null,
	"isLeaf": null,
	"text": "江苏省公安厅视频会议(100000000296)",
	"state": null,
	"right": null,
	"search": null,
	"parentIds": "1147,1143,1048,-1"
}
```

parentIds:返回当前选中节点的父节点集合（包括自身）。

#### 加载实现

```javascript
// 区域树初始化加载
onLoadSuccess:function(node,data) {
			if(areaId!="" && areaId!=null){
				
				expandArea(areaId);
                //doSelectAppoint(areaId);
                //setTimeout(doSelectAppoint(areaId),2000);
			}else{
				var nodeThis=$("#areaTree").tree('find',cId);
				if(nodeThis==""||nodeThis==undefined){//节点找不到的情况下默认根节点
					cId=-1;
					nodeThis=$("#areaTree").tree('find',-1)
				}
				if(nodeThis == null){
                    var first = $("#areaTree").tree('getChildren')[0];
                    $("#areaTree").tree('select',first.target);
				}else{
                    $("#areaTree").tree('select',nodeThis.target);
                }
			}
			//setTimeout(function(){doRight(node,data);}, 500);
		}

//节点递归加载实现
/**
 * easyui-tree 区域树回显实现
 * 默认异常情况下显示根节点
 * 借助parentIds父节点记录集合，currentNode、parentNode实现自动扩展加载三层叶子结点
 * expandAll 扩展当前节点下的所有叶子节点
 */
function expandArea(id) {
    var url = globalWebAppURL+"/manager/area/findById?id="+areaId;
    var parentNode = null;
    $.ajax({
        type: "POST",
        url: url,
        async: false,
        success: function(data){
            var fatherId = data.parentId;
            if(fatherId)
            {
            	var parentIds =new Array();
    			if(data.parentIds != ""){
    				parentIds = data.parentIds.split(",");
    			}
    			//父节点记录集合升序排序，目的是初始化区域树按照原有顺序加载
				parentIds.sort(compare);
				var len=parentIds.length;
                //从二层节点开始
				for(var index = 1;index<len; index++) 
				{
					var currentNode = $("#areaTree").tree('find',parentIds[index]);
                      //父节点为空
					if (currentNode == null)
					{
						 currentNode = parentNode;
                        	//父节点找不到的情况下默认初始化根节点
						 if(currentNode == null)
							 {
								 areaId = null;
				                 doSelectAppoint(-1);
				                 break;
							 }
						 else
							 {
                                 //如果当前节点为空说明，说明当前节点未加载，需要借助父节点expandAll()方法加载对应的子节点集合
				                $("#areaTree").tree('expandAll',currentNode.target);
							 }
		                 
					}
                     //父节点存在，进行下一层遍历
					else
					{
						 parentNode = currentNode;
					}
				}
            }
        }
    });
    $("#areaTree").tree('expand',parentNode.target);
    var selectNode =  $("#areaTree").tree('getSelected');
    //父节点展开导致当前节点选中效果失效，没有选中的节点的情况下，回显历史记录节点
    if(selectNode== null)
    	{
    		setTimeout(function(){doSelectAppoint(id);}, 2000);
    	}
}
```



