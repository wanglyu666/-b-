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
    @remove-item="appStore.removeFromWishlist"
    @back="router.push({ name: 'shop' })"
    @add-to-cart="appStore.addToCart"
  />
</template>
