---
title: MapStruct-plus实现JavaBean类型转换
categories:
	- MapStruct-plus
tags: 
	- MapStruct-plus
	
date: 2025-03-14 15:32:29
updated: 2025-03-14 15:32:29
---
<!-- toc -->
# <span id="inline-blue">环境</span>
SpringBoot: 2.6.6
Java：1.8
MapStruct-plus: 1.4.6
maven: 3.5.4

# <span id="inline-blue">介绍</span>
MapStructPlus是MapStruct的增强工具，在MapStruct的基础上实现了自动生成Mapper接口的功能，并且增强了一些功能，使得Java类型转换更加方便、优雅。

与MapStruct一样，它本质上是基于JSR 269的Java注解处理器，因此可以通过Maven、Gradle、Ant等构建触发器。

MapStructPlus 嵌入 MapStruct，与 MapStruct 完全兼容，如果您之前使用过 MapStruct，可以无缝替换依赖项。

# <span id="inline-blue">配置</span>

pom.xml引入相关依赖和插件

```xml
<mapstruct-plus.version>1.4.6</mapstruct-plus.version>
<lombok.version>1.18.12</lombok.version>
<lombok-mapstruct-binding.version>0.2.0</lombok-mapstruct-binding.version>

	 <dependency>
        <groupId>io.github.linpeilie</groupId>
        <artifactId>mapstruct-plus-spring-boot-starter</artifactId>
        <version>${mapstruct-plus.version}</version>
      </dependency>
<build>
	<plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-compiler-plugin</artifactId>
          <version>${maven-compiler-plugin.version}</version>
          <configuration>
            <source>${java.version}</source>
            <target>${java.version}</target>
            <encoding>${project.build.sourceEncoding}</encoding>
            <annotationProcessorPaths>
              <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok.version}</version>
              </path>
              <path>
                <groupId>io.github.linpeilie</groupId>
                <artifactId>mapstruct-plus-processor</artifactId>
                <version>${mapstruct-plus.version}</version>
              </path>
              <!-- 将 Lombok 注解和 MapStruct 的映射注解进行绑定，使它们能够协同工作 -->
              <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok-mapstruct-binding</artifactId>
                <version>${lombok-mapstruct-binding.version}</version>
              </path>
            </annotationProcessorPaths>
          </configuration>
        </plugin>
</build>
```

## <span id="inline-blue">两个类之间的转换</span>

```java
@AutoMapper(target = CarDto.class,nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public class Car {
    // ...
}
```
nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE表示在source转换为target的过程中，如果source属性为空所执行的属性替换的策略，NullValuePropertyMappingStrategy.IGNORE带包忽略

## <span id="inline-blue">类与多个类转换</span>

```java
@Data
@AutoMappers({
    @AutoMapper(target = DeviceSlideConfig.class),
    @AutoMapper(target = DeviceSlideConfigVO.class)
})
public class DeviceSlideConfig {
    
	@AutoMapping(targetClass = DeviceSlideConfig.class, target = "id",ignore = true)
    private Long id;
}

```

配置指定类转换的规则:

在配置多个类转换的时候，同一个属性对于不同的类有不同的转换规则。
为了解决这个问题，可以首先使用注解指定多条转换规则@AutoMappings，并在使用@AutoMapping注解时配置targetClass属性为当前规则指定应用目标转换类。
如果配置注解targetClass时没有指定@AutoMapping，则当前规则适用于所有的类转换。

# <span id="inline-blue">调用</span>

```java
import io.github.linpeilie.Converter;

@Autowired
private Converter converter;

converter.convert(deviceNoticeConfig,dbRecord);

```

官网：https://www.mapstruct.plus/en/introduction/about.html