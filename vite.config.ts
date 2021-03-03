import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // 打包进 web
    outDir: 'dist/web',
    // 直接放到根目录中
    assetsDir: '',
  },
  // https://github.com/vitejs/vite/tree/main/packages/plugin-react-refresh
  plugins: [reactRefresh()],
});
