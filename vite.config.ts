import tailwindcss from '@tailwindcss/vite';
import veauryVitePlugins from 'veaury/vite/index.js';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      veauryVitePlugins({
        type: 'vue'
      }),
      tailwindcss()
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // 外接盘 / 网络卷上 FSEvents 常不可靠，轮询可恢复保存即热更新
      watch: {
        usePolling: true,
        interval: 300,
      },
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
