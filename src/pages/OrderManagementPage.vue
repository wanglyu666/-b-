<script setup lang="ts">
import { useRouter } from 'vue-router';
import OrderManagementView from '../components/OrderManagementView.vue';

const router = useRouter();
</script>

<template>
  <OrderManagementView
    @back="router.push({ name: 'management' })"
  />
</template>
