# Pockety

> 仅绑定了个人 Pocket 帐号。大家使用时请先更改个人帐号

## 简介

本地运行服务和前端静态站点

- 服务负责转发请求到 Pocket 服务器授权及请求数据
- 静态页面负责输入参数和执行操作

## 功能

- 按是否收藏搜索文章
- 按阅读状态搜索文章
- 按标签搜索文章
- 列出文章详情
- 在控制台输出可直接复制的文章 Markdown List

## 帮助

- 调试时，每次运行项目都是一次全新的匿名登录环境，初次载入后需要前端操作跳转 Pocket 授权登录后，方可使用。如停止服务，下次启动需要重新授权

> - https://getpocket.com/developer/docs/overview
> - https://getpocket.com/developer/apps/new
> - https://getpocket.com/developer/docs/errors
