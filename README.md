# Pocket CLI

## 简介

本地运行服务和前端静态站点

- 服务负责转发请求到 Pocket 服务器授权及请求数据
- 静态页面负责输入参数和执行操作

## 功能支持

- 按是否收藏搜索文章
- 按阅读状态搜索文章
- 按标签搜索文章
- 列出文章详情
- 在控制台输出可直接复制的文章 Markdown List

## 待优化

- 统一接口数据定义，更好的代码结构
- 支持 localStorage 缓存 token，避免频繁重复验证

## 帮助

- 调试时，每次运行项目都是一次全新的匿名登录环境，初次载入后需要前端操作跳转 Pocket 授权登录后，方可使用。如停止服务，下次启动需要重新授权

> - https://getpocket.com/developer/docs/overview
> - https://getpocket.com/developer/apps/new
> - https://getpocket.com/developer/docs/errors
