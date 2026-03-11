<script setup lang="ts">
import { computed } from 'vue';
import { ArrowLeft, ShoppingBag, Trash2, Minus, Plus, ArrowRight } from 'lucide-vue-next';
import TopBarActions from './TopBarActions.vue';
import type { CartItem } from '../types';

const props = defineProps<{
  cartItems: CartItem[];
  cartCount: number;
  wishlistCount: number;
  messageCount: number;
}>();

const emit = defineEmits([
  'updateQuantity', 
  'removeItem', 
  'back', 
  'cartClick', 
  'wishlistClick', 
  'messageClick'
]);

const total = computed(() => {
  return props.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
});
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
           <h1 class="text-2xl font-bold text-gray-900">我的购物车 ({{ cartItems.length }})</h1>
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

     <div v-if="cartItems.length === 0" class="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 p-12">
        <ShoppingBag :size="64" :strokeWidth="1" class="mb-4 text-gray-300" />
        <p class="text-lg font-medium">购物车是空的</p>
        <button @click="$emit('back')" class="mt-6 px-6 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">
           去逛逛
        </button>
     </div>
     <template v-else>
       <div class="flex-1 space-y-4 overflow-y-auto pb-32">
          <div v-for="item in cartItems" :key="item.id" class="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center group transition-all hover:shadow-md">
             <div class="w-24 h-24 bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center">
                <img :src="item.image" :alt="item.name" class="w-full h-full object-cover mix-blend-multiply opacity-90" referrerpolicy="no-referrer" />
             </div>
             
             <div class="flex-1 ml-5 flex flex-col justify-center h-24 py-1">
                <div class="flex justify-between items-start mb-1">
                   <div>
                      <h3 class="font-bold text-lg text-gray-900">{{ item.name }}</h3>
                      <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mt-0.5">{{ item.category }} / 标准规格</p>
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
                   
                   <div class="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                      <button 
                        @click="$emit('updateQuantity', item.id, -1)"
                        class="text-gray-400 hover:text-black transition-colors disabled:opacity-30"
                        :disabled="item.quantity <= 1"
                      >
                        <Minus :size="14" />
                      </button>
                      <span class="text-gray-900 font-bold text-sm w-4 text-center">{{ item.quantity }}</span>
                      <button 
                        @click="$emit('updateQuantity', item.id, 1)"
                        class="text-gray-400 hover:text-black transition-colors"
                      >
                        <Plus :size="14" />
                      </button>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <div class="fixed bottom-6 left-1/2 md:left-[calc(50%+8rem)] transform -translate-x-1/2 w-full max-w-[900px] px-8 z-10">
          <div class="bg-[#A1D573] text-[#163300] p-4 pl-8 pr-4 rounded-full shadow-2xl flex items-center justify-between border border-[#A1D573]">
             <div class="flex flex-col">
                <span class="text-[#163300]/70 text-xs font-medium uppercase tracking-wider">总计 (Total)</span>
                <span class="text-2xl font-bold">¥{{ total.toFixed(2) }}</span>
             </div>
             <button class="bg-[#163300] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#163300]/90 transition-colors shadow-lg shadow-[#163300]/20 flex items-center gap-2">
                去结算 <ArrowRight :size="16" />
             </button>
          </div>
       </div>
     </template>
  </div>
</template>
