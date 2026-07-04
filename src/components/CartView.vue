<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ArrowLeft, ShoppingBag, Trash2, Minus, Plus, ArrowRight } from 'lucide-vue-next';
import type { CartDisplayMode, CartItem } from '../types';
import CartConsultationModal from './consultation-feedback/CartConsultationModal.vue';

const LIST_TABLE_COLUMNS = [
  '专业',
  '科目编号',
  '科目名称',
  '计算规则',
  '品牌',
  '系列/型号',
  '规格',
  '工作内容及特征描述',
  '单位',
  '数量',
  '综合含税单价',
  '操作',
] as const;

const DESCRIPTION_MAX_LEN = 10;

const props = defineProps<{
  cartItems: CartItem[];
  cartAnnualDisplayMode: CartDisplayMode;
}>();

const emit = defineEmits<{
  updateQuantity: [productId: number, delta: number, productKind: CartItem['productKind']];
  removeItem: [productId: number, productKind: CartItem['productKind']];
  back: [];
}>();

const cartConsultModalOpen = ref(false);
const productMode = ref<'normal' | 'annual'>('normal');
const showCartContent = ref(true);
const hoveredDescTooltip = ref<{ description: string; x: number; y: number } | null>(null);

const visibleCartItems = computed(() =>
  props.cartItems.filter((item) => item.productKind === productMode.value),
);

const showListLayout = computed(
  () => props.cartAnnualDisplayMode === 'list' && productMode.value === 'annual',
);

const cartListRows = computed(() =>
  visibleCartItems.value.map((item) => ({
    id: item.id,
    item,
    major: '装饰',
    subjectCode: `KM-${String(item.id).padStart(4, '0')}`,
    subjectName: item.name,
    calcRule: '按项计',
    brand: item.category,
    model: item.name.split(' ')[0] ?? item.name,
    spec: '标准款',
    description: item.desc,
    unit: '项',
    quantity: item.quantity,
    lineTotal: item.price * item.quantity,
  })),
);

const total = computed(() =>
  visibleCartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
);

function syncProductModeWithCartDisplay() {
  if (props.cartAnnualDisplayMode === 'list') {
    productMode.value = 'annual';
  }
}

watch(() => props.cartAnnualDisplayMode, syncProductModeWithCartDisplay, { immediate: true });

function truncateDescription(text: string, max = DESCRIPTION_MAX_LEN) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function isDescriptionTruncated(text: string, max = DESCRIPTION_MAX_LEN) {
  return text.length > max;
}

function showDescTooltip(description: string, e: MouseEvent) {
  if (!isDescriptionTruncated(description)) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  hoveredDescTooltip.value = {
    description,
    x: rect.left,
    y: rect.top,
  };
}

function hideDescTooltip() {
  hoveredDescTooltip.value = null;
}

function runCartContentTransition(update: () => void) {
  showCartContent.value = false;
  window.setTimeout(() => {
    update();
    showCartContent.value = true;
  }, 280);
}

function handleProductModeSwitch(mode: 'normal' | 'annual') {
  if (productMode.value === mode) return;
  runCartContentTransition(() => {
    productMode.value = mode;
  });
}
</script>

<template>
  <div class="relative min-h-screen bg-transparent overflow-x-hidden w-full">
    <div class="relative z-10 flex flex-col min-h-screen max-w-[1600px] mx-auto w-full px-4 sm:px-6 md:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
     <header class="flex-shrink-0 flex w-full items-center justify-between gap-4">
           <div class="flex min-w-0 items-center gap-4">
             <button
                type="button"
                @click="$emit('back')"
                class="shrink-0 rounded-full border border-gray-200 bg-white p-2 transition-colors hover:bg-gray-50"
             >
                <ArrowLeft :size="20" />
             </button>
             <h1 class="truncate text-2xl font-bold text-gray-900">我的购物车 ({{ cartItems.length }})</h1>
           </div>
           <button
             v-if="cartItems.length > 0"
             type="button"
             class="shrink-0 rounded-full border border-[#163300]/15 bg-[#9FE870]/50 px-4 py-2 text-sm font-bold text-[#163300] shadow-sm transition-colors hover:bg-[#9FE870]/70"
             @click="cartConsultModalOpen = true"
           >
             咨询
           </button>
     </header>

     <div v-if="cartItems.length > 0" class="mt-6 flex gap-3">
       <button
         type="button"
         class="rounded-xl px-6 py-2 text-sm font-medium transition-colors"
         :class="
           productMode === 'normal'
             ? 'bg-[#B0D4C5] text-white'
             : 'border border-gray-100 bg-white text-gray-500 hover:border-gray-300'
         "
         @click="handleProductModeSwitch('normal')"
       >
         普通产品
       </button>
       <button
         type="button"
         class="rounded-xl px-6 py-2 text-sm font-medium transition-colors"
         :class="
           productMode === 'annual'
             ? 'bg-[#B0D4C5] text-white'
             : 'border border-gray-100 bg-white text-gray-500 hover:border-gray-300'
         "
         @click="handleProductModeSwitch('annual')"
       >
         年框产品
       </button>
     </div>

     <CartConsultationModal v-model="cartConsultModalOpen" :cart-items="cartItems" />

     <div v-if="cartItems.length === 0" class="mt-8 md:mt-10 flex-1 flex flex-col items-center justify-center w-full min-h-[calc(100vh-10rem)] text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 p-12">
        <ShoppingBag :size="64" :strokeWidth="1" class="mb-4 text-gray-300" />
        <p class="text-lg font-medium">购物车是空的</p>
        <button @click="$emit('back')" class="mt-6 px-6 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">
           去逛逛
        </button>
     </div>
     <template v-else>
       <Transition name="cart-content" mode="out-in">
         <div
           v-if="showCartContent"
           :key="`${productMode}-${cartAnnualDisplayMode}`"
           class="mt-6 md:mt-8 flex-1 overflow-y-auto pb-32 min-h-0"
         >
          <div
            v-if="visibleCartItems.length === 0"
            class="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-gray-400"
          >
            <ShoppingBag :size="48" :stroke-width="1" class="mb-3 text-gray-300" />
            <p class="text-base font-medium">
              {{ productMode === 'annual' ? '年框产品购物车为空' : '普通产品购物车为空' }}
            </p>
          </div>

          <div
            v-else-if="showListLayout"
            class="overflow-hidden rounded-[32px] border border-white/30 bg-white/40 shadow-xl backdrop-blur-xl"
          >
            <div class="overflow-x-auto">
              <table class="cart-list-table w-full min-w-[1080px] border-collapse text-left">
                <thead>
                  <tr class="border-b border-white/10 text-sm font-medium text-gray-500">
                    <th
                      v-for="column in LIST_TABLE_COLUMNS"
                      :key="column"
                      :class="[
                        'h-[3.75rem] px-6 align-middle whitespace-nowrap',
                        column === '工作内容及特征描述' ? 'min-w-[8rem]' : '',
                        column === '操作' ? 'w-16 px-4 text-center' : '',
                      ]"
                    >
                      {{ column }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in cartListRows"
                    :key="`${row.item.productKind}-${row.id}`"
                    :class="[
                      'h-[3.75rem] transition-colors hover:bg-white/30',
                      index < cartListRows.length - 1 ? 'border-b border-white/10' : '',
                    ]"
                  >
                    <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.major }}</td>
                    <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.subjectCode }}</td>
                    <td class="h-[3.75rem] px-6 align-middle font-medium text-gray-800">{{ row.subjectName }}</td>
                    <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.calcRule }}</td>
                    <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.brand }}</td>
                    <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.model }}</td>
                    <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.spec }}</td>
                    <td class="h-[3.75rem] px-6 align-middle text-gray-500">
                      <span
                        class="inline-block"
                        @mouseenter="showDescTooltip(row.description, $event)"
                        @mouseleave="hideDescTooltip"
                      >
                        {{ truncateDescription(row.description) }}
                      </span>
                    </td>
                    <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.unit }}</td>
                    <td class="h-[3.75rem] px-6 align-middle">
                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          class="rounded-full border border-white/30 bg-white/50 p-1 text-gray-500 transition-colors hover:bg-white/80 disabled:opacity-30"
                          :disabled="row.quantity <= 1"
                          @click="emit('updateQuantity', row.id, -1, row.item.productKind)"
                        >
                          <Minus :size="14" />
                        </button>
                        <span class="w-6 text-center text-sm font-bold text-gray-800">{{ row.quantity }}</span>
                        <button
                          type="button"
                          class="rounded-full border border-white/30 bg-white/50 p-1 text-gray-500 transition-colors hover:bg-white/80"
                          @click="emit('updateQuantity', row.id, 1, row.item.productKind)"
                        >
                          <Plus :size="14" />
                        </button>
                      </div>
                    </td>
                    <td class="h-[3.75rem] whitespace-nowrap px-6 align-middle font-medium text-gray-800">
                      ¥{{ row.lineTotal.toFixed(2) }}
                    </td>
                    <td class="h-[3.75rem] px-4 align-middle text-center">
                      <button
                        type="button"
                        class="inline-flex rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/50 hover:text-red-500"
                        @click="emit('removeItem', row.id, row.item.productKind)"
                      >
                        <Trash2 :size="16" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else class="space-y-4">
          <div v-for="item in visibleCartItems" :key="`${item.productKind}-${item.id}`" class="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center group transition-all hover:shadow-md">
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
                      @click="$emit('removeItem', item.id, item.productKind)"
                      class="text-gray-300 hover:text-red-500 transition-colors p-1"
                   >
                      <Trash2 :size="18" />
                   </button>
                </div>
                
                <div class="flex justify-between items-end mt-auto">
                   <span class="text-lg font-bold text-[#A1D573]">¥{{ item.price.toFixed(2) }}</span>
                   
                   <div class="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                      <button 
                        @click="$emit('updateQuantity', item.id, -1, item.productKind)"
                        class="text-gray-400 hover:text-black transition-colors disabled:opacity-30"
                        :disabled="item.quantity <= 1"
                      >
                        <Minus :size="14" />
                      </button>
                      <span class="text-gray-900 font-bold text-sm w-4 text-center">{{ item.quantity }}</span>
                      <button 
                        @click="$emit('updateQuantity', item.id, 1, item.productKind)"
                        class="text-gray-400 hover:text-black transition-colors"
                      >
                        <Plus :size="14" />
                      </button>
                   </div>
                </div>
             </div>
          </div>
          </div>
       </div>
       </Transition>

       <div class="fixed bottom-6 left-0 right-0 z-10 px-4 md:left-64 md:px-8 pointer-events-none">
          <div class="max-w-[1600px] mx-auto pointer-events-auto">
          <div class="bg-[#A1D573] text-[#163300] p-4 pl-8 pr-4 rounded-full shadow-2xl flex items-center justify-between border border-[#A1D573]">
             <div class="flex flex-col">
                <span class="text-[#163300]/70 text-xs font-medium uppercase tracking-wider">总计 (Total)</span>
                <span class="block min-h-8">
                  <Transition name="cart-content" mode="out-in">
                    <span
                      v-if="showCartContent"
                      :key="`${productMode}-${cartAnnualDisplayMode}`"
                      class="inline-block text-2xl font-bold"
                    >
                      ¥{{ total.toFixed(2) }}
                    </span>
                  </Transition>
                </span>
             </div>
             <button class="bg-[#163300] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#163300]/90 transition-colors shadow-lg shadow-[#163300]/20 flex items-center gap-2">
                去结算 <ArrowRight :size="16" />
             </button>
          </div>
          </div>
       </div>
     </template>
    </div>

    <Teleport to="body">
      <Transition name="cart-desc-tooltip">
        <div
          v-if="hoveredDescTooltip"
          class="pointer-events-none fixed z-[200] max-w-[22rem] rounded-xl border border-white/20 bg-white/70 px-4 py-3 text-sm leading-relaxed text-gray-700 shadow-xl backdrop-blur-md"
          :style="{
            left: `${hoveredDescTooltip.x}px`,
            top: `${hoveredDescTooltip.y - 10}px`,
            transform: 'translateY(-100%)',
          }"
        >
          {{ hoveredDescTooltip.description }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.cart-content-enter-active,
.cart-content-leave-active {
  transition:
    opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.28s cubic-bezier(0.33, 1, 0.32, 1);
}

.cart-content-enter-from,
.cart-content-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.cart-content-enter-to,
.cart-content-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.cart-desc-tooltip-enter-active,
.cart-desc-tooltip-leave-active {
  transition: opacity 0.18s ease;
}

.cart-desc-tooltip-enter-from,
.cart-desc-tooltip-leave-to {
  opacity: 0;
}
</style>
