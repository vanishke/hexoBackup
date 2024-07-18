---
title: Jsp页面访问异常
categories:
	- Jsp
tags: 
	- Jetty
	- Jsp
	
date: 2023-01-06 10:44:20
updated: 2023-01-06 10:44:20
---
<!-- toc -->

# <span id="inline-blue">现象</span>
后台管理页面请求Jsp异常，报错信息如下：
```log
HTTP ERROR 500 javax.servlet.ServletException: org.apache.jasper.JasperException: java.lang.ClassNotFoundException: org.apache.jsp.views.mould_005fcoder.mould_005fcoder_005flist_jsp
URI:	/oms/manager/mould/listpage
STATUS:	500
MESSAGE:	javax.servlet.ServletException: org.apache.jasper.JasperException: java.lang.ClassNotFoundException: org.apache.jsp.views.mould_005fcoder.mould_005fcoder_005flist_jsp
SERVLET:	spring-front-controller
CAUSED BY:	javax.servlet.ServletException: org.apache.jasper.JasperException: java.lang.ClassNotFoundException: org.apache.jsp.views.mould_005fcoder.mould_005fcoder_005flist_jsp
CAUSED BY:	org.apache.jasper.JasperException: java.lang.ClassNotFoundException: org.apache.jsp.views.mould_005fcoder.mould_005fcoder_005flist_jsp
CAUSED BY:	java.lang.ClassNotFoundException: org.apache.jsp.views.mould_005fcoder.mould_005fcoder_005flist_jsp
```
# <span id="inline-blue">Jsp声明周期</span>
1、第一次访问JSP，会验证一下是否第一次访问，然后把JSP转化成java(Servlet),再编译成class文件。

2、生成的class文件中会自动生成几个方法：jspInit()、jspDestroy()、jspService().Tomcat仅仅在第一次请求时，调用jspInit()方法，然后调用jspService()进行处理。

3、之后的每个请求，都会分配一个线程调用jspService()方法。

4、如果页面被销毁或者关闭，都会调用jspDestroy由于该文件是常驻内存的，又是多线程调用，所以访问的效率和速度都会很快。
# <span id="inline-blue">原因</span>
Jsp文件编译失败导致访问失败，对比之前正常的版本发现Jsp文件内容缺失。
```jsp
String path =request.getContextPath();
String userLanguage = com.coship.oms.tools.config.ConfigService.getLanguageCode();
String userLanguage2 = "";
if(""==userLanguage || null==userLanguage){
	  userLanguage2 = "-zh_CN";
}else{
	  if("-en_US".equalsIgnoreCase(userLanguage)){
		  userLanguage2 = "-en_US";
	  }else{
		  userLanguage2 = userLanguage;
	  }
}
```
![下拉联动验证](/images/jetty/Jsp/Jetty_Jsp_2023_01_06_001.png)
# <span id="inline-blue">Jsp编译文件生成位置</span>
Tomcat:
	Linux: /usr/local/AMS/apache-tomcat-8.0.18/work/Catalina/localhost/myAM/org/apache/jsp
	windows: 
		windows环境下eclipse对应tomcat部署位置映射有三种情况
		Use workspace metadata
			工作空间下,例如:F:workspace.metadata.pluginsorg.eclipse.wst.server.coretmp0
　　	Use Tomcat installation
			Tomcat安装路径下,例如：D:\Tomcat\BI_WH_WORK\apache-tomcat-7.0.20\apache-tomcat-7.0.20\work\Catalina\localhost\biPortal\org\apache\jsp
　　	Use custom location
			自定义安装路径下,例如：D:\Tomcat\BI_WH_WORK\apache-tomcat-7.0.20\apache-tomcat-7.0.20\work\Catalina\localhost\biPortal\org\apache\jsp
Jetty：
	Linux：
		/usr/local/moui_tianjin/oms/coship-oms/work/jetty-0_0_0_0-18080-oms-_oms-any-/jsp/org/apache/jsp
	


