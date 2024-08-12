---
title: OpenGauss开启远程连接
categories:
	- OpenGauss
tags: 
	- OpenGauss
	
date: 2024-08-12 09:27:20	
updated: 2024-08-12 09:27:20
---
<!-- toc -->
# <span id="inline-blue">环境</span>
系统：openEuler release 20.03 (LTS-SP3)
数据库： openGauss-6.0.0-RC1
# <span id="inline-blue">背景</span>
使用navicate连接远程OpenGauss数据库，提示没有权限被拒绝。
## <span id="inline-blue">问题一</span>
```shell
 Forbid remote connection with initial user.
```
openGauss不允许使用超员来远程连接，应该重新创建一个数据库用户进而使用远程连接。
## <span id="inline-blue">问题二</span>
```shell
none of the server's SASL authentication mechanisms are supported
```
说明你的用户密码加密方式不支持远程连接，要按如下流程修改。
# <span id="inline-blue">实现</span>

## <span id="inline-blue">修改配置</span>
修改OpenGauss配置文件postgresql.conf，文件路径如下：
/data/openGauss/gaussdb/data/db1
找到password_encryption_type 这个属性，将注释取消，然后将value改成 1（密码格式sha256 MD5 都可用），更改好后按：wq保存
![OpenGauss配置](/images/OpenGauss/OpenGauss_20240812_001.png)
修改OpenGauss配置文件pg_hba.conf，文件路径如下：
/data/openGauss/gaussdb/data/db1
增加如下两项配置，将远程连接授权方式修改为MD5
0.0.0.0 :表示所有外部主机都可以访问
10.9.212.55：表示使用navicate连接OpenGauss的windows主机地址
![OpenGauss配置](/images/OpenGauss/OpenGauss_20240812_002.png)

配置文件修改完成之后需要修改用户的密码。变更加密方式，或者直接重新创建一个用户
```shell
# 创建新用户
CREATE USER admin WITH PASSWORD 'admin@123';

# 更改用户密码
ALTER ROLE admin IDENTIFIED BY '新密码' REPLACE '旧密码'
```
## <span id="inline-blue">navicate连接OpenGauss</span>
![navicate连接OpenGauss](/images/OpenGauss/OpenGauss_20240812_003.png)
![navicate连接OpenGauss](/images/OpenGauss/OpenGauss_20240812_004.png)