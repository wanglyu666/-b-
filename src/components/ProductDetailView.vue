<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { ArrowLeft, Star, Minus, Plus, MessageCircle } from 'lucide-vue-next';
import TopBarActions from './TopBarActions.vue';
import CartConsultationModal from './consultation-feedback/CartConsultationModal.vue';
import { useAppStore } from '../stores/appStore';
import type { CartItem, Product } from '../types';

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

const appStore = useAppStore();
const activeImg = ref(0);
const quantity = ref(1);
const cartConsultModalOpen = ref(false);

const consultCartItems = computed((): CartItem[] => [
  { ...props.product, quantity: quantity.value },
]);

const showConsultAsList = computed(
  () => props.product.productKind === 'annual' && appStore.cartAnnualDisplayMode === 'list',
);

type OptionRowKey = 'brand' | 'model' | 'spec' | 'color';

const optionRows: { key: OptionRowKey; label: string; options: string[] }[] = [
  {
    key: 'brand',
    label: '品牌',
    options: ['宜家', 'MUJI', '源氏木语', '林氏家居', '全友', '顾家', '芝华仕', '左右家居', '欧派', '索菲亚', '红苹果', '联邦'],
  },
  {
    key: 'model',
    label: '型号',
    options: ['MU-01', 'MU-02', 'MU-03', 'MU-04', 'MU-05', 'MU-06', 'MU-07', 'MU-08', 'MU-09', 'MU-10', 'MU-11', 'MU-12'],
  },
  {
    key: 'spec',
    label: '规格',
    options: ['标准款', '加大款', '迷你款', '定制款', '组合款', '限量款', '旗舰款', '入门款', '家庭款', '商用款', '儿童款', '长辈款'],
  },
  {
    key: 'color',
    label: '颜色',
    options: ['象牙白', '米灰色', '原木色', '深胡桃', '墨绿色', '浅蓝色', '燕麦色', '炭黑色', '酒红色', '雾霾蓝', '奶茶棕', '纯白色'],
  },
];

const selectedOptions = ref<Record<OptionRowKey, string>>({
  brand: optionRows[0].options[0],
  model: optionRows[1].options[0],
  spec: optionRows[2].options[0],
  color: optionRows[3].options[0],
});

const scrollContainerRefs: Record<OptionRowKey, ReturnType<typeof ref<HTMLElement | null>>> = {
  brand: ref(null),
  model: ref(null),
  spec: ref(null),
  color: ref(null),
};

const scrollMasks = ref<Record<OptionRowKey, { left: boolean; right: boolean }>>({
  brand: { left: false, right: false },
  model: { left: false, right: false },
  spec: { left: false, right: false },
  color: { left: false, right: false },
});

const rowDragState = ref<{ key: OptionRowKey; startX: number; scrollLeft: number } | null>(null);

function setScrollRef(key: OptionRowKey, el: unknown) {
  scrollContainerRefs[key].value = el as HTMLElement | null;
}

function updateScrollMask(key: OptionRowKey) {
  const el = scrollContainerRefs[key].value;
  if (!el) return;

  const { scrollLeft, scrollWidth, clientWidth } = el;
  scrollMasks.value[key] = {
    left: scrollLeft > 4,
    right: scrollLeft + clientWidth < scrollWidth - 4,
  };
}

function updateAllScrollMasks() {
  optionRows.forEach((row) => updateScrollMask(row.key));
}

function selectOption(key: OptionRowKey, value: string) {
  selectedOptions.value[key] = value;
}

function onRowDragMove(e: MouseEvent) {
  if (!rowDragState.value) return;
  const el = scrollContainerRefs[rowDragState.value.key].value;
  if (!el) return;

  el.scrollLeft = rowDragState.value.scrollLeft - (e.pageX - rowDragState.value.startX);
  updateScrollMask(rowDragState.value.key);
}

function endRowDrag() {
  rowDragState.value = null;
  document.body.classList.remove('option-row-dragging');
  document.removeEventListener('mousemove', onRowDragMove);
  document.removeEventListener('mouseup', endRowDrag);
}

function startRowDrag(key: OptionRowKey, e: MouseEvent) {
  const el = scrollContainerRefs[key].value;
  if (!el || e.button !== 0) return;

  rowDragState.value = { key, startX: e.pageX, scrollLeft: el.scrollLeft };
  document.body.classList.add('option-row-dragging');
  document.addEventListener('mousemove', onRowDragMove);
  document.addEventListener('mouseup', endRowDrag);
  e.preventDefault();
}

const images = computed(() => [props.product.image, props.product.image, props.product.image]);
const totalPrice = computed(() => props.product.price * quantity.value);

const decrement = () => {
  quantity.value = Math.max(1, quantity.value - 1);
};

const increment = () => {
  quantity.value += 1;
};

onMounted(() => {
  nextTick(updateAllScrollMasks);
  window.addEventListener('resize', updateAllScrollMasks);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateAllScrollMasks);
  endRowDrag();
});
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
          :userName="appStore.customerName"
        />
     </div>

     <div class="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
        <div class="w-full lg:w-1/2 p-8 lg:p-10 flex flex-col items-center justify-center bg-gray-50/50 border-b lg:border-b-0 lg:border-r border-gray-100 relative min-h-0">
           <div class="relative w-full flex items-center justify-center mb-3 max-h-[400px]">
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

        <div class="w-full lg:w-1/2 p-8 lg:p-10 flex flex-col justify-between overflow-hidden bg-white min-h-0">
           <div>
           <div class="mb-3.5">
               <h1 class="text-3xl font-extrabold text-gray-900">{{ product.name }}</h1>
           </div>
           <div class="flex items-end gap-6 mb-0">
               <span class="text-4xl font-bold leading-none text-[#A1D573] translate-y-1">¥{{ product.price.toFixed(2) }}</span>
               <div class="flex items-end gap-2 text-yellow-400">
                  <span class="text-gray-400 text-xs font-medium leading-none">推荐指数</span>
                  <Star v-for="i in 5" :key="i" :size="16" :fill="i <= product.rating ? 'currentColor' : 'none'" :class="i <= product.rating ? '' : 'text-gray-200'" />
               </div>
           </div>

           <div class="mt-8">
           <div class="border-b border-gray-100 pb-4 mb-4">
               <div class="flex gap-6 text-sm font-bold text-gray-400 mb-2.5 border-b border-gray-100">
                  <button class="text-black border-b-2 border-[#A1D573] pb-2 px-1 transition-colors">商品描述</button>
                  <button class="hover:text-black pb-2 px-1 transition-colors">详细信息</button>
                  <button class="hover:text-black pb-2 px-1 transition-colors">用户评价</button>
               </div>
               <p class="text-gray-500 text-sm leading-relaxed line-clamp-2">
                  {{ product.desc }}
               </p>
           </div>

           <div class="option-rows">
             <template v-for="row in optionRows" :key="row.key">
               <div
                 class="option-drag-gap"
                 @mousedown="startRowDrag(row.key, $event)"
               />
               <div class="flex items-center gap-2">
                 <span class="option-row-label shrink-0">{{ row.label }}：</span>
                 <div class="relative min-w-0 flex-1">
                   <div
                     class="option-scroll-mask option-scroll-mask-left"
                     :class="{ 'is-visible': scrollMasks[row.key].left }"
                   />
                   <div
                     class="option-scroll-mask option-scroll-mask-right"
                     :class="{ 'is-visible': scrollMasks[row.key].right }"
                   />
                   <div
                     :ref="(el) => setScrollRef(row.key, el)"
                     class="option-scroll-track flex gap-1.5 overflow-x-auto py-px"
                     @scroll="updateScrollMask(row.key)"
                   >
                     <button
                       v-for="option in row.options"
                       :key="option"
                       type="button"
                       :class="[
                         'shrink-0 rounded-md border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors',
                         selectedOptions[row.key] === option
                           ? 'border-[#A1D573] bg-[#A1D573] text-white'
                           : 'border-gray-200 bg-white text-gray-600 hover:border-[#A1D573] hover:text-[#A1D573]',
                       ]"
                       @mousedown.stop
                       @click="selectOption(row.key, option)"
                     >
                       {{ option }}
                     </button>
                   </div>
                 </div>
               </div>
             </template>
             <div
               class="option-section-gap"
               @mousedown="startRowDrag('color', $event)"
             />
           </div>

           <div>
               <span class="option-row-label block mb-1.5">数量与总价</span>
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
           </div>
           </div>

           <div class="flex flex-col gap-2.5 w-full shrink-0">
               <div class="flex gap-3 w-full">
                 <button
                   type="button"
                   @click="$emit('toggleWishlist', product)"
                   :class="[
                     'flex-1 py-2.5 rounded-full border-2 font-bold transition-all tracking-wider text-sm flex items-center justify-center gap-2 group',
                     isInWishlist
                       ? 'border-[#A1D573] text-[#A1D573]'
                       : 'border-gray-300 text-gray-600 hover:border-[#A1D573] hover:text-[#A1D573]',
                   ]"
                 >
                   <Star
                     :size="18"
                     :fill="isInWishlist ? 'currentColor' : 'none'"
                     :class="isInWishlist ? '' : 'group-hover:fill-[#A1D573] transition-colors'"
                   />
                   {{ isInWishlist ? '已收藏' : '收藏' }}
                 </button>
                 <button
                   type="button"
                   class="flex-1 py-2.5 rounded-full border-2 border-gray-300 font-bold text-gray-600 tracking-wider text-sm flex items-center justify-center gap-2 transition-all hover:border-[#A1D573] hover:text-[#A1D573]"
                   @click="cartConsultModalOpen = true"
                 >
                   <MessageCircle :size="18" />
                   咨询
                 </button>
               </div>
               <button 
                   @click="$emit('addToCart', product, quantity)"
                   class="w-full py-2.5 rounded-full bg-[#A1D573] text-white font-bold shadow-lg shadow-[#A1D573]/30 hover:bg-[#8ec260] hover:shadow-xl transition-all uppercase tracking-wider text-sm transform hover:-translate-y-0.5"
               >
                  加入购物车
               </button>
           </div>
        </div>
     </div>

     <CartConsultationModal
       v-model="cartConsultModalOpen"
       :cart-items="consultCartItems"
       :show-as-list="showConsultAsList"
     />
  </div>
</template>

<style scoped>
.option-row-label {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 700;
  color: rgb(156 163 175);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.option-scroll-track {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.option-scroll-track::-webkit-scrollbar {
  display: none;
}

.option-drag-gap {
  height: 1.375rem;
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.option-drag-gap:active {
  cursor: grabbing;
}

.option-section-gap {
  height: 2rem;
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.option-section-gap:active {
  cursor: grabbing;
}

:global(body.option-row-dragging) {
  user-select: none;
  cursor: grabbing;
}

:global(body.option-row-dragging) .option-drag-gap,
:global(body.option-row-dragging) .option-section-gap {
  cursor: grabbing;
}

.option-scroll-mask {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2rem;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.option-scroll-mask.is-visible {
  opacity: 1;
}

.option-scroll-mask-left {
  left: 0;
  background: linear-gradient(to right, #fff 10%, rgba(255, 255, 255, 0));
}

.option-scroll-mask-right {
  right: 0;
  background: linear-gradient(to left, #fff 10%, rgba(255, 255, 255, 0));
}
</style>
