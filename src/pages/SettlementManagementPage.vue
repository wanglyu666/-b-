<script setup lang="ts">
import { useRouter } from 'vue-router';
import SettlementManagementView from '../components/SettlementManagementView.vue';

const router = useRouter();
</script>

<template>
  <SettlementManagementView @back="router.push({ name: 'contracts' })" />
</template>
