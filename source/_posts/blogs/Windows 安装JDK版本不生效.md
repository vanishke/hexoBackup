---
title: Windows 安装JDK版本不生效
tags: 
	- JDK
	- Windows
categories: 
	- JDK

date: 2024-10-21 09:20:11	
updated: 2024-10-21 09:20:11
---
# <span id="inline-blue">背景</span> 
Windows安装新版本JDK8，安装之后更改系统环境变量发现不生效
# <span id="inline-blue">解决方案</span> 
查看系统环境变量下JDK和JRE路径是否正常，如下所示：
![Windows JDK设置](/images/Windows/FTP/Windows_FTP_20241021_001.png)
查看系统Path环境变量如下所示：
![Windows JDK设置](/images/Windows/FTP/Windows_FTP_20241021_002.png)
```shell
D:\SecureCRT\;%SystemRoot%\system32;
%SystemRoot%;%SystemRoot%\System32\Wbem;
C:\Program Files (x86)\Common Files\Oracle\Java\javapath;
%JAVA_HOME%\bin;%JRE_HOME%\bin;
D:\Python\Scripts\;D:\Python\;C:\Program Files (x86)\Common Files\NetSarang;
%SYSTEMROOT%\System32\WindowsPowerShell\v1.0\;E:\st-android\android-sdk\platform-tools;
%ANT_HOME%\bin;%MAVEN_HOME%/bin;%MySQL_HOME%/bin;D:\sqlite-tools;
D:\redis_3.2.100\Redis-x64-3.2.100;D:\ffmpeg\bin;D:\nodeJs\;
H:\Git\bin;%MONGODB_HOME%\bin;%PYTHON_HOME%;%PYTHON_HOME%\Scripts;
D:\Python\Scripts\;C:\msys64\mingw64\bin;C:\msys64\mingw64\x86_64-w64-mingw32\bin;%NEXUS_HOME%\bin;
C:\Program Files\TortoiseSVN\bin;C:\Users\909754\AppData\Roaming\npm;%MVND_HOME%\bin
```
%JAVA_HOME%\bin;%JRE_HOME%\bin; 路径引用在C:\Program Files (x86)\Common Files\Oracle\Java\javapath后面，发现在对应路径下面存在java.exe执行文件，Path路径命令查找逻辑是只要找到对应的命令就成功返回，不会全部扫描。
将%JAVA_HOME%\bin;%JRE_HOME%\bin;移动到命令扫描的第一行即可。

# <span id="inline-blue">验证</span> 
![Windows JDK设置](/images/Windows/FTP/Windows_FTP_20241021_003.png)


