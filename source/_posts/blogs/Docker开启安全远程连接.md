---
title: Docker开启安全远程连接
categories:
	- MySQL
tags: 
	- Linux
	- MySQL
	
date: 2025-01-14 11:31:28
updated: 2025-01-14 11:31:28
---

<!-- toc -->
# <span id="inline-blue">环境</span>
Linux: CentOS Linux release 7.7.1908 (Core)
Docker：26.1.4
Docker compose: v2.25.0

# <span id="inline-blue">背景</span>

Docker swarm线上环境配置portainer容器管理服务，开启远程安全链接。

# <span id="inline-blue">创建证书</span>

创建证书生成脚本
```shell
cd /etc/docker
vim gen-TLS.sh
```

脚本添加如下内容：
```shell
#!/bin/sh

ip="10.9.216.12"
password="coshipOk698"
# 证书生成位置
dir="/etc/docker/certs" 
# 证书有效期10年，单位是天
validity_period=3650    

# 如果目录不存在则创建目录，否则删除重建
if [ ! -d "$dir" ]; then
  echo "$dir 不存在，将创建目录"
  mkdir -p $dir
else
  echo "$dir 存在，将删除并重建"
  rm -rf $dir
  mkdir -p $dir
fi

cd $dir || exit

# 1. 创建根证书 RSA 私钥
openssl genrsa -aes256 -passout pass:"$password" -out ca-key.pem 4096

# 2. 创建 CA 证书
openssl req -new -x509 -days $validity_period -key ca-key.pem -passin pass:"$password" -sha256 -out ca.pem -subj "/C=NL/ST=./L=./O=./CN=$ip"

# 3. 创建服务端私钥
openssl genrsa -out server-key.pem 4096

# 4. 创建服务端签名请求证书文件
openssl req -subj "/CN=$ip" -sha256 -new -key server-key.pem -out server.csr

# 创建服务端扩展配置文件 extfile.cnf
echo "subjectAltName = IP:$ip,IP:0.0.0.0" > extfile.cnf
echo "extendedKeyUsage = serverAuth" >> extfile.cnf

# 5. 创建签名生效的服务端证书文件
openssl x509 -req -days $validity_period -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem -passin "pass:$password" -CAcreateserial -out server-cert.pem -extfile extfile.cnf

# 6. 创建客户端私钥
openssl genrsa -out key.pem 4096

# 7. 创建客户端签名请求证书文件
openssl req -subj '/CN=client' -new -key key.pem -out client.csr

# 创建客户端扩展配置文件 extfile-client.cnf
echo "extendedKeyUsage = clientAuth" > extfile-client.cnf

# 8. 创建签名生效的客户端证书文件
openssl x509 -req -days $validity_period -sha256 -in client.csr -CA ca.pem -CAkey ca-key.pem -passin "pass:$password" -CAcreateserial -out cert.pem -extfile extfile-client.cnf

# 删除临时文件
rm -f client.csr server.csr extfile.cnf extfile-client.cnf

# 设置文件权限
chmod 0400 ca-key.pem key.pem server-key.pem
chmod 0444 ca.pem server-cert.pem cert.pem

echo "证书生成完成"
```

ip: 修改为docker服务的IP
password: 证书密码，自行设置
dir： 证书生成目录，执行生成脚本，dir目录会先清空，再生成证书，最好单独设置空文件目录

赋予脚本执行权限
```shell
cd /etc/docker 
chmod a+x *.sh
```

执行证书生成命令

```shell
cd /etc/docker
sh gen-TLS.sh
```

最终生成证书文件主要使用ca.pem、server-key.pem、server-cert.pem,cert.pem、key.pem
将证书文件分类归档为server、client

```shell
cd /etc/docker/certs
mkdir server 
mkdir client
cp ca.pem server-key.pem、server-cert.pem  server
cp ca.pem cert.pem、key.pem client
```

# <span id="inline-blue">server端配置tls连接</span>

修改docker配置

```shell
vim /usr/lib/systemd/system/docker.service
```

添加如下内容：

```shell
ExecStart=/usr/bin/dockerd --tlsverify --tlscacert=/etc/docker/certs/server/ca.pem --tlscert=/etc/docker/certs/server/server-cert.pem --tlskey=/etc/docker/certs/server/server-key.pem  -H tcp://0.0.0.0:2375  -H fd:// --containerd=/run/containerd/containerd.sock
```

重启docker服务

```shell
systemctl daemon-reload
systemctl restart docker
```
# <span id="inline-blue">client端配置tls连接</span>
client端：
使用server文件夹内三个文件ca.pem、key.pem、cert.pem

client远程tls链接测试
```shell
docker --tlsverify --tlscacert=/etc/docker/certs/client/ca.pem --tlscert=/etc/docker/certs/client/cert.pem --tlskey=/etc/docker/certs/client/key.pem -H tcp://10.9.216.12:2375 version
```
![Dockerfile 远程安全连接](/images/docker/20250114/docker_20250114_001.png)


portainer配置tls

![Dockerfile 远程安全连接](/images/docker/20250114/docker_20250114_002.png)

