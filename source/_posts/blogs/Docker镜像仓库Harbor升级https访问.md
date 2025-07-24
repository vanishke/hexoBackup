---
title: Docker镜像仓库Harbor升级https访问
categories:
	- Harbor
tags: 
	- Harbor
	- Docker
	
date: 2025-04-03 14:52:34
updated: 2025-04-03 14:52:34
---
<!-- toc -->
# <span id="inline-blue">环境</span>
Docker: 27.3.1
docker compose: v2.29.7
Harbor: v2.12.1

# <span id="inline-blue">背景</span>

harbor配置https证书必要性

一、核心原因：安全通信​​
​​防止数据泄露​​
HTTPS 通过 TLS/SSL 协议对通信内容加密，避免镜像传输、用户凭证等敏感信息被窃取或篡改。HTTP 是明文传输，攻击者可通过抓包工具（如 Wireshark）截获数据。
​​抵御中间人攻击​​
若未启用 HTTPS，攻击者可伪造 Harbor 服务器证书，诱导客户端连接至恶意服务器，窃取镜像或注入恶意代码。

​​二、证书的核心作用​​
​​身份验证​​
​​服务器身份验证​​：证书包含域名信息（如 harbor.example.com），客户端（如 Docker 守护进程）会验证证书是否由受信任的 CA 签发，确保访问的是真实服务器而非仿冒节点。
​​客户端身份验证（可选）​​：通过客户端证书（如 ca.crt），Harbor 可验证请求来源的合法性，防止未授权的镜像推送或拉取。
​​数据完整性保护​​
使用数字签名技术（如 SHA-256），确保传输过程中数据未被篡改。例如，镜像层文件的哈希值会在传输后重新校验。

​​三、Harbor 特定场景需求​​
​​内容信任（Content Trust）​​
若启用 Notary 服务对镜像签名，必须通过 HTTPS 传输签名元数据。HTTP 会导致签名验证失败，无法保证镜像来源可信。
​​合规性要求​​
​​企业安全规范​​：多数企业要求内部服务使用 HTTPS。
​​行业标准​​：如 PCI-DSS（支付卡行业数据安全标准）强制要求加密通信。

公司内网环境下部署harbor一直使用的http,导致docker配置harbor镜像仓库需要添加如下配置：
```yml
{
    "insecure-registries": ["http://my.harbor.com"]
}
```
拉取镜像文件经常出现超时，所以决定将Harbor仓库通信协议升级为https，并配置好局域网内的域名和IP之间映射，这样既保证了docker拉取镜像文件时的安全保证，同时也为harbor服务后续升级到公网打下基础。

# <span id="inline-blue">实现</span>

## <span id="inline-blue">生成https证书</span>

### <span id="inline-blue">生成证书颁发机构证书</span>

生产环境下通常是由受信任的CA机构颁发证书，但如果想使用自签名证书，可以生成自己的CA

#### <span id="inline-blue">生成CA证书私钥</span>

```shell

openssl genrsa -out ca.key 4096

```

#### <span id="inline-blue">生成CA证书</span>

```shell

openssl req -x509 -new -nodes -sha512 -days 3650 \
 -subj "/C=CN/ST=Hubei/L=Hubei/O=harbor.test.com/OU=harbor.test.com/CN=harbor.test.com" \
 -key ca.key \
 -out ca.crt

```

### <span id="inline-blue">生成服务端证书</span>

服务端证书使用通常包含两个文件，后缀分别为.key和.crt

生成服务端证书私钥命令如下：

```shell
openssl genrsa -out harbor.test.com.key 4096
```


生成服务端证书签名请求(CSR)命令如下：

```shell
openssl req -sha512 -new \
    -subj "/C=CN/ST=Hubei/L=Hubei/O=harbor.test.com/OU=harbor.test.com/CN=harbor.test.com" \
    -key harbor.test.com.key \
    -out harbor.test.com.csr
```

#### <span id="inline-blue">生成x509 v3扩展文件</span>

扩展功能的引入背景​

X.509 v3 标准在早期版本（v1/v2）基础上新增了 ​​扩展字段（Extensions）​​，允许证书动态添加自定义属性，解决了以下问题：

​​功能单一性​​：v1/v2 证书仅支持基础身份信息（如 DN、公钥），无法满足复杂场景需求。
​​灵活性不足​​：无法定义密钥用途、证书策略等细粒度控制项。
​​证书链管理​​：需通过扩展实现证书层级关系验证（如交叉认证）。

核心扩展项及其作用​​

X.509 v3 扩展通过 ​​对象标识符（OID）​​ 唯一标识，分为 ​​关键（Critical）​​ 和 ​​非关键（Non-Critical）​​ 两类。以下是常见扩展及其作用：

​​1. 密钥用途与策略控制​​
​​Key Usage​​
定义公钥的合法用途（如数字签名、密钥加密），客户端可据此拒绝非法操作。
示例值：digitalSignature, keyEncipherment 。
​​Extended Key Usage (EKU)​​
细化密钥用途（如服务器认证 serverAuth、客户端认证 clientAuth），常用于 TLS/SSL 证书 。
​​Certificate Policies​​
声明证书的颁发策略（如企业内网策略 OID 2.23.140.1.1），支持多级策略映射 。
​​2. 证书链与身份验证​​
​​Subject Key Identifier (SKI)​​
唯一标识证书的公钥，用于快速匹配证书链中的上下级证书 。
​​Authority Key Identifier (AKI)​​
指定颁发者的公钥标识，支持交叉认证（如中间 CA 证书引用根 CA 的 SKI）。
​​Basic Constraints​​
标识证书是否为 CA 证书，pathLenConstraint 限制子 CA 层级深度（如 pathlen:0 表示仅允许直接签发终端证书）。
​​3. 安全增强与兼容性​​
​​Subject Alternative Name (SAN)​​
支持多域名/ IP 绑定（如 DNS:example.com, DNS:*.example.com），替代过时的 Common Name (CN) 字段 。
​​CRL Distribution Points​​
指定证书吊销列表（CRL）的下载地址，增强吊销检查效率 。
​​Inhibit Any Policy​​
禁止使用通配符策略（如 anyPolicy），强制严格匹配特定策略 。
​​4. 扩展功能支持​​
​​Subject Directory Attributes​​
传递访问控制信息（如用户组、角色），用于企业内网权限管理 。
​​Policy Constraints​​
强制要求证书策略链的连续性，防止策略替换攻击 。

生成扩展文件命令如下：

```shell
cat > v3.ext <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1=harbor.test.com
DNS.2=10.9.216.14
EOF
```

使用该v3.ext文件为Harbor主机生成证书,生成命令如下：

```shell
openssl x509 -req -sha512 -days 3650 \
    -extfile v3.ext \
    -CA ca.crt -CAkey ca.key -CAcreateserial \
    -in harbor.test.com.csr \
    -out harbor.test.com.crt
```

## <span id="inline-blue">提供证书给harbor和docker</span>

### <span id="inline-blue">Habor</span>

将生成harbor.test.com.crt、harbor.test.com.key文件上传到harbor配置文件harbor.yml指定位置

```shell
mkdir -p /usr/local/harbor/https/
cp harbor.test.com.crt /usr/local/harbor/https/
cp harbor.test.com.key /usr/local/harbor/https/

```

#### <span id="inline-blue">更新配置</span>

更改harbor.yml配置文件,内容如下：

```yml
# Configuration file of Harbor

# The IP address or hostname to access admin UI and registry service.
# DO NOT use localhost or 127.0.0.1, because Harbor needs to be accessed by external clients.
hostname: my.harbor.com

# http related config
#http:
  # port for http, default is 80. If https enabled, this port will redirect to https port
#  port: 80

# https related config
https:
  # https port for harbor, default is 443
  port: 443
  # The path of cert and key files for nginx
  certificate: /usr/local/harbor/https/harbor.test.com.pem
  private_key: /usr/local/harbor/https/harbor.test.com.key
  # enable strong ssl ciphers (default: false)
  # strong_ssl_ciphers: false
```

harbor主目录执行以下命令更新harbor内部服务配置

```shell
#假设harbor在/usr/local/harbor
cd /usr/local/harbor
./prepare
```

停止当前harbor实例，保留数据

```shell
cd /usr/local/harbor
docker-compose down -v
```

重启harbor

```shell
cd /usr/local/harbor
docker-compose down up -d
```



my.harbor.com是局域网自定义域名，certificate、private_key对应自签名证书和私钥
因为是局域网自定义的域名，并且使用的是自签名证书，所以需要在服务端和客户端配置域名和IP映射，让通信的双方都知道域名对应的IP地址。

Linux:
修改/etc/hosts文件，增加以下内容：

```shell
10.9.216.14  my.harbor.com
```

windows：
修改C:\Windows\System32\drivers\etc\hosts文件(使用管理员权限)，增加如下内容：

```shell
10.9.216.14  my.harbor.com
```

更改之后使用以下命令刷新dns

```shell
ipconfig /flushdns
```

浏览器导入harbor证书，包含ca.crt、coship.harbor.crt两个文件，导入到受信任的根证书机构即可，重启浏览器，访问https://harbor.test.com
![Harbor升级https](/images/Harbor/20250416/Harbor_20250416_001.png)
![Harbor升级https](/images/Harbor/20250416/Harbor_20250416_002.png)
![Harbor升级https](/images/Harbor/20250416/Harbor_20250416_003.png)
![Harbor升级https](/images/Harbor/20250416/Harbor_20250416_004.png)

### <span id="inline-blue">Docker</span>

docker默认需要使用ca.crt、harbor.test.com.key、harbor.test.com.cert三个文件
Docker守护程序将.crt文件解释为CA证书，并将.cert文件解释为客户端证书

### <span id="inline-blue">转换客户端证书</span>

```shell
openssl x509 -inform PEM -in harbor.test.com.crt -out harbor.test.com.cert
```

### <span id="inline-blue">上传证书</span>

docker客户端证书默认路径为/etc/docker/certs.d,在此路径下创建对应域名证书路径，如果harbor https开放的不是443端口，请创建文件夹/etc/docker/certs.d/yourdomain.com:port或/etc/docker/certs.d/harbor_IP:port，如下所示：

```shell
mkdir -p /etc/docker/certs.d/harbor.test.com/
cp harbor.test.com.cert /etc/docker/certs.d/harbor.test.com/
cp harbor.test.com.key /etc/docker/certs.d/harbor.test.com/
cp ca.crt /etc/docker/certs.d/harbor.test.com/
```
### <span id="inline-blue">重启docker服务</span>

```shell
systemctl daemon-reload
systemctl restart docker
```

## <span id="inline-blue">验证</span>


执行以下命令重启harbor服务

```shell
	systemctl stop harbor.service
	systemctl start harbor.service
```

![Harbor升级https](/images/Harbor/20250416/Harbor_20250416_005.png)
