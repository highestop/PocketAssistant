import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

export default defineConfig({
  // https://vitejs.dev/config/
  build: {
    // 打包进 app
    outDir: 'dist/app',
    // 直接放到根目录中
    assetsDir: '',
  },
  server: {
    port: 3000,
    // proxy: { '/': 'http://localhost:3001' },
  },
  // https://github.com/vitejs/vite/tree/main/packages/plugin-react-refresh
  plugins: [reactRefresh()],
});
