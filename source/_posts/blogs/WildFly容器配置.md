---
title: WildFly容器配置
categories:
	- WildFly

date: 2022-08-26 13:55:20
tags: 
	- WildFly
	- Https
---
<!-- toc -->

# <span id="inline-blue">下载</span>
官网下载地址：https://www.wildfly.org/downloads/

容器版本：wildfly-26.1.0.Final

# <span id="inline-blue">目录说明</span>
appclient – application client 客户端
bin – 各种脚本的位置
docs – 各种文档信息和配置例子
domain – domain mode 的专门目录
standalone – standalone server 的专门目录
modules – server中的各种模块
welcome-content – 默认的欢迎页面
WildFly启动分为单机和域模式，启动脚本对应bin目录下standalone.sh和domain.sh

# <span id="inline-blue">模式说明</span>

 ## domain模式
	configuration – 配置文件目录
	content – Host Controller工作时候的内部区域
	lib – server运行时依赖的lib
	log – 日志目录
	tmp – 临时文件
	servers – 要部署的程序目录

	
 ## standalone模式
	configuration – 配置文件目录
	data – server运行时的持久化存储信息
	deployments – 要部署的程序目录
	lib – server运行时依赖的lib
	log – 日志目录
	tmp – 临时文件

# <span id="inline-blue">注册MySQL数据源模块驱动</span>
创建mysql模块依赖文件目录及相应文件内容
cd /usr/local/WildFly/modules/system/layers/base/com
#创建mysql模块所在目录
mkdir -p  mysql/main
cd mysql/main
#创建module.xml文件，内容如下：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--
  ~ JBoss, Home of Professional Open Source.
  ~ Copyright 2010, Red Hat, Inc., and individual contributors
  ~ as indicated by the @author tags. See the copyright.txt file in the
  ~ distribution for a full listing of individual contributors.
  ~
  ~ This is free software; you can redistribute it and/or modify it
  ~ under the terms of the GNU Lesser General Public License as
  ~ published by the Free Software Foundation; either version 2.1 of
  ~ the License, or (at your option) any later version.
  ~
  ~ This software is distributed in the hope that it will be useful,
  ~ but WITHOUT ANY WARRANTY; without even the implied warranty of
  ~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
  ~ Lesser General Public License for more details.
  ~
  ~ You should have received a copy of the GNU Lesser General Public
  ~ License along with this software; if not, write to the Free
  ~ Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
  ~ 02110-1301 USA, or see the FSF site: http://www.fsf.org.
  -->
<module name="com.mysql" xmlns="urn:jboss:module:1.9" >
	<properties>
        <property name="jboss.api" value="private"/>
    </properties>
	
     <resources>
          <resource-root path="mysql-connector-java-5.1.12.jar"/>
     </resources>
     <dependencies>
		  <module name="javax.api"/>
          <module name="javax.transaction.api"/>
		  <module name="javax.servlet.api" optional="true"/>
     </dependencies>
</module>
```

mysql 驱动jar包名称，根据项目可自行更改。
将mysql-connector-java-5.1.12.jar文件上传到目录/usr/local/WildFly/modules/system/layers/base/com/mysql/main

# <span id="inline-blue">配置项目JNDI数据源</span>
cd /usr/local/WildFly/standalone/configuration
vim standalone.xml
在datasources节点下新增如下内容:
```xml
<datasource jndi-name="java:/grm" pool-name="grm" statistics-enabled="true">
                    <connection-url>jdbc:mysql://10.9.212.55:3306/global_fj</connection-url>
                    <driver-class>com.mysql.jdbc.Driver</driver-class>
                    <connection-property name="databaseName">
                        global_fj
                    </connection-property>
                    <connection-property name="useUnicode">
                        true
                    </connection-property>
                    <connection-property name="characterEncoding">
                        utf8
                    </connection-property>
                    <driver>mysql</driver>
                    <pool>
                        <min-pool-size>30</min-pool-size>
                        <initial-pool-size>30</initial-pool-size>
                        <max-pool-size>50</max-pool-size>
                        <use-strict-min>false</use-strict-min>
                    </pool>
                    <security>
                        <user-name>root</user-name>
                        <password>coship</password>
                    </security>
                    <validation>
                        <valid-connection-checker class-name="org.jboss.jca.adapters.jdbc.extensions.mysql.MySQLValidConnectionChecker"/>
                        <check-valid-connection-sql>select 1 from dual</check-valid-connection-sql>
                        <validate-on-match>true</validate-on-match>
                        <exception-sorter class-name="org.jboss.jca.adapters.jdbc.extensions.mysql.MySQLExceptionSorter"/>
                    </validation>
                </datasource>
```
更改JDNI名称，连接池名称，数据库IP、数据库名称、用户名、密码
配置mysql驱动，在drivers节点下新增driver节点，内容如下 :
```xml
<driver name="mysql" module="com.mysql">
                        <driver-class>com.mysql.jdbc.Driver</driver-class>
                        <xa-datasource-class>com.mysql.jdbc.jdbc2.optional.MysqlXADataSource</xa-datasource-class>
                    </driver>

```
# <span id="inline-blue">开启外部主机访问</span>
Interfaces节点下修改配置如下：
```xml
<interfaces>
		<interface name="any">
            <any-address/>
        </interface>
        <interface name="management">
<any-address/>
        </interface>
        <interface name="public">
            <inet-address value="${jboss.bind.address:127.0.0.1}"/>
        </interface>
    </interfaces>
    <socket-binding-group name="standard-sockets" default-interface="any" port-offset="${jboss.socket.binding.port-offset:0}">
        <socket-binding name="ajp" port="${jboss.ajp.port:8009}"/>
        <socket-binding name="http" port="${jboss.http.port:8080}"/>
        <socket-binding name="https" port="${jboss.https.port:8443}"/>
        <socket-binding name="management-http" interface="management" port="${jboss.management.http.port:9990}"/>
        <socket-binding name="management-https" interface="management" port="${jboss.management.https.port:9993}"/>
        <socket-binding name="txn-recovery-environment" port="4712"/>
        <socket-binding name="txn-status-manager" port="4713"/>
        <outbound-socket-binding name="mail-smtp">
            <remote-destination host="${jboss.mail.server.host:localhost}" port="${jboss.mail.server.port:25}"/>
        </outbound-socket-binding>
    </socket-binding-group>

```
# <span id="inline-blue">配置SSL</span>
通过jdk工具keyTool生成证书
## 生成证书命令
```shell
cd  /home
keytool -genkey -alias coship  -keyalg RSA -keysize 2048 -validity 3650 -ext SAN=dns:www.grm.com,ip:10.9.216.12  -keystore /home/certificate.jks -storepass coshipOk698 -dname "CN=www.grm.com, OU=www.grm.com, O=www.grm.com, L=wuhan, ST=wuhan, C=cn"
```

## 导出证书命令
```shell
keytool -export -trustcacerts -alias coship -file /home/cas.crt -keystore /home/certificate.jks -storepass coshipOk698
```
## keyTool命令参数
-genkey      在用户主目录中创建一个默认文件".keystore",还会产生一个mykey的别名，mykey中包含用户的公钥、私钥和证书
(在没有指定生成位置的情况下,keystore会存在用户系统默认目录，如：对于window xp系统，会生成在系统的C:/Documents and Settings/UserName/文件名为“.keystore”)
-alias       产生别名
-keystore    指定密钥库的名称(产生的各类信息将不在.keystore文件中)
-keyalg      指定密钥的算法 (如 RSA  DSA（如果不指定默认采用DSA）)
-validity    指定创建的证书有效期多少天
-keysize     指定密钥长度
-storepass   指定密钥库的密码(获取keystore信息所需的密码)
-keypass     指定别名条目的密码(私钥的密码)
-dname       指定证书拥有者信息 例如：  "CN=名字与姓氏,OU=组织单位名称,O=组织名称,L=城市或区域名称,ST=州或省份名称,C=单位的两字母国家代码"
-list        显示密钥库中的证书信息      keytool -list -v -keystore 指定keystore -storepass 密码
-v           显示密钥库中的证书详细信息
-export      将别名指定的证书导出到文件  keytool -export -alias 需要导出的别名 -keystore 指定keystore -file 指定导出的证书位置及证书名称 -storepass 密码
-file        参数指定导出到文件的文件名
-delete      删除密钥库中某条目          keytool -delete -alias 指定需删除的别  -keystore 指定keystore  -storepass 密码
-printcert   查看导出的证书信息          keytool -printcert -file yushan.crt
-keypasswd   修改密钥库中指定条目口令    keytool -keypasswd -alias 需修改的别名 -keypass 旧密码 -new  新密码  -storepass keystore密码  -keystore sage
-storepasswd 修改keystore口令      keytool -storepasswd -keystore e:/yushan.keystore(需修改口令的keystore) -storepass 123456(原始密码) -new yushan(新密码)
-import      将已签名数字证书导入密钥库  keytool -import -alias 指定导入条目的别名 -keystore 指定keystore -file 需导入的证书

/home路径下生成两个文件certificate.jks、cas.crt，将certificate.jks文件拷贝至/usr/local/WildFly/standalone/configuration目录下，浏览器访问后台需要导入cas.crt证书文件（导入到受信任的根证书颁发机构）

# <span id="inline-blue">应用配置SSL</span>
cd /usr/local/GRM/WildFly/standalone/configuration/ 
standalone.xml文件tls节点更改如下：
```xml
<tls>
                <key-stores>
                    <key-store name="applicationKS">
                        <credential-reference clear-text="coshipOk698"/>
                        <implementation type="JKS"/>
                        <file path="certificate.jks" relative-to="jboss.server.config.dir"/>
                    </key-store>
                </key-stores>
                <key-managers>
                    <key-manager name="applicationKM" key-store="applicationKS" generate-self-signed-certificate-host="localhost">
                        <credential-reference clear-text="coshipOk698"/>
                    </key-manager>
                </key-managers>
                <server-ssl-contexts>
                    <server-ssl-context name="applicationSSC" key-manager="applicationKM"/>
                </server-ssl-contexts>
            </tls>
```
# <span id="inline-blue">管理后台配置SSL</span>
cd /usr/local/GRM/WildFly/standalone/configuration/ standalone.xml文件management-interfaces节点更新内容如下：
```xml
<management-interfaces>
            <http-interface http-authentication-factory="management-http-authentication" ssl-context="applicationSSC">
                <http-upgrade enabled="true" sasl-authentication-factory="management-sasl-authentication"/>
                <socket-binding http="management-http" https="management-https"/>
            </http-interface>
        </management-interfaces>
```
# <span id="inline-blue">添加管理员</span>
cd /usr/local/GRM/WildFly/bin
 sh add-user.sh
```shell

What type of user do you wish to add? 
 a) Management User (mgmt-users.properties) //管理域用户
 b) Application User (application-users.properties) //应用程序域用户（目前没有使用）
(a): a

Enter the details of the new user to add. //设置用户名
Using realm 'ManagementRealm' as discovered from the existing property files.
Username : system
Password recommendations are listed below. To modify these restrictions edit the add-user.properties configuration file.
 - The password should be different from the username
 - The password should not be one of the following restricted values {root, admin, administrator}
 - The password should contain at least 8 characters, 1 alphabetic character(s), 1 digit(s), 1 non-alphanumeric symbol(s)//密码要求至少长度为8位，至少包含一个字母、一个数字、一个特殊字符
Password : 
Re-enter Password : 
What groups do you want this user to belong to? (Please enter a comma separated list, or leave blank for none)[  ]: 
About to add user 'system' for realm 'ManagementRealm'
Is this correct yes/no? y //添加在管理控制域
Added user 'system' to file '/usr/local/GRM/WildFly/standalone/configuration/mgmt-users.properties'
Added user 'system' to file '/usr/local/GRM/WildFly/domain/configuration/mgmt-users.properties'
Added user 'system' with groups  to file '/usr/local/GRM/WildFly/standalone/configuration/mgmt-groups.properties'
Added user 'system' with groups  to file '/usr/local/GRM/WildFly/domain/configuration/mgmt-groups.properties'
Is this new user going to be used for one AS process to connect to another AS process? 
e.g. for a slave host controller connecting to the master or for a Remoting connection for server to server Jakarta Enterprise Beans calls
.yes/no? no //不需要主从模式设置为no
```

默认管理员添加完成后，重启即可通过管理员访问管理后台。

# <span id="inline-blue">验证</span>
SSL配置完成后
服务器配置域名：
新增条目 10.9.216.12 www.grm.com
vim /etc/hosts  
```shell

127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4 12.erm.com
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
10.9.212.49 1.erm.com
140.82.113.3 github.com
10.9.216.12 www.grm.com
```
Windows客户端域名配置：
新增条目 10.9.216.12 www.grm.com
vim C:\Windows\System32\drivers\etc\hosts
```shell
#GitHub  start
#192.30.255.112 github.com


#202.160.130.66 github.global.ssl.fastly.net
#Github end
185.199.108.153 vanishke.github.io
185.199.109.153 vanishke.github.io
185.199.110.153 vanishke.github.io
185.199.111.153 vanishke.github.io
140.82.113.3 github.com
185.199.108.153 eclipse-jetty.github.io
185.199.108.153 xzer.github.io
140.82.112.4 github.com
104.21.50.214 www.onlinedoctranslator.com127.0.0.1       activate.navicat.com
162.159.152.4 medium.com
10.9.216.12 www.grm.com
```

## Google浏览器导入证书
谷歌浏览器访问chrome://settings/privacy
![导入证书](/images/WildFly/WildFly_2022_08_26_001.png)

启动WildFly
cd /usr/local/GRM/WildFly/bin
sh standalone.xml & 

访问WildFly管理后台

https://www.grm.com:9993/console/index.html
![WildFly容器配置](/images/WildFly/WildFly_2022_08_26_002.png)

