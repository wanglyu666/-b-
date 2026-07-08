<script setup lang="ts">
import { useRouter } from 'vue-router';
import OrderCenterView from '../components/OrderCenterView.vue';

const router = useRouter();
</script>

<template>
  <OrderCenterView @back="router.push({ name: 'shop' })" />
</template>
