<script setup lang="ts">
import { ref, computed } from 'vue';
import { Settings } from 'lucide-vue-next';
import Sidebar from './components/Sidebar.vue';
import DashboardHome from './components/DashboardHome.vue';
import ShopView from './components/ShopView.vue';
import Grainient from './components/Grainient.vue';
import ProductDetailView from './components/ProductDetailView.vue';
import CartView from './components/CartView.vue';
import WishlistView from './components/WishlistView.vue';
import MessageView from './components/MessageView.vue';
import ManagementView from './components/ManagementView.vue';
import ContractAndSettlementView from './components/ContractAndSettlementView.vue';
import EngineeringProjectsView from './components/EngineeringProjectsView.vue';
import MaintenanceRepairView from './components/MaintenanceRepairView.vue';
import type { Product, CartItem } from './types';

const activeTab = ref('home');
const selectedProduct = ref<Product | null>(null);

const cart = ref<CartItem[]>([]);
const wishlist = ref<Product[]>([]);
const messageCount = ref(2);

const shopPage = ref(1);
const shopScrollTop = ref(0);

const activeProjectStatus = ref('施工中');

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

const handleViewProjects = (status: string) => {
  activeProjectStatus.value = status;
  activeTab.value = 'engineering-projects';
};

const handleViewMaintenance = () => {
  activeTab.value = 'maintenance-repair';
};

const handleBackToManagement = () => {
  activeTab.value = 'management';
};

const handleBack = () => {
  if (activeTab.value === 'messages' || activeTab.value === 'contracts') {
    activeTab.value = 'home';
  } else {
    handleBackToShop();
  }
};

const backgroundConfig = computed(() => {
  const shopTabs = ['home', 'shop', 'wishlist', 'cart', 'messages', 'product-detail'];
  const managementTabs = ['management', 'engineering-projects', 'contracts', 'maintenance-repair'];

  if (shopTabs.includes(activeTab.value)) {
    return {
      color1: '#A1D573',
      color2: '#ff9ffc',
      color3: '#b19eef',
      timeSpeed: 0.8
    };
  }
  if (managementTabs.includes(activeTab.value)) {
    return {
      color1: '#FFEB69',
      color2: '#E2943A',
      color3: '#DDBDDF',
      timeSpeed: 0.8
    };
  }
  return null;
});

const showBackground = computed(() => !!backgroundConfig.value);

const rootBgColor = computed(() => {
  if (['management', 'engineering-projects', 'contracts', 'maintenance-repair'].includes(activeTab.value)) {
    return 'bg-[#f1f3f0]';
  }
  return 'bg-[#f8fafc]';
});
</script>

<template>
  <div :class="['flex h-screen font-sans text-gray-900 selection:bg-[#A1D573] selection:text-white relative overflow-hidden', rootBgColor]">
    <!-- Persistent Background Layer -->
    <div 
      v-if="showBackground"
      class="absolute top-0 left-0 w-full h-[70vh] overflow-hidden pointer-events-none z-0"
      style="mask-image: linear-gradient(to bottom, black 0%, black 20%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 0%, black 20%, transparent 100%);"
    >
      <Grainient 
        v-bind="backgroundConfig"
        :zoom="0.8"
        :noiseScale="1.5"
      />
      <!-- Frosted Glass Overlay -->
      <div class="absolute inset-0 backdrop-blur-[40px] bg-white/10"></div>
    </div>

    <Sidebar :activeTab="activeTab" @update:activeTab="activeTab = $event" class="relative z-10" />

    <main id="main-content" class="flex-1 overflow-y-auto h-full relative z-10">
      <DashboardHome 
        v-if="activeTab === 'home'"
        :cartCount="cart.length" 
        @cartClick="handleGoToCart" 
        @wishlistClick="handleGoToWishlist" 
        :wishlistCount="wishlist.length" 
        @messageClick="handleGoToMessages" 
        :messageCount="messageCount" 
      />
      
      <ManagementView 
        v-if="activeTab === 'management'" 
        @viewProjects="handleViewProjects"
        @viewMaintenance="handleViewMaintenance"
      />

      <MaintenanceRepairView 
        v-if="activeTab === 'maintenance-repair'"
        @back="handleBackToManagement"
      />

      <EngineeringProjectsView 
        v-if="activeTab === 'engineering-projects'"
        :initialStatus="activeProjectStatus"
        @back="handleBackToManagement"
      />

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

<style>
/* 可以在这里添加全局样式 */
</style>
