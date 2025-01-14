---
title: Docker Harbor配置自定义安全证书
categories:
	- Docker
tags: 
	- Docker
	- Docker-compose
	
date: 2025-01-14 16:56:36
updated: 2025-01-14 16:56:36
---
<!-- toc -->
# <span id="inline-blue">环境</span>

Linux: CentOS Linux release 7.7.1908 (Core)
Docker：26.1.4
Docker compose: v2.25.0
	
# <span id="inline-blue">背景</span>

线上Docker环境部署容器，在portainer容器可视化管理工具的支持下，部署方便了很多，但镜像不想暴露到公网环境上，于是部署了Harbor私有镜像仓库，但安全传输成了大问题，以下通过生成自签名证书实现harbor安全访问。

# <span id="inline-blue">自定义https证书</span>

创建自动生成https脚本gen-TLS.sh

```shell
cd /usr/local/harbor
vim gen-TLS.sh
```
gen-TLS.sh内容如下：

```shell
#!/bin/bash

# 在该目录下操作生成证书，正好供harbor.yml使用
mkdir -p /usr/local/harbor/https
cd /usr/local/harbor/https

openssl genrsa -out ca.key 4096
openssl req -x509 -new -nodes -sha512 -days 3650 -subj "/C=CN/ST=HuBei/L=HuBei/O=example/OU=Personal/CN=coship.harbor.com" -key ca.key -out ca.crt
openssl genrsa -out coship.harbor.com.key 4096
openssl req -sha512 -new -subj "/C=CN/ST=HuBei/L=HuBei/O=example/OU=Personal/CN=coship.harbor.com" -key coship.harbor.com.key -out coship.harbor.com.csr

cat > v3.ext <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1=coship.harbor.com
DNS.2=harbor
DNS.3=ks-allinone
EOF

openssl x509 -req -sha512 -days 3650 -extfile v3.ext -CA ca.crt -CAkey ca.key -CAcreateserial -in coship.harbor.com.csr -out coship.harbor.com.crt
    
openssl x509 -inform PEM -in coship.harbor.com.crt -out coship.harbor.com.cert

cp coship.harbor.com.crt /etc/pki/ca-trust/source/anchors/coship.harbor.com.crt 

update-ca-trust
```

coship.harbor.com域名对应harbor.yml配置文件内hostname属性，因为是自签名证书，harbor所在服务器需要配置harbor服务的域名解析

```shell
echo "10.9.216.14 coship.harbor.com" >> /etc/hosts
```

后续不管是windows端访问harbor管理页面，还是linux端推送和拉取镜像，都需要配置在各自的域名解析服务里面配置上harbor的ip和域名的映射关系。
windows端配置方法:
修改hosts文件，文件路径：C:\Windows\System32\drivers\etc\hosts，添加如下内容：

```shell
10.9.216.14 coship.harbor.com
```

进入harbor所在主目录，创建证书存放路径https

```shell
cd /usr/local/harbor
mkdir https
```

修改harbor.yml配置文件中证书配置：

```shell
# https related config
https:
  # https port for harbor, default is 443
  port: 443
  # The path of cert and key files for nginx
  certificate: /usr/local/harbor/https/coship.harbor.com.crt
  private_key: /usr/local/harbor/https/coship.harbor.com.key
  # enable strong ssl ciphers (default: false)
  # strong_ssl_ciphers: false
```

执行证书生成脚本：

```shell
cd /usr/local/harbor
chmod a+x *.sh
./gen-TLS.sh
```

将生成证书对应文件拷贝到Docker默认认证目录下

```shell

# 把这三个证书文件复制到docker默认认证目录下
mkdir -p /etc/docker/certs.d/coship.harbor.com/
cp coship.harbor.com.cert /etc/docker/certs.d/coship.harbor.com/
cp coship.harbor.com.key /etc/docker/certs.d/coship.harbor.com/
cp ca.crt /etc/docker/certs.d/coship.harbor.com/
```

重新生成harbor配置文件

```shell
cd /usr/local/harbor
./prepare
```

完成上述步骤后需要重启harbor和docker服务

```shell
cd /usr/local/harbor
#通过docker-compose编排工具调用harbor默认编排文件docker-compose.yml,在其他目录执行没有效果
docker-compose down -v

#重启docker服务
systemctl restart docker.service

#重启harbar服务
cd /usr/local/harbor
docker-compose up -d 
```

# <span id="inline-blue">验证</span>

将脚本生成的证书文件ca.crt上传到浏览器受信任的根证书机构下，重启浏览器，访问https://coship.harbor.com

![Dockerfile 远程安全连接](/images/docker/20250114/docker_20250114_003.png)

推送镜像到harbor服务器

```shell
#拉取nginx官方镜像,默认标签版本latest
docker pull nginx
#给镜像打tag
docker tag nginx coship.harbor.com/library/nginx
#登录harbor
docker login -u admin -p coshipOk698? coship.harbor.com
#推送到harbor
docker push coship.harbor.com/library/nginx
```

推送镜像格式  harbor域名:端口/harbor项目名/镜像名:标签

上述的推送命令完整格式如下：

```shell
docker push coship.harbor.com:433/library/nginx:latest
```

443是https默认访问端口，可以省略，latest为镜像默认标签，library为harbor仓库里面的默认项目

登录harbor,查看推送的镜像
![Dockerfile 远程安全连接](/images/docker/20250114/docker_20250114_004.png)





