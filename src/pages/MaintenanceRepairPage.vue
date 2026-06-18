<script setup lang="ts">
import { useRouter } from 'vue-router';
import MaintenanceRepairView from '../components/MaintenanceRepairView.vue';

const router = useRouter();
</script>

<template>
  <MaintenanceRepairView
    @back="router.push({ name: 'management' })"
  />
</template>
