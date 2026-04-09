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
      /** 开发环境默认端口（与常见 Vite 预览一致） */
      port: 5173,
      /** 若 5173 已被占用，自动尝试下一个端口（终端会打印实际端口） */
      strictPort: false,
      /** true = 同时监听本机与局域网，避免仅绑 IPv6 导致 localhost 异常 */
      host: true,
      // 外接盘 / 网络卷上 FSEvents 常不可靠，轮询可恢复保存即热更新
      watch: {
        usePolling: true,
        interval: 300,
      },
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    /** 构建后本地预览 `npm run preview` 同样使用 5173 */
    preview: {
      port: 5173,
      strictPort: false,
      host: true,
    },
  };
});
