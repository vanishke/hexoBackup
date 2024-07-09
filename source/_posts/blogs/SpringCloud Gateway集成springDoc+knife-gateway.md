---
title: SpringCloud Gateway集成springDoc+knife-gateway
date: 2024-05-31 16:10:20
tags:
	- Java
categories: Java
---
## <span id="inline-blue">环境</span>
Java: 1.8
SpringBoot: 2.6.6
SpringCloud: 2021.0.6
springDoc: 1.6.9
knife-gateway:4.4.0
### <span id="inline-blue">升级原因</span>
原本项目api文档由knife+Swagger2.0实现，springBoot升级2.6.6，发现swagger2.0已经停止 维护，knife后续版本也只兼容适配swagger3.0,也就是openapi,并且Swagger2.0最高只能集成knife-2.0.9
,由于考虑到knife的兼容性，于是将swagger2.0升级为openapi,knife升级为knife-gateway.
### <span id="inline-blue">解决方案</span>
网关以外的微服务模块pom.xml增加如下依赖：
```xml
		<dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-ui</artifactId>
			<version>1.6.9</version>
        </dependency>
```
微服务增加配置项如下：
```properties
#knife4j
knife4j.enable=true
knife4j.setting.language=zh_cn

springdoc.api-docs.version=openapi_3_0
springdoc.default-flat-param-object=true
springdoc.packages-to-scan=com.ffcs.platform.quartz
springdoc.api-docs.enabled=true
springdoc.swagger-ui.enabled=true
springdoc.swagger-ui.config-url=/v3/api-docs/swagger-config
springdoc.swagger-ui.url=/v3/api-docs
springdoc.title=ffcs-quartz
springdoc.description=Quartz接口服务
springdoc.termsOfService=服务条款
springdoc.version=V1.0
springdoc.license.name=Apache License, Version 2.0
springdoc.license.license-url=https://www.apache.org/licenses/LICENSE-2.0.html
springdoc.contact.name=xxxx
springdoc.contact.email=xxxx@coship.com
springdoc.contact.url=xxxx@coship.com

# SpringSecurity直接放行URL
ignore.urls[0]=/oauth/**
ignore.urls[1]=/actuator/**
ignore.urls[2]=/v3/api-docs/**
ignore.urls[3]=/swagger-ui.html
ignore.urls[4]=/swagger-resources/**
ignore.urls[5]=/webjars/**
ignore.urls[6]=/druid/**
ignore.urls[7]=/swagger-ui/*
ignore.urls[8]=/doc.html
ignore.urls[9]=/favicon.ico
```
公共配置配置类ApiDocProperties
```java
package com.xxx.xxx.common.config.springdoc;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "springdoc")
public class ApiDocProperties {

    @Value("${title:标题}")
    private String title;
    @Value("${description:接口文档}")
    private String description;
    @Value("${termsOfService:服务条款}")
    private String termsOfService;
    @Value("${contact.name:xxxx}")
    private String contactName;
    @Value("${contact.url:xxxx@coship.com}")
    private String contactUrl;
    @Value("${contact.email:xxxx@coship.com}")
    private String contactEmail;
    @Value("${license.name:Apache License, Version 2.0}")
    private String licenseName;
    @Value("${license.license-url:https://www.apache.org/licenses/LICENSE-2.0.html}")
    private String licenseUrl;
    @Value("${version:V1.0}")
    private String version;
}

```
openapi公共配置初始化
```java
package com.ffcs.platform.common.config.springdoc;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringDocConfig {

    @Autowired
    private ApiDocProperties apiDocProperties;

    @Bean
    public OpenAPI CreateOpenAPI() {
        License license = new License();
        license.setName(apiDocProperties.getLicenseName());
        license.setUrl(apiDocProperties.getLicenseUrl());
        Contact contact = new Contact();
        contact.setName(apiDocProperties.getContactName());
        contact.setUrl(apiDocProperties.getContactUrl());
        contact.setEmail(apiDocProperties.getContactEmail());
        return new OpenAPI()
                .info(new Info().title(apiDocProperties.getTitle())
                        .description(apiDocProperties.getDescription())
                        .version(apiDocProperties.getVersion()).contact(contact).license(license).termsOfService(apiDocProperties.getTermsOfService()));
    }


}
```

网关模块pom.xml增加如下依赖：
```xml
 <dependency>
            <groupId>com.github.xiaoymin</groupId>
            <artifactId>knife4j-gateway-spring-boot-starter</artifactId>
            <version>4.4.0</version>
        </dependency>
```

配置项新增如下：
```properties
# 直接放行URL
ignore.urls[0]=/oauth/**
ignore.urls[1]=/actuator/**
ignore.urls[2]=/v3/api-docs/**
ignore.urls[3]=/swagger-ui.html
ignore.urls[4]=/swagger-resources/**
ignore.urls[5]=/webjars/**
ignore.urls[6]=/druid/**
ignore.urls[7]=/swagger-ui/*
ignore.urls[8]=/doc.html
ignore.urls[9]=/favicon.ico
ignore.urls[10]=/user/getCaptcha
ignore.urls[11]=/**/api/**

#knife4j-gateway
knife4j.gateway.enabled=true
knife4j.gateway.strategy=discover
knife4j.gateway.discover.version=openapi3
knife4j.gateway.discover.enabled=true
knife4j.gateway.discover.excluded-services=ffcs-gateway,ffcs-event-producer,ffcs-event-consumer,ffcs-admin-server,ffcs-sync-api
```
### <span id="inline-blue">验证</span>
![knife-gateway](/images/Swagger/Swagger_20240531_001.png)