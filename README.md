# Pockety

运行前请自行在根目录下添加 `profile.json` 文件如下，此文件将会被 git 忽略

```json
{
  "consumer_key": "**"
}
```

## 简介

本地 `yarn start` 运行服务和前端静态站点

- 服务负责转发请求到 Pocket 服务器授权及请求数据
- 静态页面负责输入参数和执行操作

## 功能

- 按是否收藏搜索文章（ 因个人不使用收藏功能，前端先隐藏 ）
- 按阅读状态搜索文章（ 因个人使用习惯，只保留『 未读 』和『 归档 』两种 ）
- 按标签搜索文章
- 将搜索结果批量重置为新的标签（ 仅支持重置为一个标签，用 `,` 隔开无效 ）
- 在页面上列出文章详情
- 在控制台输出可直接复制的文章 Markdown List

## 帮助

- 调试时，每次运行项目都是一次全新的匿名登录环境
- 初次载入后需要前端操作跳转 Pocket 授权登录后，方可使用
- 再次登录时，浏览器会保留登录和验证信息，可直接使用
- 在替换 AppKey 或清空缓存之后，需要重新登录授权

## 参考

- https://getpocket.com/developer/docs/overview
- https://getpocket.com/developer/apps/new
- https://getpocket.com/developer/docs/errors
