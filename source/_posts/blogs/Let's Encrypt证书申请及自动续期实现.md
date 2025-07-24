---
title: Let's Encrypt证书申请及自动续期实现
categories:
	- Let's Encrypt
	- https
tags: 
	- Let's Encrypt
	- https
	
date: 2025-06-01 17:28:37
updated: 2025-06-01 17:28:37
---
<!-- toc -->
# <span id="inline-blue">环境</span>
Linux：CentOS Linux release 7.9.2009 (Core)

# <span id="inline-blue">背景</span>

项目通过docker部署，使用的https证书一直是自签名证书，在商业环境下，一些场景总是提示链接不安全，所以将证书升级为乐此加密颁发的https证书

Let's Encrypt是由互联网安全研究小组(ISRG)运营的非盈利性 证书颁发机构，免费提供用于传输层安全性(TLS) 加密的X.509证书。
它是世界上最大的证书颁发机构， 被超过 6 亿个网站使用，目标是所有网站都安全并使用HTTPS。
该服务提供商互联网安全研究小组(ISRG) 是一个公益组织。主要赞助商包括电子前沿基金会(EFF)、Mozilla 基金会、OVHcloud、思科系统公司、Facebook、谷歌 Chrome、互联网协会、AWS、Nginx和比尔及梅琳达·盖茨基金会。
其他合作伙伴包括证书颁发机构IdenTrust、密歇根大学( UM)、和Linux 基金会。

优点：

1、完全免费，零成本部署​

与传统商业证书（如DigiCert、Symantec）不同，乐此加密提供与付费证书相同加密强度的SSL证书（如RSA 2048位加密），且无隐藏费用。
特别适合个人开发者、小型企业及非营利组织，无需预算即可实现HTTPS加密，推动全网加密普及。

2、自动化部署与续期​

ACME协议支持​​：通过自动化工具（如Certbot）可实现证书的申请、部署和续期全流程自动化，减少人工干预风险。
​​简化运维​​：证书有效期90天，但自动续期机制确保服务不间断，避免因证书过期导致网站访问中断。

3、支持通配符证书（泛域名证书）​

覆盖无限子域名​​：一张*.example.com证书可保护所有同级子域名（如blog.example.com、shop.example.com），无需为每个子域名单独申请证书。
​​灵活扩展​​：适合多子域名架构（如SaaS平台、企业门户），新增服务时无需重复配置证书。
​​成本效益​​：通配符证书在商业CA中价格高昂（年费通常上千元），而乐此加密免费提供。


4、广泛兼容性与标准化加密​

兼容性全面​​：支持所有主流浏览器（Chrome、Firefox等）、服务器环境（Nginx/Apache）及移动设备，无兼容性风险。
​​行业标准加密​​：采用SHA-2算法和RSA/ECC密钥，保障数据传输的机密性与完整性，符合PCI DSS等合规要求。

5、 基础安全功能完善​

域名验证（DV）​​：通过DNS记录（CNAME/TXT）验证域名所有权，快速签发证书，适用于基础加密需求。
​​抵御中间人攻击​​：加密传输防止数据被窃取或篡改，尤其对登录、支付等敏感操作至关重要。

# <span id="inline-blue">证书申请</span>

官网地址：https://letsencrypt.top/

登录之后申请证书，信息如下：

![乐此加密证书申请](/images/Let's Encrypt/202500601/letsEncrypt_20250601_001.png)

下载证书

![乐此加密证书下载](/images/Let's Encrypt/202500601/letsEncrypt_20250601_002.png)

一般服务对外提供https都是使用nginx代理，默认在nginx 类型就可以，而且客户端不用导入证书就能够自动识别。

证书验证

![乐此加密证书验证](/images/Let's Encrypt/202500601/letsEncrypt_20250601_003.png)

验证步骤参考: https://blog.csdn.net/yangjing19910801/article/details/145815648

# <span id="inline-blue">自动续期</span>

```shell
#!/bin/bash

# 乐此加密证书自动续期脚本
# 适用场景：多个nginx证书目录，自动续期并同步，自动重载docker swarm nginx服务，并支持多节点证书同步

# 1. 证书参数配置
TOKEN="4TIWrE0GxCXmVJd1jAAzSVltYnZOWpeGflD7sn56eYOl5lJge+8fZ/UWM4cMdLF5"
DOMAIN="*.test.example.com,test.example.com"
NGINX_SERVICE="test-nginx"
EMQX_NGINX_SERVICE="emqx-nginx"

# 2. 证书目录配置
API_DIR="/usr/local/docker/nginx/https/api"
DOWNLOAD_DIR="/usr/local/docker/nginx/https/download"
MQTT_DIR="/usr/local/docker/nginx/https/mqtt"

KEY_FILE="server.key"
CERT_FILE="server.pem"

# 3. 多节点同步配置
SYNC_TO_OTHER_NODES=true
REMOTE_NODES=(
  "47.253.9.140:/usr/local/docker/emqx_nginx/https"
  # "192.168.1.100:/usr/local/docker/nginx/https"
  # "192.168.1.101:/usr/local/docker/nginx/https"
)

# 0. 检查并安装乐此加密续期命令
if [ ! -f /usr/bin/letsencrypt-renew ]; then
  echo "[INFO] 未检测到 letsencrypt-renew，正在下载安装..."
  curl -o /usr/bin/letsencrypt-renew https://letsencrypt.top/download/letsencrypt-renew
  chmod +x /usr/bin/letsencrypt-renew
  if [ ! -f /usr/bin/letsencrypt-renew ]; then
    echo "[ERROR] letsencrypt-renew 安装失败，退出。"
    exit 1
  fi
  echo "[INFO] letsencrypt-renew 安装完成。"
fi

# 检查证书剩余天数
CERT_PATH="${API_DIR}/${CERT_FILE}"
if [ ! -f "$CERT_PATH" ]; then
  echo "[ERROR] 未找到证书文件 $CERT_PATH，无法检测有效期，退出。"
  exit 1
fi

end_date=$(openssl x509 -in "$CERT_PATH" -noout -enddate | cut -d= -f2)
if [ -z "$end_date" ]; then
  echo "[ERROR] 证书到期日解析失败，退出。"
  exit 1
fi

end_ts=$(date -d "$end_date" +%s)
now_ts=$(date +%s)
let days_left=($end_ts-$now_ts)/86400

echo "[INFO] 当前证书剩余 $days_left 天到期。"

if [ $days_left -gt 15 ]; then
  echo "[INFO] 证书剩余天数大于15天，无需续期，退出。"
  exit 0
fi

# 4. 自动续期主证书（API目录）
echo "[INFO] $(date) 证书即将到期，开始自动续期证书..."
/usr/bin/letsencrypt-renew \
  -token=${TOKEN} \
  -key_path=${API_DIR}/${KEY_FILE} \
  -server_type=nginx \
  -cert_path=${API_DIR}/${CERT_FILE} \
  -domains="${DOMAIN}" \
  -backup=true

RENEW_STATUS=$?
if [ $RENEW_STATUS -ne 0 ]; then
  echo "[ERROR] 证书续期失败，退出。"
  exit 1
fi

echo "[INFO] 证书续期成功，开始同步到其他目录..."

# 5. 同步证书到 download 和 mqtt 目录
cp -f ${API_DIR}/${KEY_FILE} ${DOWNLOAD_DIR}/${KEY_FILE}
cp -f ${API_DIR}/${CERT_FILE} ${DOWNLOAD_DIR}/${CERT_FILE}

cp -f ${API_DIR}/${KEY_FILE} ${MQTT_DIR}/${KEY_FILE}
cp -f ${API_DIR}/${CERT_FILE} ${MQTT_DIR}/${CERT_FILE}

echo "[INFO] 本地目录证书同步完成..."

# 6. 同步证书到其他Docker Swarm节点（基于免密信任）
if [ "$SYNC_TO_OTHER_NODES" = "true" ]; then
  echo "[INFO] 开始同步证书到其他Docker Swarm节点..."

  for node_config in "${REMOTE_NODES[@]}"; do
    REMOTE_IP=$(echo $node_config | cut -d':' -f1)
    REMOTE_DIR=$(echo $node_config | cut -d':' -f2)

    echo "[INFO] 同步到节点: $REMOTE_IP:$REMOTE_DIR"

    ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@$REMOTE_IP "mkdir -p $REMOTE_DIR/api $REMOTE_DIR/download $REMOTE_DIR/mqtt" 2>/dev/null

    scp -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${API_DIR}/${KEY_FILE} root@$REMOTE_IP:${REMOTE_DIR}/api/ 2>/dev/null
    scp -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${API_DIR}/${CERT_FILE} root@$REMOTE_IP:${REMOTE_DIR}/api/ 2>/dev/null

    scp -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${API_DIR}/${KEY_FILE} root@$REMOTE_IP:${REMOTE_DIR}/download/ 2>/dev/null
    scp -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${API_DIR}/${CERT_FILE} root@$REMOTE_IP:${REMOTE_DIR}/download/ 2>/dev/null

    scp -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${API_DIR}/${KEY_FILE} root@$REMOTE_IP:${REMOTE_DIR}/mqtt/ 2>/dev/null
    scp -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${API_DIR}/${CERT_FILE} root@$REMOTE_IP:${REMOTE_DIR}/mqtt/ 2>/dev/null

    if [ $? -eq 0 ]; then
      echo "[INFO] 节点 $REMOTE_IP 证书同步成功"
    else
      echo "[WARNING] 节点 $REMOTE_IP 证书同步失败，请检查网络连接或SSH配置"
    fi
  done
else
  echo "[INFO] 跳过多节点同步（SYNC_TO_OTHER_NODES=false）"
fi

echo "[INFO] 证书同步完成，准备重载nginx服务..."

# 7. 重载nginx服务（docker swarm）
docker service update --force ${NGINX_SERVICE}
RELOAD_STATUS=$?
if [ $RELOAD_STATUS -eq 0 ]; then
  echo "[INFO] nginx服务重载成功"
else
  echo "[ERROR] nginx服务重载失败，请手动检查。"
fi

# 8. 重载emqx-nginx服务（docker swarm）
docker service update --force ${EMQX_NGINX_SERVICE}
RELOAD_STATUS=$?
if [ $RELOAD_STATUS -eq 0 ]; then
  echo "[INFO] EMQX nginx服务重载成功"
else
  echo "[ERROR] EMQX nginx服务重载失败，请手动检查。"
fi

echo "证书自动续期流程完成"
```