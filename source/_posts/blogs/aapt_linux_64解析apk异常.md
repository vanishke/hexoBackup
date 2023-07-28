---
title: aapt_linux_64解析apk异常
categories:
	- Java

date: 2023-02-24 13:44:20
tags: 
	- Linux
	- Java
---
<!-- toc -->

# <span id="inline-blue">现象</span>
./aapt_linux_64 d badging qMGFk7zYMWcN.apk
参数b标识dump
参数badging标识输出详细信息，执行提示如下错误
```shell
./aapt_linux_64 d badging qMGFk7zYMWcN.apk
./aapt_linux_64: error while loading shared libraries: libstdc++.so.6: wrong ELF class: ELFCLASS64
```
# <span id="inline-blue">问题原因</span>
aapt_linux_64工具是32位，目前系统普遍是64位，导致调用32位的库函数失败
64位库函数所在目录/usr/lib64
32为库函数所在目录/usr/lib
# <span id="inline-blue">解决办法</span>
将/usr/lib目录下libstdc++.so.6指向32为库函数文件
准备一个32位libstdc++.so.6文件，例如libstdc++.so.6.0.13
将原始/usr/lib目录下libstdc++.so.6删除，并创建软连接指向libstdc++.so.6.0.13
```shell
cd /usr/lib
#删除原始软连接 
rm -f libstdc++.so.6
#创建软连接
ln -s libstdc++.so.6.0.13 libstdc++.so.6
```
查看一个库函数是32位还是64位
```shell
file libstdc++.so.6.0.13
libstdc++.so.6.0.13: ELF 32-bit LSB shared object, Intel 80386, version 1 (SYSV), dynamically linked, stripped
```
定位一个库函数所在目录
```shell
#locate命令从数据库文件内查找，效率比find高
locate libstdc++.so.6
/usr/lib/libstdc++.so.6
/usr/lib/libstdc++.so.6.0.13
/usr/lib/libstdc++.so.6.0.26
/usr/lib/libstdc++.so.6.bak
/usr/lib64/libstdc++.so.6
/usr/lib64/libstdc++.so.6.0.13
/usr/lib64/libstdc++.so.6.0.26
```
# <span id="inline-blue">验证</span>
```shell
[root@lwdCSCDN home]# ./aapt_linux_64 d  badging qMGFk7zYMWcN.apk
./aapt_linux_64: /usr/lib/libz.so.1: no version information available (required by ./aapt_linux_64)
package: name='com.goke.lmm' versionCode='20220721' versionName='1.29'
sdkVersion:'19'
targetSdkVersion:'25'
uses-permission:'android.permission.GET_TASKS'
uses-permission:'android.permission.READ_EXTERNAL_STORAGE'
uses-permission:'android.permission.WRITE_EXTERNAL_STORAGE'
uses-permission:'android.permission.INTERNET'
uses-permission:'android.permission.GOKE_SYSTEM_MANAGER_SERVICE'
uses-permission:'android.permission.SYSTEM_ALERT_WINDOW'
uses-permission:'android.permission.ACCESS_NETWORK_STATE'
application-label:'媒体中心'
application-label-ca:'媒体中心'
application-label-da:'媒体中心'
application-label-fa:'媒体中心'
application-label-ja:'媒体中心'
application-label-nb:'媒体中心'
application-label-de:'媒体中心'
application-label-af:'媒体中心'
application-label-bg:'媒体中心'
application-label-th:'媒体中心'
application-label-fi:'媒体中心'
application-label-hi:'媒体中心'
application-label-vi:'媒体中心'
application-label-sk:'媒体中心'
application-label-uk:'媒体中心'
application-label-el:'媒体中心'
application-label-nl:'媒体中心'
application-label-pl:'媒体中心'
application-label-sl:'媒体中心'
application-label-tl:'媒体中心'
application-label-am:'媒体中心'
application-label-in:'媒体中心'
application-label-ko:'媒体中心'
application-label-ro:'媒体中心'
application-label-ar:'媒体中心'
application-label-fr:'媒体中心'
application-label-hr:'媒体中心'
application-label-sr:'媒体中心'
application-label-tr:'媒体中心'
application-label-cs:'媒体中心'
application-label-es:'媒体中心'
application-label-it:'媒体中心'
application-label-lt:'媒体中心'
application-label-pt:'媒体中心'
application-label-hu:'媒体中心'
application-label-ru:'媒体中心'
application-label-zu:'媒体中心'
application-label-lv:'媒体中心'
application-label-sv:'媒体中心'
application-label-iw:'媒体中心'
application-label-sw:'媒体中心'
application-label-bs_BA:'媒体中心'
application-label-fr_CA:'媒体中心'
application-label-lo_LA:'媒体中心'
application-label-en_GB:'媒体中心'
application-label-bn_BD:'媒体中心'
application-label-et_EE:'媒体中心'
application-label-ka_GE:'媒体中心'
application-label-ky_KG:'媒体中心'
application-label-km_KH:'媒体中心'
application-label-zh_HK:'媒体中心'
application-label-si_LK:'媒体中心'
application-label-mk_MK:'媒体中心'
application-label-ur_PK:'媒体中心'
application-label-sq_AL:'媒体中心'
application-label-hy_AM:'媒体中心'
application-label-my_MM:'媒体中心'
application-label-zh_CN:'媒体中心'
application-label-pa_IN:'媒体中心'
application-label-ta_IN:'媒体中心'
application-label-te_IN:'媒体中心'
application-label-ml_IN:'媒体中心'
application-label-en_IN:'媒体中心'
application-label-kn_IN:'媒体中心'
application-label-mr_IN:'媒体中心'
application-label-gu_IN:'媒体中心'
application-label-mn_MN:'媒体中心'
application-label-ne_NP:'媒体中心'
application-label-pt_BR:'媒体中心'
application-label-gl_ES:'媒体中心'
application-label-eu_ES:'媒体中心'
application-label-is_IS:'媒体中心'
application-label-es_US:'媒体中心'
application-label-pt_PT:'媒体中心'
application-label-en_AU:'媒体中心'
application-label-zh_TW:'媒体中心'
application-label-be_BY:'媒体中心'
application-label-ms_MY:'媒体中心'
application-label-az_AZ:'媒体中心'
application-label-kk_KZ:'媒体中心'
application-label-uz_UZ:'媒体中心'
application-icon-120:'res/mipmap-mdpi-v4/localplayers_icon.png'
application-icon-160:'res/mipmap-mdpi-v4/localplayers_icon.png'
application-icon-240:'res/mipmap-hdpi-v4/localplayers_icon.png'
application-icon-320:'res/mipmap-xhdpi-v4/localplayers_icon.png'
application-icon-480:'res/mipmap-xxhdpi-v4/localplayers_icon.png'
application-icon-640:'res/mipmap-xxxhdpi-v4/localplayers_icon.png'
application-icon-65534:'res/mipmap-xxxhdpi-v4/localplayers_icon.png'
application: label='媒体中心' icon='res/mipmap-mdpi-v4/localplayers_icon.png'
application-debuggable
launchable-activity: name='com.goke.lmm.MainActivity'  label='' icon=''
uses-feature:'android.hardware.touchscreen'
uses-implied-feature:'android.hardware.touchscreen','assumed you require a touch screen unless explicitly made optional'
uses-feature:'android.hardware.screen.landscape'
uses-implied-feature:'android.hardware.screen.landscape','one or more activities have specified a landscape orientation'
main
other-activities
supports-screens: 'small' 'normal' 'large' 'xlarge'
supports-any-density: 'true'
locales: '--_--' 'ca' 'da' 'fa' 'ja' 'nb' 'de' 'af' 'bg' 'th' 'fi' 'hi' 'vi' 'sk' 'uk' 'el' 'nl' 'pl' 'sl' 'tl' 'am' 'in' 'ko' 'ro' 'ar' '
fr' 'hr' 'sr' 'tr' 'cs' 'es' 'it' 'lt' 'pt' 'hu' 'ru' 'zu' 'lv' 'sv' 'iw' 'sw' 'bs_BA' 'fr_CA' 'lo_LA' 'en_GB' 'bn_BD' 'et_EE' 'ka_GE' 'ky_KG' 'km_KH' 'zh_HK' 'si_LK' 'mk_MK' 'ur_PK' 'sq_AL' 'hy_AM' 'my_MM' 'zh_CN' 'pa_IN' 'ta_IN' 'te_IN' 'ml_IN' 'en_IN' 'kn_IN' 'mr_IN' 'gu_IN' 'mn_MN' 'ne_NP' 'pt_BR' 'gl_ES' 'eu_ES' 'is_IS' 'es_US' 'pt_PT' 'en_AU' 'zh_TW' 'be_BY' 'ms_MY' 'az_AZ' 'kk_KZ' 'uz_UZ'densities: '120' '160' '240' '320' '480' '640' '65534'
```