---
title: Hexo安装渲染引擎
tags: 
	- Hexo
categories: 
	- Hexo

date: 2022-05-17 11:33:49
updated: 2022-05-17 11:33:49

---

## <span id="inline-blue">卸载默认引擎</span>



```shell
npm uninstall hexo-renderer-marked –save
```



## <span id="inline-blue">安装新渲染引擎和katex引擎</span>

```shell
npm install hexo-renderer-markdown-it --save
npm install markdown-it-katex --save
```

## <span id="inline-blue">引擎设置</span>

修改hexo根目录下_config.xml

```shell
# Markdown-it config
## Docs: https://github.com/celsomiranda/hexo-renderer-markdown-it/wiki/
markdown:
  render:
    html: true
    xhtmlOut: false
    breaks: true
    linkify: true
    typographer: true
    quotes: '“”‘’'
  plugins:
  anchors:
    level: 2
    collisionSuffix: ''

math:
  engine: 'katex'   
  katex:
    css: https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.11.1/katex.min.css
    js: https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.11.1/katex.min.js
    config:
      # KaTeX config
      throwOnError: false
      errorColor: "#cc0000"   

```

## <span id="inline-blue">开启NexT主题math支持</span>

修改next主题下_config.xml

```shell
# Math Formulas Render Support
math:
  # Default (true) will load mathjax / katex script on demand.
  # That is it only render those page which has `mathjax: true` in Front-matter.
  # If you set it to false, it will load mathjax / katex srcipt EVERY PAGE.
  per_page: true

  # hexo-renderer-pandoc (or hexo-renderer-kramed) required for full MathJax support.
  mathjax:
    enable: false
    # See: https://mhchem.github.io/MathJax-mhchem/
    mhchem: false

  # hexo-renderer-markdown-it-plus (or hexo-renderer-markdown-it with markdown-it-katex plugin) required for full Katex support.
  katex:
    enable: true
    # See: https://github.com/KaTeX/KaTeX/tree/master/contrib/copy-tex
    copy_tex: false
```




