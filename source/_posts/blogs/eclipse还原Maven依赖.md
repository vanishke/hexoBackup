---
title: eclipse还原Maven依赖
tags:
	- Eclipse
	- Maven
categories: Maven
---
## <span id="inline-blue">现象</span>
eclipse移除项目Maven依赖之后发现无法添加

## <span id="inline-blue">解决办法</span>
打开项目下.classpath文件
![Maven依赖恢复](/images/Maven/20221025_Maven_001.png)
添加如下内容
```xml
<classpathentry kind="con" path="org.eclipse.m2e.MAVEN2_CLASSPATH_CONTAINER">
         <attributes>
             <attribute name="maven.pomderived" value="true"/>
             <attribute name="org.eclipse.jst.component.dependency" value="/WEB-INF/lib"/>
         </attributes>
</classpathentry>
```

添加后内容如下：
![Maven依赖恢复](/images/Maven/20221025_Maven_002.png)

## <span id="inline-blue">验证</span>
![Maven依赖恢复](/images/Maven/20221025_Maven_003.png)


