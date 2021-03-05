import express from 'express';
import axios from 'axios';

const app = express();

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

app.listen(3001, () => {
  console.log(`Server starts at http://localhost:3001`);
});

function printLog(log: any) {
  console.log(`>>> ${log}`);
}

function appendParams(obj: { [key: string]: any }) {
  let str = '';
  Object.keys(obj).forEach(key => {
    if (obj[key] != null) {
      str = `${str}&${key}=${obj[key]}`;
    }
  });
  if (!str) {
    return null;
  }
  return str;
}

const enum ResponseStatus {
  DONE = 'success',
  FAILED = 'error',
}

type ResponseBody = { [key: string]: any };

interface ResponseData {
  readonly status: ResponseStatus;
  readonly body: ResponseBody;
}

class ResponseData {
  constructor(
    readonly body: ResponseBody,
    readonly status: ResponseStatus = ResponseStatus.DONE
  ) {
    return this;
  }
}

app.get('/hello', (_, res) => {
  res.json(new ResponseData({ message: 'hello' }));
});

const pocket_uri = 'https://getpocket.com';

const headers = {
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
    'X-Accept': 'application/json',
  },
};

let consumer_key: string;

let request_token: string | null = null;

let access_token: string | null = null;

/**
 * 根据申请 app 的 consumer_key 进行模拟授权，得到 account 的 request_token
 * 此时要根据 request_token 访问 activateRequestToken 返回的地址，在页面上点击授权，才算可用
 * 每发送一次请求，表示进行一次匿名模拟登录，都会得到一个新的 request_token，表示一个新用户，每个用户都要单独去点击授权
 * 记住一个用户的 request_token 相当于记住一个账号，尽管是匿名的，不影响使用
 */
app.get('/oauth-request', (req, res, next) => {
  const { key } = req.query;
  if (typeof key === 'string') {
    consumer_key = key;
  } else {
    next(new Error(`'consumer_key' 参数的类型不正确`));
  }
  const url = `https://getpocket.com/v3/oauth/request?consumer_key=${consumer_key}&redirect_uri=${pocket_uri}`;
  printLog(url);
  axios
    .post(url, null, headers)
    .then(body => {
      request_token = body.data.code;
      printLog(request_token);
      res.json({
        consumer_key,
        request_token,
        /**
         * 授权链接
         */
        authorize_url: `https://getpocket.com/auth/authorize?request_token=${request_token}`,
      });
    })
    .catch(() => next(new Error(`获取 'request_token' 失败`)));
});

/**
 * 真正执行命令前需要根据 consumer_key 和 request_token 拿到 access_token，同时返回一个用户名
 * 最终由 access_token 配合 consumer_key 发送命令
 * access_token 假装允许了对该 request_token 的授权，所以请谨慎保管
 */
app.get('/oauth-authorize', (_, res, next) => {
  const url = `https://getpocket.com/v3/oauth/authorize?consumer_key=${consumer_key}&code=${request_token}`;
  printLog(url);
  axios
    .post(url, null, headers)
    .then(body => {
      access_token = body.data.access_token;
      printLog(access_token);
      res.json({ access_token });
    })
    .catch(() =>
      next(
        new Error(`获取 'access_token' 失败。可能没有点击授权或 APP 配置有问题`)
      )
    );
});

/**
 * 搜索项目
 */
app.get('/retrieve', (req, res, next) => {
  const params: {
    readonly state?: 'unread' | 'archive' | 'all';
    readonly fav?: 0 | 1;
    readonly tag?: string;
    readonly search?: string;
    readonly domain?: string;
    readonly count?: number;
    readonly since?: number;
  } = req.query;
  const paramStr = appendParams(params) ?? '$count=20'; // 没有任何搜索条件时，默认返回 20 条
  const url = `https://getpocket.com/v3/get?consumer_key=${consumer_key}&access_token=${access_token}${paramStr}&sort=newest`; // 默认从新到旧
  printLog(url);
  axios
    .post(url, null, headers)
    .then(body => {
      const {
        list,
      }: {
        list: {
          [key: string]: {
            resolved_url: string; // The final url of the item
            resolved_title: string; // The title that Pocket found for the item when it was parsed
            excerpt: string; // The first few lines of the item (articles only)
            favorite: 0 | 1; // 1 If the item is favorited
            status: 0 | 1 | 2; // 1 if the item is archived - 2 if the item should be deleted
            word_count: number;
          };
        };
      } = body.data;
      printLog(list);
      res.json({ list: Object.keys(list).map(id => list[id]) });
    })
    .catch(err =>
      next(new Error(`获取项目失败。可能没有点击授权或 APP 配置有问题\n${err}`))
    );
});
