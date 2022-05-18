---
title: hexo集成gitalk
categories:
	- hexo
	- Next
tags: 
	- hexo
	- Next
	- gitalk

---

## <span id="inline-blue">注册应用<span>

注册地址：https://github.com/settings/applications/new
![应用注册](/images/hexo/gitalk/hexo_gitalk_2021_01-19_001.png)

参数说明：
Application name //应用名称，随便填
Homepage URL //可以填自己的博客地址
Application description //应用描述
Authorization callback URL //填自己要使用Gitalk的博客地址

应用注册成功后会生成Client ID和Client Secret，记下这两个参数值，后面配置文件会用到。
## <span id="inline-blue">创建仓库<span>
github创建一个仓库用于保存评论
![评论仓库设置](/images/hexo/gitalk/hexo_gitalk_2021_01-19_002.png)

## <span id="inline-blue"> 集成gitalk<span>
1. 新建gitalk.swig

```nodejs
# 文件目录：themes\next\layout_third-party\comments
# 内容如下：
{% if page.comments && theme.gitalk.enable %}

  <link rel="stylesheet" href="https://unpkg.com/gitalk/dist/gitalk.css">

  <script src="https://unpkg.com/gitalk/dist/gitalk.min.js"></script>

   <script type="text/javascript">
        var gitalk = new Gitalk({
          clientID: '{{ theme.gitalk.ClientID }}',
          clientSecret: '{{ theme.gitalk.ClientSecret }}',
          repo: '{{ theme.gitalk.repo }}',
          owner: '{{ theme.gitalk.owner }}',
          admin: {{ theme.gitalk.adminUser }},
          id: {{ theme.gitalk.ID }},
          labels: {{ theme.gitalk.labels }},
          perPage: {{ theme.gitalk.perPage }},
          pagerDirection: '{{ theme.gitalk.pagerDirection }}',
          createIssueManually: {{ theme.gitalk.createIssueManually }},
          distractionFreeMode: {{ theme.gitalk.distractionFreeMode }}
        })
        gitalk.render('gitalk-container')           
       </script>
{% endif %}
```
2. 在gitalk.swig的同级目录下找到index.swig，在文件末尾添加
```nodejs
{% include 'gitalk.swig' %}
```
3. 打开\hexo\themes\next\layout\\_partials\comments.swig,添加以下内容，图中所示位置
![gitalk评论设置](/images/hexo/gitalk/hexo_gitalk_2021_01-19_003.png)

```nodejs
{% elseif theme.gitalk.enable %}
<div id="gitalk-container"></div>
```

4. 修改hexo根目录_config.xml配置文件
```xml
# 以下内容配置时注释需要去掉，否则会引起报错
gitalk:
enable: true #是否开启Gitalk
  ClientID: xxxxxx #创建应用生成的Client ID 
  ClientSecret: xxxxxxxxxxxx #创建应用生成的Client Secret
  repo: gitalk #创建的评论仓库
  owner: iosite #这个项目名的拥有者（GitHub账号或组织）
  adminUser: "['iosite']" #管理员用户
  ID: location.pathname #页面ID，不知道默认就行
  labels: "['Gitalk']" #GitHub issues的标签
  perPage: 15 #每页多少个评论
  pagerDirection: last #排序方式是从旧到新（first）还是从新到旧（last）
  createIssueManually: true #如果当前页面没有相应的 isssue ，且登录的用户属于 admin，则会自动创建 issue。如果设置为 true，则显示一个初始化页面，创建 issue 需要点击 init 按钮。
  distractionFreeMode: false #是否启用快捷键(cmd|ctrl + enter) 提交评论.
```
## <span id="inline-blue">验证<span>
![gitalk评论验证](/images/hexo/gitalk/hexo_gitalk_2021_01-19_004.png)





