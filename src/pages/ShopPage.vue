<script setup lang="ts">
import { useRouter } from 'vue-router';
import ShopView from '../components/ShopView.vue';
import { useAppStore } from '../stores/appStore';
import type { Product } from '../types';

const router = useRouter();
const appStore = useAppStore();

function onProductClick(product: Product) {
  appStore.persistShopScroll();
  appStore.setSelectedProduct(product);
  router.push({ name: 'product-detail' });
}

function navigateFromShop(routeName: 'cart' | 'wishlist' | 'messages' | 'order-center') {
  appStore.persistShopScroll();
  router.push({ name: routeName });
}
</script>

<template>
  <ShopView
    :normal-products="appStore.normalProducts"
    :annual-products="appStore.annualProducts"
    :current-page="appStore.shopPage"
    :initial-scroll-top="appStore.shopScrollTop"
    :cart-count="appStore.cart.length"
    :wishlist-count="appStore.wishlist.length"
    :wishlist-items="appStore.wishlist"
    :message-count="appStore.messageCount"
    @update:current-page="appStore.setShopPage"
    @product-click="onProductClick"
    @add-to-cart="(product, count, options) => appStore.addToCart(product, count, options)"
    @cart-click="navigateFromShop('cart')"
    @order-center-click="navigateFromShop('order-center')"
    @wishlist-click="navigateFromShop('wishlist')"
    @toggle-wishlist="(product, options) => appStore.toggleWishlist(product, options)"
    @message-click="navigateFromShop('messages')"
  />
</template>
