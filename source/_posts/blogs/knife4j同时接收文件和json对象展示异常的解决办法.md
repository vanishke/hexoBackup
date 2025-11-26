---
title: knife4j同时接收文件和json对象展示异常的解决办法
categories:
	- Knife4j
tags: 
	- Knife4j
	- Springdoc

date: 2025-11-26 14:47:58
updated: 2025-11-26 14:47:58
---
<!-- toc -->

# <span id="inline-blue">环境</span>

knife4j-openapi3-spring-boot-starter：4.5.0
knife4j-gateway-spring-boot-starter：4.5.0
springdoc-openapi-ui: 1.7.0
Springboot: 2.6.6
Springcloud: 2021.0.6
JDK: 1.8

# <span id="inline-blue">现象</span>

微服务网关统一集成knife4j依赖，实现微服务模块在线接口文档，模块接口参数需要同时传递接口json对象和文件时，在线接口文档展示错乱。

微服务对应模块knife4j相关配置如下：
```yml
knife4j:
  basic:
    enable: false
    username: admin
    password: admin
  enable: true
  production: false
  setting:
    enable-filter-multipart-apis: true
    language: zh_cn

springdoc:
  #default-flat-param-object: true
  swagger-ui:
    url: /v3/api-docs
    config-url: /v3/api-docs/swagger-config
    enabled: true
  license:
    name: Apache License, Version 2.0
    license-url: https://www.apache.org/licenses/LICENSE-2.0.html
  contact:
    email: test.com
    name: test.com
    url: test.com
  packages-to-scan: com.test.adminbiz.controller
  api-docs:
    version: openapi_3_0
    enabled: true
  termsOfService: 服务条款
  version: V1.0
  title: ffcs-admin-biz
  description: admin后台业务接口
```

开启default-flat-param-object配置，则接口存在文件类型的参数在在线文档上不可见，原因是springdoc对应/v3/api-docs接口获取到的参数不正确，导致UI展现失败，如下图所示：
![Knife4j在线文档_01](/images/Knife4j/Knife4j_20251126_001.png)

关闭default-flat-param-object配置，则接口传递json对象在UI上展现异常，如下图所示：
![Knife4j在线文档_01](/images/Knife4j/Knife4j_20251126_002.png)


# <span id="inline-blue">解决办法</span>

如果想要同时传递对象和文件，解决办法是关闭default-flat-param-object配置，同时在传递对象参数上添加@ParameterObject注解，这样使得对象参数可以以表单参数的形式展现。

接口传递对象定义如下：

```java
@GetMapping({"/page"})
    @Parameters({
            @Parameter(name="versionNo", description = "版本号",in = ParameterIn.QUERY),
            @Parameter(name="updateType", description = "更新方式 0:强制更新；1：非强制更新",in = ParameterIn.QUERY),
            @Parameter(name="hardwareType", description = "硬件类型 0：平板；1：手机",in = ParameterIn.QUERY),
            @Parameter(name="operatingSystem", description = "操作系统 0：IOS 1：安卓",in = ParameterIn.QUERY),
            @Parameter(name="channelType", description = "渠道类型（取数据字典）",in = ParameterIn.QUERY),
            @Parameter(name="publishStatus", description = "发布状态",in = ParameterIn.QUERY),
            @Parameter(name="current", description = "页数",in = ParameterIn.QUERY),
            @Parameter(name="size", description = "每页大小",in = ParameterIn.QUERY)
    })
    @Operation(summary = "分页查询APP版本")
    public ApiResponse page( @ParameterObject  AppVersion version,
                            @RequestParam(name = "current",required = false)Long current,
                            @RequestParam(name = "size",required = false)Long size){
        Page<AppVersion> page = PageUtil.getPage(current,size);
        return success(this.appVersionService.findPage(page, version));
    }
```

接口传递文件定义如下：

```java
@PostMapping({"upload/{id}"})
    @PreAuthorize("hasAnyAuthority('version:upload')")
    @Operation(summary = "上传文件")
    public ApiResponse upload(@RequestPart MultipartFile file, @PathVariable Long id)
    {
        return success(this.appVersionService.upload(file, id));
    }
```

# <span id="inline-blue">验证</span>

![Knife4j在线文档_01](/images/Knife4j/Knife4j_20251126_003.png)
![Knife4j在线文档_01](/images/Knife4j/Knife4j_20251126_004.png)

参考：https://github.com/xiaoymin/knife4j/issues/922