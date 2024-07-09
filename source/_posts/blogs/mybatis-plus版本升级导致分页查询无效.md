---
title: mybatis-plus版本升级导致分页查询无效
date: 2024-05-31 15:43:20
tags:
	- Java
categories: Java
---
## <span id="inline-blue">环境</span>
os: Linux centos 7.9
Java: 1.8
SpringBoot: 2.6.6
SpringCloud: 2021.0.6
mybatis-plus: 3.3.1

### <span id="inline-blue">现象</span>
后台管理页面查询一直卡死，断点之后发现传递的分页参数没有效果，导致一次加载所有数据。

### <span id="inline-blue">解决方案</span>
mybatisPlusConfig升级前配置：
```java
package com.xxx.xxx.common.config.mybatis;

import com.baomidou.mybatisplus.extension.plugins.PaginationInterceptor;
import com.baomidou.mybatisplus.extension.plugins.pagination.optimize.JsqlParserCountOptimize;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@EnableTransactionManagement
@Configuration
public class MybatisPlusConfig
{
    @Bean
    public PaginationInterceptor paginationInterceptor() {
        PaginationInterceptor paginationInterceptor = new PaginationInterceptor();
        // 设置最大单页限制数量，默认 5000 条，-1 不受限制
        paginationInterceptor.setLimit(5000);
        // 开启 count 的 join 优化,只针对部分 left join
        paginationInterceptor.setCountSqlParser(new JsqlParserCountOptimize(true));
        return paginationInterceptor;
    }

}

```

升级后：
```java
package com.xxx.xxx.common.config.mybatis;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.BlockAttackInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@EnableTransactionManagement
@Configuration
public class MybatisPlusConfig
{
    @Bean
    public MybatisPlusInterceptor paginationInterceptor() {

        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        //阻止恶意或误操作的全表更新删除
        interceptor.addInnerInterceptor(new BlockAttackInnerInterceptor());
        //分页插件
        PaginationInnerInterceptor pageInterceptor = new PaginationInnerInterceptor(DbType.MYSQL);
        pageInterceptor.setMaxLimit(5000L);
        // 开启 count 的 join 优化,只针对部分 left join
        pageInterceptor.setOptimizeJoin(true);
        interceptor.addInnerInterceptor(pageInterceptor);
        return interceptor;
    }

}
```