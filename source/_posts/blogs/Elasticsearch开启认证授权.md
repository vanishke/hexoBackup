# Elasticsearch 开启认证授权

Elasticsearch 开启认证授权之后，很多人第一反应是：直接用 `elastic` 超级账号往业务里塞。能跑，但不安全。

更稳妥的做法是：**先改配置开启 Security，再建角色、挂用户**——配置管「开不开认证」，角色管「能干什么」（授权），用户管「谁在干」（认证）。今天这篇按真实配置与命令拆解，带你完成业务侧认证授权落地，照着做就能用。

> **安全提醒**：文中命令含示例账号密码，仅作运维记录与演示。对外发文、进 Git 前请改成占位符，生产环境务必使用独立强密码，并避免把超级用户凭证写进脚本仓库。

---

## 一、前提：elasticsearch.yml 开启认证授权

创建角色、用户之前，必须先在 Elasticsearch 配置文件 `elasticsearch.yml` 中打开安全相关开关。改完配置后**重启节点**才会生效。

本环境采用的关键示例如下（可按实际证书路径微调）：

```yaml
# Enable security features
xpack.security.enabled: true

xpack.security.enrollment.enabled: false

# Enable encryption for HTTP API client connections, such as Kibana, Logstash, and Agents
xpack.security.http.ssl:
  enabled: false
  keystore.path: certs/http.p12

# Enable encryption and mutual authentication between cluster nodes
xpack.security.transport.ssl:
  enabled: true
  verification_mode: certificate
  keystore.path: certs/transport.p12
  truststore.path: certs/transport.p12
# Create a new cluster with the current node only
# Additional nodes can still join the cluster later
#cluster.initial_master_nodes: ["node-1"]
```

关键要点：

| 配置项 | 本例取值 | 说明 |
|--------|----------|------|
| `xpack.security.enabled` | `true` | 总开关：开启认证与授权 |
| `xpack.security.enrollment.enabled` | `false` | 关闭自动 enrollment（按需） |
| `xpack.security.http.ssl.enabled` | `false` | HTTP 对外暂不强制 HTTPS（内网联调常见） |
| `xpack.security.transport.ssl.enabled` | `true` | 节点间传输加密 + 证书校验 |
| `verification_mode` | `certificate` | transport 层按证书校验 |
| `keystore.path` / `truststore.path` | `certs/transport.p12` | 节点证书与信任库路径需真实存在 |

说明：

1. **`xpack.security.enabled: true` 是后续一切 Security API 的前提**；未开启时，创建角色/用户要么失败，要么无实际意义。  
2. 本例 **HTTP SSL 关闭、Transport SSL 开启**：客户端可用 `http://host:9200` 访问，但集群节点之间仍走加密通道。生产若对外暴露，建议再打开 `http.ssl`。  
3. `certs/*.p12` 需提前准备好，路径相对 ES 配置目录；证书缺失会导致节点起不来。  
4. 修改 `elasticsearch.yml` 后重启，再用 `elastic` 超级用户确认需带账号密码才能访问：

```bash
curl -u 'elastic:你的密码' http://localhost:9200
```

未带凭证访问应被拒绝，说明认证已生效，再继续下面的角色与用户创建。

---

## 二、为什么要自定义角色，而不是继续用 elastic？

典型场景：业务服务要读写人脸索引、API 日志索引，还要查 Zipkin 链路数据。若全程用 `elastic`：

1. 权限过大，一旦密钥泄露，整库可被改写甚至删光  
2. 审计分不清「业务操作」和「管理员操作」  
3. 后续做最小权限、轮换密钥都会很难下手  

核心原则就一句：

**业务只拿业务需要的索引权限；集群管理权限留给运维账号。**

下面这套方案会创建：

| 对象 | 名称 | 作用 |
|------|------|------|
| 角色 | `coframe_editor` | 对指定索引模式具备 read / write / delete |
| 用户 | `coframe_user` | 业务侧连接 ES 的账号，绑定上述角色 |

索引范围：`face*`、`es_log_api_*`、`zipkin-*`。

---

## 三、操作前检查清单

动手前确认这几项，能少踩一半坑：

1. **`elasticsearch.yml` 已按上文开启** `xpack.security.enabled: true`，并完成重启  
2. **Transport 证书文件存在**（本例 `certs/transport.p12`），节点能正常启动  
3. **本机能访问** `http://localhost:9200`（或实际节点地址）  
4. **手边有管理员账号**，本例用内置超级用户 `elastic` 调用 Security API  
5. **具备 `manage_security` 集群权限**（`elastic` 默认具备）  
6. **先建角色、再建用户**（用户引用的角色必须已存在）

验证集群是否存活且已强制认证：

```bash
curl -u 'elastic:你的密码' http://localhost:9200
```

看到集群名称与版本号即可继续。

---

## 四、四步落地：从角色到用户

### 步骤 1：设计角色权限边界

本例角色 `coframe_editor` 的设计意图：

- `cluster: []`：不给任何集群级权限（不能管节点、不能随便建角色）  
- `indices.names`：用通配符限定业务相关索引  
- `privileges`：`read`、`write`、`delete`——覆盖查询、写入、删除文档/索引操作中常见需求  
- `allow_restricted_indices: false`：不允许碰受限系统索引（更安全）

权限够用即可，不要一上来给 `all`。

### 步骤 2：创建角色 coframe_editor

```bash
curl -u 'elastic:coshipOk698?' -X POST http://localhost:9200/_security/role/coframe_editor \
-H "Content-Type: application/json" \
-d '{
  "cluster": [],
  "indices": [
    {
      "names": ["face*","es_log_api_*","zipkin-*"],
      "privileges": ["read", "write", "delete"],
      "allow_restricted_indices": false
    }
  ]
}'
```

成功时通常返回：

```json
{
  "role": {
    "created": true
  }
}
```

若角色已存在再执行一次，`created` 会变为 `false`，表示**更新成功**（该 API 是创建或更新语义）。

字段速查：

| 字段 | 含义 |
|------|------|
| `names` | 索引名或模式，支持 `*` 通配 |
| `privileges` | 索引级权限列表 |
| `cluster` | 集群级权限；空数组表示无 |
| `allow_restricted_indices` | 是否可访问受限索引 |

### 步骤 3：创建用户 coframe_user 并绑定角色

角色就绪后，创建业务用户并挂上 `coframe_editor`：

```bash
curl -u 'elastic:coshipOk698?' -X POST http://127.0.0.1:9200/_security/user/coframe_user \
-H "Content-Type:application/json" \
-d '{
  "password": "coshipOk698?",
  "roles": ["coframe_editor"],
  "full_name": "es-coframe"
}'
```

成功响应示例：

```json
{
  "created": true
}
```

要点说明：

- `password`：新建用户时必填，长度至少 6 位  
- `roles`：角色名数组，必须是已存在的角色  
- `full_name`：展示名，便于运维识别（本例为 `es-coframe`）  
- 同一 API 再次调用可更新用户；只改密码时也可用专门的 Change Password API  

### 步骤 4：验证角色、用户与真实读写

查角色：

```bash
curl -u 'elastic:coshipOk698?' http://localhost:9200/_security/role/coframe_editor
```

查用户：

```bash
curl -u 'elastic:coshipOk698?' http://localhost:9200/_security/user/coframe_user
```

用业务账号做一次认证探测（按你环境替换索引与 DSL）：

```bash
curl -u 'coframe_user:coshipOk698?' \
  -H "Content-Type: application/json" \
  -X GET "http://localhost:9200/face*/_search?size=1"
```

再故意访问无权限索引（例如系统索引），应返回授权失败——说明最小权限生效。

业务侧连接串示例（按客户端调整）：

```text
用户名：coframe_user
密码：******（与创建时一致）
地址：http://es-host:9200
```

应用配置里请改用 `coframe_user`，不要再写 `elastic`。

---

## 五、常见踩坑与排查

### 1. 节点启动失败 / Security 未生效

- `elasticsearch.yml` 改完未重启  
- `xpack.security.enabled` 未设为 `true`  
- `transport.ssl` 已开但 `certs/transport.p12` 路径错误或文件缺失  

### 2. 401 Unauthorized

- 管理员密码错误，或 Security 未启用  
- 业务用户密码写错、用户被禁用  

### 3. 403 security_exception

- 用户角色未包含目标索引  
- 索引名与通配符不匹配（注意前缀：`face*` 匹配 `face_xxx`，不匹配 `xxx_face`）  
- 需要集群级操作却给了空的 `cluster`  

### 4. 角色创建成功但用户仍无权限

- 用户 `roles` 写错角色名（大小写敏感）  
- 改了角色后客户端仍缓存旧会话（重启应用或刷新连接）  

### 5. 通配符理解偏差

| 模式 | 大致匹配 |
|------|----------|
| `face*` | `face`、`face_v1`、`face_xxx`… |
| `es_log_api_*` | `es_log_api_202608` 等 |
| `zipkin-*` | `zipkin-span-2026-08-31` 等 |

上线前用真实索引名对照一遍通配符，比事后补权限省事得多。

---

## 六、可复用模板（复制即改）

把下面两段当成团队标准模板，改名字、索引、密码即可：

```bash
# 1) 创建/更新角色
curl -u 'elastic:${ES_ADMIN_PASS}' -X POST "http://${ES_HOST}:9200/_security/role/${ROLE_NAME}" \
-H "Content-Type: application/json" \
-d "{
  \"cluster\": [],
  \"indices\": [
    {
      \"names\": [\"face*\",\"es_log_api_*\",\"zipkin-*\"],
      \"privileges\": [\"read\", \"write\", \"delete\"],
      \"allow_restricted_indices\": false
    }
  ]
}"

# 2) 创建/更新用户
curl -u 'elastic:${ES_ADMIN_PASS}' -X POST "http://${ES_HOST}:9200/_security/user/${USER_NAME}" \
-H "Content-Type: application/json" \
-d "{
  \"password\": \"${USER_PASS}\",
  \"roles\": [\"${ROLE_NAME}\"],
  \"full_name\": \"es-coframe\"
}"
```

密码建议用环境变量注入，不要明文贴进公开文档或 CI 日志。

