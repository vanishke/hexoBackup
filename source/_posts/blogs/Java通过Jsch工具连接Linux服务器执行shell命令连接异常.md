---
title: Java通过Jsch工具连接Linux服务器执行shell命令连接异常
categories:
	- Java

date: 2023-11-22 17:55:20
tags: 
	- Java
---
<!-- toc -->

# <span id="inline-blue">环境</span>
Linux: Red Hat Enterprise Linux Server release 6.8 (Santiago)
Java： 1.8.0_31
# <span id="inline-blue">背景</span>
JavaWeb项目后台管理nginx所在IP、端口、用户名、密码，后台管理页面通过页面定时请求nginx服务器端口连接数，nginx服务启动成功后发现页面一直显示连接异常，浏览器F12条件下查看接口返回结果，发现数据对应nginx状态值错误，接口请求返回需要10秒钟左右。
Jsch工具包连接Linux服务器的情况下，执行的shell命令如下：
```shell
lsof -i:8088 | grep nginx | wc -l
```
通过xshell登陆服务器执行命令的情况下，连接数统计正常。
Jsch工具类实现如下：
```Java
package com.flysee.version.service;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.Properties;

import org.apache.commons.io.IOUtils;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.ChannelShell;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;

public class ShellService {
	
	/**
	 * 执行命令
	 */
	public static void runCommand(Session session, String command, OutputStream out, InfoDecorator decorator,int timeout) throws Exception {
		long timeStart = System.currentTimeMillis();
		ChannelExec channel = (ChannelExec)session.openChannel("exec");		
		decorator.command(out, command);
		channel.setCommand(command);
		channel.connect();
			
		ByteArrayOutputStream errOut = new ByteArrayOutputStream();
		channel.setErrStream(errOut);
		InputStream in = channel.getInputStream();  
		BufferedReader reader = new BufferedReader(new InputStreamReader(in, "UTF-8"));  
		String line = null;
		Writer writer = new OutputStreamWriter(out, "UTF-8");
		while ((line = reader.readLine()) != null) {  
			line = decorator == null ? line : decorator.line(line);
			writer.write(line);
			writer.flush();
			if(System.currentTimeMillis()>timeStart+timeout){//超时
				break;
			}
		}
		in.close();
		if(decorator != null && errOut.toByteArray().length > 0){
			decorator.error(out, new String(errOut.toByteArray(), "UTF-8"));
		}
		
        channel.disconnect();
	}
	
	/**
	 * 执行命令
	 */
	public static void runCommand(Session session, String command, OutputStream out, InfoDecorator decorator) throws Exception {
		ChannelExec channel = (ChannelExec)session.openChannel("exec");		
		decorator.command(out, command);
		channel.setCommand(command);
		channel.connect();
			
		ByteArrayOutputStream errOut = new ByteArrayOutputStream();
		channel.setErrStream(errOut);
		InputStream in = channel.getInputStream();  
		BufferedReader reader = new BufferedReader(new InputStreamReader(in, "UTF-8"));  
		String line = null;
		Writer writer = new OutputStreamWriter(out, "UTF-8");
		while ((line = reader.readLine()) != null) {  
			line = decorator == null ? line : decorator.line(line);
			writer.write(line);
			writer.flush();
		}
		in.close();
		if(decorator != null && errOut.toByteArray().length > 0){
			decorator.error(out, new String(errOut.toByteArray(), "UTF-8"));
		}
		
        channel.disconnect();
	}
	
	public static void runShell(Session session, String command, OutputStream out, String[] returnKeyWords, 
			InfoDecorator decorator) throws Exception {
		ChannelShell channel = (ChannelShell)session.openChannel("shell");		
		channel.connect();
		OutputStream output = channel.getOutputStream();
		decorator.command(out, command);
		output.write((command + "\n").getBytes());
		output.flush();			
			
		InputStream in = channel.getInputStream();  
		BufferedReader reader = new BufferedReader(new InputStreamReader(in, "UTF-8"));  
		String line = null;  
		Writer writer = new OutputStreamWriter(out, "UTF-8");
		while ((line = reader.readLine()) != null) {  
			line = decorator == null ? line : decorator.line(line);
			writer.write(line);
			writer.flush();
			for(String returnKeyWord :returnKeyWords){
				if(line.indexOf(returnKeyWord) > -1){
					in.close();
					channel.disconnect();
					return;
				}
			}
		}
	}
	
	public static void uploadFile(Session session, File sourceFile, String dst) throws Exception{
		ChannelSftp  channel = (ChannelSftp)session.openChannel("sftp");		
		channel.connect();
		channel.cd(dst);
		OutputStream output = channel.put(sourceFile.getName());
		InputStream input = new FileInputStream(sourceFile);
		IOUtils.copy(input, output);
		input.close();
        output.close();
        channel.disconnect();
	}
	
	public static void uploadFile(Session session, String source, String dst) throws Exception{
		File sourceFile = new File(source);
		uploadFile(session, sourceFile, dst);
	}

	/**
	 * 创建会话
	 */
	public static Session createSession(String ip, String name, String password, int port) throws Exception{
		JSch jsch = new JSch();
		Session session = jsch.getSession(name, ip, port);
		session.setPassword(password);
		Properties config = new Properties();  
		config.put("StrictHostKeyChecking", "no");  
		session.setConfig(config);  
		session.connect();
		return session;
	}

	public static interface InfoDecorator{
		public void tip(OutputStream out, String tip) throws Exception;
		public void command (OutputStream out, String command)  throws Exception;
		public void error (OutputStream out, String error)  throws Exception;
		public String line(String line)  throws Exception;
		public void style(OutputStream out)  throws Exception;
	}
}
```
其中主要调用了runCommand方法实现执行shell命令，后台页面日志没有输出异常信息。
并且同样的应用程序部署到其他服务器是正常的，所以大概是由于服务器的原因造成的。

# <span id="inline-blue">问题排查思路</span>
页面提示nginx连接异常，做出以下尝试
1、将nginx服务移动到应用程序所在服务器，问题依然存在。
2、删除已有nginx连接配置信息，重新配置，问题依然存在。
3、检查服务器系统版本、JDK版本与正常版本差异，发现并无差异。
4、发现后台管理有配置域名,nginx请求代理有使用域名，猜测可能是由于域名解析导致。

# <span id="inline-blue">原因</span>
应用程序所在服务器配置了错误的域名解析，导致每次请求都要经过错误的域名解析，导致请求超时。
配置文件所在路径： /etc/resolv.conf
![域名解析配置](/images/Java/Java_20231122_001.png)

/etc/resolv.conf 中的两个配置项 search 和 options ndots 的意义：
search 代表域名搜索顺序
options：选项      ndots ：代表域名中点号.(dot)的个数
如下配置：
```shell
search openstacklocal novalocal
nameserver 10.26.0.3
options ndots:3
```
说明：当给定的域名不是 FQDN（完全限定名），并且域名中的 "." 数量小于ndots 5个，将按照 search 的顺序进行解析。
FQDN：ik.com. 这种形式的就是完全限定名，ik.com不是完全限定名
当访问 ik.com 的时候 因为只有 3 个点，少于 ndots 的数量，那么解析将会按照如下顺序进行：
```shell
ik.com.openstacklocal
ik.com.novalocal
ik.com
```
参考连接：https://cloud.tencent.com/developer/article/2267366