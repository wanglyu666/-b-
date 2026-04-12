<script setup lang="ts">
import { useRouter } from 'vue-router';
import OrderManagementView from '../components/OrderManagementView.vue';
import { useAppStore } from '../stores/appStore';

const router = useRouter();
const appStore = useAppStore();
</script>

<template>
  <OrderManagementView
    :data="appStore.orderData"
    @back="router.push({ name: 'management' })"
  />
</template>
