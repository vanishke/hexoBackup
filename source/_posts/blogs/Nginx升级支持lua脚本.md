---
title: Nginx升级支持lua脚本
categories:
	- Nginx
tags: 
	- Nginx
	- Lua
	
date: 2025-04-21 17:03:09
updated: 2025-04-21 17:03:09
---
<!-- toc -->
# <span id="inline-blue">环境</span>

Linux: CentOS Linux release 7.4.1708 (Core) 
nginx: 1.24.0
luajit2: 2.0.4

# <span id="inline-blue">背景</span>

线上服务支付宝相关接口服务使用nginx代理，请求携带特殊字符导致出现400错误，需要借助lua脚本实现特殊字符编码转换。

# <span id="inline-blue">安装依赖</span>

```shell
yum install -y zlib zlib-devel
yum install gcc-c++
yum install -y pcre pcre-devel
yum install -y openssl openssl-devel
```

# <span id="inline-blue">下载nginx源码</span>

```shell
cd /usr/local/
wget https://nginx.org/download/nginx-1.24.0.tar.gz
tar -zxvf nginx-1.24.0.tar.gz
```

# <span id="inline-blue">下载luajit2并编译</span>

```shell
wget http://luajit.org/download/LuaJIT-2.0.5.tar.gz
$ tar zxvf LuaJIT-2.0.5.tar.gz
$ cd LuaJIT-2.0.5
$ make install
```

或者访问https://github.com/openresty/luajit2/releases/tag/,下载对应版本


## <span id="inline-blue">设置luajit2环境变量</span>
```shell
export LUAJIT_LIB=/usr/local/lib
export LUAJIT_INC=/usr/local/include/luajit-2.0
echo "/usr/local/lib" > /etc/ld.so.conf.d/usr_local_lib.conf
ldconfig
```

# <span id="inline-blue">下载相关模块</span>

## <span id="inline-blue">ngx_devel_kit</span>

```shell
wget https://github.com/simpl/ngx_devel_kit/archive/v0.3.2.tar.gz
tar zxvf v0.3.2.tar.gz
# 解压缩后目录名
#ngx_devel_kit-0.3.2
```


## <span id="inline-blue">lua-nginx-module</span>

```shell
$ wget https://github.com/openresty/lua-nginx-module/archive/v0.10.13.tar.gz
$ tar zxvf v0.10.13.tar.gz
# 解压缩后目录名
lua-nginx-module-0.10.13

```

# <span id="inline-blue">重新编译nginx</span>

```shell
cd /usr/local/nginx-1.24.0

./configure --prefix=/usr/local/nginx --with-openssl=/usr/local/openssl --add-module=../ngx_devel_kit-0.3.2 --add-module=../lua-nginx-module-0.10.13/  --with-ld-opt="-Wl,-rpath,$LUAJIT_LIB"    --with-http_addition_module --with-http_auth_request_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_ssl_module --with-http_stub_status_module --with-http_sub_module --with-http_v2_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module

make && make install
```

执行make命令报如下错误：

```shell
error: 'ngx_http_headers_in_t' has no member named 'cookies'
```

解决办法：


找到模块源码文件，lua-nginx-module-0.10.13/src/ngx_http_lua_headers_in.c
将offsetof(ngx_http_headers_in_t, cookies), 改成 offsetof(ngx_http_headers_in_t, cookie)

重新编译就可以了

# <span id="inline-blue">lua配置</span>

## <span id="inline-blue">nginx添加lua支持</span>

```shell
http {
    # 第三方库（cjson）地址luajit-2.0/lib
    lua_package_path './lua/?.lua;;';
    lua_package_cpath '/usr/local/include/luajit-2.0/lib/?.so;;';
}
```

## <span id="inline-blue">nginx添加lua支持</span>

```shell
			location = /lua_content {
            default_type 'text/plain';
            content_by_lua_block {
                ngx.say('Hello world!')
            }
        }
```

# <span id="inline-blue">验证</span>
![Nginx升级lua](/images/nginx/20250421/nginx_20250421_001.png)
