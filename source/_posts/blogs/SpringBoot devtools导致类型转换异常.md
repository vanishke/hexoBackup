---
title: SpringBoot Devtools导致类型转换异常
tags:
	- SpringBoot
	- Java
	- Devtools
categories: 
	- SpringBoot

date: 2024-04-29 14:11:20
updated: 2024-04-29 14:11:20
---
## <span id="inline-blue">环境</span>
os: Windows7
Java: 1.8
SpringBoot: 2.2.6.Release
SpringCloud: 2021.0.5
spring-boot-devtools: 2.2.6.Release
### <span id="inline-blue">现象</span>
本地启动SpringBoot项目，请求后天接口提示错误，错误信息如下：
```shell
java.lang.ClassCastException: com.ffcs.common.model.LoginUser cannot be cast to com.ffcs.common.model.LoginUser
```
### <span id="inline-blue">代码调用</span>
```Java
@Slf4j
public class UserUtils
{
    public static LoginUser getLoginUser() {
        LoginUser loginUser = null;
        try {
            loginUser = (LoginUser)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        }
        catch (Exception e) {
            log.error("UserUtils异常:", e);
            UserUtils.log.info("============当前无登录信息，请注意================");
        }
        return loginUser;
    }
}
```
### <span id="inline-blue">问题排查</span>
错误信息很奇怪，同一个Class类对象居然不能转换，本地存在转换异常，但是如果打包后部署到Linux服务器上后，请求一切正常，接下来就是逐步排查提交的代码是否是因为修改代码逻辑导致出现请求异常。
代码没有找到特别的地方，怀疑是否是编译器做了什么优化，导致本地编译运行的class和打包后的不一致导致运行出现异常，特别检查了本地的class和反编译后的jar包内容是否一致，结果也没有变化。
因为重写了SpringSecurity的UserDetails对象，怀疑是否是loadUserByUsername方法和当前调用不一致导致，修改为一致的对象发现也没有效果，最后查看资料发现spring-boot-devtools依赖使用的是自己的类加载器，导致对象无法正常转换。

### <span id="inline-blue">问题原因</span>
项目启动时加载项目中的类使用的加载器都是org.springframework.boot.devtools.restart.classloader.RestartClassLoader，代码调用处左右两边的对象使用的不同的类加载器，左边使用的是sun.misc.Launcher.AppClassLoader，而右边使用的是org.springframework.boot.devtools.restart.classloader.RestartClassLoader
这是spring-boot-devtools自己封装的类加载器，方便重新加载变化的对象。就因为这个差别导致异常发生。

### <span id="inline-blue">解决办法</span>
项目pom.xml删除所有spring-boot-devtools依赖项
