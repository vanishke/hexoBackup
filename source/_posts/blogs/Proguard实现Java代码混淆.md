---
title: Proguard实现Java代码混淆
categories:
	- Proguard
tags: 
	- Proguard
	- Java

date: 2025-11-21 17:42:45
updated: 2025-11-21 17:42:45
---
<!-- toc -->

# <span id="inline-blue">背景</span>

项目因为业务上的原因需要对模块部分源代码实现混淆，以下实现借助proguard实现java代码混淆。

# <span id="inline-blue">ProGuard</span>

ProGuard是一个免费的Java类文件收缩，优化，混淆和预校验器。
它可以检测并删除未使用的类，字段，方法和属性。它可以优化字节码，并删除未使用的指令。
它可以将类、字段和方法使用短无意义的名称进行重命名。
最后，预校验的Java6或针对Java MicroEdition的所述处理后的码。 
如果开启了混淆，Proguard默认情况下会对所有代码，包括第三方包都进行混淆，可是有些代码或者第三方包是不能混淆的，这就需要我们手动编写混淆规则来保持不能被混淆的部分。

# <span id="inline-blue">实现</span>

maven项目引入proguard混淆插件,实现针对com.test.common.service包目录下的源代码实现混淆，排除类中特定的方法和变量

```xml
			<plugin>
				<groupId>com.github.wvengen</groupId>
				<artifactId>proguard-maven-plugin</artifactId>
				<version>${proguard.plugin.version}</version>
				<executions>
					<execution>
						<phase>package</phase>
						<goals><goal>proguard</goal></goals>
					</execution>
				</executions>
				<configuration>
					<proguardVersion>${proguard.core.version}</proguardVersion>
					<injar>${project.build.finalName}-original.jar</injar> <!-- 输入严格过滤后的原始Jar -->
					<outjar>${project.build.finalName}.jar</outjar> <!-- 输出混淆后的Jar -->

					<!-- 依赖JAR配置（供ProGuard解析类关系） -->
					<libs>
						<!-- Include main JAVA library required.-->
						<lib>${java.home}/lib/rt.jar</lib>
						<!-- Include crypto JAVA library if necessary.-->
						<lib>${java.home}/lib/jce.jar</lib>
						<lib>${project.basedir}/lib</lib>
					</libs>

					<!-- 核心混淆规则（用CDATA包裹，避免XML解析错误） -->
					<options>
						<!-- 1. 保留包路径 -->
						<option><![CDATA[-keeppackagenames com.test.common.service.**]]></option>

						<!-- 2. 保留所有 service 下的类 -->
						<option><![CDATA[-keep class com.test.common.service.**]]></option>
						<!-- 保持目录结构 -->
						<option><![CDATA[-keepdirectories]]></option>
						<!-- 3. 保留类成员（字段+方法签名+构造方法，合并为一个规则） -->
						<option><![CDATA[-keepclassmembers class com.test.common.service.** {
                            <fields>;
                            public <methods>;
                            protected <methods>;
                            <init>(...);
                        }]]></option>

						<!-- 4. 完整保留Spring注解 -->
						<option><![CDATA[-keep @org.springframework.stereotype.Component class com.test.common.service.**]]></option>
						<option><![CDATA[-keep @org.springframework.stereotype.Service class com.test.common.service.**]]></option>
						<option><![CDATA[-keepclassmembers class com.example.oms.service** {
                            @org.springframework.beans.factory.annotation.Autowired *;
                            @org.springframework.beans.factory.annotation.Resource *;
                            @org.springframework.beans.factory.annotation.Value *;
							@org.springframework.stereotype.Component *;
                        }]]></option>

						<!-- 5. 保留Spring生命周期接口 -->
						<option><![CDATA[-keep class com.example.oms.service.** implements org.springframework.context.ApplicationContextAware {
                            public <methods>;
                        }]]></option>
						<option><![CDATA[-keep class com.example.oms.service.** implements org.springframework.beans.factory.InitializingBean {
                            public <methods>;
                        }]]></option>

						<!-- 6. 保留内部类 -->
						<option><![CDATA[-keep class com.example.oms.service.**$* {
                            @*.* *;
                            <fields>;
                            <methods>;
                            <init>(...);
                        }]]></option>
						<option><![CDATA[-keep class com.example.oms.service.**$*$* {
                            @*.* *;
                            <fields>;
                            <methods>;
                            <init>(...);
                        }]]></option>

						<!-- 7. 保留枚举类 -->
						<option><![CDATA[-keep class *$* extends java.lang.Enum {
                            *;
                        }]]></option>
						<option><![CDATA[-keepclassmembers enum * {
                            public static **[] values();
                            public static ** valueOf(java.lang.String);
                            *;
                        }]]></option>


						<!-- 解决邮件类超类问题 -->
						<option>-keep class javax.mail.** { *; }</option>
						<option>-keep class com.sun.mail.** { *; }</option>

						<option>-useuniqueclassmembernames</option>
						<option><![CDATA[-keepattributes !LocalVariableTable,!LocalVariableTypeTable]]></option>
						<option><![CDATA[-keepattributes Exceptions,InnerClasses,Signature,*Annotation*,SourceFile,LineNumberTable]]></option>

                        <option>-dontshrink</option>
                        <option>-dontoptimize</option>
						<option>-dontskipnonpubliclibraryclasses</option>
                        <option>-dontskipnonpubliclibraryclassmembers</option>
						<option>-ignorewarnings</option>
						<option>-dontnote</option>
						
						<option>-target 1.8</option>

						<!-- 排查辅助：生成保留类清单+详细日志 -->
						<option>-verbose</option> <!-- 输出处理日志 -->
						<option>-printseeds ${project.build.directory}/proguard_seeds.txt</option>
						<!-- 生成混淆详细日志，记录局部变量混淆、优化过程 -->
						<option>-printmapping ${project.build.directory}/proguard_full_map.txt</option>
						<!-- 记录被混淆的类/方法（非保留类） -->
						<option>-printusage ${project.build.directory}/proguard_usage.txt</option>

						
					</options>
				</configuration>
				<dependencies>
					<dependency>
						<groupId>com.guardsquare</groupId>
						<artifactId>proguard-base</artifactId>
						<version>${proguard.core.version}</version>
						<exclusions>
							<exclusion>
								<groupId>net.sf.proguard</groupId>
								<artifactId>*</artifactId>
							</exclusion>
						</exclusions>
					</dependency>
				</dependencies>
			</plugin>

```

proguard插件相关参数用法参考官方文档: https://wvengen.github.io/proguard-maven-plugin/proguard-mojo.html#options

