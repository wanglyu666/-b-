<script setup lang="ts">
import { useRouter } from 'vue-router';
import DashboardHome from '../components/DashboardHome.vue';
import { useAppStore } from '../stores/appStore';

const router = useRouter();
const appStore = useAppStore();

function openProjectView(payload: {
  projectId: string;
  projectStatus: string;
  viewMode: string;
}) {
  appStore.setEngineeringProjectEntry({
    projectStatus: payload.projectStatus,
    projectId: payload.projectId,
    viewMode: payload.viewMode,
  });
  router.push({ name: 'engineering-projects' });
}
</script>

<template>
  <DashboardHome
    :cart-count="appStore.cart.length"
    :wishlist-count="appStore.wishlist.length"
    :message-count="appStore.messageCount"
    :todo-items="appStore.todoNotifications"
    @cart-click="router.push({ name: 'cart' })"
    @wishlist-click="router.push({ name: 'wishlist' })"
    @message-click="router.push({ name: 'messages' })"
    @open-project-view="openProjectView"
  />
</template>
