---
title: markdown流程图
tags: 
	- markdown
categories: markdown
---
# <span id="inline-blue">语法</span> 
1. 定义元素
```code

元素ID->元素类型: 描述

```
2. 元素类型
```code

#冒号后跟空格
startID=>start: 开始
inputoutputID=>inputoutput: 输入输出描述
conditionID=>condition: 条件描述
subroutineID=>subroutine: 子流程描述
endID=>end: 结束

```
3. 条件判断
```code
condition(yes)->inputoutput
#条件判断控制方向,left、right、bottom、top
condition(yes,left)->inputoutputID
condition(no,top)->subroutineID
```
4. 元素连接
```code
#方式1
startID->inputoutputID->conditionID->subroutineID->endID

#方式2
startID->inputoutputID
inputoutputID->conditionID
conditionID->subroutineID
subroutineID->endID
以上两种连接方式均可
```

# <span id="inline-blue">示例</span> 

```flow
startID=>start: 开始
inputoutputID1=>inputoutput: 输入X
conditionID=>condition: x>0
inputoutputID2=>inputoutput: x是一个正数
inputoutputID3=>inputoutput: x是一个负数
endID=>end: 结束

startID->inputoutputID1
inputoutputID1->conditionID
conditionID(yes,left)->inputoutputID2
conditionID(no,right)->inputoutputID3
inputoutputID2->endID
inputoutputID3->endID
```





