---
title: hexo添加分享功能
tags: hexo
categories: hexo
---
## <span id="inline-blue">安装插件</span>
hexo站点根目录目录下执行
```shell
git clone https://github.com/theme-next/theme-next-needmoreshare2 themes/next/source/lib/needsharebutton
```

## <span id="inline-blue">修改Next主题配置文件</span>
打开themes/next/_config.yml 搜索关键字needmoreshare2 修改为下面设置
```xml
needmoreshare2:
  enable: true
  postbottom:
    enable: true #开启底部分享按钮
    options:
      iconStyle: box
      boxForm: horizontal
      position: bottom
      networks: Weibo,Wechat,Douban,QQZone,Twitter,Facebook
  float:
    enable: false #左侧分享不开启
    options:
      iconStyle: box
      boxForm: horizontal
      position: Left
      networks: Weibo,Wechat,Douban,QQZone,Twitter,Facebook
```

## <span id="inline-blue">验证</span>
![分享](/images/hexo/next/hexo_next_2021_01_19_001.png)






