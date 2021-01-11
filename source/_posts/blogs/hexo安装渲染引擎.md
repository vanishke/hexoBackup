---
title: hexo安装渲染引擎
tags: hexo
categories: hexo

---

## 卸载默认引擎



```bash
npm uninstall hexo-renderer-marked –save
```



## 安装新渲染引擎和katex引擎

```bash
npm install hexo-renderer-markdown-it --save
npm install markdown-it-katex --save
```

## 引擎设置

修改hexo根目录下_config.xml

```bash
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

## 开启NexT主题math支持

修改next主题下_config.xml

```bash
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




