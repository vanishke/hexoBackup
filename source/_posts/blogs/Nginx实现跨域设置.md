---
title: Nginx实现跨域设置
categories: 
	- Nginx
tags: 
	- Nginx
	
date: 2026-02-28 16:17:07
updated: 2026-02-28 16:17:07
---
<!-- toc -->

## <span id="inline-blue"></span>Nginx 跨域（CORS）配置完整实战笔记

在前后端分离的项目中，前端通过浏览器访问后端 API 时，经常会遇到 CORS（跨域资源共享）问题。  
本文以 Nginx 为网关为例，整理一份**可直接使用**、同时考虑到“后端可能已经返回部分 CORS 头”的完整配置方案。

---

### <span id="inline-blue"></span>一、跨域的本质：HTTP 响应头

浏览器是否允许跨域访问，主要看后端返回的几类 HTTP 头：

- **Access-Control-Allow-Origin**
- **Access-Control-Allow-Credentials**
- **Access-Control-Allow-Methods**
- **Access-Control-Allow-Headers**

你的需求是：

```nginx
add_header 'Access-Control-Allow-Origin' '*' always;
add_header 'Access-Control-Allow-Credentials' 'true';
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
```

并且：**如果响应中已经带有这些头，就不要再添加**。

要实现这一点，有两种典型思路。

---

## <span id="inline-blue"></span>二、方案一（推荐）：统一由 Nginx 管理 CORS（先“隐藏”再统一添加）

在实际生产中，最推荐的做法是：

- **由 Nginx 统一下发 CORS 头**
- 把上游（后端服务）返回的同名 CORS 头统统“隐藏”（丢弃）
- 避免重复与冲突，不去做“存在就不加”的复杂判断

### <span id="inline-blue"></span>2.1 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://backend;  # 你的后端服务 upstream

        # 1. 隐藏后端返回的 CORS 相关响应头，避免重复和冲突
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Credentials;
        proxy_hide_header Access-Control-Allow-Methods;
        proxy_hide_header Access-Control-Allow-Headers;

        # 2. 由 Nginx 统一添加 CORS 响应头
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Credentials "true" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type" always;

        # 3. 处理预检请求（OPTIONS），否则浏览器有时会报错
        if ($request_method = OPTIONS) {
            return 204;
        }
    }
}
```

### <span id="inline-blue"></span>2.2 配置要点说明

- **`proxy_hide_header`**  
  - **作用**：把后端返回的同名响应头“丢掉”，对客户端不可见。  
  - **好处**：不需要判断“有就不加”，而是直接“统一交给 Nginx 发一份标准的头”。

- **`add_header ... always;`**  
  - 默认 `add_header` 只在 200、204、301 等状态码上生效。  
  - 加上 `always` 可以保证在错误响应（如 4xx、5xx）时依然下发这些头，便于前端统一处理。

- **`if ($request_method = OPTIONS)`**  
  - 这是浏览器的预检请求（preflight），常常什么业务逻辑都不需要做，只需要快速返回一个 204 即可。  
  - 此时已经有上面的 `add_header`，预检也会带上完整的 CORS 头。

**总结一句：**用这个方案，你不需要考虑“如果已经有 CORS 头就别加”的问题，直接由 Nginx 统一发一份标准配置，既简单又稳定。

---

## <span id="inline-blue"></span>三、方案二：真正做到“有就不加”（需要第三方模块）

如果你有更严格的需求：

- **后端已有的 CORS 头必须保留**
- 只在“后端没有设置时”由 Nginx 补充

那么，**仅靠 Nginx 自带模块是不够的**，需要借助第三方模块，例如：`headers-more-nginx-module`。

### <span id="inline-blue"></span>3.1 思路说明

- Nginx 提供了 `$upstream_http_*` 变量，可以读取后端返回的响应头，例如：
  - `$upstream_http_access_control_allow_origin`
- 借助 `headers-more-nginx-module` 的 `more_set_headers` 指令，可以在 `if` 逻辑中按条件设置响应头。

### <span id="inline-blue"></span>3.2 示例配置（需要 `headers-more-nginx-module`）

```nginx
http {
    # 确保已经编译/加载了 headers-more-nginx-module
    # load_module modules/ngx_http_headers_more_filter_module.so;

    server {
        listen 80;
        server_name your-domain.com;

        location /api/ {
            proxy_pass http://backend;

            # 仅当后端没有返回对应 CORS 头时，Nginx 才补充这些头
            if ($upstream_http_access_control_allow_origin = "") {
                more_set_headers 'Access-Control-Allow-Origin: *';
                more_set_headers 'Access-Control-Allow-Credentials: true';
                more_set_headers 'Access-Control-Allow-Methods: GET, POST, OPTIONS';
                more_set_headers 'Access-Control-Allow-Headers: DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
            }

            if ($request_method = OPTIONS) {
                return 204;
            }
        }
    }
}
```

### <span id="inline-blue"></span>3.3 注意点

- 需要在编译 Nginx 时加上 `--add-module=...` 或使用已经集成此模块的发行版。
- 上面的判断只针对 `Access-Control-Allow-Origin`，你也可以按需对其它头做类似判断。
- 这种方式更“精细”，但也更复杂，维护成本略高，一般只在有强需求保留后端原始头信息时才使用。

---

## <span id="inline-blue"></span>四、两种方案对比与实践建议

- **方案一：统一由 Nginx 管理 CORS（推荐）**
  - **优点**：实现简单、行为一致、排查方便。
  - **做法**：隐藏上游同名头 + Nginx 统一添加。
  - **适用场景**：绝大多数前后端分离、网关统一管理场景。

- **方案二：条件补充（有则不加）**
  - **优点**：可以保留后端原有的 CORS 头，仅在缺失时补足。
  - **缺点**：依赖第三方模块，部署与维护复杂度更高。
  - **适用场景**：对后端已有 CORS 头有严格保留要求，或逐步迁移到 Nginx 统一管理的过渡阶段。

**实践建议：**

- 如果你能控制后端服务配置，推荐直接采用**方案一**，把 CORS 彻底下沉到 Nginx。
- 如果遗留系统众多、后端 CORS 配置难以改动，则可以在短期内采用**方案二**做兼容性处理，逐步收口。

---

## <span id="inline-blue"></span>五、常见问题排查建议

- **问题 1：浏览器仍然报跨域错误**
  - 检查是否命中了正确的 `server` 和 `location`；
  - 用 `curl -I` 或浏览器开发者工具查看响应头中是否真的带上了 `Access-Control-Allow-*`。

- **问题 2：预检（OPTIONS）请求失败**
  - 确认是否存在 `if ($request_method = OPTIONS)` 并正常返回（如 204）；
  - 确认 Nginx 对 OPTIONS 请求没有被其它 `location` 截走。

- **问题 3：配置改了没生效**
  - 执行：`nginx -t` 检查配置是否通过；
  - 再执行：`nginx -s reload` 或对应系统服务重启 Nginx；
  - 再次使用 `curl -I` 验证响应头。

通过以上配置与说明，你可以根据自己项目的实际情况，选择：

- **“统一由 Nginx 管理 CORS”** 的简洁方案，  
或  
- **“有则不加、无则补充”** 的精细方案。  

在生产环境中，**保持 CORS 配置的单一来源（通常是网关 Nginx）**，是最易维护、最不易出错的做法。

