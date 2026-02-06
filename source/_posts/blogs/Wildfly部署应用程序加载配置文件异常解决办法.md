---
title: WildFly部署应用程序加载配置文件异常解决办法
categories: 
	- WildFly
tags: 
	- WildFly
	- Java
	
date: 2025-12-05 16:12:27
updated: 2025-12-05 16:12:27
---
<!-- toc -->

# <span id="inline-blue">背景</span>

项目模块升级为spring-4.3.20+JDK8之后，之前部署模块应用程序容器jboss-4.2.3已经不再兼容，需要对容器进行升级，综合考虑之下，选择wildfly-26.1.0-Final作为部署容器。

# <span id="inline-blue">环境</span>

JDK： 1.8
Spring: 4.3.20.RELEASE
WildFly: 26.1.0-Final

# <span id="inline-blue">现象</span>

WildFly部署应用程序启动加载出现如下报错信息：

```shell
2025-12-04 14:05:11,021 INFO  [com.xxx.istore.shelfmanager.task.ThridSignStatusCheckTask] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) signStatusCheck start###
2025-12-04 14:05:11,028 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,029 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) java.io.FileNotFoundException: /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties (没有那个文件或目录)
2025-12-04 14:05:11,031 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at java.io.FileInputStream.open0(Native Method)
2025-12-04 14:05:11,031 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at java.io.FileInputStream.open(FileInputStream.java:195)
2025-12-04 14:05:11,032 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at java.io.FileInputStream.<init>(FileInputStream.java:138)
2025-12-04 14:05:11,033 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at java.io.FileInputStream.<init>(FileInputStream.java:93)
2025-12-04 14:05:11,033 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at com.xxx.istore.common.SysConfigManager.<init>(SysConfigManager.java:106)
2025-12-04 14:05:11,034 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at com.xxx.istore.common.SysConfigManager.getInstance(SysConfigManager.java:38)
2025-12-04 14:05:11,034 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at com.xxx.istore.shelfmanager.common.AppConstants.<clinit>(AppConstants.java:19)
2025-12-04 14:05:11,035 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at com.xxx.istore.shelfmanager.task.ThridSignStatusCheckTask.signStatusCheck(ThridSignStatusCheckTask.java:66)
2025-12-04 14:05:11,035 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
2025-12-04 14:05:11,036 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
2025-12-04 14:05:11,037 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
2025-12-04 14:05:11,037 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at java.lang.reflect.Method.invoke(Method.java:498)
2025-12-04 14:05:11,038 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at org.springframework.util.MethodInvoker.invoke(MethodInvoker.java:273)
2025-12-04 14:05:11,038 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean$MethodInvokingJob.executeInternal(MethodInvokingJobDetailFactoryBean.java:311)
2025-12-04 14:05:11,039 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at org.springframework.scheduling.quartz.QuartzJobBean.execute(QuartzJobBean.java:113)
2025-12-04 14:05:11,039 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at org.quartz.core.JobRunShell.run(JobRunShell.java:202)
2025-12-04 14:05:11,040 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1)  at org.quartz.simpl.SimpleThreadPool$WorkerThread.run(SimpleThreadPool.java:573)
2025-12-04 14:05:11,041 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,041 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,042 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,042 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,043 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,043 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,044 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,044 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,045 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,045 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,046 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,046 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,047 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,047 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,048 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,049 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,049 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,050 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,050 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,051 ERROR [stderr] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) /home/istore/wildfly26-istore/modules/system/layers/base/org/jboss/as/ejb3/main/timers/conf/conf.properties file does not exist!
2025-12-04 14:05:11,052 ERROR [org.quartz.core.JobRunShell] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) Job DEFAULT.thridSignStatusSyncTask threw an unhandled Exception: : org.springframework.scheduling.quartz.JobMethodInvocationFailedException: Invocation of method 'signStatusCheck' on target class [class com.xxx.istore.shelfmanager.task.ThridSignStatusCheckTask] failed; nested exception is java.lang.ExceptionInInitializerError
        at org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean$MethodInvokingJob.executeInternal(MethodInvokingJobDetailFactoryBean.java:320)
        at org.springframework.scheduling.quartz.QuartzJobBean.execute(QuartzJobBean.java:113)
        at org.quartz.core.JobRunShell.run(JobRunShell.java:202)
        at org.quartz.simpl.SimpleThreadPool$WorkerThread.run(SimpleThreadPool.java:573)
Caused by: java.lang.ExceptionInInitializerError
        at com.xxx.istore.shelfmanager.task.ThridSignStatusCheckTask.signStatusCheck(ThridSignStatusCheckTask.java:66)
        at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
        at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
        at java.lang.reflect.Method.invoke(Method.java:498)
        at org.springframework.util.MethodInvoker.invoke(MethodInvoker.java:273)
        at org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean$MethodInvokingJob.executeInternal(MethodInvokingJobDetailFactoryBean.java:311)
        ... 3 more
Caused by: java.lang.NullPointerException
        at com.xxx.istore.shelfmanager.common.AppConstants.<clinit>(AppConstants.java:251)
        ... 10 more

2025-12-04 14:05:11,060 ERROR [org.quartz.core.ErrorLogger] (org.springframework.scheduling.quartz.SchedulerFactoryBean#0_Worker-1) Job (DEFAULT.thridSignStatusSyncTask threw an exception.: org.quartz.SchedulerException: Job threw an unhandled exception. [See nested exception: org.springframework.scheduling.quartz.JobMethodInvocationFailedException: Invocation of method 'signStatusCheck' on target class [class com.xxx.istore.shelfmanager.task.ThridSignStatusCheckTask] failed; nested exception is java.lang.ExceptionInInitializerError]
        at org.quartz.core.JobRunShell.run(JobRunShell.java:213)
        at org.quartz.simpl.SimpleThreadPool$WorkerThread.run(SimpleThreadPool.java:573)
Caused by: org.springframework.scheduling.quartz.JobMethodInvocationFailedException: Invocation of method 'signStatusCheck' on target class [class com.xxx.istore.shelfmanager.task.ThridSignStatusCheckTask] failed; nested exception is java.lang.ExceptionInInitializerError
        at org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean$MethodInvokingJob.executeInternal(MethodInvokingJobDetailFactoryBean.java:320)
        at org.springframework.scheduling.quartz.QuartzJobBean.execute(QuartzJobBean.java:113)
        at org.quartz.core.JobRunShell.run(JobRunShell.java:202)
        ... 1 more
Caused by: java.lang.ExceptionInInitializerError
        at com.xxx.istore.shelfmanager.task.ThridSignStatusCheckTask.signStatusCheck(ThridSignStatusCheckTask.java:66)
        at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
        at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
        at java.lang.reflect.Method.invoke(Method.java:498)
        at org.springframework.util.MethodInvoker.invoke(MethodInvoker.java:273)
        at org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean$MethodInvokingJob.executeInternal(MethodInvokingJobDetailFactoryBean.java:311)
        ... 3 more
Caused by: java.lang.NullPointerException
        at com.xxx.istore.shelfmanager.common.AppConstants.<clinit>(AppConstants.java:251)
        ... 10 more
```

# <span id="inline-blue">问题原因</span>

应用启动加载配置的正确的逻辑是加载wildfly部署应用程序所在class目录下的conf.properties配置文件，从实际的错误信息看加载的路径是wildfly自身modules依赖下目录，加载读取conf.properties配置的代码如下：

```java
package com.xxx.istore.common;

import java.io.File;
import java.io.FileInputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Properties;

public class SysConfigManager {

	private static SysConfigManager m_instance;

	private static final String SYSTEM_CONFIG_FILE_NAME = "conf.properties";
	private static String PFILE = getAbsApplicationPath() + "conf"
			+ File.separator + SYSTEM_CONFIG_FILE_NAME;

	private File m_file = null;

	// 上次加载时间戳
	private long m_lastModifiedTime = 0;
	private static Properties m_props = null;


	synchronized public static SysConfigManager getInstance() {
		if (m_instance == null) {
			m_instance = new SysConfigManager();
		}
		return m_instance;
	}

	public String getInfoMessage(String errorCode) {
		return getConfigItem(errorCode, m_props);
	}


	public List getMessageList() {
		List list = new ArrayList();
		for (Enumeration<Object> e = m_props.keys(); e.hasMoreElements();) {
			list.add(e.nextElement().toString());
		}
		return list;
	}

	public String getValueByKey(String value) {
		String result = "";
		List list = SysConfigManager.getInstance().getMessageList();
		for (int i = 0; i < list.size(); i++) {
			String temp = list.get(i).toString();
			if (value.contains(temp)) {
				result = SysConfigManager.getInstance()
						.getConfigItem(temp, "");
				break;
			}

		}
		return result;
	}

	/**
	 * 默认构造方法
	 */
	private SysConfigManager() {
		m_file = new File(PFILE);
		m_lastModifiedTime = m_file.lastModified();

		if (m_lastModifiedTime == 0) {
			System.err.println(PFILE + " file does not exist!");
		}

		m_props = new Properties();

		try {
			m_props.load(new FileInputStream(PFILE));

		} catch (Exception e) {
			e.printStackTrace();
		}
	}


	final public String getConfigItem(String name, Object defaultVal) {
		long newTime = m_file.lastModified();
		if (newTime == 0) {
			if (m_lastModifiedTime == 0) {
				System.err.println(PFILE + " file does not exist!");
			} else {
				System.err.println(PFILE + " file was deleted!!");
			}
			return null;
		} else if (newTime > m_lastModifiedTime) {
			m_props.clear();
			try {
				m_props.load(new FileInputStream(PFILE));
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		m_lastModifiedTime = newTime;

		String val = m_props.getProperty(name);
		if (val == null) {
			return null;
		} else {
			return val;
		}
	}

	/**
	 * 获取当前绝对路径
	 * 
	 * @return
	 */
	public static String getAbsApplicationPath() {
		String path = SystemConfig.class.getClassLoader().getResource("")
				.getPath();
		try {
			path = URLDecoder.decode(path, "utf-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		path = path
				.replaceAll("/", "\\" + System.getProperty("file.separator"));
		if (System.getProperty("file.separator").equals("\\"))// windows
			path = path.substring(1);
		return path;
	}

	public static void main(String[] args) {
		System.out.println(SysConfigManager.getAbsApplicationPath());
	}
}

```

结合代码分析问题原因就是SystemConfig.class.getClassLoader().getResource("")调用没有获取到正确的资源文件的根路径，而是去wildfly自身的modules依赖下去读取对应的配置文件，导致加载异常

# <span id="inline-blue">解决办法</span>


更改资源文件的读取方式，优化后加载配置文件的代码内容如下：

```java
package com.xxx.istore.common;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Properties;

import org.apache.log4j.Logger;

public class SysConfigManager {
	
	private static final Logger logger = Logger.getLogger(SysConfigManager.class);

	private static SysConfigManager m_instance;

	private static final String SYSTEM_CONFIG_FILE_NAME = "conf.properties";
	private static String PFILE = File.separator + "conf"
			+ File.separator + SYSTEM_CONFIG_FILE_NAME;

	private File m_file = null;
	public static InputStream is;

	// 上次加载时间戳
	private long m_lastModifiedTime = 0;
	private static Properties config = null;


	synchronized public static SysConfigManager getInstance() {
		if (m_instance == null) {
			m_instance = new SysConfigManager();
		}
		return m_instance;
	}

	public String getInfoMessage(String errorCode) {
		return getConfigItem(errorCode, config);
	}

	public List getMessageList() {
		List list = new ArrayList();
		for (Enumeration<Object> e = config.keys(); e.hasMoreElements();) {
			list.add(e.nextElement().toString());
		}
		return list;
	}

	public String getValueByKey(String value) {
		String result = "";
		List list = SysConfigManager.getInstance().getMessageList();
		for (int i = 0; i < list.size(); i++) {
			String temp = list.get(i).toString();
			if (value.contains(temp)) {
				result = SysConfigManager.getInstance()
						.getConfigItem(temp, "");
				break;
			}

		}
		return result;
	}

	/**
	 * 默认构造方法
	 */
	private SysConfigManager() {
		
	try {
		m_file = ResourcesUtil.getResourceAsFile(PFILE);
		m_lastModifiedTime = m_file.lastModified();

		if (m_lastModifiedTime == 0) {
			System.err.println(PFILE + " file does not exist!");
		}

		config = new Properties();

		
			config.load(new FileInputStream(m_file));

		} catch (Exception e) {
			logger.error("load conf.properties error", e); 
		}
	}


	final public String getConfigItem(String name, Object defaultVal) {
		long newTime = m_file.lastModified();
		if (newTime == 0) {
			if (m_lastModifiedTime == 0) {
				System.err.println(PFILE + " file does not exist!");
			} else {
				System.err.println(PFILE + " file was deleted!!");
			}
			return null;
		} else if (newTime > m_lastModifiedTime) {
			config.clear();
			try {
				config.load(ResourcesUtil.getResourceAsStream(PFILE));
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		m_lastModifiedTime = newTime;

		String val = config.getProperty(name);
		if (val == null) {
			return null;
		} else {
			return val;
		}
	}

	/**
	 * 获取当前绝对路径
	 * 
	 * @return
	 */
	public static String getAbsApplicationPath() {
		String path = "";
		try {
			path = ResourcesUtil.getResourceAsFile("").getAbsolutePath();
			path = URLDecoder.decode(path, "utf-8");
		} catch (IOException  e) {
			e.printStackTrace();
		} 
		path = path.replaceAll("/", "\\" + System.getProperty("file.separator"));
		if (System.getProperty("file.separator").equals("\\"))
		{
			path = path.substring(1);
		}	
		return path;
	}

	public static void main(String[] args) {
		try {
			System.out.println(ResourcesUtil.getResourceAsFile("").getAbsolutePath());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}

```

上述实现需要依赖ResourcesUtil工具类，对应代码如下：

```java
package com.xxx.istore.common;

import java.io.*;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.Charset;
import java.util.Properties;

public class ResourcesUtil extends Object {

	private static ClassLoader defaultClassLoader;
	/**
	 * Charset to use when calling getResourceAsReader. null means use the
	 * system default.
	 */
	private static Charset charset;

	private ResourcesUtil() {
	}

	/**
	 * Returns the default classloader (may be null).
	 * 
	 * @return The default classloader
	 */
	public static ClassLoader getDefaultClassLoader() {
		return defaultClassLoader;
	}

	/**
	 * Sets the default classloader
	 * 
	 * @param defaultClassLoader
	 *            - the new default ClassLoader
	 */
	public static void setDefaultClassLoader(ClassLoader defaultClassLoader) {
		ResourcesUtil.defaultClassLoader = defaultClassLoader;
	}

	/**
	 * Returns the URL of the resource on the classpath
	 * 
	 * @param resource
	 *            The resource to find
	 * @return The resource
	 * @throws IOException
	 *             If the resource cannot be found or read
	 */
	public static URL getResourceURL(String resource) throws IOException {
		return getResourceURL(getClassLoader(), resource);
	}

	/**
	 * Returns the URL of the resource on the classpath
	 * 
	 * @param loader
	 *            The classloader used to load the resource
	 * @param resource
	 *            The resource to find
	 * @return The resource
	 * @throws IOException
	 *             If the resource cannot be found or read
	 */
	public static URL getResourceURL(ClassLoader loader, String resource)
			throws IOException {
		URL url = null;
		if (loader != null) {
			url = loader.getResource(resource);
		}
		if (url == null) {
			url = ClassLoader.getSystemResource(resource);
		}
		if (url == null) {
			throw new IOException("Could not find resource " + resource);
		}
		return url;
	}

	/**
	 * Returns a resource on the classpath as a Stream object
	 * 
	 * @param resource
	 *            The resource to find
	 * @return The resource
	 * @throws IOException
	 *             If the resource cannot be found or read
	 */
	public static InputStream getResourceAsStream(String resource)
			throws IOException {
		return getResourceAsStream(getClassLoader(), resource);
	}

	/**
	 * Returns a resource on the classpath as a Stream object
	 * 
	 * @param loader
	 *            The classloader used to load the resource
	 * @param resource
	 *            The resource to find
	 * @return The resource
	 * @throws IOException
	 *             If the resource cannot be found or read
	 */
	public static InputStream getResourceAsStream(ClassLoader loader,
			String resource) throws IOException {
		InputStream in = null;
		if (loader != null) {
			in = loader.getResourceAsStream(resource);
		}
		if (in == null) {
			in = ClassLoader.getSystemResourceAsStream(resource);
		}
		if (in == null) {
			throw new IOException("Could not find resource " + resource);
		}
		return in;
	}

	/**
	 * Returns a resource on the classpath as a Properties object
	 * 
	 * @param resource
	 *            The resource to find
	 * @return The resource
	 * @throws IOException
	 *             If the resource cannot be found or read
	 */
	public static Properties getResourceAsProperties(String resource)
			throws IOException {
		Properties props = new Properties();
		InputStream in = null;
		String propfile = resource;
		in = getResourceAsStream(propfile);
		props.load(in);
		in.close();
		return props;
	}

	/**
	 * Returns a resource on the classpath as a Properties object
	 * 
	 * @param loader
	 *            The classloader used to load the resource
	 * @param resource
	 *            The resource to find
	 * @return The resource
	 * @throws IOException
	 *             If the resource cannot be found or read
	 */
	public static Properties getResourceAsProperties(ClassLoader loader,
			String resource) throws IOException {
		Properties props = new Properties();
		InputStream in = null;
		String propfile = resource;
		in = getResourceAsStream(loader, propfile);
		props.load(in);
		in.close();
		return props;
	}

	/**
	 * Returns a resource on the classpath as a Reader object
	 * 
	 * @param resource
	 *            The resource to find
	 * @return The resource
	 * @throws IOException
	 *             If the resource cannot be found or read
	 */
	public static Reader getResourceAsReader(String resource)
			throws IOException {
		Reader reader;
		if (charset == null) {
			reader = new InputStreamReader(getResourceAsStream(resource));
		} else {
			reader = new InputStreamReader(getResourceAsStream(resource),
					charset);
		}

		return reader;
	}

	/**
	 * Returns a resource on the classpath as a Reader object
	 * 
	 * @param loader
	 *            The classloader used to load the resource
	 * @param resource
	 *            The resource to find
	 * @return The resource
	 * @throws IOException
	 *             If the resource cannot be found or read
	 */
	public static Reader getResourceAsReader(ClassLoader loader, String resource)
			throws IOException {
		Reader reader;
		if (charset == null) {
			reader = new InputStreamReader(
					getResourceAsStream(loader, resource));
		} else {
			reader = new InputStreamReader(
					getResourceAsStream(loader, resource), charset);
		}

		return reader;
	}

	/**
	 * Returns a resource on the classpath as a File object
	 * 
	 * @param resource
	 *            The resource to find
	 * @return The resource
	 * @throws IOException
	 *             If the resource cannot be found or read
	 */
	public static File getResourceAsFile(String resource) throws IOException {
		return new File(getResourceURL(resource).getFile());
	}

	/**
	 * Returns a resource on the classpath as a File object
	 * 
	 * @param loader
	 *            - the classloader used to load the resource
	 * @param resource
	 *            - the resource to find
	 * @return The resource
	 * @throws IOException
	 *             If the resource cannot be found or read
	 */
	public static File getResourceAsFile(ClassLoader loader, String resource)
			throws IOException {
		return new File(getResourceURL(loader, resource).getFile());
	}

	/**
	 * Gets a URL as an input stream
	 * 
	 * @param urlString
	 *            - the URL to get
	 * @return An input stream with the data from the URL
	 * @throws IOException
	 *             If the resource cannot be found or read
	 */
	public static InputStream getUrlAsStream(String urlString)
			throws IOException {
		URL url = new URL(urlString);
		URLConnection conn = url.openConnection();
		return conn.getInputStream();
	}

	/**
	 * Gets a URL as a Reader
	 * 
	 * @param urlString
	 *            - the URL to get
	 * @return A Reader with the data from the URL
	 * @throws IOException
	 *             If the resource cannot be found or read
	 */
	public static Reader getUrlAsReader(String urlString) throws IOException {
		return new InputStreamReader(getUrlAsStream(urlString));
	}

	/**
	 * Gets a URL as a Properties object
	 * 
	 * @param urlString
	 *            - the URL to get
	 * @return A Properties object with the data from the URL
	 * @throws IOException
	 *             If the resource cannot be found or read
	 */
	public static Properties getUrlAsProperties(String urlString)
			throws IOException {
		Properties props = new Properties();
		InputStream in = null;
		String propfile = urlString;
		in = getUrlAsStream(propfile);
		props.load(in);
		in.close();
		return props;
	}

	/**
	 * Loads a class
	 * 
	 * @param className
	 *            - the class to load
	 * @return The loaded class
	 * @throws ClassNotFoundException
	 *             If the class cannot be found (duh!)
	 */
	public static Class classForName(String className)
			throws ClassNotFoundException {
		Class clazz = null;
		try {
			clazz = getClassLoader().loadClass(className);
		} catch (Exception e) {
			e.printStackTrace();
		}
		if (clazz == null) {
			clazz = Class.forName(className);
		}
		return clazz;
	}

	private static ClassLoader getClassLoader() {
		if (defaultClassLoader != null) {
			return defaultClassLoader;
		} else {
			return Thread.currentThread().getContextClassLoader();
		}
	}

	public static Charset getCharset() {
		return charset;
	}

	/**
	 * Use this method to set the Charset to be used when calling the
	 * getResourceAsReader methods. This will allow iBATIS to function properly
	 * when the system default encoding doesn't deal well with unicode
	 * (IBATIS-340, IBATIS-349)
	 * 
	 * @param charset
	 */
	public static void setCharset(Charset charset) {
		ResourcesUtil.charset = charset;
	}
}

```
