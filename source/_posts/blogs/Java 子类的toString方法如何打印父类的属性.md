---
title: Java 子类的toString方法如何打印父类的属性
categories:
	- Java
tags: 
	- Java
	- Lombok
	
date: 2024-07-17 16:40:20
---

<!-- toc -->
# 背景
Java项目新增javabean集成父类之后，在idea工具自动生成的toString()方法不能打印父类属性
# 解决办法
子类添加@ToString(callSuper = true)
```java
@Data
@NoArgsConstructor
@ToString(callSuper = true)
public class ModelRuleVo  {

    Integer id;
    String name;

}
```
