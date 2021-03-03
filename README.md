# Pocket CLI

## 简介

本地运行服务和前端静态站点

- 服务负责转发请求到 Pocket 服务器授权及请求数据
- 静态页面负责输入参数和执行操作

## 功能支持

- 获取最近 3 天的未读项目
- 获取最近 7 天的已读项目
- 获取所有收藏项目
- 获取某个标签下的所有项目，标签自行输入

## 服务接口列表

- `getRequestToken` / `getAccountCode`
- `getAccessToken`
- `getRecentUnread`
- `getRecentArchived`
- `getFavourite`
- `getByTag`

## 特别提示

- 每次运行项目都是一次全新的匿名登录环境，初次载入后需要前端操作跳转 Pocket 授权登录后，方可使用。如停止服务，下次启动需要重新授权

> - https://getpocket.com/developer/docs/overview
> - https://getpocket.com/developer/apps/new
> - https://getpocket.com/developer/docs/errors
