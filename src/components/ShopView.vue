<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Search, TrendingUp, Star, ShoppingBag, Heart, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import TopBarActions from './TopBarActions.vue';
import { products } from '../data';
import type { Product } from '../types';

const props = defineProps<{
  currentPage: number;
  initialScrollTop: number;
  cartCount: number;
  wishlistCount: number;
  wishlistItems: Product[];
  messageCount: number;
}>();

const emit = defineEmits([
  'update:currentPage', 
  'productClick', 
  'addToCart', 
  'cartClick', 
  'wishlistClick', 
  'toggleWishlist', 
  'messageClick'
]);

const itemsPerPage = 16;
const totalPages = Math.ceil(products.length / itemsPerPage);

const currentProducts = computed(() => {
  return products.slice(
    (props.currentPage - 1) * itemsPerPage,
    props.currentPage * itemsPerPage
  );
});

onMounted(() => {
  const mainEl = document.getElementById('main-content');
  if (mainEl && props.initialScrollTop > 0) {
    mainEl.scrollTop = props.initialScrollTop;
  }
});

const isInWishlist = (product: Product) => {
  return props.wishlistItems.some(item => item.id === product.id);
};

const setCurrentPage = (page: number) => {
  emit('update:currentPage', page);
};

const prevPage = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1);
  }
};

const nextPage = () => {
  if (props.currentPage < totalPages) {
    emit('update:currentPage', props.currentPage + 1);
  }
};
</script>

<template>
  <div class="p-8 space-y-8">
    <header class="flex justify-between items-center">
      <div class="flex-1 max-w-lg">
         <div class="relative">
           <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" :size="18" />
           <input type="text" placeholder="搜索商品..." class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-gray-400 w-full shadow-sm" />
         </div>
      </div>
      <div class="pl-4">
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
    </header>

    <section>
      <h2 class="text-2xl font-bold text-gray-800 mb-6">特惠活动</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="h-64 rounded-3xl bg-white/50 backdrop-blur-md border border-white/20 relative overflow-hidden">
        </div>

        <div class="h-64 rounded-3xl bg-white/50 backdrop-blur-md border border-white/20 relative overflow-hidden">
        </div>
      </div>
    </section>

    <section>
      <div class="flex justify-between items-end mb-6">
         <div>
           <h2 class="text-2xl font-bold text-gray-800 mb-4">热销商品</h2>
           <div class="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
             <button 
                v-for="(cat, idx) in ['全部商品', '椅子', '桌子', '沙发', '脚凳', '办公']" 
                :key="cat" 
                :class="['px-6 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                  idx === 0 ? 'bg-black text-white' : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300'
                ]"
             >
               {{ cat }}
             </button>
           </div>
         </div>
         <div class="flex items-center space-x-2 text-sm text-gray-500 mb-3">
           <span>排序</span>
           <button class="flex items-center font-bold text-gray-800">
             低-高 <TrendingUp :size="14" class="ml-1" />
           </button>
         </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <div 
            v-for="product in currentProducts"
            :key="product.id" 
            @click="$emit('productClick', product)"
            class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group cursor-pointer"
         >
           <div class="relative h-48 bg-[#F5F5F7] rounded-xl overflow-hidden mb-4 flex items-center justify-center">
             <img :src="product.image" :alt="product.name" class="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500" referrerpolicy="no-referrer" />
             
             <div class="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <button 
                    @click.stop="$emit('toggleWishlist', product)"
                    :class="['p-2 rounded-full shadow-md hover:text-white transition-colors', isInWishlist(product) ? 'bg-[#A1D573] text-white' : 'bg-white text-gray-900 hover:bg-black']"
                >
                   <Heart :size="16" :fill="isInWishlist(product) ? 'currentColor' : 'none'" />
                </button>
             </div>
           </div>
           <div class="space-y-1">
             <span class="text-xs text-gray-400 uppercase font-semibold">{{ product.category }}</span>
             <h3 class="font-bold text-gray-800 text-lg leading-tight truncate">{{ product.name }}</h3>
             <div class="flex text-yellow-400 text-xs">
               <Star v-for="i in 5" :key="i" :size="12" :fill="i <= product.rating ? 'currentColor' : 'none'" :class="i <= product.rating ? '' : 'text-gray-300'" />
             </div>
           </div>
           <div class="flex justify-between items-end mt-4">
             <span class="text-lg font-bold text-gray-900">¥{{ product.price.toFixed(2) }}</span>
             <button 
                @click.stop="$emit('addToCart', product)"
                class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#A1D573] hover:text-black hover:scale-110 transition-all shadow-md shadow-black/20"
             >
               <ShoppingBag :size="14" />
             </button>
           </div>
         </div>
      </div>

      <div class="flex justify-center items-center mt-12 space-x-4">
        <button 
          @click="prevPage"
          :disabled="currentPage === 1"
          class="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft :size="20" />
        </button>
        
        <div class="flex space-x-2">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="setCurrentPage(page)"
            :class="['w-10 h-10 rounded-full text-sm font-bold transition-all',
              currentPage === page 
                ? 'bg-black text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button 
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight :size="20" />
        </button>
      </div>
    </section>
  </div>
</template>
