import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Router } from 'vue-router';
import { fetchBackendRoutes } from '../api/permissionApi';
import { resolveDynamicRouteComponent } from '../router/dynamicRegistry';

export const usePermissionStore = defineStore('permission', () => {
  const dynamicRoutesLoaded = ref(false);
  const loadedRouteNames = ref<string[]>([]);

  async function loadDynamicRoutes(router: Router) {
    if (dynamicRoutesLoaded.value) return;
    const backendRoutes = await fetchBackendRoutes();
    for (const route of backendRoutes) {
      const comp = resolveDynamicRouteComponent(route.componentKey);
      if (!comp || router.hasRoute(route.name)) continue;
      router.addRoute({
        path: route.path,
        name: route.name,
        component: comp,
        meta: route.meta ?? {},
      });
      loadedRouteNames.value.push(route.name);
    }
    dynamicRoutesLoaded.value = true;
  }

  return {
    dynamicRoutesLoaded,
    loadedRouteNames,
    loadDynamicRoutes,
  };
});
