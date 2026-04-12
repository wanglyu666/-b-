<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import ProductDetailView from '../components/ProductDetailView.vue';
import { useAppStore } from '../stores/appStore';

const router = useRouter();
const appStore = useAppStore();

const product = computed(() => appStore.selectedProduct);

watchEffect(() => {
  if (!product.value) {
    router.replace({ name: 'shop' });
  }
});
</script>

<template>
  <ProductDetailView
    v-if="product"
    :product="product"
    :cart-count="appStore.cart.length"
    :is-in-wishlist="appStore.wishlist.some((x) => x.id === product.id)"
    :wishlist-count="appStore.wishlist.length"
    :message-count="appStore.messageCount"
    @back="router.push({ name: 'shop' })"
    @add-to-cart="appStore.addToCart"
    @cart-click="router.push({ name: 'cart' })"
    @toggle-wishlist="appStore.toggleWishlist"
    @wishlist-click="router.push({ name: 'wishlist' })"
    @message-click="router.push({ name: 'messages' })"
  />
</template>
