<script setup lang="ts">
import { useRouter } from 'vue-router';
import MaintenanceProjectsView from '../components/MaintenanceProjectsView.vue';
import { useAppStore } from '../stores/appStore';

const router = useRouter();
const appStore = useAppStore();
</script>

<template>
  <MaintenanceProjectsView
    :projects="appStore.maintenanceProjects"
    :initial-status="appStore.activeMaintenanceProjectStatus"
    @back="router.push({ name: 'management' })"
  />
</template>
