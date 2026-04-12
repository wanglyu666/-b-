import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import { usePermissionStore } from './stores/permissionStore';
import './index.css';

async function bootstrap() {
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
