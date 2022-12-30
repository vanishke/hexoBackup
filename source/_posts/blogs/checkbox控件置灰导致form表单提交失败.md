---
title: checkbox控件置灰导致form表单提交失败
categories:
	- Jsp

date: 2022-12-27 15:32:20
tags: 
	- Jsp
---
<!-- toc -->

# <span id="inline-blue">现象</span>
checkbox置灰后提交获取对应的值失败
置灰代码
```js
//遍历checkbox，对应权限ID为7、71、7101、7102不置灰
$(":checkbox").each(function () {
        if (this.value == 7 || this.value == 71 || this.value == 7101 || this.value == 7102) {
            if (!this.checked) {
                this.checked = true;
            }
            this.disabled = true;
        }
    });
```
测试之后发现后台拿不到默认选中的checkbox参数值。
# <span id="inline-blue">解决方案</span>
form表单提交之前恢复checkbox的disabled属性，再进行表单提交
```js
function sumbit(){
	//恢复checkbox状态disabled
    $(":checkbox").each(function () {
        if (this.disabled) {
            this.disabled = false;
        }
    });
	document.getElementById("AssignPrivileges").submit();
}
```



