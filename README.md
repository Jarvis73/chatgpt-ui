# Test New LLMs (CodeLlama, Llama2, etc.) 

Notice you forked chatgpt-ui. if you're trying to test other LLMs (codellama, wizardcoder, etc.) with it, I just wrote a [1-click proxy](https://github.com/BerriAI/litellm#openai-proxy-server) to translate openai calls to huggingface, anthropic, togetherai, etc. api calls.

**code**
```
$ pip install litellm
$ litellm --model huggingface/bigcode/starcoder
#INFO:     Uvicorn running on http://0.0.0.0:8000
$ aider --openai-api-base http://0.0.0.0:8000
```

I'd love to know if this solves a problem for you

<div align="center">
<h1>ChatGPT UI</h1>
</div>

A ChatGPT web client that supports multiple users, multiple languages, and multiple database connections for persistent data storage.

The server of this project：[https://github.com/WongSaang/chatgpt-ui-server](https://github.com/WongSaang/chatgpt-ui-server)

## Documentation

-   [English](https://wongsaang.github.io/chatgpt-ui/)
-   [中文](https://wongsaang.github.io/chatgpt-ui/zh/)

https://user-images.githubusercontent.com/46235412/227156264-ca17ab17-999b-414f-ab06-3f75b5235bfe.mp4

## Development

需要提前运行后端环境，详情参考后端的开发文档。

如果需要删除 `yarn.lock` 重新生成, 则需要处理一些一些错误的问题.

```bash
yarn install
yarn dev
```

遇到如下提示, 选择 2.0.0-beta.61

```
Couldn't find any versions for "vuepress-vite" that matches "2.0.0-beta.50-pre.1"
? Please choose a version of "vuepress-vite" from this list:
```

然后编辑 `yarn.lock` 文件, 把下面的内容

```

vuepress-vite@2.0.0-beta.50-pre.1:
version "2.0.0-beta.61"
resolved "https://registry.npmmirror.com/vuepress-vite/-/vuepress-vite-2.0.0-beta.61.tgz#04058551e6be014e9f2dee14c5d8043b158e032d"
integrity sha512-4mcR8XSY5b36CYkPqF80WvoeGAEjTw6Cr9bMPHrPVSjG4qqyfVpdSdyRtXD+/5aLJB7r/L60J7PI1pKTci1+3w==
dependencies:
"@vuepress/bundler-vite" "2.0.0-beta.61"
"@vuepress/cli" "2.0.0-beta.61"
"@vuepress/core" "2.0.0-beta.61"
"@vuepress/theme-default" "2.0.0-beta.61"

vuepress@^2.0.0-beta.61:
version "2.0.0-beta.50-pre.1"
resolved "https://registry.npmmirror.com/vuepress/-/vuepress-2.0.0-beta.50-pre.1.tgz#26eec90444bb37590f29d10dd5923e75c476189f"
integrity sha512-4Finc3GDscIqgRFAZFwa4SUm8tIFSVQIxnPIpQPW3kaM37rKylvUDkLrs2lMvoDPTAAE+Kf+v34tAFX+ZMGKUg==
dependencies:
vuepress-vite "2.0.0-beta.50-pre.1"

```

替换成

```

vuepress-vite@2.0.0-beta.61:
version "2.0.0-beta.61"
resolved "https://registry.npmmirror.com/vuepress-vite/-/vuepress-vite-2.0.0-beta.61.tgz#04058551e6be014e9f2dee14c5d8043b158e032d"
integrity sha512-4mcR8XSY5b36CYkPqF80WvoeGAEjTw6Cr9bMPHrPVSjG4qqyfVpdSdyRtXD+/5aLJB7r/L60J7PI1pKTci1+3w==
dependencies:
"@vuepress/bundler-vite" "2.0.0-beta.61"
"@vuepress/cli" "2.0.0-beta.61"
"@vuepress/core" "2.0.0-beta.61"
"@vuepress/theme-default" "2.0.0-beta.61"

vuepress@^2.0.0-beta.61:
version "2.0.0-beta.61"
resolved "https://registry.npmmirror.com/vuepress/-/vuepress-2.0.0-beta.61.tgz"
integrity sha512-gpttL0x5ZvI9eTyR/pexBknIAcgrdjAWoiJc7OYd4bIVfwlXAb4GO4A2EwRSX+pIaNOWdcd+sfZA86EMEbrtNg==
dependencies:
vuepress-vite "2.0.0-beta.61"

```

重新 `yarn install`
