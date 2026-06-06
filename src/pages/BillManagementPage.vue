<script setup lang="ts">
import { useRouter } from 'vue-router';
import BillManagementView from '../components/BillManagementView.vue';

const router = useRouter();
</script>

<template>
  <BillManagementView @back="router.push({ name: 'contracts' })" />
</template>

