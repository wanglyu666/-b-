<script setup lang="ts">
import { useRouter } from 'vue-router';
import MaintenanceRepairView from '../components/MaintenanceRepairView.vue';
import { useAppStore } from '../stores/appStore';

const router = useRouter();
const appStore = useAppStore();
</script>

<template>
  <MaintenanceRepairView
    :data="appStore.maintenanceRepairData"
    @back="router.push({ name: 'management' })"
  />
</template>
