<script setup lang="ts">
import { useRouter } from 'vue-router';
import EngineeringProjectsView from '../components/EngineeringProjectsView.vue';
import { useAppStore } from '../stores/appStore';

const router = useRouter();
const appStore = useAppStore();
</script>

<template>
  <EngineeringProjectsView
    :projects="appStore.engineeringProjects"
    :initial-status="appStore.activeProjectStatus"
    :auto-open-project-id="appStore.autoOpenProjectId"
    :auto-open-view-mode="appStore.autoOpenViewMode"
    @back="router.push({ name: 'management' })"
    @auto-open-consumed="appStore.consumeEngineeringAutoOpen"
  />
</template>
