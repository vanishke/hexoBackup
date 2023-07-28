---
title: JAXB性能优化
categories:
	- JAXB

date: 2023-04-21 14:35:20
tags: 
	- JAXB
---
<!-- toc -->

# <span id="inline-blue">现象</span>
接口并发压力测试下，RPS耗时非常严重，使用jstack命令抓取堆栈，发现线程在JAXBUtil.jaxbStreamToBean(JAXBUtil.java:314)方法耗时特别严重。
```java
"http-0.0.0.0-8080-472" daemon prio=10 tid=0x00007f4a00371000 nid=0x11891 runnable [0x00007f46c003d000]
   java.lang.Thread.State: RUNNABLE
	at java.util.zip.ZipFile.getEntry(Native Method)
	at java.util.zip.ZipFile.getEntry(ZipFile.java:162)
	- locked <0x0000000744023910> (a java.util.jar.JarFile)
	at java.util.jar.JarFile.getEntry(JarFile.java:208)
	at java.util.jar.JarFile.getJarEntry(JarFile.java:191)
	at sun.misc.URLClassPath$JarLoader.getResource(URLClassPath.java:757)
	at sun.misc.URLClassPath.getResource(URLClassPath.java:169)
	at sun.misc.URLClassPath.getResource(URLClassPath.java:221)
	at java.lang.ClassLoader.getBootstrapResource(ClassLoader.java:1151)
	at java.lang.ClassLoader.getResource(ClassLoader.java:1000)
	at java.lang.ClassLoader.getResource(ClassLoader.java:998)
	at java.lang.ClassLoader.getResource(ClassLoader.java:998)
	at org.jboss.classloader.plugins.loader.ClassLoaderToLoaderAdapter.getResource(ClassLoaderToLoaderAdapter.java:117)
	at org.jboss.classloader.spi.ClassLoaderDomain.getResourceFromParent(ClassLoaderDomain.java:475)
	at org.jboss.classloader.spi.ClassLoaderDomain.beforeGetResource(ClassLoaderDomain.java:431)
	at org.jboss.classloader.spi.base.BaseClassLoaderDomain.getResource(BaseClassLoaderDomain.java:418)
	at org.jboss.classloader.spi.base.BaseClassLoaderDomain.getResource(BaseClassLoaderDomain.java:1136)
	at org.jboss.classloader.spi.base.BaseClassLoader.getResource(BaseClassLoader.java:473)
	at java.lang.ClassLoader.getResourceAsStream(ClassLoader.java:1193)
	at org.apache.xerces.parsers.SecuritySupport$6.run(Unknown Source)
	at java.security.AccessController.doPrivileged(Native Method)
	at org.apache.xerces.parsers.SecuritySupport.getResourceAsStream(Unknown Source)
	at org.apache.xerces.parsers.ObjectFactory.findJarServiceProvider(Unknown Source)
	at org.apache.xerces.parsers.ObjectFactory.createObject(Unknown Source)
	at org.apache.xerces.parsers.ObjectFactory.createObject(Unknown Source)
	at org.apache.xerces.parsers.SAXParser.<init>(Unknown Source)
	at org.apache.xerces.parsers.SAXParser.<init>(Unknown Source)
	at org.apache.xerces.jaxp.SAXParserImpl$JAXPSAXParser.<init>(Unknown Source)
	at org.apache.xerces.jaxp.SAXParserImpl.<init>(Unknown Source)
	at org.apache.xerces.jaxp.SAXParserFactoryImpl.newSAXParser(Unknown Source)
	at javax.xml.bind.helpers.AbstractUnmarshallerImpl.getXMLReader(AbstractUnmarshallerImpl.java:86)
	at javax.xml.bind.helpers.AbstractUnmarshallerImpl.unmarshal(AbstractUnmarshallerImpl.java:137)
	at javax.xml.bind.helpers.AbstractUnmarshallerImpl.unmarshal(AbstractUnmarshallerImpl.java:184)
	at com.coship.dhm.usm.util.JAXBUtil.jaxbStreamToBean(JAXBUtil.java:269)
	at com.coship.dhm.usm.util.JAXBUtil.jaxbStreamToBean(JAXBUtil.java:314)
	at com.longvision.adapter.ngod.a7.getfoldercontents.action.GetRootContentsAction.getRootContents(GetRootContentsAction.java:77)
	at sun.reflect.GeneratedMethodAccessor437.invoke(Unknown Source)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:25)
	at java.lang.reflect.Method.invoke(Method.java:597)
	at ognl.OgnlRuntime.invokeMethod(OgnlRuntime.java:892)
	at ognl.OgnlRuntime.callAppropriateMethod(OgnlRuntime.java:1294)
	at ognl.ObjectMethodAccessor.callMethod(ObjectMethodAccessor.java:68)
	at com.opensymphony.xwork2.ognl.accessor.XWorkMethodAccessor.callMethodWithDebugInfo(XWorkMethodAccessor.java:117)
	at com.opensymphony.xwork2.ognl.accessor.XWorkMethodAccessor.callMethod(XWorkMethodAccessor.java:108)
	at ognl.OgnlRuntime.callMethod(OgnlRuntime.java:1370)
	at ognl.ASTMethod.getValueBody(ASTMethod.java:91)
	at ognl.SimpleNode.evaluateGetValueBody(SimpleNode.java:212)
	at ognl.SimpleNode.getValue(SimpleNode.java:258)
	at ognl.Ognl.getValue(Ognl.java:467)
	at ognl.Ognl.getValue(Ognl.java:431)
	at com.opensymphony.xwork2.ognl.OgnlUtil$3.execute(OgnlUtil.java:352)
	at com.opensymphony.xwork2.ognl.OgnlUtil.compileAndExecuteMethod(OgnlUtil.java:404)
	at com.opensymphony.xwork2.ognl.OgnlUtil.callMethod(OgnlUtil.java:350)
	at com.opensymphony.xwork2.DefaultActionInvocation.invokeAction(DefaultActionInvocation.java:430)
	at com.opensymphony.xwork2.DefaultActionInvocation.invokeActionOnly(DefaultActionInvocation.java:290)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:251)
	at com.longvision.adapter.ngod.interceptor.InterfaceMonitor.doService(InterfaceMonitor.java:220)
	at com.longvision.adapter.ngod.interceptor.InterfaceMonitor.intercept(InterfaceMonitor.java:147)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at org.apache.struts2.interceptor.DeprecationInterceptor.intercept(DeprecationInterceptor.java:41)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at org.apache.struts2.interceptor.debugging.DebuggingInterceptor.intercept(DebuggingInterceptor.java:256)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at com.opensymphony.xwork2.interceptor.DefaultWorkflowInterceptor.doIntercept(DefaultWorkflowInterceptor.java:168)
	at com.opensymphony.xwork2.interceptor.MethodFilterInterceptor.intercept(MethodFilterInterceptor.java:98)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at com.opensymphony.xwork2.validator.ValidationInterceptor.doIntercept(ValidationInterceptor.java:265)
	at org.apache.struts2.interceptor.validation.AnnotationValidationInterceptor.doIntercept(AnnotationValidationInterceptor.java:76)
	at com.opensymphony.xwork2.interceptor.MethodFilterInterceptor.intercept(MethodFilterInterceptor.java:98)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at com.opensymphony.xwork2.interceptor.ConversionErrorInterceptor.intercept(ConversionErrorInterceptor.java:138)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at com.opensymphony.xwork2.interceptor.ParametersInterceptor.doIntercept(ParametersInterceptor.java:229)
	at com.opensymphony.xwork2.interceptor.MethodFilterInterceptor.intercept(MethodFilterInterceptor.java:98)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at com.opensymphony.xwork2.interceptor.ParametersInterceptor.doIntercept(ParametersInterceptor.java:229)
	at com.opensymphony.xwork2.interceptor.MethodFilterInterceptor.intercept(MethodFilterInterceptor.java:98)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at com.opensymphony.xwork2.interceptor.StaticParametersInterceptor.intercept(StaticParametersInterceptor.java:191)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at org.apache.struts2.interceptor.MultiselectInterceptor.intercept(MultiselectInterceptor.java:73)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at org.apache.struts2.interceptor.DateTextFieldInterceptor.intercept(DateTextFieldInterceptor.java:125)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at org.apache.struts2.interceptor.CheckboxInterceptor.intercept(CheckboxInterceptor.java:91)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at org.apache.struts2.interceptor.FileUploadInterceptor.intercept(FileUploadInterceptor.java:253)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at com.opensymphony.xwork2.interceptor.ModelDrivenInterceptor.intercept(ModelDrivenInterceptor.java:100)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at com.opensymphony.xwork2.interceptor.ScopedModelDrivenInterceptor.intercept(ScopedModelDrivenInterceptor.java:141)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at com.opensymphony.xwork2.interceptor.ChainingInterceptor.intercept(ChainingInterceptor.java:145)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at com.opensymphony.xwork2.interceptor.PrepareInterceptor.doIntercept(PrepareInterceptor.java:171)
	at com.opensymphony.xwork2.interceptor.MethodFilterInterceptor.intercept(MethodFilterInterceptor.java:98)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at com.opensymphony.xwork2.interceptor.I18nInterceptor.intercept(I18nInterceptor.java:140)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at org.apache.struts2.interceptor.ServletConfigInterceptor.intercept(ServletConfigInterceptor.java:164)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at com.opensymphony.xwork2.interceptor.AliasInterceptor.intercept(AliasInterceptor.java:193)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at com.opensymphony.xwork2.interceptor.ExceptionMappingInterceptor.intercept(ExceptionMappingInterceptor.java:189)
	at com.opensymphony.xwork2.DefaultActionInvocation.invoke(DefaultActionInvocation.java:245)
	at org.apache.struts2.impl.StrutsActionProxy.execute(StrutsActionProxy.java:54)
	at org.apache.struts2.dispatcher.Dispatcher.serviceAction(Dispatcher.java:575)
	at org.apache.struts2.dispatcher.FilterDispatcher.doFilter(FilterDispatcher.java:434)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:235)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:206)
	at com.coship.system.filter.SystemFilter.doFilter(SystemFilter.java:57)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:235)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:206)
	at org.jboss.web.tomcat.filters.ReplyHeaderFilter.doFilter(ReplyHeaderFilter.java:96)
	at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:235)
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:206)
	at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:235)
	at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:191)
	at org.jboss.web.tomcat.security.SecurityAssociationValve.invoke(SecurityAssociationValve.java:190)
	at org.jboss.web.tomcat.security.JaccContextValve.invoke(JaccContextValve.java:92)
	at org.jboss.web.tomcat.security.SecurityContextEstablishmentValve.process(SecurityContextEstablishmentValve.java:126)
	at org.jboss.web.tomcat.security.SecurityContextEstablishmentValve.invoke(SecurityContextEstablishmentValve.java:70)
	at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:127)
	at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:102)
	at org.jboss.web.tomcat.service.jca.CachedConnectionValve.invoke(CachedConnectionValve.java:158)
	at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:109)
	at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:330)
	at org.apache.coyote.http11.Http11Processor.process(Http11Processor.java:829)
	at org.apache.coyote.http11.Http11Protocol$Http11ConnectionHandler.process(Http11Protocol.java:598)
	at org.apache.tomcat.util.net.JIoEndpoint$Worker.run(JIoEndpoint.java:447)
	at java.lang.Thread.run(Thread.java:662)

   Locked ownable synchronizers:
	- None

```
# <span id="inline-blue">原始JAXBUtil</span>

```java
package com.coship.usm.util;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.Hashtable;
import java.util.Map;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

import org.apache.log4j.Logger;

import com.coship.dhm.aaa.commons.exception.AAAException;
import com.coship.dhm.aaa.commons.util.StringUtil;

/**
 * JAXB工具类
 * 
 * @author 903889
 * 
 * @param <T>
 */
public class JAXBUtil<T extends Object>
{

    private final static String ENCODING = "UTF-8";

    public static final Logger log = Logger.getLogger(JAXBUtil.class);
    private static Map<String, JAXBContext> JAXBContextMap = new Hashtable<String, JAXBContext>();

    /**
     * @param <T> 
     * @param t 待转换为XML格式的对象
     * @return
     * @throws IepgRuntimeException 
     */
    public static <T> String jaxbBeanToStr(T t) throws AAAException
    {
        Marshaller marshaller = null;

        String xmlString = null;
        ByteArrayOutputStream outs = null;
        try
        {
            outs = new ByteArrayOutputStream();
            JAXBContext context = getJAXBContext(t.getClass());
            marshaller = context.createMarshaller();

            marshaller.setProperty(Marshaller.JAXB_ENCODING, ENCODING);// UTF-8
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            marshaller.marshal(t, outs);
            xmlString = new String(outs.toByteArray(), ENCODING);
        }
        catch (Exception e)
        {
            e.printStackTrace();
            throw new AAAException("405");
        }
        finally
        {
            try
            {
                if (outs != null)
                {
                    //修改为非chunked格式响应
                    //outs.flush();
                    outs.close();
                }
            }
            catch (Exception e1)
            {
            }
        }
        return xmlString;
    }

    /**
     * 使用JAXB处理从Bean到流的过程，此方法供写XML使用
     * 
     * @param t
     *            包含内容的对象
     * @param outs
     *            一个干净的输出流，经过处理后，内容会注入到该流中
     * @throws IepgRuntimeException 
     * @throws JAXBException
     *             当包含内容的对象和JAXB模板class不匹配时抛出，实际此处不会抛出该异常
     */
    public static <T> void jaxbBeanToStream(T t, OutputStream outs) throws AAAException
    {

        if (t == null)
        {
            return;
        }
        try
        {
            String xmlString = jaxbBeanToStr(t);
            outs.write(xmlString.getBytes(ENCODING));

            log.info("\n==================================" + t.getClass().getName()
                    + "===返回结果=======================================\n" + xmlString);

        }
        catch (UnsupportedEncodingException e)
        {
            log.error(e.getMessage());
            e.printStackTrace();
        }
        catch (IOException e)
        {
            e.printStackTrace();
            log.error(e.getMessage());
        }
        finally
        {
            try
            {
                if (outs != null)
                {
                    //修改为非chunked格式响应
                    //outs.flush();
                    outs.close();
                }

            }
            catch (Throwable ex)
            {
            }
        }
    }

    @SuppressWarnings("unchecked")
    public static <T> T jaxbStreamToBean(Class<T> clazz, String requestXML) throws AAAException
    {
        Unmarshaller um = null;
        T result = null;
        ByteArrayInputStream ins = null;
        try
        {
            JAXBContext context = getJAXBContext(clazz);
            um = context.createUnmarshaller();
            ins = new ByteArrayInputStream(requestXML.getBytes(ENCODING));
            // 输出流内容
            result = (T) um.unmarshal(ins);// 编码问题再前面已经处理，只需要按JVM的编码处理即可
        }
        catch (Exception ex)
        {
            log.error("解析XML文件出错,请检查发送报文！", ex);
            throw new AAAException("405");
        }
        finally
        {
            try
            {
                if (ins != null)
                {
                    ins.close();
                }
            }
            catch (Throwable ex)
            {
            }
        }
        return result;
    }

    public static <T> T jaxbStreamToBean(Class<T> clazz, InputStream inputStream) throws AAAException
    {
        String requestXML;
        try
        {
            requestXML = convertStreamToString(inputStream);

            if (log.isInfoEnabled())
            {
                log.info("---requestXML---" + requestXML);
            }
        }
        catch (Exception ex)
        {
            log.error("解析XML文件出错,请检查发送报文！", ex);
            throw new AAAException("405");
        }
        return jaxbStreamToBean(clazz, requestXML);
    }

    /**
     * 简单创建实例,缓存
     * 
     * @param clazz
     * @return
     * @throws JAXBException 
     */
    public static JAXBContext getJAXBContext(Class<?> clazz) throws JAXBException
    {

        JAXBContext context = JAXBContextMap.get(clazz.getName());
        if (context == null)
        {
            context = JAXBContext.newInstance(clazz);
            JAXBContextMap.put(clazz.getName(), context);
        }

        return context;
    }

    public static String convertStreamToString(InputStream is)
    {
        BufferedReader reader = null;
        try
        {
            reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
        }
        catch (UnsupportedEncodingException e1)
        {
            log.error("sendErrorMessage exception！", e1);
        }
        StringBuilder sb = new StringBuilder();

        String line = null;
        try
        {
            while ((line = reader.readLine()) != null)
            {
                sb.append(line + "\n");
            }
        }
        catch (IOException e)
        {
            e.printStackTrace();
        }
        finally
        {
            try
            {
                is.close();
            }
            catch (IOException e)
            {
                e.printStackTrace();
            }
        }

        return sb.toString();
    }

    // 下发错误码
    public static void sendErrorMessage(String errorCode, String errorMessage, OutputStream outs)
    {
        try
        {
            if (outs != null)
            {
                NavServerResponse navServerResponse = new NavServerResponse();
                if (StringUtil.isNil(errorCode) && StringUtil.isNil(errorMessage))
                {
                    errorCode = "-1";
                    errorMessage = "UNKNOWN_ERROR";
                }
                navServerResponse.setCode(errorCode);
                navServerResponse.setMessage(errorMessage);

                jaxbBeanToStream(navServerResponse, outs);

            }
        }
        catch (Exception e)
        {
        }
    }

    // 下发错误码
    public static void sendErrorMessage(Exception e, OutputStream outs)
    {
        if (outs != null)
        {
            String errorCode = null;
            String errorMessage = null;
            NavServerResponse navServerResponse = new NavServerResponse();
            if (e instanceof AAAException)
            {
                AAAException iepgRuntimeException = (AAAException) e;

                if (StringUtil.isNil(iepgRuntimeException.getErrCode()) && StringUtil.isNil(e.getMessage()))
                {
                    errorCode = "-1";
                    errorMessage = "UNKNOWN_ERROR";
                }
                else
                {
                    errorCode = iepgRuntimeException.getErrCode();
                    errorMessage = e.getMessage();
                }
                navServerResponse.setCode(errorCode);
                navServerResponse.setMessage(errorMessage);
            }
            try
            {
                jaxbBeanToStream(navServerResponse, outs);
            }
            catch (AAAException e1)
            {
                log.error("sendErrorMessage exception！", e1);
            }
        }
    }

}


```
main方法多线程执行的情况下缓存几乎没有作用，耗时特别严重。
![JAXB性能优化](/images/JAXB/JAXB_20230421_001.png)
# <span id="inline-blue">问题原因</span>

JAXBContent类是线程安全的、Unmarshal、Marshal是非线程安全的。
JAXBContent采用单例进行实例化，map缓存class对应的JAXBContent实例。
多线程的情况下执行发现缓存的JAXBContent没有作用，在jaxbBeanToStr和jaxbStreamToBean添加synchorized修饰的情况下，性能有很大提升，但在接口高并发的情况下，两个方法都有获取同步锁的消耗。同时Unmarshal、Marshal的编码和解码有一定耗时，综合考虑之下，决定采用官方推荐用法，将JAXBContent实例交由spring管理，unmarshal,marshall采用线程池实现,jaxb对应的spring文件如下：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="    
        http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd">

	<!-- Pool (un)marshallers to improve performance -->
	<bean id="jaxbContext" class="javax.xml.bind.JAXBContext"
	    factory-method="newInstance">
	    <constructor-arg>
	        <list>
	            <value type="java.lang.Class">com.coship.usm.action.SessionStop</value>
	            <value type="java.lang.Class">com.coship.usm.action.bean.request.RequestPlaylist</value>
	            <value type="java.lang.Class">com.coship.usm.action.bean.request.RequestSecret</value>
	            <value type="java.lang.Class">com.coship.usm.action.UsmDcssDelete</value>
	            <value type="java.lang.Class">com.coship.usm.action.bean.response.ContentRef</value>
	            <value type="java.lang.Class">com.coship.usm.action.bean.response.PhysicalPlaylist</value>
	            <value type="java.lang.Class">com.coship.usm.action.bean.response.RespSecret</value>
	            </list>
	    </constructor-arg>
	</bean>
	<bean id="marshallerTarget" class="javax.xml.bind.Marshaller"
	    factory-bean="jaxbContext" factory-method="createMarshaller"
	    scope="prototype">
	</bean>
	 
	<bean id="unmarshallerTarget" class="javax.xml.bind.Unmarshaller"
	    factory-bean="jaxbContext" factory-method="createUnmarshaller"
	    scope="prototype">
	</bean>
	
	<bean id="poolTargetSource" class="org.springframework.aop.target.CommonsPoolTargetSource">
	    <property name="targetBeanName" value="marshallerTarget" />
	    <property name="maxSize" value="25" />
	</bean>
	 
	<bean id="unmarshallerPoolTargetSource" class="org.springframework.aop.target.CommonsPoolTargetSource">
	    <property name="targetBeanName" value="unmarshallerTarget" />
	    <property name="maxSize" value="25" />
	</bean>
	
	<bean id="marshaller" class="org.springframework.aop.framework.ProxyFactoryBean">
	    <qualifier value="marshaller" />
	    <property name="targetSource" ref="poolTargetSource" />
	</bean>
	 
	<bean id="unmarshaller" class="org.springframework.aop.framework.ProxyFactoryBean">
	    <qualifier value="unmarshaller" />
	    <property name="targetSource" ref="unmarshallerPoolTargetSource" />
	</bean>

</beans>
```
applicationContext-jaxb.xml文件放在/src/main/resources目录下即可。
constructor-arg节点配置的是由@XmlRootElement注解的xml根节点类路径，多个接口的情况下需要都配置上。
# <span id="inline-blue">JAXB优化</span>
JAXB.java
```java
package com.coship.usm.util;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.Date;

import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

import org.apache.log4j.Logger;

import com.coship.dhm.aaa.commons.exception.AAAException;
import com.coship.dhm.aaa.commons.util.StringUtil;


/**
 * JAXB工具类
 * 
 * @param <T>
 */
public class JAXBUtil<T extends Object>
{

    private final static String ENCODING = "UTF-8";

    public static final Logger log = Logger.getLogger(JAXBUtil.class);
    
    private static  Unmarshaller unmarshaller = (Unmarshaller) SpringContextUtil.getBean("unmarshaller");;

    private static  Marshaller marshaller = (Marshaller) SpringContextUtil.getBean("marshaller");;
    
    /**
     * @param <T> 
     * @param t 待转换为XML格式的对象
     * @return
     * @throws IepgRuntimeException 
     */
    public static  <T>   String jaxbBeanToStr(T t) throws AAAException
    {
        String xmlString = null;
        Date startTime = new Date();
        ByteArrayOutputStream outs = null;
        try
        {
            outs = new ByteArrayOutputStream();
            marshaller.setProperty(Marshaller.JAXB_ENCODING, ENCODING);// UTF-8
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            marshaller.marshal(t, outs);
            xmlString = new String(outs.toByteArray(), ENCODING);
        }
        catch (Exception e)
        {
            e.printStackTrace();
            log.error(e.getMessage(),e);
            throw new AAAException("405");
        }
        finally
        {
            try
            {
                if (outs != null)
                {
                    outs.flush();
                    outs.close();
                }
            }
            catch (Exception e1)
            {
            }
        }
        Date endTime = new Date();
        System.out.println("marshaller耗时："+(endTime.getTime()-startTime.getTime())+"ms");
        return xmlString;       
    }
    
    @SuppressWarnings("unchecked")
    public static  <T> T jaxbStreamToBean(Class<T> clazz, String requestXML) throws AAAException
    {
        
        T result = null;
        Date startTime = new Date();
        ByteArrayInputStream ins = null;
        try
        {	
                ins = new ByteArrayInputStream(requestXML.getBytes(ENCODING));
                // 输出流内容
                result = (T) unmarshaller.unmarshal(ins);// 编码问题再前面已经处理，只需要按JVM的编码处理即可   
        }
        catch (Exception ex)
        {
            log.error("JAXBUtil.jaxbStreamToBean(): Error parsing XML file, please check the sending message!", ex);
            throw new AAAException("405");
        }
        finally
        {
            try
            {
                if (ins != null)
                {
                    ins.close();
                }
            }
            catch (Throwable egnoreEx)
            {
            }
        }
        Date endTime = new Date();
        System.out.println("unmarshaller耗时："+(endTime.getTime()-startTime.getTime())+"ms");
        return result;
    }

    /**
     * 使用JAXB处理从Bean到流的过程，此方法供写XML使用
     * 
     * @param t
     *            包含内容的对象
     * @param outs
     *            一个干净的输出流，经过处理后，内容会注入到该流中
     * @throws IepgRuntimeException 
     * @throws JAXBException
     *             当包含内容的对象和JAXB模板class不匹配时抛出，实际此处不会抛出该异常
     */
    public static <T> void jaxbBeanToStream(T t, OutputStream outs) throws AAAException
    {

        if (t == null)
        {
            return;
        }
        try
        {
            String xmlString = jaxbBeanToStr(t);
            outs.write(xmlString.getBytes(ENCODING));

            log.info("\n==================================" + t.getClass().getName()
                    + "===返回结果=======================================\n" + xmlString);

        }
        catch (UnsupportedEncodingException e)
        {
            log.error(e.getMessage());
            e.printStackTrace();
        }
        catch (IOException e)
        {
            e.printStackTrace();
            log.error(e.getMessage());
        }
        finally
        {
            try
            {
                if (outs != null)
                {
                    //修改为非chunked格式响应
                    //outs.flush();
                    outs.close();
                }

            }
            catch (Throwable ex)
            {
            }
        }
    }

    

    public static <T> T jaxbStreamToBean(Class<T> clazz, InputStream inputStream) throws AAAException
    {
        String requestXML;
        try
        {
            requestXML = convertStreamToString(inputStream);

            if (log.isInfoEnabled())
            {
                log.info("---requestXML---" + requestXML);
            }
        }
        catch (Exception ex)
        {
            log.error("解析XML文件出错,请检查发送报文！", ex);
            throw new AAAException("405");
        }
        return jaxbStreamToBean(clazz, requestXML);
    }

    public static String convertStreamToString(InputStream is)
    {
        BufferedReader reader = null;
        try
        {
            reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
        }
        catch (UnsupportedEncodingException e1)
        {
            log.error("sendErrorMessage exception！", e1);
        }
        StringBuilder sb = new StringBuilder();

        String line = null;
        try
        {
            while ((line = reader.readLine()) != null)
            {
                sb.append(line + "\n");
            }
        }
        catch (IOException e)
        {
            e.printStackTrace();
        }
        finally
        {
            try
            {
                is.close();
            }
            catch (IOException e)
            {
                e.printStackTrace();
            }
        }

        return sb.toString();
    }

    // 下发错误码
    public static void sendErrorMessage(String errorCode, String errorMessage, OutputStream outs)
    {
        try
        {
            if (outs != null)
            {
                NavServerResponse navServerResponse = new NavServerResponse();
                if (StringUtil.isNil(errorCode) && StringUtil.isNil(errorMessage))
                {
                    errorCode = "-1";
                    errorMessage = "UNKNOWN_ERROR";
                }
                navServerResponse.setCode(errorCode);
                navServerResponse.setMessage(errorMessage);

                jaxbBeanToStream(navServerResponse, outs);

            }
        }
        catch (Exception e)
        {
        }
    }

    // 下发错误码
    public static void sendErrorMessage(Exception e, OutputStream outs)
    {
        if (outs != null)
        {
            String errorCode = null;
            String errorMessage = null;
            NavServerResponse navServerResponse = new NavServerResponse();
            if (e instanceof AAAException)
            {
                AAAException iepgRuntimeException = (AAAException) e;

                if (StringUtil.isNil(iepgRuntimeException.getErrCode()) && StringUtil.isNil(e.getMessage()))
                {
                    errorCode = "-1";
                    errorMessage = "UNKNOWN_ERROR";
                }
                else
                {
                    errorCode = iepgRuntimeException.getErrCode();
                    errorMessage = e.getMessage();
                }
                navServerResponse.setCode(errorCode);
                navServerResponse.setMessage(errorMessage);
            }
            try
            {
                jaxbBeanToStream(navServerResponse, outs);
            }
            catch (AAAException e1)
            {
                log.error("sendErrorMessage exception！", e1);
            }
        }
    }

}
```
SpringContextUtil.java
```java
package com.coship.usm.util;

import javax.xml.bind.Unmarshaller;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class SpringContextUtil
{
    private static class Holder
    {
        private static ClassPathXmlApplicationContext context;

        static
        {
            context = new ClassPathXmlApplicationContext("spring/*.xml");    
        }

    }

    public static ApplicationContext getInstance()
    {
        return Holder.context;
    }

    @SuppressWarnings("unchecked")
    public static <T> T getBean(String name)
    {
        return (T) Holder.context.getBean(name);
    }
    public static void main(String[] args)
    {
    	Unmarshaller unmarshaller =(Unmarshaller)  SpringContextUtil.getBean("unmarshaller");
        System.out.println(unmarshaller.toString());
    }
}

```

# <span id="inline-blue">验证</span>
JAXBTest.java
```java
package com.coship.usm.base;

import com.coship.usm.action.bean.request.RequestPlaylist;
import com.coship.usm.action.bean.response.PhysicalPlaylist;
import com.coship.usm.util.JAXBUtil;

public class JAXBTest {

	public static void main(String[] args) {
    	int num = 10;
    	for(int i=0;i<num;i++)
    	{
    		new Thread(new Runnable() {
				
				@Override
				public void run() {
					try 
					{
						RequestPlaylist requestPlaylist = new RequestPlaylist();
						requestPlaylist.setDeviceID("111");
						requestPlaylist.setPT("11");
						requestPlaylist.setSessionID("10");
						requestPlaylist.setSMName("name111");
						requestPlaylist.setUsage("50");
						JAXBUtil.jaxbBeanToStr(requestPlaylist);
						
						
				    	String requestXML = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\r\n" + 
				    			"<RequestPlaylist deviceID=\"111\" PT=\"11\" sessionID=\"111\" SMName=\"name111\" useage=\"50\"/>";
						
				    	JAXBUtil.jaxbStreamToBean(PhysicalPlaylist.class, requestXML);
				    	
					} catch (Exception e) {
						e.printStackTrace();
					}
					
				}
			}).start();		
    	}
	}

}

```
![JAXB性能优化验证](/images/JAXB/JAXB_20230421_002.png)

