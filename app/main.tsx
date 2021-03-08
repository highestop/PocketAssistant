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
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { PocketRetrieveItem } from '../server/model';

function fetch<T>(url: string, options?: AxiosRequestConfig) {
  return axios.get<T>(`http://localhost:3001${url}`, options);
}

interface DataStore {
  readonly consumer_key?: string;
  readonly request_token?: string;
  readonly authorize_url?: string;
  readonly access_token?: string;
  readonly allList: PocketRetrieveItem[];
}

const App = () => {
  const [store, updateStore] = useReducer(
    (state: DataStore, action: Partial<DataStore>) => {
      return {
        ...state,
        ...action,
      };
    },
    {
      consumer_key,
      allList: [],
    }
  );

  const fetchRequestToken = useCallback(() => {
    fetch<{
      consumer_key: string;
      request_token: string;
      authorize_url: string;
    }>(`/oauth-request`, {
      params: { key: consumer_key },
    }).then(({ data }) => {
      updateStore({
        request_token: data.request_token,
        authorize_url: data.authorize_url,
      });
    });
  }, []);

  const fetchAccessToken = useCallback(() => {
    fetch<{
      access_token: string;
    }>('/oauth-authorize').then(({ data }) => {
      updateStore({
        access_token: data.access_token,
      });
    });
  }, []);

  const retrieve = useCallback(() => {
    fetch<{ list: PocketRetrieveItem[] }>('/retrieve', {
      params: form.getFieldsValue(),
    }).then(({ data }) => {
      updateStore({ allList: data.list });
      console.log(
        data.list
          .map(item => `- [${item.resolved_title}](${item.resolved_url})`)
          .join('\n')
      );
    });
  }, []);

  const clear = useCallback(() => updateStore({ allList: [] }), []);

  const [form] = useForm();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Content style={{ backgroundColor: '#fff', padding: '2rem' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
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
                {store.request_token ? (
                  <Typography.Text type="secondary">
                    {store.request_token}
                  </Typography.Text>
                ) : (
                  <a onClick={fetchRequestToken}>Get Request Token</a>
                )}
                {store.access_token ? null : store.authorize_url ? (
                  <a
                    href={store.authorize_url}
                    target="blank"
                    style={{ marginLeft: '0.5rem' }}
                  >
                    Go authorize
                  </a>
                ) : null}
              </Form.Item>
              <Form.Item
                label={<Typography.Text strong>Access Token</Typography.Text>}
              >
                {store.access_token ? (
                  <Typography.Text type="secondary">
                    {store.access_token}
                  </Typography.Text>
                ) : (
                  <a onClick={fetchAccessToken}>Get Access Token</a>
                )}
              </Form.Item>
            </Form>
          </Card>
          <Card>
            <Form
              form={form}
              initialValues={{
                tag: '2021.3',
                state: 'archive',
              }}
            >
              <Form.Item label="Tag" name="tag">
                <Input style={{ width: '200px' }}></Input>
              </Form.Item>
              <Form.Item label="State" name="state">
                <Radio.Group>
                  <Radio value="unread">Unread</Radio>
                  <Radio value="archive">Archived</Radio>
                  <Radio value="all">All</Radio>
                  <Radio value={undefined}>-</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Favorite" name="fav">
                <Radio.Group>
                  <Radio value={1}>Favorite</Radio>
                  <Radio value={0}>All</Radio>
                  <Radio value={undefined}>-</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" onClick={retrieve}>
                    搜索
                  </Button>
                  <Button onClick={clear}>清空</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
          <Card>
            <List
              dataSource={store.allList}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <>
                        <a href={item.resolved_url} target="blank">
                          {item.resolved_title}
                        </a>
                        {item.favorite > 0 ? (
                          <Tag color="orange">Favorite</Tag>
                        ) : null}
                        {item.status === 1 ? (
                          <Tag color="purple">Archived</Tag>
                        ) : null}
                        {item.status === 2 ? (
                          <Tag color="default">Should be deleted</Tag>
                        ) : null}
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
