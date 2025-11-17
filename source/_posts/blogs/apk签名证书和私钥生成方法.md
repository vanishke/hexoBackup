---
title: apk签名证书和私钥生成方法
categories:
	- keyTool
tags: 
	- keyTool
	- Java

date: 2025-11-14 16:07:18
updated: 2025-11-14 16:07:18
---
<!-- toc -->
# <span id="inline-blue">使用keytool生成密钥对，存储到JKS格式的密钥库中</span>

```shell
keytool -genkeypair \
  -alias istore \                  
  -keyalg RSA \                    
  -keysize 2048 \                  
  -validity 3650 \                 
  -keystore istore.jks \           
  -storepass 123456 \              
  -keypass 123456                  
```
参数 <br>
-alias      密钥对的别名（用于标识该密钥对，后续操作需引用）<br>
-keyalg     加密算法为RSA（非对称加密算法）<br>
-keysize    密钥长度2048位（安全性较高，常用长度）<br>
-validity   证书有效期10年（3650天）<br>
-keystore   生成的密钥库文件名为istore.jks（JKS是Java默认格式）<br>
-storepass  密钥库的访问密码（保护整个密钥库）<br>
-keypass    密钥对自身的密码（保护私钥，此处与密钥库密码相同）<br>

# <span id="inline-blue">从JKS密钥库中导出证书（DER格式，包含公钥</span>
```shell
keytool -exportcert \
  -alias istore \                  
  -keystore istore.jks \           
  -storepass 123456 \              
  -file istore.cer                 
```

参数 <br>
-alias      要导出的密钥对别名（需与生成时一致）<br>
-keystore   源密钥库文件 <br>
-storepass  密钥库访问密码（验证权限）<br>
-file       导出的证书文件名（DER格式，二进制）<br>

# <span id="inline-blue">使用openssl将DER格式证书转换为PEM格式（文本格式，便于查看和使用</span>


```shell
openssl x509 \
  -inform der \                    
  -in istore.cer \                 
  -out public.pem                  
```
参数 <br>
-inform      输入格式为DER（二进制）<br>
-in          输入的DER格式证书文件 <br>
-out         输出的PEM格式文件（包含公钥）<br>

# <span id="inline-blue">将JKS格式密钥库转换为PKCS12格式(更通用的密钥库格式，跨平台支持更好)</span>

```shell
keytool -importkeystore \
  -srckeystore istore.jks \        
  -srcstoretype JKS \              
  -srcstorepass 123456 \           
  -destkeystore istore.p12 \       
  -deststoretype PKCS12 \          
  -deststorepass 123456 \          
  -alias istore                    
```

参数 <br>
-srckeystore   源JKS密钥库 <br>
-srcstoretype  源密钥库类型为JKS <br>
-srcstorepass  源密钥库密码 <br>
-destkeystore  目标PKCS12密钥库文件名 <br>
-deststoretype 目标密钥库类型为PKCS12 <br>
-deststorepass 目标密钥库密码 <br>
-alias         要转换的密钥对别名 <br>

# <span id="inline-blue">从PKCS12密钥库中提取私钥(PEM格式，文本)</span>


```shell
openssl pkcs12 \
  -in istore.p12 \                 
  -nodes \                         
  -nocerts \                       
  -out temp_private_key.pem        
```

参数 <br>
-in      输入的PKCS12密钥库 <br>
-nodes   不加密私钥（否则会要求设置私钥密码）<br>
-nocerts 只提取私钥，不提取证书 <br>
-out     输出的临时私钥文件（PEM格式）<br>

# <span id="inline-blue">将PEM格式私钥转换为PKCS#8 DER格式(二进制，常用于Java等平台)</span>

```shell
openssl pkcs8 \
  -topk8 \                         
  -inform PEM \                    
  -outform DER \                   
  -in temp_private_key.pem \       
  -out private.pk8 \               
  -nocrypt                         
```

参数 <br>
-topk8   转换为PKCS#8格式（私钥的标准格式）<br>
-inform  输入格式为PEM（文本）<br>
-outform 输出格式为DER（二进制）<br>
-in      输入的PEM格式私钥 <br>
-out     输出的PKCS#8 DER格式私钥文件 <br>
-nocrypt 不加密输出文件（否则会要求设置密码）<br>

