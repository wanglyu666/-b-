<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ArrowLeft, Star, Trash2, ShoppingBag } from 'lucide-vue-next';
import type { Product, WishlistDisplayMode } from '../types';

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
  '综合含税单价',
  '操作',
] as const;

const DESCRIPTION_MAX_LEN = 10;

const props = defineProps<{
  wishlistItems: Product[];
  wishlistAnnualDisplayMode: WishlistDisplayMode;
}>();

const emit = defineEmits<{
  removeItem: [productId: number, productKind: Product['productKind']];
  back: [];
  addToCart: [product: Product, count?: number, options?: { fromListView?: boolean }];
}>();

const productMode = ref<'normal' | 'annual'>('normal');
const showWishlistContent = ref(true);
const hoveredDescTooltip = ref<{ description: string; x: number; y: number } | null>(null);

const visibleWishlistItems = computed(() =>
  props.wishlistItems.filter((item) => item.productKind === productMode.value),
);

const showListLayout = computed(
  () => props.wishlistAnnualDisplayMode === 'list' && productMode.value === 'annual',
);

const wishlistListRows = computed(() =>
  visibleWishlistItems.value.map((item) => ({
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
    taxIncludedPrice: item.price,
  })),
);

function syncProductModeWithWishlistDisplay() {
  if (props.wishlistAnnualDisplayMode === 'list') {
    productMode.value = 'annual';
  }
}

watch(() => props.wishlistAnnualDisplayMode, syncProductModeWithWishlistDisplay, { immediate: true });

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

function runWishlistContentTransition(update: () => void) {
  showWishlistContent.value = false;
  window.setTimeout(() => {
    update();
    showWishlistContent.value = true;
  }, 280);
}

function handleProductModeSwitch(mode: 'normal' | 'annual') {
  if (productMode.value === mode) return;
  runWishlistContentTransition(() => {
    productMode.value = mode;
  });
}

function handleAddToCart(item: Product) {
  if (showListLayout.value) {
    emit('addToCart', item, 1, { fromListView: true });
    return;
  }
  emit('addToCart', item);
}
</script>

<template>
  <div class="relative min-h-screen w-full overflow-x-hidden bg-transparent">
    <div
      class="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] animate-in flex-col px-4 py-8 duration-500 fade-in slide-in-from-bottom-4 sm:px-6 md:px-8"
    >
      <header class="flex flex-shrink-0 items-center gap-4">
        <button
          type="button"
          class="rounded-full border border-gray-200 bg-white p-2 transition-colors hover:bg-gray-50"
          @click="$emit('back')"
        >
          <ArrowLeft :size="20" />
        </button>
        <h1 class="text-2xl font-bold text-gray-900">我的收藏 ({{ wishlistItems.length }})</h1>
      </header>

      <div v-if="wishlistItems.length > 0" class="mt-6 flex gap-3">
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

      <div
        v-if="wishlistItems.length === 0"
        class="mt-8 flex min-h-[calc(100vh-10rem)] w-full flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-gray-400 md:mt-10"
      >
        <Star :size="64" :stroke-width="1" class="mb-4 text-gray-300" />
        <p class="text-lg font-medium">暂无收藏商品</p>
        <button
          type="button"
          class="mt-6 rounded-full bg-black px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-800"
          @click="$emit('back')"
        >
          去逛逛
        </button>
      </div>

      <template v-else>
        <Transition name="wishlist-content" mode="out-in">
          <div
            v-if="showWishlistContent"
            :key="`${productMode}-${wishlistAnnualDisplayMode}`"
            class="mt-6 min-h-0 flex-1 overflow-y-auto pb-12 md:mt-8"
          >
            <div
              v-if="visibleWishlistItems.length === 0"
              class="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-gray-400"
            >
              <Star :size="48" :stroke-width="1" class="mb-3 text-gray-300" />
              <p class="text-base font-medium">
                {{ productMode === 'annual' ? '年框产品收藏为空' : '普通产品收藏为空' }}
              </p>
            </div>

            <div
              v-else-if="showListLayout"
              class="overflow-hidden rounded-[32px] border border-white/30 bg-white/40 shadow-xl backdrop-blur-xl"
            >
              <div class="overflow-x-auto">
                <table class="wishlist-list-table w-full min-w-[1080px] border-collapse text-left">
                  <thead>
                    <tr class="border-b border-white/10 text-sm font-medium text-gray-500">
                      <th
                        v-for="column in LIST_TABLE_COLUMNS"
                        :key="column"
                        :class="[
                          'h-[3.75rem] px-6 align-middle whitespace-nowrap',
                          column === '工作内容及特征描述' ? 'min-w-[8rem]' : '',
                          column === '操作' ? 'w-28 px-4 text-center' : '',
                        ]"
                      >
                        {{ column }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, index) in wishlistListRows"
                      :key="`${row.item.productKind}-${row.id}`"
                      :class="[
                        'h-[3.75rem] transition-colors hover:bg-white/30',
                        index < wishlistListRows.length - 1 ? 'border-b border-white/10' : '',
                      ]"
                    >
                      <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.major }}</td>
                      <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.subjectCode }}</td>
                      <td class="h-[3.75rem] px-6 align-middle font-medium text-gray-800">
                        {{ row.subjectName }}
                      </td>
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
                      <td class="h-[3.75rem] whitespace-nowrap px-6 align-middle font-medium text-gray-800">
                        ¥{{ row.taxIncludedPrice.toFixed(2) }}
                      </td>
                      <td class="h-[3.75rem] px-4 align-middle text-center">
                        <div class="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            class="inline-flex rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/50 hover:text-[#163300]"
                            title="加入购物车"
                            @click="handleAddToCart(row.item)"
                          >
                            <ShoppingBag :size="16" />
                          </button>
                          <button
                            type="button"
                            class="inline-flex rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/50 hover:text-red-500"
                            title="取消收藏"
                            @click="emit('removeItem', row.id, row.item.productKind)"
                          >
                            <Trash2 :size="16" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="item in visibleWishlistItems"
                :key="`${item.productKind}-${item.id}`"
                class="group flex items-center rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div class="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-50">
                  <img
                    :src="item.image"
                    :alt="item.name"
                    class="h-full w-full object-cover opacity-90 mix-blend-multiply"
                    referrerpolicy="no-referrer"
                  />
                </div>

                <div class="ml-5 flex h-24 flex-1 flex-col justify-center py-1">
                  <div class="mb-1 flex items-start justify-between">
                    <div>
                      <h3 class="text-lg font-bold text-gray-900">{{ item.name }}</h3>
                      <p class="mt-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                        {{ item.category }} / 标准规格
                      </p>
                    </div>
                    <button
                      type="button"
                      class="p-1 text-gray-300 transition-colors hover:text-red-500"
                      @click="$emit('removeItem', item.id, item.productKind)"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>

                  <div class="mt-auto flex items-end justify-between">
                    <span class="text-lg font-bold text-[#A1D573]">¥{{ item.price.toFixed(2) }}</span>
                    <button
                      type="button"
                      class="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800"
                      @click="handleAddToCart(item)"
                    >
                      <ShoppingBag :size="14" />
                      加入购物车
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </template>
    </div>

    <Teleport to="body">
      <Transition name="wishlist-desc-tooltip">
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
.wishlist-content-enter-active,
.wishlist-content-leave-active {
  transition:
    opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.28s cubic-bezier(0.33, 1, 0.32, 1);
}

.wishlist-content-enter-from,
.wishlist-content-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.wishlist-content-enter-to,
.wishlist-content-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.wishlist-desc-tooltip-enter-active,
.wishlist-desc-tooltip-leave-active {
  transition: opacity 0.18s ease;
}

.wishlist-desc-tooltip-enter-from,
.wishlist-desc-tooltip-leave-to {
  opacity: 0;
}
</style>
