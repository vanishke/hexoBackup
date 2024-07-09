---
title: SpringBoot+Mybatis+Druid批量更新 multi-statement not allow异常
categories:
	- Druid

date: 2023-10-26 14:25:20
tags: 
	- Druid
---
<!-- toc -->

# <span id="inline-blue">项目环境</span>
SpringBoot: 2.2.6.RELEASE
SpringCloud: 2021.0.5
Druid: 1.1.22
Mybatis-plus: 3.3.1


多条SQL语句同时执行更新操作，提示报错
```shell
Error updating database. Cause: java.sql.SQLException: sql injection violation, multi-statement not allow 
```
# <span id="inline-blue">问题原因</span>
mysql默认不支持批量更新
Druid的multiStatementAllow默认是false

# <span id="inline-blue">解决办法</span>

## <span id="inline-blue">方案一</span>
mysql连接url参数添加allowMultiQueries=true
如果配置了druid 注释掉 filters: wall，加上
	filter:
	wall:
	config:
	multi-statement-allow: true
	none-base-statement-allow: true
参考示例如下：
	
```shell
	#mysql
	spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver	spring.datasource.url=jdbc:mysql://10.9.216.14:3306/ihome_album?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=GMT%2B8&allowMultiQueries=true
	spring.datasource.username=root
	spring.datasource.password=coship
	spring.datasource.name=ihome_album
	spring.datasource.type=com.alibaba.druid.pool.DruidDataSource
	spring.datasource.initial-size=5
	spring.datasource.min-idle=5
	spring.datasource.max-active=20
	spring.datasource.max-wait=3000
	spring.datasource.time-between-eviction-runs-millis=60000
	spring.datasource.min-evectable-idle-time-millis=300000
	spring.datasource.validation-query=SELECT '1' FROM dual
	
	#druid
	spring.datasource.druid.filter.wall.config.multi-statement-allow=true
	spring.datasource.druid.filter.wall.config.none-base-statement-allow=true	
```

##  <span id="inline-blue">方案二</span>

DataSourceProperties配置类添加SQL多条更新支持

```java
	package com.ffcs.platform.common.config.datasource;
	import com.alibaba.druid.pool.DruidDataSource;
	import com.alibaba.druid.wall.WallConfig;
	import com.alibaba.druid.wall.WallFilter;
	import lombok.Data;
	import lombok.extern.slf4j.Slf4j;
	import org.springframework.boot.context.properties.ConfigurationProperties;
	import org.springframework.context.annotation.Bean;
	import org.springframework.context.annotation.Primary;
	import org.springframework.stereotype.Component;

	import javax.sql.DataSource;
	import java.sql.SQLException;
	import java.util.ArrayList;
	import java.util.List;

	@Slf4j
	@Data
	@Component
	@ConfigurationProperties(prefix = "spring.datasource")
	public class DataSourceProperties
	{
		private String url;
		private String name;
		private String username;
		private String password;
		private String driverClassName;
		private int initialSize;
		private int minIdle;
		private int maxActive;
		private int maxWait;
		private int timeBetweenEvictionRunsMillis;
		private int minEvictableIdleTimeMillis;
		private String validationQuery;
		private boolean testWhileIdle;
		private boolean testOnBorrow;
		private boolean testOnReturn;
		private boolean poolPreparedStatements;
		private int maxPoolPreparedStatementPerConnectionSize;
		private String filters;
		private String connectionProperties;

		@Bean
		@Primary
		public DataSource dataSource() {
			DruidDataSource datasource = new DruidDataSource();
			datasource.setUrl(this.url);
			datasource.setUsername(this.username);
			datasource.setPassword(this.password);
			datasource.setDriverClassName(this.driverClassName);
			datasource.setInitialSize(this.initialSize);
			datasource.setMinIdle(this.minIdle);
			datasource.setMaxActive(this.maxActive);
			datasource.setMaxWait((long)this.maxWait);
			datasource.setTimeBetweenEvictionRunsMillis((long)this.timeBetweenEvictionRunsMillis);
			datasource.setMinEvictableIdleTimeMillis((long)this.minEvictableIdleTimeMillis);
			datasource.setValidationQuery(this.validationQuery);
			datasource.setTestWhileIdle(this.testWhileIdle);
			datasource.setTestOnBorrow(this.testOnBorrow);
			datasource.setTestOnReturn(this.testOnReturn);
			datasource.setPoolPreparedStatements(this.poolPreparedStatements);
			datasource.setMaxPoolPreparedStatementPerConnectionSize(this.maxPoolPreparedStatementPerConnectionSize);
			try {
				datasource.setFilters(this.filters);
			} catch (SQLException e) {
				log.error("druid configuration initialization filter: " + e);
			}
			datasource.setConnectionProperties(this.connectionProperties);
			List filterList = new ArrayList<>();
			filterList.add(wallFilter());
			datasource.setProxyFilters(filterList);
			log.debug("druid configuration datasource 成功" + datasource);
			log.debug("druid configuration datasource 成功" + this.name);
			return datasource;
		}

		@Bean
		public WallFilter wallFilter() {
			WallFilter wallFilter = new WallFilter();
			wallFilter.setConfig(wallConfig());
			return wallFilter;
		}

		@Bean
		public WallConfig wallConfig() {
			WallConfig wallConfig = new WallConfig();
			//允许一次执行多条语句
			wallConfig.setMultiStatementAllow(true);
			//是否允许非以上基本语句的其他语句
			wallConfig.setNoneBaseStatementAllow(true);
			//是否进行严格的语法检测
			wallConfig.setStrictSyntaxCheck(false);
			return wallConfig;
		}
	}
```



