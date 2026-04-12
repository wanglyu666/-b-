<script setup lang="ts">
import { useRouter } from 'vue-router';
import MessageView from '../components/MessageView.vue';
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
  <MessageView
    :todo-items="appStore.todoNotifications"
    @back="router.push({ name: 'home' })"
    @open-project-view="openProjectView"
  />
</template>
