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
    :cart-annual-display-mode="appStore.cartAnnualDisplayMode"
    @update-quantity="(id, delta, kind) => appStore.updateCartQuantity(id, delta, kind)"
    @remove-item="(id, kind) => appStore.removeFromCart(id, kind)"
    @back="router.push({ name: 'shop' })"
  />
</template>
