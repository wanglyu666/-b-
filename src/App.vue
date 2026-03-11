<script setup lang="ts">
import { ref } from 'vue';
import { Settings } from 'lucide-vue-next';
import Sidebar from './components/Sidebar.vue';
import DashboardHome from './components/DashboardHome.vue';
import ShopView from './components/ShopView.vue';
import ProductDetailView from './components/ProductDetailView.vue';
import CartView from './components/CartView.vue';
import WishlistView from './components/WishlistView.vue';
import MessageView from './components/MessageView.vue';
import ManagementView from './components/ManagementView.vue';
import ContractAndSettlementView from './components/ContractAndSettlementView.vue';
import type { Product, CartItem } from './types';

const activeTab = ref('home');
const selectedProduct = ref<Product | null>(null);

const cart = ref<CartItem[]>([]);
const wishlist = ref<Product[]>([]);
const messageCount = ref(2);

const shopPage = ref(1);
const shopScrollTop = ref(0);

const addToCart = (product: Product, count = 1) => {
  const existingItem = cart.value.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += count;
  } else {
    cart.value.push({ ...product, quantity: count });
  }
};

const removeFromCart = (productId: number) => {
  cart.value = cart.value.filter(item => item.id !== productId);
};

const updateCartQuantity = (productId: number, delta: number) => {
  const item = cart.value.find(item => item.id === productId);
  if (item) {
    item.quantity = Math.max(1, item.quantity + delta);
  }
};

const toggleWishlist = (product: Product) => {
  const index = wishlist.value.findIndex(item => item.id === product.id);
  if (index !== -1) {
    wishlist.value.splice(index, 1);
  } else {
    wishlist.value.push(product);
  }
};

const removeFromWishlist = (productId: number) => {
  wishlist.value = wishlist.value.filter(item => item.id !== productId);
};

const handleProductClick = (product: Product) => {
  const mainEl = document.getElementById('main-content');
  if (mainEl) {
    shopScrollTop.value = mainEl.scrollTop;
  }
  selectedProduct.value = product;
  activeTab.value = 'product-detail';
};

const handleBackToShop = () => {
  selectedProduct.value = null;
  activeTab.value = 'shop';
};

const handleGoToCart = () => {
  activeTab.value = 'cart';
};

const handleGoToWishlist = () => {
  activeTab.value = 'wishlist';
};

const handleGoToMessages = () => {
  activeTab.value = 'messages';
};

const handleBack = () => {
  if (activeTab.value === 'messages' || activeTab.value === 'contracts') {
    activeTab.value = 'home';
  } else {
    handleBackToShop();
  }
};
</script>

<template>
  <div class="flex h-screen bg-[#F9FAFB] font-sans text-gray-900 selection:bg-[#A1D573] selection:text-white">
    <Sidebar :activeTab="activeTab" @update:activeTab="activeTab = $event" />

    <main id="main-content" class="flex-1 overflow-y-auto h-full">
      <DashboardHome 
        v-if="activeTab === 'home'"
        :cartCount="cart.length" 
        @cartClick="handleGoToCart" 
        @wishlistClick="handleGoToWishlist" 
        :wishlistCount="wishlist.length" 
        @messageClick="handleGoToMessages" 
        :messageCount="messageCount" 
      />
      
      <ManagementView v-if="activeTab === 'management'" />

      <ContractAndSettlementView v-if="activeTab === 'contracts'" />

      <ShopView 
        v-if="activeTab === 'shop'"
        @productClick="handleProductClick" 
        v-model:currentPage="shopPage"
        :initialScrollTop="shopScrollTop"
        @addToCart="addToCart"
        :cartCount="cart.length"
        @cartClick="handleGoToCart"
        @wishlistClick="handleGoToWishlist"
        :wishlistCount="wishlist.length"
        @toggleWishlist="toggleWishlist"
        :wishlistItems="wishlist"
        @messageClick="handleGoToMessages"
        :messageCount="messageCount"
      />
      
      <ProductDetailView 
        v-if="activeTab === 'product-detail' && selectedProduct"
        :product="selectedProduct" 
        @back="handleBackToShop" 
        @addToCart="addToCart"
        :cartCount="cart.length"
        @cartClick="handleGoToCart"
        @toggleWishlist="toggleWishlist"
        :isInWishlist="wishlist.some(item => item.id === selectedProduct!.id)"
        @wishlistClick="handleGoToWishlist"
        :wishlistCount="wishlist.length"
        @messageClick="handleGoToMessages"
        :messageCount="messageCount"
      />

      <CartView 
        v-if="activeTab === 'cart'"
        :cartItems="cart"
        @updateQuantity="updateCartQuantity"
        @removeItem="removeFromCart"
        @back="handleBackToShop"
        @cartClick="() => {}" 
        :cartCount="cart.length"
        @wishlistClick="handleGoToWishlist"
        :wishlistCount="wishlist.length"
        @messageClick="handleGoToMessages"
        :messageCount="messageCount"
      />

      <WishlistView
        v-if="activeTab === 'wishlist'"
        :wishlistItems="wishlist"
        @removeItem="removeFromWishlist"
        @back="handleBackToShop"
        @cartClick="handleGoToCart"
        :cartCount="cart.length"
        @wishlistClick="() => {}"
        :wishlistCount="wishlist.length"
        @addToCart="addToCart"
        @messageClick="handleGoToMessages"
        :messageCount="messageCount"
      />

      <MessageView v-if="activeTab === 'messages'" @back="handleBack" />
    </main>
    
    <div class="md:hidden fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-xl z-50">
      <Settings :size="24" />
    </div>
  </div>
</template>
