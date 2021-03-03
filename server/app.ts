import express from 'express';
import axios from 'axios';

const app = express();
const port = 8080;

app.get('/', (_, res) => {
  pocket.getAccount().then(() => {
    console.log(pocket.activateRequestToken());
    console.log(pocket);
  });
});

app.get('/access', () => {
  pocket.getAccess().then(() => console.log(pocket));
});

app.get('/tag/:tag', req => {
  pocket.getByTag(req.params.tag).then(res => {
    const obj = res.data.list;
    const list = Object.keys(obj).map(id => ({
      ...obj[id],
      id,
    }));
    console.log(obj);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const redirect_uri = 'https://getpocket.com';
const headers = {
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
    'X-Accept': 'application/json',
  },
};

/**
 * Pocket API
 */
class PocketCLI {
  private consumer_key: string;

  private request_token: string | null = null;

  private access_token: string | null = null;

  constructor(consumer_key: string) {
    this.consumer_key = consumer_key;
  }
  /**
   * 根据申请 app 的 consumer_key 进行模拟授权，得到 account 的 request_token
   * 此时要根据 request_token 访问 activateRequestToken 返回的地址，在页面上点击授权，才算可用
   * 每发送一次请求，表示进行一次匿名模拟登录，都会得到一个新的 request_token，表示一个新用户，每个用户都要单独去点击授权
   * 记住一个用户的 request_token 相当于记住一个账号，尽管是匿名的，不影响使用
   */
  getAccount() {
    return axios
      .post(
        `https://getpocket.com/v3/oauth/request?consumer_key=${this.consumer_key}&redirect_uri=${redirect_uri}`,
        null,
        headers
      )
      .then(res => (this.request_token = res.data.code));
  }
  /**
   * 真正执行命令前需要根据 consumer_key 和 request_token 拿到 access_token，同时返回一个用户名
   * 最终由 access_token 配合 consumer_key 发送命令
   * access_token 假装允许了对该 request_token 的授权，所以请谨慎保管
   */
  getAccess() {
    return axios
      .post(
        `https://getpocket.com/v3/oauth/authorize?consumer_key=${this.consumer_key}&code=${this.request_token}`,
        null,
        headers
      )
      .then(res => (this.access_token = res.data.access_token));
  }
  /**
   * 拼接返回的授权信息
   */
  concatAuthedParams() {
    return `consumer_key=${this.consumer_key}&access_token=${this.access_token}`;
  }
  /**
   * 激活用户授权
   */
  activateRequestToken() {
    return `https://getpocket.com/auth/authorize?request_token=${this.request_token}`;
  }
  /**
   * 根据 tag 拿信息
   */
  getByTag(tag: string) {
    return axios.post(
      `https://getpocket.com/v3/get?${this.concatAuthedParams()}&tag=${tag}`
    );
  }
}

let pocket = new PocketCLI('96138-f6ee120aeb0b6cc79f6bb0f3');
