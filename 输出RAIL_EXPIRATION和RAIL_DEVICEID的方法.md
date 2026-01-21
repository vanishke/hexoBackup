# 如何输出 RAIL_EXPIRATION 和 RAIL_DEVICEID

## ⚠️ 重要提示

如果 Cookie 中找不到这些值，它们可能存储在：
- **localStorage** 或 **sessionStorage** 中
- 通过 **JavaScript 变量**动态生成
- 在 **网络请求**的参数中传递
- Cookie 名称可能有**大小写变化**或**前缀**

## 🔍 方法一：全面搜索所有存储位置（推荐）

在 12306 查询页面的浏览器控制台（F12）中执行以下代码，它会自动搜索所有可能的存储位置：

```javascript
(function(){
    console.log("=== 开始全面搜索 RAIL_DEVICEID 和 RAIL_EXPIRATION ===\n");
    
    var result = {
        RAIL_DEVICEID: {},
        RAIL_EXPIRATION: {}
    };
    
    // 1. 检查 Cookie（包括大小写变化）
    function getAllCookies() {
        var cookies = {};
        if (document.cookie) {
            document.cookie.split(';').forEach(function(cookie) {
                var parts = cookie.trim().split('=');
                if (parts.length === 2) {
                    cookies[parts[0]] = parts[1];
                }
            });
        }
        return cookies;
    }
    
    var allCookies = getAllCookies();
    console.log("1. 检查所有 Cookie:");
    Object.keys(allCookies).forEach(function(key) {
        if (key.toUpperCase().includes('RAIL') || key.toUpperCase().includes('DEVICE') || key.toUpperCase().includes('EXPIRATION')) {
            console.log("  找到 Cookie:", key, "=", allCookies[key]);
            if (key.toUpperCase().includes('DEVICEID')) {
                result.RAIL_DEVICEID.cookie = allCookies[key];
            }
            if (key.toUpperCase().includes('EXPIRATION')) {
                result.RAIL_EXPIRATION.cookie = allCookies[key];
            }
        }
    });
    
    // 2. 检查 localStorage
    console.log("\n2. 检查 localStorage:");
    try {
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && (key.toUpperCase().includes('RAIL') || key.toUpperCase().includes('DEVICE') || key.toUpperCase().includes('EXPIRATION'))) {
                var value = localStorage.getItem(key);
                console.log("  找到 localStorage:", key, "=", value);
                if (key.toUpperCase().includes('DEVICEID')) {
                    result.RAIL_DEVICEID.localStorage = value;
                }
                if (key.toUpperCase().includes('EXPIRATION')) {
                    result.RAIL_EXPIRATION.localStorage = value;
                }
            }
        }
    } catch(e) {
        console.log("  localStorage 不可用");
    }
    
    // 3. 检查 sessionStorage
    console.log("\n3. 检查 sessionStorage:");
    try {
        for (var i = 0; i < sessionStorage.length; i++) {
            var key = sessionStorage.key(i);
            if (key && (key.toUpperCase().includes('RAIL') || key.toUpperCase().includes('DEVICE') || key.toUpperCase().includes('EXPIRATION'))) {
                var value = sessionStorage.getItem(key);
                console.log("  找到 sessionStorage:", key, "=", value);
                if (key.toUpperCase().includes('DEVICEID')) {
                    result.RAIL_DEVICEID.sessionStorage = value;
                }
                if (key.toUpperCase().includes('EXPIRATION')) {
                    result.RAIL_EXPIRATION.sessionStorage = value;
                }
            }
        }
    } catch(e) {
        console.log("  sessionStorage 不可用");
    }
    
    // 4. 检查 jQuery Cookie 插件
    console.log("\n4. 检查 jQuery Cookie 插件:");
    if (typeof $.cookie !== 'undefined') {
        var deviceId = $.cookie("RAIL_DEVICEID");
        var expiration = $.cookie("RAIL_EXPIRATION");
        console.log("  $.cookie('RAIL_DEVICEID'):", deviceId);
        console.log("  $.cookie('RAIL_EXPIRATION'):", expiration);
        if (deviceId) result.RAIL_DEVICEID.jqueryCookie = deviceId;
        if (expiration) result.RAIL_EXPIRATION.jqueryCookie = expiration;
    } else {
        console.log("  jQuery Cookie 插件未加载");
    }
    
    // 5. 检查全局变量
    console.log("\n5. 检查全局变量:");
    var globalVars = ['RAIL_DEVICEID', 'RAIL_EXPIRATION', 'rail_deviceid', 'rail_expiration'];
    globalVars.forEach(function(varName) {
        if (typeof window[varName] !== 'undefined') {
            console.log("  找到全局变量:", varName, "=", window[varName]);
            if (varName.toUpperCase().includes('DEVICEID')) {
                result.RAIL_DEVICEID.globalVar = window[varName];
            }
            if (varName.toUpperCase().includes('EXPIRATION')) {
                result.RAIL_EXPIRATION.globalVar = window[varName];
            }
        }
    });
    
    // 6. 输出最终结果
    console.log("\n=== 搜索结果汇总 ===");
    console.table({
        RAIL_DEVICEID: result.RAIL_DEVICEID,
        RAIL_EXPIRATION: result.RAIL_EXPIRATION
    });
    
    // 返回第一个找到的值
    var finalResult = {
        RAIL_DEVICEID: result.RAIL_DEVICEID.cookie || 
                       result.RAIL_DEVICEID.localStorage || 
                       result.RAIL_DEVICEID.sessionStorage || 
                       result.RAIL_DEVICEID.jqueryCookie || 
                       result.RAIL_DEVICEID.globalVar || 
                       null,
        RAIL_EXPIRATION: result.RAIL_EXPIRATION.cookie || 
                        result.RAIL_EXPIRATION.localStorage || 
                        result.RAIL_EXPIRATION.sessionStorage || 
                        result.RAIL_EXPIRATION.jqueryCookie || 
                        result.RAIL_EXPIRATION.globalVar || 
                        null
    };
    
    console.log("\n=== 最终值 ===");
    console.log("RAIL_DEVICEID:", finalResult.RAIL_DEVICEID);
    console.log("RAIL_EXPIRATION:", finalResult.RAIL_EXPIRATION);
    
    return finalResult;
})();
```

## 方法二：分别检查各个存储位置

### 2.1 检查所有 Cookie（包括大小写变化）

```javascript
// 列出所有 Cookie，查找包含 RAIL、DEVICE、EXPIRATION 的
document.cookie.split(';').forEach(function(cookie) {
    var parts = cookie.trim().split('=');
    if (parts.length === 2) {
        var key = parts[0];
        var value = parts[1];
        if (key.toUpperCase().includes('RAIL') || 
            key.toUpperCase().includes('DEVICE') || 
            key.toUpperCase().includes('EXPIRATION')) {
            console.log(key + " = " + value);
        }
    }
});
```

### 2.2 检查 localStorage

```javascript
// 列出所有 localStorage 键值对
for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    var value = localStorage.getItem(key);
    if (key && (key.toUpperCase().includes('RAIL') || 
                key.toUpperCase().includes('DEVICE') || 
                key.toUpperCase().includes('EXPIRATION'))) {
        console.log("localStorage[" + key + "] = " + value);
    }
}
```

### 2.3 检查 sessionStorage

```javascript
// 列出所有 sessionStorage 键值对
for (var i = 0; i < sessionStorage.length; i++) {
    var key = sessionStorage.key(i);
    var value = sessionStorage.getItem(key);
    if (key && (key.toUpperCase().includes('RAIL') || 
                key.toUpperCase().includes('DEVICE') || 
                key.toUpperCase().includes('EXPIRATION'))) {
        console.log("sessionStorage[" + key + "] = " + value);
    }
}
```

### 2.4 使用 jQuery Cookie 插件（如果页面已加载）

```javascript
// 读取 RAIL_DEVICEID
var deviceId = $.cookie("RAIL_DEVICEID");
console.log("RAIL_DEVICEID:", deviceId);

// 读取 RAIL_EXPIRATION
var expiration = $.cookie("RAIL_EXPIRATION");
console.log("RAIL_EXPIRATION:", expiration);

// 同时输出两个值
console.log({
    RAIL_DEVICEID: $.cookie("RAIL_DEVICEID"),
    RAIL_EXPIRATION: $.cookie("RAIL_EXPIRATION")
});
```

### 2.5 使用原生 JavaScript 读取 Cookie

```javascript
// 读取 Cookie 的辅助函数
function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
    return null;
}

// 输出两个值
var deviceId = getCookie("RAIL_DEVICEID");
var expiration = getCookie("RAIL_EXPIRATION");

console.log("RAIL_DEVICEID:", deviceId);
console.log("RAIL_EXPIRATION:", expiration);

// 或者以对象形式输出
console.log({
    RAIL_DEVICEID: deviceId,
    RAIL_EXPIRATION: expiration
});
```

## 方法二：使用代码中已有的 Cookie 读取函数

如果页面已经加载了代码中的 `jQuery.ht_getcookie` 函数，可以使用：

```javascript
// 使用代码中定义的函数
var deviceId = jQuery.ht_getcookie("RAIL_DEVICEID");
var expiration = jQuery.ht_getcookie("RAIL_EXPIRATION");

console.log("RAIL_DEVICEID:", deviceId);
console.log("RAIL_EXPIRATION:", expiration);
```

## 方法三：在代码中直接添加输出语句

如果需要修改原代码，可以在代码中适当位置添加：

```javascript
// 在代码中读取这两个值的位置（大约在第 100 行附近）
var RAIL_DEVICEID = $.cookie("RAIL_DEVICEID");
var RAIL_EXPIRATION = $.cookie("RAIL_EXPIRATION");

// 添加输出语句
console.log("RAIL_DEVICEID:", RAIL_DEVICEID);
console.log("RAIL_EXPIRATION:", RAIL_EXPIRATION);

// 或者使用 alert（不推荐，会阻塞页面）
// alert("RAIL_DEVICEID: " + RAIL_DEVICEID + "\nRAIL_EXPIRATION: " + RAIL_EXPIRATION);
```

## 方法三：监控网络请求获取值

这些值可能在网络请求中传递，可以通过以下方式捕获：

### 3.1 使用浏览器开发者工具监控网络请求

1. 打开浏览器开发者工具（F12）
2. 切换到 **Network（网络）** 标签
3. 刷新页面或执行查询操作
4. 查看所有请求的 **Headers（请求头）** 和 **Payload（请求体）**
5. 在 **Cookies** 标签或 **Request Headers** 中查找 `RAIL_DEVICEID` 和 `RAIL_EXPIRATION`

### 3.2 使用 JavaScript 拦截网络请求

```javascript
// 拦截 XMLHttpRequest
(function() {
    var originalOpen = XMLHttpRequest.prototype.open;
    var originalSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url) {
        this._url = url;
        return originalOpen.apply(this, arguments);
    };
    
    XMLHttpRequest.prototype.send = function(data) {
        this.addEventListener('load', function() {
            // 检查请求 URL 和响应
            if (this._url && (this._url.includes('12306') || this._url.includes('query'))) {
                console.log('请求 URL:', this._url);
                console.log('请求数据:', data);
                // 检查请求数据中是否包含 RAIL_DEVICEID 或 RAIL_EXPIRATION
                if (data && (data.includes('RAIL_DEVICEID') || data.includes('RAIL_EXPIRATION'))) {
                    console.log('找到相关参数:', data);
                }
            }
        });
        return originalSend.apply(this, arguments);
    };
})();

// 拦截 fetch
(function() {
    var originalFetch = window.fetch;
    window.fetch = function() {
        var args = arguments;
        return originalFetch.apply(this, args).then(function(response) {
            console.log('Fetch 请求:', args[0]);
            return response;
        });
    };
})();
```

## 方法四：监控 Cookie 的设置过程

如果值是通过 JavaScript 动态设置的，可以监控设置过程：

```javascript
// 监控 Cookie 的设置
(function() {
    var originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') || 
                                   Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');
    
    if (originalCookieDescriptor && originalCookieDescriptor.set) {
        Object.defineProperty(document, 'cookie', {
            get: function() {
                return originalCookieDescriptor.get.call(this);
            },
            set: function(val) {
                if (val && (val.toUpperCase().includes('RAIL') || 
                           val.toUpperCase().includes('DEVICE') || 
                           val.toUpperCase().includes('EXPIRATION'))) {
                    console.log('设置 Cookie:', val);
                    console.trace('调用堆栈:');
                }
                return originalCookieDescriptor.set.call(this, val);
            }
        });
    }
    
    // 监控 jQuery Cookie 插件
    if (typeof $ !== 'undefined' && $.cookie) {
        var originalCookie = $.cookie;
        $.cookie = function(name, value, options) {
            if (name && (name.toUpperCase().includes('RAIL') || 
                        name.toUpperCase().includes('DEVICE') || 
                        name.toUpperCase().includes('EXPIRATION'))) {
                console.log('jQuery Cookie 操作:', name, '=', value);
                console.trace('调用堆栈:');
            }
            return originalCookie.apply(this, arguments);
        };
    }
})();
```

## 方法五：使用浏览器开发者工具查看存储

### 5.1 查看 Cookie

1. 打开浏览器开发者工具（F12）
2. 切换到 **Application**（Chrome）或 **存储**（Firefox）标签
3. 在左侧找到 **Cookies** → 选择当前网站域名（如 `www.12306.cn`）
4. 在右侧列表中**查找所有 Cookie**，注意大小写变化
5. 可以直接查看和复制它们的值

### 5.2 查看 localStorage

1. 打开浏览器开发者工具（F12）
2. 切换到 **Application**（Chrome）或 **存储**（Firefox）标签
3. 在左侧找到 **Local Storage** → 选择当前网站域名
4. 在右侧列表中查找相关键值

### 5.3 查看 sessionStorage

1. 打开浏览器开发者工具（F12）
2. 切换到 **Application**（Chrome）或 **存储**（Firefox）标签
3. 在左侧找到 **Session Storage** → 选择当前网站域名
4. 在右侧列表中查找相关键值

## 方法六：检查代码中的变量赋值

如果值是通过 JavaScript 代码动态生成的，可以搜索代码：

```javascript
// 在控制台搜索页面中所有包含这些关键字的代码
(function() {
    var scripts = document.getElementsByTagName('script');
    var found = [];
    
    for (var i = 0; i < scripts.length; i++) {
        var script = scripts[i];
        if (script.textContent) {
            var content = script.textContent;
            if (content.includes('RAIL_DEVICEID') || content.includes('RAIL_EXPIRATION')) {
                // 提取相关代码片段
                var lines = content.split('\n');
                lines.forEach(function(line, index) {
                    if (line.includes('RAIL_DEVICEID') || line.includes('RAIL_EXPIRATION')) {
                        found.push({
                            script: i,
                            line: index + 1,
                            code: line.trim()
                        });
                    }
                });
            }
        }
    }
    
    console.log('找到相关代码:');
    found.forEach(function(item) {
        console.log('脚本 ' + item.script + ', 行 ' + item.line + ':', item.code);
    });
    
    return found;
})();
```

## 方法七：使用 JavaScript 书签（Bookmarklet）

创建一个书签，点击后自动搜索并输出这两个值：

```javascript
javascript:(function(){
    console.log("=== 开始搜索 RAIL_DEVICEID 和 RAIL_EXPIRATION ===");
    
    var result = {RAIL_DEVICEID: null, RAIL_EXPIRATION: null};
    
    // 1. 检查 Cookie
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if(parts.length == 2) return parts.pop().split(";").shift();
        return null;
    }
    
    // 检查所有可能的 Cookie 名称
    var cookieNames = ['RAIL_DEVICEID', 'rail_deviceid', 'Rail_DeviceId', 'RAIL_EXPIRATION', 'rail_expiration', 'Rail_Expiration'];
    cookieNames.forEach(function(name) {
        var value = getCookie(name);
        if (value) {
            if (name.toUpperCase().includes('DEVICEID')) result.RAIL_DEVICEID = value;
            if (name.toUpperCase().includes('EXPIRATION')) result.RAIL_EXPIRATION = value;
        }
    });
    
    // 2. 检查 localStorage
    try {
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && key.toUpperCase().includes('DEVICEID')) {
                result.RAIL_DEVICEID = localStorage.getItem(key);
            }
            if (key && key.toUpperCase().includes('EXPIRATION')) {
                result.RAIL_EXPIRATION = localStorage.getItem(key);
            }
        }
    } catch(e) {}
    
    // 3. 检查 sessionStorage
    try {
        for (var i = 0; i < sessionStorage.length; i++) {
            var key = sessionStorage.key(i);
            if (key && key.toUpperCase().includes('DEVICEID')) {
                result.RAIL_DEVICEID = sessionStorage.getItem(key);
            }
            if (key && key.toUpperCase().includes('EXPIRATION')) {
                result.RAIL_EXPIRATION = sessionStorage.getItem(key);
            }
        }
    } catch(e) {}
    
    // 4. 检查 jQuery Cookie
    if (typeof $ !== 'undefined' && $.cookie) {
        if (!result.RAIL_DEVICEID) result.RAIL_DEVICEID = $.cookie("RAIL_DEVICEID");
        if (!result.RAIL_EXPIRATION) result.RAIL_EXPIRATION = $.cookie("RAIL_EXPIRATION");
    }
    
    console.log("搜索结果:", result);
    alert("RAIL_DEVICEID: " + (result.RAIL_DEVICEID || "未找到") + "\nRAIL_EXPIRATION: " + (result.RAIL_EXPIRATION || "未找到"));
    
    return result;
})();
```

使用方法：
1. 复制上面的代码
2. 在浏览器中创建新书签
3. 将代码粘贴到书签的 URL 地址中
4. 在 12306 页面点击该书签即可搜索并输出值

## ⚠️ 注意事项和常见问题

### 为什么找不到这些值？

1. **值可能还未生成**：
   - 这些值可能是通过 JavaScript 动态生成的
   - 需要等待页面完全加载或执行某些操作后才生成
   - 尝试刷新页面或执行查询操作后再查找

2. **存储位置不同**：
   - 可能存储在 `localStorage` 或 `sessionStorage` 中，而不是 Cookie
   - 可能通过 JavaScript 变量临时存储
   - 可能只在网络请求中传递，不存储在客户端

3. **Cookie 名称变化**：
   - 名称可能有大小写变化（如 `rail_deviceid`、`Rail_DeviceId`）
   - 可能有前缀或后缀（如 `_RAIL_DEVICEID`、`RAIL_DEVICEID_12306`）
   - 可能使用了不同的命名规则

4. **域名和路径限制**：
   - Cookie 可能只在特定域名下有效（如 `www.12306.cn` 或 `kyfw.12306.cn`）
   - 需要在正确的页面执行代码
   - 某些 Cookie 可能有路径限制

5. **Cookie 已过期或被清除**：
   - 如果用户首次访问，这些值可能还未设置
   - Cookie 可能已过期或被浏览器清除
   - 隐私模式下可能无法访问某些存储

6. **动态生成**：
   - 这些值可能是通过服务器端脚本动态生成的
   - 可能需要先登录或执行某些操作
   - 可能通过 AJAX 请求异步获取

### 结合你当前抓包的结论（`queryG` 余票查询接口）

你抓到的请求为：

- `GET https://kyfw.12306.cn/otn/leftTicket/queryG?...`
- `Referer: https://kyfw.12306.cn/otn/leftTicket/init?...`
- **Request Headers 的 `cookie` 里包含**：`_uab_collina`、`tk`、`JSESSIONID`、`route`、`_jc_save_*`、`BIGipServer*` 等
- **没有** `RAIL_DEVICEID` / `RAIL_EXPIRATION`

这说明：**至少在“余票查询（leftTicket）”这条链路里，前端请求并不依赖这两个字段**。网上很多旧教程提到的 `RAIL_DEVICEID/RAIL_EXPIRATION` 很可能已在新版站点中 **废弃/改名/迁移** 到其他机制。

如果你必须确认“站点是否还会下发 `RAIL_*`”，建议把抓包范围扩大到以下更可能出现风控/设备标识相关字段的流程：

- **登录相关**：`passport.12306.cn` 域名下的登录/校验/滑块等请求
- **下单/提交相关**：提交订单、排队、确认等关键接口请求
- **跳转/重定向**：首次进入站点、登录跳转时的 302 响应头 `Set-Cookie`

同时注意：如果 `RAIL_*` 以 **HttpOnly Cookie** 下发，**JavaScript（包括本文的搜索脚本）永远读不到**，只能在开发者工具的 Cookies 面板或抓包里看到。

### 调试建议

1. **使用方法一（全面搜索）**：这是最可靠的方法，会自动搜索所有可能的存储位置
2. **检查网络请求**：打开 Network 标签，查看请求头中是否包含这些值
3. **等待页面加载**：确保页面完全加载后再执行搜索代码
4. **尝试不同页面**：在不同的 12306 页面（首页、查询页、登录页）尝试
5. **清除缓存重试**：清除浏览器缓存和 Cookie 后重新访问，观察值的生成过程
6. **使用监控代码**：使用方法三的监控代码，观察这些值何时被设置

### 其他注意事项

1. **安全性**：这些值可能包含敏感信息，请妥善保管
2. **时效性**：`RAIL_EXPIRATION` 表示过期时间，需要定期更新
3. **法律合规**：请确保使用这些值符合相关法律法规和网站使用条款
4. **跨域限制**：这些值可能受到浏览器同源策略限制

## 📋 完整示例代码（推荐使用）

这是一个完整的、经过优化的搜索函数，会尝试所有可能的方法：

```javascript
/**
 * 全面搜索 RAIL_DEVICEID 和 RAIL_EXPIRATION
 * 返回找到的值或 null
 */
function findRailValues() {
    var result = {
        RAIL_DEVICEID: null,
        RAIL_EXPIRATION: null,
        foundIn: {
            RAIL_DEVICEID: null,
            RAIL_EXPIRATION: null
        }
    };
    
    // 辅助函数：获取 Cookie
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
        return null;
    }
    
    // 辅助函数：搜索所有 Cookie（包括大小写变化）
    function searchAllCookies() {
        var cookies = {};
        if (document.cookie) {
            document.cookie.split(';').forEach(function(cookie) {
                var parts = cookie.trim().split('=');
                if (parts.length === 2) {
                    cookies[parts[0]] = parts[1];
                }
            });
        }
        return cookies;
    }
    
    // 1. 尝试标准 Cookie 名称
    var deviceId = getCookie("RAIL_DEVICEID");
    var expiration = getCookie("RAIL_EXPIRATION");
    if (deviceId) {
        result.RAIL_DEVICEID = deviceId;
        result.foundIn.RAIL_DEVICEID = "cookie (标准名称)";
    }
    if (expiration) {
        result.RAIL_EXPIRATION = expiration;
        result.foundIn.RAIL_EXPIRATION = "cookie (标准名称)";
    }
    
    // 2. 搜索所有 Cookie（包括大小写变化）
    if (!result.RAIL_DEVICEID || !result.RAIL_EXPIRATION) {
        var allCookies = searchAllCookies();
        Object.keys(allCookies).forEach(function(key) {
            var upperKey = key.toUpperCase();
            if (upperKey.includes('DEVICEID') && upperKey.includes('RAIL')) {
                if (!result.RAIL_DEVICEID) {
                    result.RAIL_DEVICEID = allCookies[key];
                    result.foundIn.RAIL_DEVICEID = "cookie (" + key + ")";
                }
            }
            if (upperKey.includes('EXPIRATION') && upperKey.includes('RAIL')) {
                if (!result.RAIL_EXPIRATION) {
                    result.RAIL_EXPIRATION = allCookies[key];
                    result.foundIn.RAIL_EXPIRATION = "cookie (" + key + ")";
                }
            }
        });
    }
    
    // 3. 尝试 jQuery Cookie 插件
    if (typeof $ !== 'undefined' && $.cookie) {
        if (!result.RAIL_DEVICEID) {
            var deviceId = $.cookie("RAIL_DEVICEID");
            if (deviceId) {
                result.RAIL_DEVICEID = deviceId;
                result.foundIn.RAIL_DEVICEID = "jQuery Cookie";
            }
        }
        if (!result.RAIL_EXPIRATION) {
            var expiration = $.cookie("RAIL_EXPIRATION");
            if (expiration) {
                result.RAIL_EXPIRATION = expiration;
                result.foundIn.RAIL_EXPIRATION = "jQuery Cookie";
            }
        }
    }
    
    // 4. 搜索 localStorage
    try {
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key) {
                var upperKey = key.toUpperCase();
                if (upperKey.includes('DEVICEID') && upperKey.includes('RAIL')) {
                    if (!result.RAIL_DEVICEID) {
                        result.RAIL_DEVICEID = localStorage.getItem(key);
                        result.foundIn.RAIL_DEVICEID = "localStorage (" + key + ")";
                    }
                }
                if (upperKey.includes('EXPIRATION') && upperKey.includes('RAIL')) {
                    if (!result.RAIL_EXPIRATION) {
                        result.RAIL_EXPIRATION = localStorage.getItem(key);
                        result.foundIn.RAIL_EXPIRATION = "localStorage (" + key + ")";
                    }
                }
            }
        }
    } catch(e) {}
    
    // 5. 搜索 sessionStorage
    try {
        for (var i = 0; i < sessionStorage.length; i++) {
            var key = sessionStorage.key(i);
            if (key) {
                var upperKey = key.toUpperCase();
                if (upperKey.includes('DEVICEID') && upperKey.includes('RAIL')) {
                    if (!result.RAIL_DEVICEID) {
                        result.RAIL_DEVICEID = sessionStorage.getItem(key);
                        result.foundIn.RAIL_DEVICEID = "sessionStorage (" + key + ")";
                    }
                }
                if (upperKey.includes('EXPIRATION') && upperKey.includes('RAIL')) {
                    if (!result.RAIL_EXPIRATION) {
                        result.RAIL_EXPIRATION = sessionStorage.getItem(key);
                        result.foundIn.RAIL_EXPIRATION = "sessionStorage (" + key + ")";
                    }
                }
            }
        }
    } catch(e) {}
    
    // 6. 检查全局变量
    var globalVars = ['RAIL_DEVICEID', 'RAIL_EXPIRATION', 'rail_deviceid', 'rail_expiration'];
    globalVars.forEach(function(varName) {
        if (typeof window[varName] !== 'undefined') {
            if (varName.toUpperCase().includes('DEVICEID') && !result.RAIL_DEVICEID) {
                result.RAIL_DEVICEID = window[varName];
                result.foundIn.RAIL_DEVICEID = "globalVar (" + varName + ")";
            }
            if (varName.toUpperCase().includes('EXPIRATION') && !result.RAIL_EXPIRATION) {
                result.RAIL_EXPIRATION = window[varName];
                result.foundIn.RAIL_EXPIRATION = "globalVar (" + varName + ")";
            }
        }
    });
    
    return result;
}

// 执行搜索
var result = findRailValues();

// 输出结果
console.log("=== 搜索结果 ===");
console.log("RAIL_DEVICEID:", result.RAIL_DEVICEID || "未找到");
console.log("  来源:", result.foundIn.RAIL_DEVICEID || "无");
console.log("RAIL_EXPIRATION:", result.RAIL_EXPIRATION || "未找到");
console.log("  来源:", result.foundIn.RAIL_EXPIRATION || "无");

// 以表格形式输出
console.table({
    RAIL_DEVICEID: {
        值: result.RAIL_DEVICEID || "未找到",
        来源: result.foundIn.RAIL_DEVICEID || "无"
    },
    RAIL_EXPIRATION: {
        值: result.RAIL_EXPIRATION || "未找到",
        来源: result.foundIn.RAIL_EXPIRATION || "无"
    }
});

// 注意：控制台最外层不能写 return，否则会报 “Illegal return statement”
```

## 🚀 快速测试（一键执行）

在浏览器控制台直接粘贴并执行以下代码：

```javascript
(function(){
    console.log("=== 快速搜索 RAIL_DEVICEID 和 RAIL_EXPIRATION ===\n");
    
    var result = {RAIL_DEVICEID: null, RAIL_EXPIRATION: null};
    var sources = {RAIL_DEVICEID: [], RAIL_EXPIRATION: []};
    
    // 搜索 Cookie
    var cookies = document.cookie.split(';').reduce(function(acc, cookie) {
        var parts = cookie.trim().split('=');
        if (parts.length === 2) acc[parts[0]] = parts[1];
        return acc;
    }, {});
    
    Object.keys(cookies).forEach(function(key) {
        var upper = key.toUpperCase();
        if (upper.includes('DEVICEID') && upper.includes('RAIL')) {
            result.RAIL_DEVICEID = cookies[key];
            sources.RAIL_DEVICEID.push('Cookie: ' + key);
        }
        if (upper.includes('EXPIRATION') && upper.includes('RAIL')) {
            result.RAIL_EXPIRATION = cookies[key];
            sources.RAIL_EXPIRATION.push('Cookie: ' + key);
        }
    });
    
    // 搜索 localStorage
    try {
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key) {
                var upper = key.toUpperCase();
                if (upper.includes('DEVICEID') && upper.includes('RAIL')) {
                    result.RAIL_DEVICEID = localStorage.getItem(key);
                    sources.RAIL_DEVICEID.push('localStorage: ' + key);
                }
                if (upper.includes('EXPIRATION') && upper.includes('RAIL')) {
                    result.RAIL_EXPIRATION = localStorage.getItem(key);
                    sources.RAIL_EXPIRATION.push('localStorage: ' + key);
                }
            }
        }
    } catch(e) {}
    
    // 搜索 sessionStorage
    try {
        for (var i = 0; i < sessionStorage.length; i++) {
            var key = sessionStorage.key(i);
            if (key) {
                var upper = key.toUpperCase();
                if (upper.includes('DEVICEID') && upper.includes('RAIL')) {
                    result.RAIL_DEVICEID = sessionStorage.getItem(key);
                    sources.RAIL_DEVICEID.push('sessionStorage: ' + key);
                }
                if (upper.includes('EXPIRATION') && upper.includes('RAIL')) {
                    result.RAIL_EXPIRATION = sessionStorage.getItem(key);
                    sources.RAIL_EXPIRATION.push('sessionStorage: ' + key);
                }
            }
        }
    } catch(e) {}
    
    // 输出结果
    console.log("RAIL_DEVICEID:", result.RAIL_DEVICEID || "❌ 未找到");
    if (sources.RAIL_DEVICEID.length > 0) {
        console.log("  来源:", sources.RAIL_DEVICEID.join(", "));
    }
    
    console.log("\nRAIL_EXPIRATION:", result.RAIL_EXPIRATION || "❌ 未找到");
    if (sources.RAIL_EXPIRATION.length > 0) {
        console.log("  来源:", sources.RAIL_EXPIRATION.join(", "));
    }
    
    if (!result.RAIL_DEVICEID && !result.RAIL_EXPIRATION) {
        console.log("\n⚠️ 未找到任何值，建议：");
        console.log("1. 确保在 12306 查询页面执行");
        console.log("2. 等待页面完全加载");
        console.log("3. 尝试执行查询操作后再搜索");
        console.log("4. 检查 Network 标签中的请求头");
    }
    
    return result;
})();
```

