---
title:  SpringBoot集成Jasypt实现配置加密
categories: 
	- Jasypt
tags: 
	- Jasypt
	- SpringBoot
	
date: 2026-02-28 14:51:43
updated: 2026-02-28 14:51:43
---
<!-- toc -->

# <span id="inline-blue">背景</span>

Jasypt（Java Simplified Encryption）是一个用于简化Java加密操作的库，它提供了简单易用的API来加密和解密敏感数据。在Spring Boot项目中，Jasypt可以帮助我们加密配置文件中的敏感信息，如数据库密码、API密钥等，从而提高应用的安全性。

Spring Boot集成Jasypt后，可以通过在配置文件中使用`ENC(...)`包裹加密后的值，应用启动时会自动解密这些值。本文描述Idea本地启动微服务模块，jasypt加密配置项的注意事项。

# <span id="inline-blue">项目依赖版本信息</span>

- **Spring Boot**：2.6.6
- **JDK / 编译版本**：1.8
- **Jasypt Spring Boot Starter**：3.0.4
- **Jasypt Maven Plugin**：3.0.4

# <span id="inline-blue">添加依赖</span>

```xml
	  <dependency>
        <groupId>com.github.ulisesbocchio</groupId>
        <artifactId>jasypt-spring-boot-starter</artifactId>
        <version>3.0.4</version>
      </dependency>
	.........  
	
	  <plugin>
          <groupId>com.github.ulisesbocchio</groupId>
          <artifactId>jasypt-maven-plugin</artifactId>
          <version>3.0.4</version>
      </plugin>
	  
	  
	  
```

# <span id="inline-blue">Jasypt 基本配置</span>

在需要加密配置的微服务模块 `application.yml` / `bootstrap.yml` 中增加：

```yaml
jasypt:
  encryptor:
    algorithm: PBEWITHHMACSHA512ANDAES_256
    key-obtention-iterations: 1000
    pool-size: 1
    salt-generator-classname: org.jasypt.salt.RandomSaltGenerator
    iv-generator-classname: org.jasypt.iv.RandomIvGenerator
    string-output-type: base64
```

**说明：**

- **算法**：`PBEWITHHMACSHA512ANDAES_256`，目前比较安全的一种组合。
- **salt / iv 随机化**：提高密文安全性。
- **输出格式 base64**：便于直接放在 YAML / properties 中。

# <span id="inline-blue">IDEA 本地启动必须配置的 JVM 环境变量</span>

不管是 **IDEA Run Configuration** 还是命令行 `java -jar`，只要要让应用正确解密，都必须在 JVM 启动参数里加上 **同一把密钥**：

```text
-Djasypt.encryptor.password=YOUR_ENCRYPTOR_PASSWORD
```

## <span id="inline-blue">IDEA配置</span>

在对应模块的 **Run/Debug Configuration** 中：

- 打开该模块的运行配置；
- 在 **VM options** 中添加：

```text
-Djasypt.encryptor.password=YOUR_ENCRYPTOR_PASSWORD
```

**注意：**

- 这把密码必须和你使用 Jasypt 插件加密时的密码完全一致。
- 不同微服务如果共用一套密钥，可以统一用同一个；否则注意区分。

## <span id="inline-blue">配置项的加密/解密操作</span>

### <span id="inline-blue">手动加密单个值</span>

在 **微服务模块根目录**（例如 `your-module-name`）执行：

```bash
mvn jasypt:encrypt-value \
  -Djasypt.encryptor.password="YOUR_ENCRYPTOR_PASSWORD" \
  -Djasypt.plugin.value="your_plaintext_value"
```

- **`jasypt.plugin.value`**：要加密的明文，比如数据库密码、AK/SK 等。
- 输出是一个 `ENC(...)` 字符串，把它复制到配置文件相应位置即可。

### <span id="inline-blue">手动解密单个值</span>

```bash
mvn jasypt:decrypt-value \
  -Djasypt.encryptor.password="YOUR_ENCRYPTOR_PASSWORD" \
  -Djasypt.plugin.value="YOUR_ENCRYPTED_VALUE"
```

- **`jasypt.plugin.value`**：配置文件里已有的 `ENC(...)` 内部密文（去掉 `ENC()` 外壳或直接贴整个 `ENC(...)`，视插件版本而定）。
- 输出为对应的明文，便于排查或迁移。

### <span id="inline-blue">批量加密配置文件（YAML）</span>

将 `application-dev.yml` 中的 `DEC(aaaa)` 自动替换为 `ENC(...)`：

```bash
mvn jasypt:encrypt \
  -Djasypt.encryptor.password="YOUR_ENCRYPTOR_PASSWORD" \
  -Djasypt.plugin.path=file:src/main/resources/application-dev.yml
```

- 插件会扫描目标文件，将 `DEC(明文)` 替换成 `ENC(密文)`。

### <span id="inline-blue">批量解密配置文件（YAML）</span>

将 `application-dev.yml` 中的 `ENC(...)` 自动替换为 `DEC(明文)`：

```bash
mvn jasypt:decrypt \
  -Djasypt.encryptor.password="YOUR_ENCRYPTOR_PASSWORD" \
  -Djasypt.plugin.path=file:src/main/resources/application-dev.yml
```

**命令执行位置要点：**

- 必须在 **对应微服务模块的根目录** 执行（有自己 `pom.xml` 的那个目录）。
- 插件默认会在该模块下的 `src/main/resources` 查找配置文件。

# <span id="inline-blue">`@activatedProperties@` 占位符踩坑：必须加双引号</span>

项目中许多模块用到了 Maven 占位符：

```yaml
spring:
  profiles:
    active: @activatedProperties@
```

用于构建时根据不同 profile 动态替换为不同环境的 nacos 用户、密码、命名空间等。

**问题：**

- 执行 Jasypt Maven 插件时，它会启动一个 Spring Boot 环境来加载配置。
- 此时读取到的是 **未被 Maven 过滤的原始 `application.yml` / `bootstrap.yml`**。
- SnakeYAML 解析到 `active: @activatedProperties@` 时，认为 `@` 开头不是合法 token，直接抛异常：

```text
found character '@' that cannot start any token. (Do not use @ for indentation)
```

**解决方案（关键点）：给占位符加双引号**

把所有 YAML 中的占位符改为带引号的形式：

```yaml
spring:
  profiles:
    active: "@activatedProperties@"
```

适用范围：

- 所有 `application.yml`、`bootstrap.yml`、`application-*.yml` 等 YAML 配置。
- 其他类似 `@xxx@` 的占位符同理，建议一律加双引号。

**效果：**

- 对 YAML：这是一个普通字符串，解析不再报错。
- 对 Maven 过滤：仍然会把 `"@activatedProperties@"` 替换为真实值。
- 对 Jasypt 插件 / 单元测试：可以正常读取配置，避免因为占位符解析失败导致插件执行中断。

