<script setup lang="ts">
import { Search, ShoppingBag, Heart, Bell } from 'lucide-vue-next';

withDefaults(defineProps<{
  isShop?: boolean;
  cartCount?: number;
  wishlistCount?: number;
  messageCount?: number;
}>(), {
  isShop: false,
  cartCount: 0,
  wishlistCount: 0,
  messageCount: 0
});

defineEmits(['cartClick', 'wishlistClick', 'messageClick']);
</script>

<template>
  <div class="flex items-center space-x-4">
    <div class="flex items-center bg-white rounded-full border border-gray-100 shadow-sm px-4 py-2 space-x-5 h-12">
      
      <div v-if="isShop" 
        @click="$emit('cartClick')"
        class="relative cursor-pointer hover:text-black transition-colors"
      >
        <ShoppingBag :size="20" class="text-gray-600" />
        <span v-if="cartCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white font-bold">
            {{ cartCount > 9 ? '9+' : cartCount }}
        </span>
      </div>
      <Search v-else :size="20" class="text-gray-600 cursor-pointer hover:text-black transition-colors" />
      
      <div v-if="isShop"
        @click="$emit('wishlistClick')"
        class="relative cursor-pointer hover:text-red-500 transition-colors"
      >
        <Heart :size="20" class="text-gray-600" />
        <span v-if="wishlistCount > 0" class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </div>

      <div 
        @click="$emit('messageClick')"
        class="relative cursor-pointer hover:text-black transition-colors"
      >
        <Bell :size="20" class="text-gray-600" />
        <span v-if="messageCount > 0" class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </div>

    </div>
    <div class="flex items-center space-x-3 bg-white pl-2 pr-4 py-1.5 rounded-full shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors h-12">
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Cooper" alt="User" class="w-9 h-9 rounded-full bg-gray-100" />
      <div class="flex items-center space-x-2">
        <span class="text-sm font-bold text-gray-700">管理员</span>
      </div>
    </div>
  </div>
</template>
