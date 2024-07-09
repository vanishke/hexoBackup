---
title: Swagger提示Unable to render this definition
categories:
	- Maven

date: 2023-09-18 17:25:20
tags: 
	- Maven
---
<!-- toc -->

# <span id="inline-blue">项目环境</span>
SpringBoot: 2.2.6.RELEASE
SpringCloud: 2021.0.5
Swagger UI: 2.9.2

微服务添加Swagger支持，通过网关访问提示如下：
```shell
Unable to render this definition
The provided definition does not specify a valid version field.

Please indicate a valid Swagger or OpenAPI version field. Supported version fields are swagger: "2.0" and those that match openapi: 3.0.n (for example, openapi: 3.0.0).
```
提示版本信息无效，但通过微服务自身的端口直接访问/api-docs能够获取到模块对应的接口信息，通过比对不对模块返回的接口数据，发现返回的数据结构不一致，报错的模块返回信息被封装了一层结构，导致Swagger无法解析。
查看项目源码，最终定位到是由以下位置ResponseAdvice类导致该问题
```java
@ControllerAdvice
 @Priority(3)
 public class ResponseAdvice
   implements ResponseBodyAdvice<Object>
 {

     @Autowired
   private ObjectMapper objectMapper;

     public boolean supports(MethodParameter methodParameter, Class aClass)
   {
     return true;
   }

     public Object beforeBodyWrite(Object o, MethodParameter methodParameter, MediaType mediaType, Class aClass, ServerHttpRequest serverHttpRequest, ServerHttpResponse serverHttpResponse)
   {
       
     if ((o instanceof String))
     {
       return JSONObject.toJSONString(ResultData.success(o));
     }
     if ((o instanceof ResultData)) {
       return o;
     }
     return ResultData.success(o);
   }
 }
```
所有的返回数据外层都是{"code":"","msg":"","data":[]}这样的结构，导致Swagger无法解析。

# <span id="inline-blue">解决办法</span>
在代码判断逻辑排除掉Swagger接口相关的返回信息
```java
@ControllerAdvice
 @Priority(3)
 public class ResponseAdvice
   implements ResponseBodyAdvice<Object>
 {

     @Autowired
   private ObjectMapper objectMapper;

     public boolean supports(MethodParameter methodParameter, Class aClass)
   {
     return true;
   }

     public Object beforeBodyWrite(Object o, MethodParameter methodParameter, MediaType mediaType, Class aClass, ServerHttpRequest serverHttpRequest, ServerHttpResponse serverHttpResponse)
   {
       // 判断当前请求是否是 Swagger 相关的请求
       if (serverHttpRequest.getURI().getPath().startsWith("/swagger") || serverHttpRequest.getURI().getPath().startsWith("/v2/api-docs")) {
           return o;
       }
     if ((o instanceof String))
     {
       return JSONObject.toJSONString(ResultData.success(o));
     }
     if ((o instanceof ResultData)) {
       return o;
     }
     return ResultData.success(o);
   }
 }
```
# <span id="inline-blue">验证</span>
![Swagger集成](/images/Swagger/Swagger_20230918_001.png)



