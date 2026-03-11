<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowLeft, Star, Heart, Minus, Plus } from 'lucide-vue-next';
import TopBarActions from './TopBarActions.vue';
import type { Product } from '../types';

const props = defineProps<{
  product: Product;
  cartCount: number;
  isInWishlist: boolean;
  wishlistCount: number;
  messageCount: number;
}>();

const emit = defineEmits([
  'back', 
  'addToCart', 
  'cartClick', 
  'toggleWishlist', 
  'wishlistClick', 
  'messageClick'
]);

const activeImg = ref(0);
const quantity = ref(1);

const images = computed(() => [props.product.image, props.product.image, props.product.image]);
const totalPrice = computed(() => props.product.price * quantity.value);

const decrement = () => {
  quantity.value = Math.max(1, quantity.value - 1);
};

const increment = () => {
  quantity.value += 1;
};
</script>

<template>
  <div class="p-8 h-full flex flex-col max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
     <div class="flex justify-between items-center mb-6">
        <button 
          @click="$emit('back')" 
          class="flex items-center text-gray-500 hover:text-black transition-colors group"
        >
          <div class="p-2 rounded-full bg-white border border-gray-200 group-hover:bg-gray-100 mr-2">
             <ArrowLeft :size="20" />
          </div>
          <span class="font-bold">返回商店</span>
        </button>
        <TopBarActions 
          :isShop="true" 
          :cartCount="cartCount" 
          @cartClick="$emit('cartClick')" 
          @wishlistClick="$emit('wishlistClick')" 
          :wishlistCount="wishlistCount" 
          @messageClick="$emit('messageClick')" 
          :messageCount="messageCount" 
        />
     </div>

     <div class="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
        <div class="w-full lg:w-1/2 p-12 flex flex-col items-center justify-center bg-gray-50/50 border-b lg:border-b-0 lg:border-r border-gray-100 relative">
           <div class="relative w-full h-full max-h-[500px] flex items-center justify-center mb-8">
              <img 
                :src="images[activeImg]" 
                :alt="product.name" 
                class="max-h-full max-w-full object-contain drop-shadow-2xl transition-all duration-500 transform hover:scale-105" 
                referrerpolicy="no-referrer"
              />
           </div>
           <div class="flex gap-3">
              <button 
                 v-for="(_, i) in images"
                 :key="i" 
                 @click="activeImg = i" 
                 :class="['h-3 rounded-full transition-all duration-300', activeImg === i ? 'bg-[#A1D573] w-8' : 'bg-gray-300 hover:bg-gray-400 w-3']" 
              />
           </div>
        </div>

        <div class="w-full lg:w-1/2 p-12 flex flex-col justify-center bg-white">
           <div class="mb-6">
               <h1 class="text-4xl font-extrabold text-gray-900 mb-2">{{ product.name }}</h1>
               <p class="text-gray-400 font-medium tracking-wide text-sm uppercase">{{ product.category }}</p>
           </div>
           <div class="flex items-center gap-6 mb-8">
               <span class="text-4xl font-bold text-[#A1D573]">¥{{ product.price.toFixed(2) }}</span>
               <div class="flex items-center text-yellow-400">
                  <Star v-for="i in 5" :key="i" :size="18" :fill="i <= product.rating ? 'currentColor' : 'none'" :class="i <= product.rating ? '' : 'text-gray-200'" />
                  <span class="text-gray-400 text-sm ml-2 font-medium">(128 条评价)</span>
               </div>
           </div>

           <div class="border-b border-gray-100 pb-8 mb-8">
               <div class="flex gap-8 text-sm font-bold text-gray-400 mb-4 border-b border-gray-100">
                  <button class="text-black border-b-2 border-[#A1D573] pb-3 px-1 transition-colors">商品描述</button>
                  <button class="hover:text-black pb-3 px-1 transition-colors">详细信息</button>
                  <button class="hover:text-black pb-3 px-1 transition-colors">用户评价</button>
               </div>
               <p class="text-gray-500 text-sm leading-relaxed">
                  {{ product.desc }}
               </p>
           </div>

           <div class="mb-10">
               <span class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">数量与总价</span>
               <div class="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-full border border-gray-200 w-full sm:w-auto sm:inline-flex">
                  <div class="flex items-center gap-3">
                     <button 
                       @click="decrement"
                       class="text-gray-400 hover:text-black transition-colors"
                     >
                       <Minus :size="16" />
                     </button>
                     <span class="text-gray-900 font-bold text-base w-6 text-center">{{ quantity }}</span>
                     <button 
                       @click="increment"
                       class="text-gray-400 hover:text-black transition-colors"
                     >
                       <Plus :size="16" />
                     </button>
                  </div>
                  <div class="w-px h-4 bg-gray-300 mx-4 hidden sm:block"></div>
                  <span class="text-base font-bold text-gray-900">¥{{ totalPrice.toFixed(2) }}</span>
               </div>
           </div>

           <div class="flex flex-col gap-4 mt-auto w-full">
               <button 
                   @click="$emit('toggleWishlist', product)"
                   :class="['w-full py-4 rounded-full border-2 font-bold transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2 group', isInWishlist ? 'border-[#A1D573] text-[#A1D573]' : 'border-gray-300 text-gray-600 hover:border-[#A1D573] hover:text-[#A1D573]']"
               >
                  <Heart :size="18" :fill="isInWishlist ? 'currentColor' : 'none'" :class="isInWishlist ? '' : 'group-hover:fill-[#A1D573] transition-colors'" />
                  {{ isInWishlist ? '已在心愿单' : '加入心愿单' }}
               </button>
               <button 
                   @click="$emit('addToCart', product, quantity)"
                   class="w-full py-4 rounded-full bg-[#A1D573] text-white font-bold shadow-lg shadow-[#A1D573]/30 hover:bg-[#8ec260] hover:shadow-xl transition-all uppercase tracking-wider text-sm transform hover:-translate-y-0.5"
               >
                  加入购物车
               </button>
           </div>
        </div>
     </div>
  </div>
</template>
