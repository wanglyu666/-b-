<script setup lang="ts">
import { ArrowLeft, Heart, Trash2, ShoppingBag } from 'lucide-vue-next';
import TopBarActions from './TopBarActions.vue';
import type { Product } from '../types';

defineProps<{
  wishlistItems: Product[];
  cartCount: number;
  wishlistCount: number;
  messageCount: number;
}>();

defineEmits([
  'removeItem', 
  'back', 
  'cartClick', 
  'wishlistClick', 
  'addToCart', 
  'messageClick'
]);
</script>

<template>
  <div class="p-8 h-full flex flex-col max-w-[1000px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
     <header class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
           <button 
              @click="$emit('back')" 
              class="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
           >
              <ArrowLeft :size="20" />
           </button>
           <h1 class="text-2xl font-bold text-gray-900">我的收藏 ({{ wishlistItems.length }})</h1>
        </div>
        <TopBarActions 
          :isShop="true" 
          :cartCount="cartCount" 
          @cartClick="$emit('cartClick')" 
          @wishlistClick="$emit('wishlistClick')" 
          :wishlistCount="wishlistCount" 
          @messageClick="$emit('messageClick')" 
          :messageCount="messageCount" 
        />
     </header>

     <div v-if="wishlistItems.length === 0" class="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 p-12">
        <Heart :size="64" :strokeWidth="1" class="mb-4 text-gray-300" />
        <p class="text-lg font-medium">暂无收藏商品</p>
        <button @click="$emit('back')" class="mt-6 px-6 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">
           去逛逛
        </button>
     </div>
     <div v-else class="flex-1 space-y-4 overflow-y-auto pb-12">
        <div v-for="item in wishlistItems" :key="item.id" class="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center group transition-all hover:shadow-md">
           <div class="w-24 h-24 bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center">
              <img :src="item.image" :alt="item.name" class="w-full h-full object-cover mix-blend-multiply opacity-90" referrerpolicy="no-referrer" />
           </div>
           
           <div class="flex-1 ml-5 flex flex-col justify-center h-24 py-1">
              <div class="flex justify-between items-start mb-1">
                 <div>
                    <h3 class="font-bold text-lg text-gray-900">{{ item.name }}</h3>
                    <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mt-0.5">{{ item.category }}</p>
                 </div>
                 <button 
                    @click="$emit('removeItem', item.id)"
                    class="text-gray-300 hover:text-red-500 transition-colors p-1"
                 >
                    <Trash2 :size="18" />
                 </button>
              </div>
              
              <div class="flex justify-between items-end mt-auto">
                 <span class="text-lg font-bold text-[#A1D573]">¥{{ item.price.toFixed(2) }}</span>
                 <button 
                    @click="$emit('addToCart', item)"
                    class="bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
                 >
                    <ShoppingBag :size="14" />
                    加入购物车
                 </button>
              </div>
           </div>
        </div>
     </div>
  </div>
</template>
