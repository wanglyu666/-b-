<script setup lang="ts">
import { useRouter } from 'vue-router';
import WishlistView from '../components/WishlistView.vue';
import { useAppStore } from '../stores/appStore';

const router = useRouter();
const appStore = useAppStore();
</script>

<template>
  <WishlistView
    :wishlist-items="appStore.wishlist"
    :wishlist-annual-display-mode="appStore.wishlistAnnualDisplayMode"
    @remove-item="(id, kind) => appStore.removeFromWishlist(id, kind)"
    @back="router.push({ name: 'shop' })"
    @add-to-cart="(product, count, options) => appStore.addToCart(product, count, options)"
  />
</template>
