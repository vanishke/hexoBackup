---
title: Js实现下拉框联动回显功能
categories:
	- Jsp
tags: 
	- Js
	- Jsp
	
date: 2022-09-27 16:24:20
updated: 2022-09-27 16:24:20
---
<!-- toc -->

# <span id="inline-blue">jsp页面添加依赖项</span>

```jsp
<%@ taglib prefix="s" uri="/struts-tags"%>
<script type="text/javascript" src="<s:url value='js/cdnmanage.pagination.js'/>"></script>
```

# <span id="inline-blue">下拉框定义</span>
```jsp
<label><s:text name="grmmanage.log.moduleName" /></label>
<select name="logBean.moduleName" id="moduleName" onchange="setAction(this.options[this.selectedIndex].text);"  onselect="setAction(this.options[this.selectedIndex].text);" style="width:120px">
	<option value="" selected="selected">全部</option>
	<option value="21" <s:if test="%{logBean.moduleName==21}">selected</s:if> >角色管理</option>
	<option value="22" <s:if test="%{logBean.moduleName==22}">selected</s:if>>用户管理</option>
	<option value="31" <s:if test="%{logBean.moduleName==31}">selected</s:if>>IPQAM导入管理</option>
	<option value="32" <s:if test="%{logBean.moduleName==32}">selected</s:if>>IPQAM管理</option>
	<option value="33" <s:if test="%{logBean.moduleName==33}">selected</s:if>>规则管理</option>
	<option value="34" <s:if test="%{logBean.moduleName==34}">selected</s:if>>设备类型管理</option>
	<option value="41" <s:if test="%{logBean.moduleName==41}">selected</s:if>>区域管理</option>
	<option value="42" <s:if test="%{logBean.moduleName==42}">selected</s:if>>区域导入管理</option>
	<option value="51" <s:if test="%{logBean.moduleName==51}">selected</s:if>>推流导入管理</option>
	<option value="52" <s:if test="%{logBean.moduleName==52}">selected</s:if>>推流管理</option>
	<option value="53" <s:if test="%{logBean.moduleName==53}">selected</s:if>>VSGROUP管理</option>
	<option value="54" <s:if test="%{logBean.moduleName==54}">selected</s:if>>vs分配管理</option>
	<option value="71" <s:if test="%{logBean.moduleName==71}">selected</s:if>>修改密码</option>
</select>
<label><s:text name="grmmanage.log.actionType" /></label>
<select name="logBean.actionType" id="actionType" style="width:120px">
	<option value="" selected="selected">全部</option>
</select>
```

# <span id="inline-blue">js联动实现</span>
```js
	//下拉选项数组定义
	var actionArr = [];
	var moduleArr =
		[
			{txt:'角色管理',val:"21"},
			{txt:'用户管理',val:"22"},
            {txt: 'IPQAM导入管理', val: "31"},
			{txt:'IPQAM管理',val:"32"},
			{txt:'规则管理',val:"33"},
            {txt: '设备类型管理', val: "34"},
			{txt:'区域管理',val:"41"},
            {txt: '区域导入管理', val: "42"},
            {txt: '推流导入管理', val: "51"},
			{txt:'推流管理',val:"52"},
			{txt:'VSGROUP管理',val:"53"},
			{txt:'vs分配管理',val:"54"},
			{txt:'修改密码',val:"71"}
			];
	var actionArrInitial = [];

	actionArr['角色管理'] =
	[
		{txt:'新增角色', val:'211'},
		{txt:'删除角色', val:'212'},
		{txt:'更新角色', val:'213'},
		{txt:'分配用户', val:'216'},
        {txt: '分配权限', val: '217'}

	];
	actionArr['用户管理'] =
	[
		{txt:'新增用户', val:'221'},
		{txt:'删除用户', val:'222'},
		{txt:'重置密码', val:'223'},
        {txt: '修改用户', val: '224'},
		{txt:'更新用户角色', val:'225'},
		{txt:'锁定用户', val:'226'},
		{txt:'解锁用户', val:'227'}
	];

actionArr['IPQAM导入管理'] =
	[
		{txt:'导入数据', val:'3101'}
	];

	actionArr['IPQAM管理'] =
	[
		{txt:'QAM新增', val:'3201'},
		{txt:'QAM删除', val:'3202'},
		{txt:'数据下载', val:'3203'},
		{txt:'频点新增', val:'3205'},
		{txt:'频点修改', val:'3206'},
		{txt:'删除频点', val:'3207'}
	];

	actionArr['规则管理'] =
	[
		{txt:'新增规则', val:'3301'},
		{txt:'删除规则', val:'3302'}
	];

	 actionArr['设备类型管理'] =
	[
		{txt:'新增设备类型', val:'3401'},
		{txt:'删除设备类型', val:'3402'}
	];

	actionArr['区域管理'] =
	[
		{txt:'新增区域码', val:'4101'},
		{txt:'批量删除区域码', val:'4102'},
		{txt:'修改区域码', val:'4103'},
		{txt:'删除区域码', val:'4104'},
		{txt:'区域码下载', val:'4105'},
		{txt:'批量修改Vs区域码', val:'4106'}
	];

actionArr['区域导入管理'] =
	[
		{txt:'导入数据', val:'4201'}
	];

actionArr['推流导入管理'] =
	[
		{txt:'导入数据', val:'5101'}
	];

	  actionArr['推流管理'] =
	[
		{txt:'新增推流服务', val:'5201'},
        {txt: '批量上线', val: '5202'},
        {txt: '批量下线', val: '5203'},
		{txt:'修改推流服务', val:'5204'},
		{txt:'删除推流服务', val:'5205'},
		{txt:'批量修改端口组', val:'5206'},
		{txt:'新增流输出', val:'5209'},
        {txt: '修改流输出', val: '5210'},
        {txt: '删除流输出', val: '5211'},
		{txt:'新增卷标信息', val:'5212'},
		{txt:'修改卷标信息', val:'5213'},
		{txt:'删除卷标信息', val:'5214'}
	];

	   actionArr['VSGROUP管理'] =
	[
		{txt:'vs群组下线', val:'5301'},
		{txt:'vs群组修改', val:'5302'},
		{txt:'vs群组删除', val:'5303'}
	];

	   actionArr['vs分配管理'] =
	[
        {txt: 'SM新增vs关联', val: '5401'},
        {txt: 'SM取消vs关联', val: '5402'}
	];

	   actionArr['修改密码'] =
	[
        {txt: '修改', val: '7101'},
        {txt: '重置', val: '7102'}
	];

	//初始化操作行为
function setAction(moduleName) {
	if (actionArr[moduleName] != null && actionArr[moduleName] != 'undefined' && actionArr[moduleName] != '') {
		setSelectOption('actionType', actionArr[moduleName], '全部');
	} else {
		setSelectOption('actionType', actionArrInitial, '全部');
	}

}

//移除下拉选项
function removeOptions(selectObj) {
	if (typeof selectObj != 'object') {
		selectObj = document.getElementById(selectObj);
	}
	// 原有选项计数
	var len = selectObj.options.length;
	for (var i = 0; i < len; i++) {
		// 移除当前选项
		selectObj.options[0] = null;
	}
}

//根据moduleId设置actionId下拉项
function setSelectOption(selectObj, optionList, firstOption) {
	if (typeof selectObj != 'object') {
		selectObj = document.getElementById(selectObj);
	}
	// 清空选项
	removeOptions(selectObj);
	// 选项计数
	var start = 0;
	// 如果需要添加第一个选项
	if (firstOption) {
		selectObj.options[0] = new Option(firstOption, '');
		// 选项计数从 1 开始
		start++;
	}
	var len = optionList.length;
	for (var i = 0; i < len; i++) {
		// 设置 option
		selectObj.options[start] = new Option(optionList[i].txt, optionList[i].val);
		// 计数加 1
		start++;
	}
}
```
# <span id="inline-blue">数据回显</span>
```js
jQuery(function($) {

	for (var i = 0; i < moduleArr.length; i++) {
		if (moduleArr[i].val == '<s:property value="logBean.moduleName"/>') {
			setAction(moduleArr[i].txt);
		}
	}
	var count = $("#actionType option")
		.length;
	for (var i = 0; i < count; i++) {
		if ($("#actionType")
			.get(0)
			.options[i].value == '<s:property value="logBean.actionType"/>') {
			$("#actionType")
				.get(0)
				.options[i].selected = true;
			break;
		}
	}
});
```
# <span id="inline-blue">验证</span>
![下拉联动验证](/images/js/js_2022_09_27_001.png)