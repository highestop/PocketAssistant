// 注意，polyfill 必须放在顶部
import './polyfill';
import './main.css';
import 'antd/dist/antd.css';
import * as ReactDOM from 'react-dom';
import axios, { AxiosRequestConfig } from 'axios';
import { useCallback, useReducer } from 'react';
import { consumer_key } from '../profile.json';
import {
  Layout,
  List,
  Form,
  Tag,
  Typography,
  Radio,
  Input,
  Button,
  Space,
  Card,
  Alert,
  Popconfirm,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { PocketRetrieveItem } from '../server/model';

function fetch<T>(url: string, options?: AxiosRequestConfig & { body?: any }) {
  return axios.post<T>(`http://localhost:3001${url}`, options?.body, options);
}

interface DataStore {
  readonly request_token?: string;
  readonly authorize_url?: string;
  readonly access_token?: string;
  readonly allList: PocketRetrieveItem[];
  readonly allTags?: string[];
  readonly alert?: string;
}

const App = () => {
  const [store, updateStore] = useReducer(
    (state: DataStore, action: Partial<DataStore>) => {
      console.log(state, action);
      return {
        ...state,
        ...action,
      };
    },
    {
      request_token: localStorage.getItem('request_token') ?? undefined,
      access_token: localStorage.getItem('access_token') ?? undefined,
      allList: [],
    }
  );

  const setAlert = useCallback((message: string) => {
    console.error(message);
    updateStore({ alert: message });
    const sto = setTimeout(() => {
      updateStore({ alert: undefined });
      clearTimeout(sto);
    }, 3000);
  }, []);

  const fetchRequestToken = useCallback(() => {
    if (!consumer_key) {
      console.error('没有找到 consumer_key 或无效');
      return;
    }
    fetch<{
      consumer_key: string;
      request_token: string;
      authorize_url: string;
    }>(`/oauth-request`, {
      params: { consumer_key },
    }).then(({ data }) => {
      updateStore({
        request_token: data.request_token,
        access_token: undefined,
        authorize_url: data.authorize_url,
      });
      // 重新获取 request_token 之后会清空缓存，此时处于新一轮验证未完全结束的阶段
      localStorage.removeItem('request_token');
      localStorage.removeItem('access_token');
    });
  }, []);

  const fetchAccessToken = useCallback(() => {
    if (!store.request_token) {
      setAlert('没有找到 request_token 或无效');
      return;
    }
    fetch<{
      access_token: string;
    }>('/oauth-authorize', {
      params: { consumer_key, request_token: store.request_token },
    }).then(({ data }) => {
      updateStore({
        access_token: data.access_token,
      });
      // 一轮验证成功结束，同时缓存一对 token
      localStorage.setItem('request_token', store.request_token!);
      localStorage.setItem('access_token', data.access_token);
    });
  }, [store]);

  const retrieve = useCallback(() => {
    if (!consumer_key) {
      setAlert('没有找到 consumer_key 或无效');
      return;
    }
    if (!store.access_token) {
      setAlert('没有找到 access_token 或无效');
      return;
    }
    fetch<{ list: PocketRetrieveItem[] }>('/retrieve', {
      params: {
        consumer_key,
        access_token: store.access_token,
      },
      body: form.getFieldsValue(),
    }).then(({ data }) => {
      updateStore({ allList: data.list });
      console.warn(
        data.list
          .map(item => `- [${item.resolved_title}](${item.given_url})`)
          .join('\n')
      );
    });
  }, [store]);

  const fetchTags = useCallback(() => {
    if (!consumer_key) {
      setAlert('没有找到 consumer_key 或无效');
      return;
    }
    if (!store.access_token) {
      setAlert('没有找到 access_token 或无效');
      return;
    }
    fetch<string[]>('/tags', {
      params: {
        consumer_key,
        access_token: store.access_token,
      },
    }).then(({ data }) => {
      updateStore({ allTags: data });
      console.warn(data);
    });
  }, [store]);

  const clear = useCallback(() => updateStore({ allList: [] }), []);

  // const replace = useCallback(() => {
  //   if (!consumer_key) {
  //     setAlert('没有找到 consumer_key 或无效');
  //     return;
  //   }
  //   if (!store.access_token) {
  //     setAlert('没有找到 access_token 或无效');
  //     return;
  //   }
  //   if (!store.allList.length) {
  //     setAlert('没有要替换的目标项');
  //     return;
  //   }
  //   if (!form.getFieldsValue()['newTag']) {
  //     setAlert('请输入要替换的标签');
  //     return;
  //   }
  //   const newTag = form.getFieldsValue()['newTag'];
  //   fetch<void>('/replace', {
  //     params: {
  //       consumer_key,
  //       access_token: store.access_token,
  //     },
  //     body: {
  //       ids: store.allList.map(item => item.item_id),
  //       newTag: form.getFieldsValue()['newTag'],
  //     },
  //   }).then(() => {
  //     setAlert('替换成功，正在按新的标签重新获取列表');
  //     form.setFieldsValue({
  //       tag: newTag,
  //       newTag: undefined,
  //     });
  //     retrieve();
  //   });
  // }, [store]);

  const [form] = useForm();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Content style={{ backgroundColor: '#fff', padding: '2rem' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {store.alert && <Alert message={store.alert}></Alert>}
          <Card>
            <Form>
              <Form.Item
                label={<Typography.Text strong>Consumer Key</Typography.Text>}
              >
                <Typography.Text type="secondary">
                  {consumer_key}
                </Typography.Text>
              </Form.Item>
              <Form.Item
                label={<Typography.Text strong>Request Token</Typography.Text>}
              >
                <Typography.Text type="secondary">
                  {store.request_token}
                </Typography.Text>
                {store.authorize_url && (
                  <Tag.CheckableTag
                    checked={true}
                    onChange={() => window.open(store.authorize_url)}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    Go authorize
                  </Tag.CheckableTag>
                )}
                <Tag.CheckableTag
                  checked={true}
                  onChange={fetchRequestToken}
                  style={{ marginLeft: '0.5rem' }}
                >
                  {store.request_token ? 'Renew' : 'Get'} Request Token
                </Tag.CheckableTag>
              </Form.Item>
              <Form.Item
                label={<Typography.Text strong>Access Token</Typography.Text>}
              >
                <>
                  <Typography.Text type="secondary">
                    {store.access_token}
                  </Typography.Text>
                  <Tag.CheckableTag
                    checked={true}
                    onChange={fetchAccessToken}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    {store.access_token ? 'Renew' : 'Get'} Access Token
                  </Tag.CheckableTag>
                </>
              </Form.Item>
            </Form>
          </Card>
          <Card>
            <Form
              form={form}
              initialValues={{
                tag: '@2021.6',
                state: 'archive',
              }}
            >
              <Form.Item
                label={<Typography.Text strong>标签</Typography.Text>}
                name="tag"
              >
                <Input style={{ width: '120px' }}></Input>
              </Form.Item>
              <Form.Item
                label={<Typography.Text strong>状态</Typography.Text>}
                name="state"
              >
                <Radio.Group>
                  <Radio value="unread">未读</Radio>
                  <Radio value="archive">已归档</Radio>
                  {/* <Radio value="all">All</Radio>
                  <Radio value={undefined}>-</Radio> */}
                </Radio.Group>
              </Form.Item>
              {/* <Form.Item label="Favorite" name="fav">
                <Radio.Group>
                  <Radio value={1}>Favorite</Radio>
                  <Radio value={0}>All</Radio>
                  <Radio value={undefined}>-</Radio>
                </Radio.Group>
              </Form.Item> */}
              {/* <Form.Item
                label={<Typography.Text strong>替换为</Typography.Text>}
                name="newTag"
              >
                <Input style={{ width: '120px' }}></Input>
              </Form.Item> */}
              <Form.Item>
                <Space>
                  <Button type="primary" onClick={retrieve}>
                    搜索
                  </Button>
                  <Button onClick={clear}>清空</Button>
                  {/* <Popconfirm
                    title={
                      form.getFieldsValue()['newTag']
                        ? `确定要将 ${
                            store.allList.length
                          } 篇文章的标签重洗为 ${
                            form.getFieldsValue()['newTag']
                          }`
                        : '请输入要替换的标签'
                    }
                    okText="继续"
                    okButtonProps={{
                      disabled: !form.getFieldsValue()['newTag'],
                    }}
                    cancelText={
                      form.getFieldsValue()['newTag'] ? '再想想' : '关闭'
                    }
                    onConfirm={replace}
                    disabled={!store.allList.length}
                  >
                    <Button danger disabled={!store.allList.length}>
                      替换
                    </Button>
                  </Popconfirm> */}
                  <Button type="primary" onClick={fetchTags}>
                    标签
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
          <Card>
            <List
              dataSource={store.allList}
              header={
                <Typography.Text strong>
                  共 {store.allList.length} 篇
                </Typography.Text>
              }
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <>
                        <a href={item.given_url} target="blank">
                          {item.resolved_title || item.given_url}
                        </a>
                        {item.favorite > 0 && (
                          <Tag color="orange">Favorite</Tag>
                        )}
                        {item.status === 1 && (
                          <Tag color="purple">Archived</Tag>
                        )}
                        {item.status === 2 && (
                          <Tag color="default">Should be deleted</Tag>
                        )}
                      </>
                    }
                    description={item.excerpt}
                  />
                </List.Item>
              )}
            ></List>
          </Card>
        </Space>
      </Layout.Content>
      <Layout.Footer style={{ textAlign: 'center', color: 'grey' }}>
        ©Copyright by Highestop
      </Layout.Footer>
    </Layout>
  );
};

ReactDOM.render(
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>,
  document.getElementById('root')
);
