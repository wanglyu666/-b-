<script setup lang="ts">
import { useRouter } from 'vue-router';
import ShopView from '../components/ShopView.vue';
import { useAppStore } from '../stores/appStore';
import type { Product } from '../types';

const router = useRouter();
const appStore = useAppStore();

function onProductClick(product: Product) {
  const mainEl = document.getElementById('main-content');
  appStore.setShopScrollTop(mainEl?.scrollTop ?? 0);
  appStore.setSelectedProduct(product);
  router.push({ name: 'product-detail' });
}
</script>

<template>
  <ShopView
    :products="appStore.products"
    :current-page="appStore.shopPage"
    :initial-scroll-top="appStore.shopScrollTop"
    :cart-count="appStore.cart.length"
    :wishlist-count="appStore.wishlist.length"
    :wishlist-items="appStore.wishlist"
    :message-count="appStore.messageCount"
    @update:current-page="appStore.setShopPage"
    @product-click="onProductClick"
    @add-to-cart="appStore.addToCart"
    @cart-click="router.push({ name: 'cart' })"
    @wishlist-click="router.push({ name: 'wishlist' })"
    @toggle-wishlist="appStore.toggleWishlist"
    @message-click="router.push({ name: 'messages' })"
  />
</template>
