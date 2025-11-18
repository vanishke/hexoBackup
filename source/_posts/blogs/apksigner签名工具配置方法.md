---
title: apksigner签名工具配置方法
categories:
	- Apksigner
tags: 
	- Apksigner
	- Java

date: 2025-11-14 17:23:02
updated: 2025-11-14 17:23:02
---
<!-- toc -->


apksigner是android sdk提供的android 实现V1 V2应用签名的签名工具，在不安装安装android-studio的前提下，想要实现使用apksigner工具实现对应用进行签名，最好的办法是通过android命令行工具cmdline-tools实现build-tools的安装，apksigner就包含在build-tools工具集里面。下面介绍通过cmdline-tools安装build-tools的方法。

cmdline-tool版本与JDK对应关系参考 :https://likfe.com/2023/11/21/cmdlineToolsWithJdk/

# <span id="inline-blue">安装cmdline-tools</span>

## <span id="inline-blue">Linux</span>

本地使用jdk1.8，对应cmdline-tools下载地址为: 
https://dl.google.com/android/repository/commandlinetools-linux-9123335_latest.zip

### <span id="inline-blue">上传</span>

下载完成之后通过XFtp上传到服务器目录，示例: /usr/local/android-tools

### <span id="inline-blue">解压</span>

```shell
unzip commandlinetools-linux-9123335_latest.zip
```

解压之后生成cmdline-tools目录，需要在cmdline-tools目录下新建latest子目录，并将cmdline-tools目录下的内容移动到latest目录下，这样做是为了解决后续命令行执行sdkmanager 安装build-tools报错问题,最终cmdline-tools目录如下：
![cmdline-tools目录](/images/Apksigner_Linux_20251118_001.png)


### <span id="inline-blue">赋予可执行权限</span>

```shell
cd /usr/local/android-tools/cmdline-tools/latest/bin
chmod a+x *
```

### <span id="inline-blue">安装build-tools</span>

build-tools在24.0.3及之后的版本提供apksigner工具，目前安装使用的34.0.0版本

```shell
cd /usr/local/android-tools/cmdline-tools/latest/bin
#执行以下命令进行安装
./sdkmanager "build-tools;34.0.0"
```

### <span id="inline-blue">配置环境变量</span>

```shell
vim /etc/profile
#文件末尾增加以下三行内容
export ANDROID_BUILD_TOOL_HOME=/usr/local/android-tools/build-tools/34.0.0
export PATH=$PATH:$ANDROID_BUILD_TOOL_HOME
export PATH

#重新加载/etc/profile
source /etc/profile
```

### <span id="inline-blue">验证</span>

```shell
apksigner --help
```

![apksigner验证](/images/Apksigner_Linux_20251118_002.png)

## <span id="inline-blue">Windows</span>

本地使用jdk1.8，对应cmdline-tools下载地址为: 
https://dl.google.com/android/repository/commandlinetools-win-9123335_latest.zip


### <span id="inline-blue">安装cmdline-tools</span>

1. 下载后解压commandlinetools-win-9123335_latest.zip，指定解压到指定目录，示例: D:\android-sdk
2. 在解压缩的 cmdline-tools 目录中，创建一个名为 latest 文件夹。
3. 将原始 cmdline-tools 目录内容都移动到新创建的 latest 目录中。
最终cmdline-tools目录结构如下所示：

![cmdline-tools安装](/images/Apksigner/Apksigner_Windows_20251118_003.png)

### <span id="inline-blue">安装build-tools</span>

build-tools在24.0.3及之后的版本提供apksigner工具，目前安装使用的34.0.0版本

运行命令行终端，不要使用powershell,必须使用旧版cmd.

```shell
.\sdkmanager.bat build-tools;34.0.0
```

安装完成后，cmdline-tools同级目录会增加build-tools目录

![build-tools安装](/images/Apksigner/Apksigner_Windows_20251118_004.png)

apksigner签名工具位于build-tools目录下，具体位置如下:

![build-tools安装](/images/Apksigner/Apksigner_Windows_20251118_005.png)

### <span id="inline-blue">配置环境变量</span>

为了方便应用程序调用，为apksigner工具配置环境变量

![build-tools安装](/images/Apksigner/Apksigner_Windows_20251118_006.png)


### <span id="inline-blue">验证</span>

![Apksigner验证](/images/Apksigner/Apksigner_Windows_20251118_007.png)

