---
title: DM8安装部署记录
categories:
	- DM8

date: 2024-07-08 11:25:20
tags: 
	- DM8
---
<!-- toc -->
# <span id="inline-blue">背景</span>
ORACLE数据库基于安全考虑迁移至达梦数据库，采用达梦8
# <span id="inline-blue">安装</span>

## <span id="inline-blue">下载达梦8安装包</span>
下载地址:
https://download.dameng.com/eco/adapter/DM8/202405/dm8_20240408_x86_rh7_64_ent_8.1.3.140.zip
下载之后本地解压dm8_20240408_x86_rh7_64_ent_8.1.3.140.zip文件得到文件内容如下：
![DM8](/images/DM8/DM8_20240708_001.png)
dm8_20240408_x86_rh7_64.iso直接上传服务器挂载发现执行挂载命令报错
![DM8](/images/DM8/DM8_20240708_002.png)
通过第三方工具DAEMON Tools Lite加载镜像iso文件，将镜像内部文件拷贝出来，再上传服务器。
DAEMON Tools Lite下载地址: https://www.xitongzhijia.net/soft/215783.html
下载完成后通过快速装载加载DM8镜像iso文件
![DM8](/images/DM8/DM8_20240708_003.png)
镜像加载后在电脑本地文件出现如下标识，双击进去之后可以看到DMInstall.bin就是需要上传的安装文件
![DM8](/images/DM8/DM8_20240708_004.png)
![DM8](/images/DM8/DM8_20240708_005.png)
## <span id="inline-blue">安装</span>
参考官方安装文档地址：https://eco.dameng.com/document/dm/zh-cn/start/install-dm-linux-prepare.html

## <span id="inline-blue">安装过程中遇到的问题</span>

### <span id="inline-blue">DMInstall.bin安装启动失败</span>
描述：DmServiceDMSERVER start命令之后后没有启动成功
原因：没有使用dmdba用户初始化实例
解决方案：重新使用dmdba用户初始化数据库实例

### <span id="inline-blue">Red Hat 7.9安装达梦数据库DM8图形化显示英文和乱码</span>
描述：DM8图形化显示英文和乱码
原因：系统缺失相应的字体依赖
解决方案：安装字体库
```shell
[root@S21612 dm]#export LANG=zh_CN.UTF8
[root@S21612 dm]#yum groupinstall Fonts
```


### <span id="inline-blue"> Could not load SWT library. Reasons</span>
描述：./DMInstall.bin -i 执行报错，java.lang.UnsatisfiedLinkError: Could not load SWT library. Reasons:     no swt-pi-gtk-3659
原因：缺失gtk依赖
解决方案：
```shell
[root@S21612 dm]# yum search gtk
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
======================================================================= N/S matched: gtk ========================================================================
adwaita-gtk2-theme.x86_64 : Adwaita gtk2 theme
avahi-ui-gtk3.x86_64 : Gtk user interface library for Avahi (Gtk+ 3 version)
clutter-gtk.x86_64 : A basic GTK clutter widget
colord-gtk.x86_64 : GTK support library for colord
gstreamer1-plugins-bad-free-gtk.x86_64 : GStreamer "bad" plugins gtk plugin
gtk-vnc2.x86_64 : A GTK3 widget for VNC clients
gtk2.x86_64 : The GIMP ToolKit (GTK+), a library for creating GUIs for X
gtk2-devel.x86_64 : Development files for GTK+
gtk2-devel-docs.x86_64 : Developer documentation for GTK+
gtk2-immodule-xim.x86_64 : XIM support for GTK+
gtk3.x86_64 : GTK+ graphical user interface library
gtk3-devel.x86_64 : Development files for GTK+
gtk3-immodule-xim.x86_64 : XIM support for GTK+
gtkhtml3.x86_64 : GtkHTML library
gtkmm24.x86_64 : C++ interface for GTK2 (a GUI library for X)
gtkmm30.x86_64 : C++ interface for the GTK+ library
gtkspell.x86_64 : On-the-fly spell checking for GtkTextView widgets
gtkspell3.x86_64 : On-the-fly spell checking for GtkTextView widgets
ibus-gtk2.x86_64 : IBus IM module for GTK2
ibus-gtk3.x86_64 : IBus IM module for GTK3
kcm-gtk.x86_64 : Configure the appearance of GTK apps in KDE
libcanberra-gtk2.x86_64 : Gtk+ 2.x Bindings for libcanberra
libcanberra-gtk3.x86_64 : Gtk+ 3.x Bindings for libcanberra
libchamplain-gtk.x86_64 : Gtk+ widget wrapper for libchamplain
libpeas-gtk.x86_64 : GTK+ plug-ins support for libpeas
libreoffice-gtk2.x86_64 : LibreOffice GTK+ 2 integration plug-in
libreoffice-gtk3.x86_64 : LibreOffice GTK+ 3 integration plug-in
libreport-gtk.x86_64 : GTK front-end for libreport
oxygen-gtk.noarch : Oxygen GTK theme
oxygen-gtk2.x86_64 : Oxygen GTK+2 theme
pinentry-gtk.x86_64 : Passphrase/PIN entry dialog based on GTK+
pygtk2.x86_64 : Python bindings for GTK+
pygtk2-libglade.x86_64 : A wrapper for the libglade library for use with PyGTK
spice-gtk3.x86_64 : A GTK3 widget for SPICE clients
webkitgtk3.x86_64 : GTK+ Web content engine library
webkitgtk4.x86_64 : GTK+ Web content engine library
webkitgtk4-devel.x86_64 : Development files for webkitgtk4
webkitgtk4-jsc.x86_64 : JavaScript engine from webkitgtk4
webkitgtk4-jsc-devel.x86_64 : Development files for JavaScript engine from webkitgtk4
webkitgtk4-plugin-process-gtk2.x86_64 : GTK+ 2 based NPAPI plugins support for webkitgtk4
xdg-desktop-portal-gtk.x86_64 : Backend implementation for xdg-desktop-portal using GTK+
PackageKit-gtk3-module.x86_64 : Install fonts automatically using PackageKit
anaconda-widgets.x86_64 : A set of custom GTK+ widgets for use with anaconda
at-spi2-atk.x86_64 : A GTK+ module that bridges ATK to D-Bus at-spi
at-spi2-atk-devel.x86_64 : A GTK+ module that bridges ATK to D-Bus at-spi
authconfig-gtk.x86_64 : Graphical tool for setting up authentication from network services
gnome-bluetooth-libs.x86_64 : GTK+ Bluetooth device selection widgets
gnome-settings-daemon.x86_64 : The daemon sharing settings from GNOME to GTK+/KDE applications
gspell.x86_64 : Spell-checking library for GTK+
gtk-update-icon-cache.x86_64 : Icon theme caching utility
gtksourceview3.x86_64 : A library for viewing source files
libnm-gtk.x86_64 : Private libraries for NetworkManager GUI support
libsexy.x86_64 : Funky fresh graphical widgets for GTK+ 2
libtimezonemap.x86_64 : Time zone map widget for Gtk+
pidgin.x86_64 : A Gtk+ based multiprotocol instant messaging client
usermode-gtk.x86_64 : Graphical tools for certain user account management tasks
xdg-user-dirs-gtk.x86_64 : Gnome integration of special directories

  Name and summary matches only, use "search all" for everything.
[root@S21612 dm]# 
#安装gtk2.x86_64、gtk2.x86_64即可
[root@S21612 dm]# yum install gtk2.x86_64
[root@S21612 dm]# yum install gtk2.x86_64
```

### <span id="inline-blue">xhost: command not found</span>
描述：-bash: xhost: command not found
原因：缺失xorg-x11-server-utils对应依赖
解决方案：yum安装xorg-x11-server-utils依赖
```shell
#查找对应的依赖所在包位置
[root@S21612 bin]# yum whatprovides "*/xhost"
Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
xorg-x11-server-utils-7.7-20.el7.x86_64 : X.Org X11 X server utilities
Repo        : media
Matched from:
Filename    : /usr/bin/xhost



xorg-x11-server-utils-7.7-20.el7.x86_64 : X.Org X11 X server utilities
Repo        : @media
Matched from:
Filename    : /usr/bin/xhost
#安装
[root@S21612 bin]#yum install -y xorg-x11-server-utils-7.7-20.el7.x86_64
```
### <span id="inline-blue">No more handles [gtk_init_check() failed</span>
描述：No more handles [gtk_init_check()] failed
原因：当前操作系统的登录用户应该为非dmdba 用户，如果在当前会话中启用图形界面需
要将图形界面权限放开
解决方案：切换到root 用户后在命令行中输入xhost +，可以使得dmdba 可以调用图形界面进行安装。
需要在root用户权限下执行如下命令，然后切换到dmdba用户执行：
```shell
[root@S21612 dm]export DISPLAY=10.9.212.55:0.0
[root@S21612 dm]echo $DISPLAY
[root@S21612 dm]xhost +
```
DISPLAY环境变量含义：该方法为本地调用图形化界面，如果希望通过其它机器调用该图形化界面需设置 export DISPLAY=调用图形化机器的IP:0.0，例如，数据库安装机器 IP 为 10.10.12.25，需要在 IP 为 192.132.32.12 的机器上调用图形化界面，需要设置 export DISPLAY=192.132.32.12:0.0
出现这个问题的场景大多都是在Linux安装DM8之后需要使用达梦数据库管理工具和迁移工具，xhost +命令执行的过程中xmanager-broadcast需要一直开启否则可视化界面没有办法在本地显示

启动方式：
![DM8](/images/DM8/DM8_20240708_006.png)



