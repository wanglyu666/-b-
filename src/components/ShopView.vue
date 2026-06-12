<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Search, Star, ShoppingBag, Heart, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import TopBarActions from './TopBarActions.vue';
import type { Product } from '../types';
import post1Img from '../../image asset/post1.png';
import post2Img from '../../image asset/post2.png';

/** 右侧特惠图布局：直接改这里的数字即可 */
const POST2_BANNER = {
  /** 图片宽度占卡片宽度的百分比（越小越「小」） */
  widthPercent: 100,
  /** 图片最大高度占卡片高度的百分比 */
  maxHeightPercent: 100,
  /** 图片整体缩放（1.5 = 放大 50%） */
  scale: 1.35,
  /** 水平位移（负数 = 往左） */
  offsetXPx: -40,
  /** 左侧留白（像素） */
  paddingLeftPx: 8,
};

const props = defineProps<{
  currentPage: number;
  initialScrollTop: number;
  cartCount: number;
  wishlistCount: number;
  wishlistItems: Product[];
  messageCount: number;
  products: Product[];
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

const categories = ['全部商品', '椅子', '桌子', '沙发', '脚凳', '办公'] as const;

const categoryFilters: Record<(typeof categories)[number], (product: Product) => boolean> = {
  全部商品: () => true,
  椅子: (product) => product.name.includes('椅') && !product.name.includes('脚凳'),
  桌子: (product) => product.name.includes('桌') || product.category === '桌子',
  沙发: (product) => product.name.includes('沙发'),
  脚凳: (product) => product.name.includes('脚凳'),
  办公: (product) =>
    product.name.includes('书架') || product.name.includes('储物') || product.category === '收纳',
};

const itemsPerPage = 16;
const isAnnualMode = ref(false);
const activeCategory = ref<(typeof categories)[number]>('全部商品');
const showProductGrid = ref(true);

const filteredProducts = computed(() =>
  props.products.filter(categoryFilters[activeCategory.value]),
);

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage));

const currentProducts = computed(() => {
  return filteredProducts.value.slice(
    (props.currentPage - 1) * itemsPerPage,
    props.currentPage * itemsPerPage,
  );
});

const productGridKey = computed(() => `${activeCategory.value}-${isAnnualMode.value}`);

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
  if (props.currentPage < totalPages.value) {
    emit('update:currentPage', props.currentPage + 1);
  }
};

function runProductGridTransition(update: () => void) {
  showProductGrid.value = false;
  window.setTimeout(() => {
    update();
    showProductGrid.value = true;
  }, 280);
}

function handleCategoryClick(category: (typeof categories)[number]) {
  if (activeCategory.value === category) return;

  runProductGridTransition(() => {
    activeCategory.value = category;
    emit('update:currentPage', 1);
  });
}

function handleToggleProductType() {
  runProductGridTransition(() => {
    isAnnualMode.value = !isAnnualMode.value;
  });
}
</script>

<template>
  <div class="w-full overflow-x-hidden p-8 space-y-8">
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
      <div class="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
        <div class="relative h-64 min-w-0 overflow-hidden rounded-3xl border border-white/20 bg-white/50 backdrop-blur-md isolate">
          <img
            :src="post1Img"
            alt=""
            class="h-full w-full object-cover"
          />
          <div
            class="absolute left-10 top-[40%] -translate-y-1/2 space-y-2 select-none"
            style="color: #000;"
          >
            <div class="text-5xl font-extrabold tracking-wide leading-tight">
              所售皆<span class="text-[#9FE870]">精品</span>
            </div>
            <div class="text-5xl font-extrabold tracking-wide leading-tight">
              所装皆<span class="text-[#9FE870]">作品</span>
            </div>
          </div>
        </div>

        <div
          class="relative isolate h-64 min-w-0 overflow-hidden rounded-3xl border border-white/20 bg-white/50 backdrop-blur-md"
        >
          <div
            class="pointer-events-none absolute inset-0 overflow-hidden"
            :style="{ paddingLeft: `${POST2_BANNER.paddingLeftPx}px` }"
          >
            <img
              :src="post2Img"
              alt=""
              class="absolute left-0 top-1/2 max-h-full object-contain object-left"
              :style="{
                width: `${POST2_BANNER.widthPercent}%`,
                maxHeight: `${POST2_BANNER.maxHeightPercent}%`,
                transform: `translate(${POST2_BANNER.offsetXPx}px, -50%) scale(${POST2_BANNER.scale})`,
                transformOrigin: 'left center',
              }"
            />
          </div>
          <div
            class="pointer-events-none absolute right-10 top-[65%] -translate-y-1/2 space-y-2 select-none text-right"
            style="color: #000;"
          >
            <div class="text-4xl font-extrabold tracking-wide leading-tight">
              <span class="text-[#9FE870]">指尖</span>完成一切
            </div>
            <div class="text-4xl font-extrabold tracking-wide leading-tight">
              <span class="text-[#9FE870]">轻松</span>就完事了
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="flex justify-between items-end mb-6">
         <div>
           <h2 class="text-2xl font-bold text-gray-800 mb-4">热销商品</h2>
           <div class="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
             <button
                v-for="cat in categories"
                :key="cat"
                type="button"
                :class="[
                  'px-6 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                  activeCategory === cat
                    ? 'bg-[#B0D4C5] text-white'
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300',
                ]"
                @click="handleCategoryClick(cat)"
             >
               {{ cat }}
             </button>
           </div>
         </div>
         <button
           type="button"
           class="mb-3 text-sm text-gray-800 transition-colors hover:text-gray-600"
           @click="handleToggleProductType"
         >
           <span class="font-light">切换</span>
           <span class="font-bold">{{ isAnnualMode ? ' 普通产品' : ' 年框产品' }}</span>
         </button>
      </div>

      <Transition name="shop-products" mode="out-in">
        <div v-if="showProductGrid" :key="productGridKey">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <div 
            v-for="product in currentProducts"
            :key="product.id" 
            @click="$emit('productClick', product)"
            class="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-lg"
         >
           <div class="relative h-48 bg-[#F5F5F7] rounded-xl overflow-hidden mb-2 flex items-center justify-center">
             <img :src="product.image" :alt="product.name" class="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500" referrerpolicy="no-referrer" />
             
             <div class="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <button 
                    @click.stop="$emit('toggleWishlist', product)"
                    :class="['p-2 rounded-full shadow-md transition-colors', isInWishlist(product) ? 'bg-[#B2C4D7] text-white' : 'bg-white text-gray-900 hover:bg-[#B0D4C5] hover:text-white']"
                >
                   <Heart :size="16" :fill="isInWishlist(product) ? 'currentColor' : 'none'" />
                </button>
             </div>
           </div>
           <div class="space-y-1">
             <h3 class="font-bold text-gray-800 text-lg leading-tight truncate">{{ product.name }}</h3>
             <div class="flex text-yellow-400 text-xs">
               <Star v-for="i in 5" :key="i" :size="12" :fill="i <= product.rating ? 'currentColor' : 'none'" :class="i <= product.rating ? '' : 'text-gray-300'" />
             </div>
           </div>
           <div class="flex justify-between items-end mt-4">
             <span class="text-lg font-bold text-gray-900">¥{{ product.price.toFixed(2) }}</span>
             <button 
                @click.stop="$emit('addToCart', product)"
                class="w-8 h-8 rounded-full bg-[#B0D4C5] text-white flex items-center justify-center hover:bg-[#B2C4D7] hover:text-white hover:scale-110 transition-all shadow-md shadow-gray-400/25"
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
                ? 'bg-[#B0D4C5] text-white shadow-md' 
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
        </div>
      </Transition>
    </section>
  </div>
</template>

<style scoped>
.shop-products-enter-active,
.shop-products-leave-active {
  transition:
    opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.28s cubic-bezier(0.33, 1, 0.32, 1);
}

.shop-products-enter-from,
.shop-products-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.shop-products-enter-to,
.shop-products-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
