import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import { usePermissionStore } from './stores/permissionStore';
import { initTokenFromUrl } from './utils/auth';
import './index.css';

async function bootstrap() {
  // 从 URL 中提取 token 并存入缓存
  initTokenFromUrl();

  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);
  app.use(router);

  const permissionStore = usePermissionStore(pinia);
  await permissionStore.loadDynamicRoutes(router);
  await router.isReady();

  app.mount('#app');
}

bootstrap();
