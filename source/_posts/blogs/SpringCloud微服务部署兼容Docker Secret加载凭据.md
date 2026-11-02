---
title: SpringCloud微服务部署兼容Docker Secret加载凭据
categories:
	- SpringCloud
tags: 
	- SpringCloud
	- Docker
	- Secret
	
date: 2026-11-02 17:41:07
---

# 环境

SpringBoot: 2.6.6
SpringCloud: 2021.0.6
JDK: 1.8
Docker : 27.3.1




# 背景

我们的微服务以前把 Nacos 密码和 Jasypt 主密钥放在环境变量里，用久了总觉得不踏实——`docker inspect` 能看到明文，编排文件里也躺着一份，`docker exec` 进容器看进程环境同样能看到。Docker Secret 正是为这个问题设计的：它把口令挂载成容器内 `/run/secrets/` 目录下的普通文件，环境变量里就不用再放这两项了。

麻烦在于，服务要同时兼容两种来源：容器里优先读 Secret 文件，本机开发时没有这个目录，还得回退到原来的环境变量。至于 Nacos 用户名——它不是口令本体，泄露风险小得多，继续留在环境变量里就够了。

## 一、为什么必须写在 bootstrap.yml

先说清楚一个前提。以 Spring Boot 2.4 及以上为例（配置优先级参考 2.6 的文档），Nacos 的地址、命名空间、用户名、密码都要写在 `bootstrap.yml` 里，因为客户端必须先连上 Nacos，才能把远程的加密配置和公共配置拉下来。这是个先有鸡还是先有蛋的问题：口令如果写在 `application.yml`，或者干脆放在 Nacos 自己管理的配置里，等那些配置加载时，连接这一步早就过去了。

Secret 的导入因此必须和 Nacos 账号放同一份 `bootstrap.yml`。Jasypt 主密钥同理——远程配置里的 `ENC(...)` 要在启动早期就解密，主密钥不能等业务配置从远端回来才就位。

另外要注意，这套修改只覆盖 Spring Boot 进程。如果还有一些单独运行的控制台程序也要连 Nacos，它们不走 `configtree`，需要在各自的启动脚本里自己读文件。

## 二、Spring 怎么把 Secret 文件变成配置

Docker Swarm 和 Compose 的 secret 默认挂到 `/run/secrets/<名字>`，一个 secret 对应一个文件，文件内容就是口令本身。

Spring Boot 2.4 起提供了 `configtree:`，能把这种目录整体收成配置：目录里每个文件名是一个 key，文件内容是对应的 value。官方说明见 [https://docs.spring.io/spring-boot/docs/2.6.6/reference/html/features.html#features.external-config.files.configtree](https://docs.spring.io/spring-boot/docs/2.6.6/reference/html/features.html#features.external-config.files.configtree)。

对我们的场景来说，`/run/secrets/nacos-password` 这个文件对应的属性名就是 `nacos-password`（只有子目录才会变成 `目录.文件名` 的形式，Secret 是平铺文件，没有多一层目录）。这里有个容易踩的小坑：文件名必须和占位符完全一致，用连字符写成 `nacos-password`，习惯性写成下划线 `nacos_password` 就匹配不上了。

`optional:` 前缀表示目录不存在也不报错，这样本机启动不会因为缺 `/run/secrets` 而失败。最终的配置长这样：

```yaml
spring:
  config:
    import: optional:configtree:/run/secrets/
  cloud:
    nacos:
      config:
        username: ${NACOS_USERNAME:}
        password: ${nacos-password:${NACOS_PASSWORD:}}
      discovery:
        username: ${NACOS_USERNAME:}
        password: ${nacos-password:${NACOS_PASSWORD:}}
jasypt:
  encryptor:
    password: ${jasypt-encryptor-password:${JASYPT_ENCRYPTOR_PASSWORD:}}
```

配置中心（config）和注册中心（discovery）的密码都要改——只改一处的话，另一处仍然只认环境变量，等于白改。

以 password 这行为例，占位符的查找顺序是从左到右：先找属性 `nacos-password`，也就是 Secret 文件；没有再找环境变量 `NACOS_PASSWORD`；再没有就是空字符串。最后这个兜底故意留成空的——Nacos 会按未授权或匿名去连，连不上就让它失败报错，也不要在配置里写死一口令。Jasypt 那行是同样的结构：文件 `jasypt-encryptor-password`，退回 `JASYPT_ENCRYPTOR_PASSWORD`。

## 三、注意：环境变量会盖过文件

这是整篇文章里最反直觉的一点。

占位符虽然写成「文件在前、变量在后」，但这并不代表文件的优先级更高。在 Spring Boot 2.6 的外部配置顺序里，排在后面的来源会覆盖前面的，而 Config data（`application` / `bootstrap` 以及 `spring.config.import`，`configtree` 也在其中）恰好排在操作系统环境变量**之前**——也就是说，环境变量会盖掉同名的 configtree 值。

更麻烦的是宽松绑定：`NACOS_PASSWORD` 能对上属性名 `nacos-password`。所以容器里只要还设着这个环境变量，`${nacos-password}` 解析时会先命中环境变量，`/run/secrets/nacos-password` 根本轮不到；`${NACOS_PASSWORD:}` 那段兜底只有在属性完全缺失时才会走到。

换句话说，编排文件里如果还留着这样的配置：

```yaml
environment:
  NACOS_PASSWORD: ${NACOS_PASSWORD}
  JASYPT_ENCRYPTOR_PASSWORD: ${JASYPT_ENCRYPTOR_PASSWORD}
```

那即使应用已经能读 Secret，实际生效的仍然是环境变量。要让文件真正起作用，需要三步：

- 给服务挂上 secret，目标文件名就是 `nacos-password`、`jasypt-encryptor-password`；
- 从这两个服务的环境变量里去掉 `NACOS_PASSWORD`、`JASYPT_ENCRYPTOR_PASSWORD`；
- 用户名不受影响，继续用 `NACOS_USERNAME`。

编排文件改成这样：

```yaml
services:
  demo-gateway:
    environment:
      NACOS_USERNAME: ${NACOS_USERNAME}
    secrets:
      - nacos-password
      - jasypt-encryptor-password

secrets:
  nacos-password:
    external: true
  jasypt-encryptor-password:
    external: true
```

创建 secret 时还有一个细节：不要用 `echo` 管道，它会额外补一个换行符。Spring 只会去掉文件末尾的一个 `\n`，如果混进了 `\r` 会留在口令里，Nacos 校验就对不上了。用 `printf '%s'` 才安全：

```bash
printf '%s' '你的口令' | docker secret create nacos-password -
printf '%s' '你的主密钥' | docker secret create jasypt-encryptor-password -
```

默认情况下，secret 名字和容器内文件名相同。如果平台上的 secret 名字不允许连字符，可以用 `target` 把挂载名改成占位符要的文件名：

```yaml
secrets:
  - source: nacos_password
    target: nacos-password
```

最后提醒一句：`configtree` 会把 `/run/secrets/` 里的**每一个**文件都收成属性。如果这个目录里还挂了数据库口令之类的其他 secret，就会多出同名属性，可能撞上已有配置键。所以业务服务只挂自己需要读的 secret，别贪多。

## 四、本地和容器怎么共存

| 场景 | `/run/secrets` | 实际用的口令 |
| --- | --- | --- |
| 本机启动 | 目录不存在，`optional` 跳过 | `NACOS_PASSWORD`、`JASYPT_ENCRYPTOR_PASSWORD` |
| 容器只配了环境变量 | 没挂 secret | 仍是环境变量 |
| 容器只挂了 secret，没有对应环境变量 | 文件在 | 文件内容 |
| 文件和环境变量同时存在 | 文件在 | 环境变量盖过文件 |

本机开发不用为了模拟 secret 特意去建 `/run/secrets` 目录，环境变量的老路完全走得通。

## 五、远程配置里的口令占位符也要一起改

这是我们自己实际踩过的坑。有的公共配置会用 Nacos Open API 再拉一份文件，比如日志配置，地址上直接拼了查询参数：

```text
password=${NACOS_PASSWORD:}
```

注意这里解析的是环境变量 `NACOS_PASSWORD`，和 Secret 文件无关。如果某个环境把 `NACOS_PASSWORD` 去掉了、只留 Secret 文件，那么 Nacos 主连接没问题（它能用文件里的口令），但这条地址上的密码会解析成空，请求直接失败。

解决办法是让这类引用和 `bootstrap.yml` 保持同一套占位符：

```text
password=${nacos-password:${NACOS_PASSWORD:}}
```

凡是单独引用 Nacos 密码的地方——配置中心、注册中心、URL 或配置项里拼的参数——都要统一成这套写法，不能只改 `bootstrap.yml` 就完事。

## 六、上线前对一下清单

1. 每个连 Nacos 的服务，`bootstrap.yml` 都有 `optional:configtree:/run/secrets/`。
2. Nacos config、discovery 的 password 都是 `${nacos-password:${NACOS_PASSWORD:}}`。
3. Jasypt 是 `${jasypt-encryptor-password:${JASYPT_ENCRYPTOR_PASSWORD:}}`。
4. 用户名仍是 `${NACOS_USERNAME:}`。
5. 准备启用 Secret 的服务：挂上文件，并去掉同名环境变量，否则文件不会生效（见第三节）。
6. secret 用 `printf '%s'` 创建，避免换行和 `\r` 混入口令。
7. 文件名与占位符一致：`nacos-password`、`jasypt-encryptor-password`。
8. 远程配置、日志地址等单独拼接的 Nacos 密码，也改成同一套占位符。

整套方案的思路是：本地不挂 secret、只留环境变量，现有启动方式原样保留；Secret 是容器侧的可选项，本地调试不需要跟着改。
