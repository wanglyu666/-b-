<script setup lang="ts">
import { useRouter } from 'vue-router';
import CartView from '../components/CartView.vue';
import { useAppStore } from '../stores/appStore';

const router = useRouter();
const appStore = useAppStore();
</script>

<template>
  <CartView
    :cart-items="appStore.cart"
    @update-quantity="appStore.updateCartQuantity"
    @remove-item="appStore.removeFromCart"
    @back="router.push({ name: 'shop' })"
  />
</template>
