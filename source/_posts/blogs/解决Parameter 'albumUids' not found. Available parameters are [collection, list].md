---
title: 解决Parameter 'albumUids' not found. Available parameters are [collection, list]
categories:
	- Java

date: 2023-11-03 10:55:20
tags: 
	- Java
---
<!-- toc -->

# <span id="inline-blue">环境</span>
mybatis: 3.5.3
mybatis-plus: 3.3.1

# <span id="inline-blue">错误信息</span>
```shell
Parameter 'albumUids' not found. Available parameters are [collection, list]
```
# <span id="inline-blue">调用链</span>
dao层
```java
public abstract List<Material> selectByAlbumUids(List<String> paramList);
```
xml文件
```xml
<select id="selectByAlbumUids" parameterType="java.lang.String" resultMap="BaseResultMap">
        select
        m.album_uid,
        <include refid="select_column_clause"/>
        from
        tbl_material t,tbl_mid_album_material m
        where t.uid = m.material_uid and m.album_uid in
        <foreach collection="albumUids" index="index" item="uid" open="(" close=")" separator=",">
            #{uid}
        </foreach>
</select>
```

# <span id="inline-blue">原因</span>
1、当我们传递一个 List 实例或者数组作为参数对象传给 MyBatis,MyBatis 会自动将它包装在一个 Map 中,用名称在作为键。List 实例将会以"list" 作为键,而数组实例将会以"array"作为键。所以，当我们传递的是一个List集合时，mybatis会自动把我们的list集合包装成以list为Key值的map。

2、传递List类型参数时，参数类型为List，parameterType="java.lang.String" 修改为parameterType="java.util.List"
# <span id="inline-blue">解决办法</span>

## <span id="inline-blue">方案一</span>
collection="albumUids" 修改为 collection="list"
parameterType="java.lang.String" 修改为parameterType="java.util.List"
```xml
<select id="selectByAlbumUids" parameterType="java.util.List" resultMap="BaseResultMap">
        select
        m.album_uid,
        <include refid="select_column_clause"/>
        from
        tbl_material t,tbl_mid_album_material m
        where t.uid = m.material_uid and m.album_uid in
        <foreach collection="list" index="index" item="uid" open="(" close=")" separator=",">
            #{uid}
        </foreach>
    </select>
```

## <span id="inline-blue">方案二</span>
接口方法定义加上@Param("albumUids")
```java
public abstract List<Material> selectByAlbumUids(@Param("albumUids") List<String> paramList);
```


