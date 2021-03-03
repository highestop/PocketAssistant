// 注意，polyfill 必须放在顶部
import './polyfill';
import * as ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>,
  document.getElementById('root')
);
