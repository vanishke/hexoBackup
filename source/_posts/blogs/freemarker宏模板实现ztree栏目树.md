---
title: freemarker宏模板实现ztree栏目树
categories:
	- Ztree
date: 2022-07-01 16:23:20
tags: 
	- Freemarker
	- Ztree

---
<!-- toc -->

# <span id="inline-blue">版本信息</span>
Freemarker: 2.3.24
Ztree：JQuery zTree core v3.5.17-beta.2

# <span id="inline-blue">关键点</span>
>因为使用hibernate的缘故，栏目节点的parent为对象，而非简单数据类型，这里将影响到ztree初始化节点key设置，pIdKey设置为parentNode.id。
>栏目模板的递归调用,后台返回的节点存在children节点，可以递归得到所有数据节点。

# <span id="inline-blue">页面实现细节</span>
页面引入ztree依赖资源文件：
```html
<link href="${base}/res/ztree/css/ztree.css" rel="stylesheet">
<script src="${base}/res/ztree/js/jquery.ztree.all-3.5.min.js"></script>
```
ztree初始化:
```js
var settingss = 
				 {
		                data: 
		                {
		                    simpleData: 
		                    {
		                        enable: true,  
		                        idKey: "id",  //节点标识,对应后台返回数据节点ID
		                        pIdKey: "parent.id", //父节点对象关联，对应后台返回数据节点parentId  
		                        rootPId: -1  //父节点不存在情况下使用根节点适配
		                     },
		                    key: 
		                    {
		                        name: "name"  //节点显示名称
		                     }
		                       
		                },
			           check:
			            {
			                enable:true,  //开启节点checkbox选项
			                nocheckInherit:false  //是否有级联，当前节点受到父节点和子节点状态影响 
			            }
		            };
				 $.ajax({
		                    type:"post",
		                    url:"v_tree_channels.do", //请求后台方法获取数据
		                    async:false,
		                    success:function(res)
		                    {   
			                     var  zTreeObj = $.fn.zTree.init($("#channels"), settingss, res); 
			                     //默认不展开所有栏目
			                     zTreeObj.expandAll(false);  
		                     }
	                    });
```
页面元素设置：
```html
	<div id="channels" class="ztree" style="width:150px;"></div>
```
ztree调用初始化
模板如下：
```html
<#macro channelTree list>
[
<#list list as channel>
		{
		"id": ${channel.id},
		"name": "${channel.name}",
		"open": <#if channel.child?size gt 0>true<#else>false</#if>,
		<#if channel.child?size gt 0>
		"children":
				<@channelTree list = channel.child />
		<#else>
		"children":[]
		</#if>
		}<#if channel_has_next>,</#if>
	</#list>
	]
</#macro>
<@channelTree list = channelList />
```

tree模板数据展现json格式:
```json
[
			{
		"id": "156",
		"text": "今日高邮",
		"classes": "folder",
		"hasChildren": true,
		"children" :
		  [
				{
				"id": "217",
				"text": "宣传视频",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "161",
				"text": "新闻公告",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "162",
				"text": "部门动态",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "163",
				"text": "市长信箱",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "164",
				"text": "乡镇园区",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "165",
				"text": "办事大厅",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "166",
				"text": "政务公开",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "167",
				"text": "企业风采",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "168",
				"text": "最新院线",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "169",
				"text": "学霸宝盒",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "170",
				"text": "热播追剧",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				}
		 ]
		
		},
		{
		"id": "222",
		"text": "文明实践",
		"classes": "folder",
		"hasChildren": true,
		"children" :
		  [
				{
				"id": "258",
				"text": "宣传视频",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "259",
				"text": "文明创建",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "260",
				"text": "文化高邮",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "261",
				"text": "志愿服务",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "262",
				"text": "变废为宝",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "263",
				"text": "曝光台",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "264",
				"text": "文旅在线",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "265",
				"text": "教育服务",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "266",
				"text": "医疗服务",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "267",
				"text": "智慧残联",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				}
		 ]
		
		},
		{
		"id": "223",
		"text": "清风高邮",
		"classes": "folder",
		"hasChildren": true,
		"children" :
		  [
				{
				"id": "229",
				"text": "宣传视频",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "230",
				"text": "一线传真",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "231",
				"text": "派驻监督",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "232",
				"text": "监督曝光",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "233",
				"text": "党纪法规",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "234",
				"text": "三务公开",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "235",
				"text": "教育服务",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "236",
				"text": "医疗服务",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "237",
				"text": "三农在线",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "238",
				"text": "乡镇风采",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				}
		 ]
		
		},
		{
		"id": "224",
		"text": "智慧党建",
		"classes": "folder",
		"hasChildren": true,
		"children" :
		  [
				{
				"id": "239",
				"text": "宣传视频",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "240",
				"text": "组工动态",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "241",
				"text": "秦邮英才",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "242",
				"text": "党员培训",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "243",
				"text": "红色教育",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "244",
				"text": "最新院线",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "245",
				"text": "教育服务",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "246",
				"text": "企业风采",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "247",
				"text": "部门动态",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "248",
				"text": "乡镇风采",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				}
		 ]
		
		},
		{
		"id": "225",
		"text": "法治高邮",
		"classes": "folder",
		"hasChildren": true,
		"children" :
		  [
				{
				"id": "279",
				"text": "宣传视频",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "280",
				"text": "法治动态",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "281",
				"text": "普法在线",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "282",
				"text": "以案释法",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "283",
				"text": "司法救助",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "284",
				"text": "三农在线",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "472",
				"text": "有事好商量",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				}
		 ]
		
		},
		{
		"id": "226",
		"text": "文旅在线",
		"classes": "folder",
		"hasChildren": true,
		"children" :
		  [
				{
				"id": "249",
				"text": "宣传视频",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "250",
				"text": "A级景区",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "251",
				"text": "景区慧眼",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "252",
				"text": "清水潭",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "253",
				"text": "运河西堤",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "254",
				"text": "高邮美食",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "255",
				"text": "温馨住宿",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "256",
				"text": "珠湖小镇",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "257",
				"text": "好事成双伴手礼",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				}
		 ]
		
		},
		{
		"id": "227",
		"text": "慧眼高邮",
		"classes": "file",
		"hasChildren": false,
		"children" :
		[]
		
		},
		{
		"id": "228",
		"text": "百姓生活",
		"classes": "folder",
		"hasChildren": true,
		"children" :
		  [
				{
				"id": "268",
				"text": "最新院线",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "269",
				"text": "热播剧",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "270",
				"text": "学霸宝盒",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "271",
				"text": "物价公示",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "272",
				"text": "精品农园",
				"classes": "folder",
				"hasChildren": true,
				"children" :
				
				},
				{
				"id": "273",
				"text": "医疗服务",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "274",
				"text": "教育服务",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "275",
				"text": "公交出行",
				"classes": "folder",
				"hasChildren": true,
				"children" :
                []
				
				},
				{
				"id": "276",
				"text": "高邮美食",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "277",
				"text": "孝乐神州",
				"classes": "file",
				"hasChildren": false,
				"children" :
				[]
				
				},
				{
				"id": "278",
				"text": "应急常识",
				"classes": "folder",
				"hasChildren": true,
				"children" :
                []
				}
		 ]
		
		}
	]
```
# <span id="inline-blue">验证</span>

![Freemarker宏模板实现ztree栏目树01](/images/Freemarker/Freemarker_20220701_001.png)

