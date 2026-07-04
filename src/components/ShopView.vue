<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { Search, Star, ShoppingBag, ChevronLeft, ChevronRight, Info, MessageCircle } from 'lucide-vue-next';
import TopBarActions from './TopBarActions.vue';
import { useAppStore, type ShopCategory } from '../stores/appStore';
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
  normalProducts: Product[];
  annualProducts: Product[];
}>();

const emit = defineEmits([
  'update:currentPage', 
  'productClick', 
  'addToCart', 
  'cartClick', 
  'wishlistClick', 
  'toggleWishlist', 
  'messageClick',
]);

const appStore = useAppStore();
const { shopUiState } = storeToRefs(appStore);

const categories = ['全部商品', '椅子', '桌子', '沙发', '脚凳', '办公'] as const;
type Category = ShopCategory;
type SubCategoryGroup = Exclude<Category, '全部商品'>;

const categoryFilters: Record<Category, (product: Product) => boolean> = {
  全部商品: () => true,
  椅子: (product) => product.name.includes('椅') && !product.name.includes('脚凳'),
  桌子: (product) => product.name.includes('桌') || product.category === '桌子',
  沙发: (product) => product.name.includes('沙发'),
  脚凳: (product) => product.name.includes('脚凳'),
  办公: (product) =>
    product.name.includes('书架') ||
    product.name.includes('储物') ||
    product.name.includes('文件柜') ||
    product.category === '收纳',
};

const subCategories: Record<SubCategoryGroup, readonly string[]> = {
  椅子: ['扶手椅', '餐椅', '办公椅', '休闲椅', '吧台椅', '摇椅'],
  桌子: ['餐桌', '书桌', '茶几', '边桌', '折叠桌', '梳妆台'],
  沙发: ['单人沙发', '双人沙发', '三人沙发', '转角沙发', '沙发床', '懒人沙发'],
  脚凳: ['圆形脚凳', '方形脚凳', '储物脚凳', '长脚凳', '折叠脚凳', '布艺脚凳'],
  办公: ['文件柜', '书架', '储物柜', '办公桌', '会议桌', '隔断'],
};

const GRID_ITEMS_PER_PAGE = 16;
const LIST_ITEMS_PER_PAGE = 11;

const isAnnualMode = computed({
  get: () => shopUiState.value.isAnnualMode,
  set: (value: boolean) => appStore.patchShopUiState({ isAnnualMode: value }),
});

type AnnualRegion = 'north' | 'west' | 'south' | 'east';

const SHELF_CYCLE = ['货架', '清单', '品牌表'] as const;

const ANNUAL_REGIONS: { key: AnnualRegion; label: string }[] = [
  { key: 'north', label: '北区年框' },
  { key: 'west', label: '西区年框' },
  { key: 'south', label: '南区年框' },
  { key: 'east', label: '东区年框' },
];

const shelfCycleIndex = computed({
  get: () => shopUiState.value.shelfCycleIndex,
  set: (value: number) => appStore.patchShopUiState({ shelfCycleIndex: value }),
});

const selectedAnnualRegion = computed({
  get: () => shopUiState.value.selectedAnnualRegion,
  set: (value: AnnualRegion) => appStore.patchShopUiState({ selectedAnnualRegion: value }),
});
const showRegionDropdown = ref(false);
const regionDropdownRef = ref<HTMLElement | null>(null);
const shelfFlashActive = ref(false);
const flashingDropdownRegion = ref<AnnualRegion | null>(null);
const showRegionInfo = ref(false);

const shelfCycleLabel = computed(() => SHELF_CYCLE[shelfCycleIndex.value]);

const showProductListTable = computed(
  () => isAnnualMode.value && shelfCycleLabel.value === '清单',
);

const showBrandTable = computed(
  () => isAnnualMode.value && shelfCycleLabel.value === '品牌表',
);

const showAnnualTableView = computed(
  () => showProductListTable.value || showBrandTable.value,
);

const itemsPerPage = computed(() =>
  showAnnualTableView.value ? LIST_ITEMS_PER_PAGE : GRID_ITEMS_PER_PAGE,
);

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
] as const;

const BRAND_TABLE_HEADERS = [
  { key: 'major', label: '专业' },
  { key: 'materialCode', label: '物料编码' },
  { key: 'materialName', label: '物料名称' },
  { key: 'materialGrade', label: '材料等级' },
  { key: 'brand', label: '品牌' },
  { key: 'specModel', label: '规格型号' },
  { key: 'unit', label: '单位' },
  { key: 'remark', label: '备注' },
] as const;

const MATERIAL_GRADES = ['A级', 'B级', '优选', '标准'] as const;

const DESCRIPTION_MAX_LEN = 10;
const hoveredDescTooltip = ref<{ description: string; x: number; y: number } | null>(null);

const selectedListRowIds = computed(() => new Set(shopUiState.value.selectedListRowIds));

const selectedRegionLabel = computed(
  () => ANNUAL_REGIONS.find((r) => r.key === selectedAnnualRegion.value)?.label ?? '北区年框',
);

const otherAnnualRegions = computed(() =>
  ANNUAL_REGIONS.filter((r) => r.key !== selectedAnnualRegion.value),
);

const FLASH_DURATION_MS = 220;

function flashShelfButton() {
  shelfFlashActive.value = true;
  window.setTimeout(() => {
    shelfFlashActive.value = false;
  }, FLASH_DURATION_MS);
}

function closeRegionDropdown() {
  showRegionDropdown.value = false;
}

function handleShelfCycleClick() {
  closeRegionDropdown();
  flashShelfButton();
  runProductGridTransition(() => {
    shelfCycleIndex.value = (shelfCycleIndex.value + 1) % SHELF_CYCLE.length;
    emit('update:currentPage', 1);
  });
}

function handleRegionButtonClick(e: MouseEvent) {
  e.stopPropagation();
  showRegionDropdown.value = !showRegionDropdown.value;
}

function selectAnnualRegion(region: AnnualRegion, e: MouseEvent) {
  e.stopPropagation();
  if (region === selectedAnnualRegion.value) {
    closeRegionDropdown();
    return;
  }

  flashingDropdownRegion.value = region;
  window.setTimeout(() => {
    selectedAnnualRegion.value = region;
    flashingDropdownRegion.value = null;
    closeRegionDropdown();
  }, FLASH_DURATION_MS);
}

function handleDocumentClick(e: MouseEvent) {
  if (!showRegionDropdown.value) return;
  const target = e.target as Node;
  if (regionDropdownRef.value?.contains(target)) return;
  closeRegionDropdown();
}
const activeCategory = computed({
  get: () => shopUiState.value.activeCategory,
  set: (value: Category) => appStore.patchShopUiState({ activeCategory: value }),
});

const activeSubCategory = computed({
  get: () => shopUiState.value.activeSubCategory,
  set: (value: string | null) => appStore.patchShopUiState({ activeSubCategory: value }),
});
const showProductGrid = ref(true);
const productGridRef = ref<HTMLElement | null>(null);
const gridShellMinHeight = ref<number | null>(null);
const gridTransitionKey = ref(0);
const searchQuery = ref('');
const isSearchFocused = ref(false);

const catalogProducts = computed(() =>
  isAnnualMode.value ? props.annualProducts : props.normalProducts,
);

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return [];

  return catalogProducts.value
    .filter(
      (product) =>
        product.name.toLowerCase().includes(q) || product.category.toLowerCase().includes(q),
    )
    .slice(0, 8);
});

const showSearchDropdown = computed(
  () => isSearchFocused.value && searchQuery.value.trim().length > 0,
);

const showSubCategoryRow = computed(() => activeCategory.value !== '全部商品');

const currentSubCategories = computed(() => {
  if (activeCategory.value === '全部商品') return [];
  return subCategories[activeCategory.value];
});

const filteredProducts = computed(() => {
  let result = catalogProducts.value.filter(categoryFilters[activeCategory.value]);
  if (activeSubCategory.value) {
    result = result.filter((product) => product.name.includes(activeSubCategory.value!));
  }
  return result;
});

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value));

const currentProducts = computed(() => {
  return filteredProducts.value.slice(
    (props.currentPage - 1) * itemsPerPage.value,
    props.currentPage * itemsPerPage.value,
  );
});

const productListRows = computed(() =>
  currentProducts.value.map((product) => ({
    id: product.id,
    product,
    major: '装饰',
    subjectCode: `KM-${String(product.id).padStart(4, '0')}`,
    subjectName: product.name,
    calcRule: '按项计',
    brand: product.category,
    model: product.name.split(' ')[0] ?? product.name,
    spec: '标准款',
    description: product.desc,
    unit: '项',
    taxIncludedPrice: product.price,
  })),
);

const brandTableRows = computed(() =>
  currentProducts.value.map((product, index) => ({
    id: product.id,
    product,
    major: '装饰',
    materialCode: `WL-${String(product.id).padStart(4, '0')}`,
    materialName: product.name,
    materialGrade: MATERIAL_GRADES[index % MATERIAL_GRADES.length],
    brand: product.category,
    specModel: product.name.split(' ')[0] ?? product.name,
    unit: '项',
    remark: product.desc,
  })),
);

function truncateDescription(text: string, max = DESCRIPTION_MAX_LEN) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function isDescriptionTruncated(text: string, max = DESCRIPTION_MAX_LEN) {
  return text.length > max;
}

const isInWishlist = (product: Product) => {
  return props.wishlistItems.some((item) => item.id === product.id);
};

const selectedListProducts = computed(() =>
  catalogProducts.value.filter((product) => selectedListRowIds.value.has(product.id)),
);

const hasListSelection = computed(() => selectedListRowIds.value.size > 0);

const allSelectedInWishlist = computed(
  () =>
    hasListSelection.value &&
    selectedListProducts.value.every((product) => isInWishlist(product)),
);

function isListRowSelected(id: number) {
  return selectedListRowIds.value.has(id);
}

function selectListRow(id: number) {
  const next = new Set(shopUiState.value.selectedListRowIds);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  appStore.setShopSelectedListRowIds([...next]);
}

function clearListRowSelection() {
  appStore.setShopSelectedListRowIds([]);
}

function handleListFavorite() {
  if (!hasListSelection.value) return;
  for (const product of selectedListProducts.value) {
    if (allSelectedInWishlist.value) {
      emit('toggleWishlist', product);
    } else if (!isInWishlist(product)) {
      emit('toggleWishlist', product, { fromListView: true });
    }
  }
}

function handleListAddToCart() {
  if (!hasListSelection.value) return;
  for (const product of selectedListProducts.value) {
    emit('addToCart', product, 1, { fromListView: true });
  }
}

function handleListConsult() {
  if (!hasListSelection.value) return;
  emit('messageClick');
}

watch(
  showProductListTable,
  (visible) => {
    if (!isAnnualMode.value) return;

    if (visible) {
      appStore.setAnnualCommerceListDisplayMode();
    } else {
      clearListRowSelection();
      appStore.resetAnnualCommerceDisplayMode();
    }
  },
  { immediate: true },
);

watch(isAnnualMode, () => {
  clearListRowSelection();
});

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

const productViewKey = computed(
  () =>
    `${gridTransitionKey.value}-${showProductListTable.value ? 'list' : showBrandTable.value ? 'brand' : 'grid'}-${isAnnualMode.value}-${props.currentPage}`,
);

const listPageStart = computed(() => (props.currentPage - 1) * itemsPerPage.value + 1);

const listPageEnd = computed(() =>
  Math.min(props.currentPage * itemsPerPage.value, filteredProducts.value.length),
);

onMounted(() => {
  restoreShopScroll();
  document.addEventListener('click', handleDocumentClick);
});

function restoreShopScroll() {
  if (props.initialScrollTop <= 0) return;

  const apply = () => {
    const mainEl = document.getElementById('main-content');
    if (mainEl) mainEl.scrollTop = props.initialScrollTop;
  };

  apply();
  requestAnimationFrame(apply);
}

function persistShopScrollPosition() {
  appStore.persistShopScroll();
}

onBeforeUnmount(() => {
  persistShopScrollPosition();
  document.removeEventListener('click', handleDocumentClick);
});

function setCurrentPage(page: number) {
  if (props.currentPage === page) return;

  runProductGridTransition(() => {
    emit('update:currentPage', page);
  });
}

const prevPage = () => {
  if (props.currentPage <= 1) return;

  runProductGridTransition(() => {
    emit('update:currentPage', props.currentPage - 1);
  });
};

const nextPage = () => {
  if (props.currentPage >= totalPages.value) return;

  runProductGridTransition(() => {
    emit('update:currentPage', props.currentPage + 1);
  });
};

function scrollMainToTop(behavior: ScrollBehavior = 'smooth') {
  const mainEl = document.getElementById('main-content');
  if (mainEl) {
    mainEl.scrollTo({ top: 0, behavior });
  }
}

function runProductGridTransition(update: () => void) {
  if (productGridRef.value) {
    gridShellMinHeight.value = productGridRef.value.offsetHeight;
  }
  scrollMainToTop();
  showProductGrid.value = false;
  window.setTimeout(() => {
    update();
    gridTransitionKey.value += 1;
    showProductGrid.value = true;
    window.setTimeout(() => {
      gridShellMinHeight.value = null;
    }, 320);
  }, 280);
}

function handleCategoryClick(category: Category) {
  if (activeCategory.value === category) return;

  if (category === '全部商品') {
    activeCategory.value = category;
    activeSubCategory.value = null;
    emit('update:currentPage', 1);
    scrollMainToTop('instant');
    return;
  }

  runProductGridTransition(() => {
    activeCategory.value = category;
    activeSubCategory.value = null;
    emit('update:currentPage', 1);
  });
}

function handleSubCategoryClick(sub: string) {
  if (activeSubCategory.value === sub) return;

  runProductGridTransition(() => {
    activeSubCategory.value = sub;
    emit('update:currentPage', 1);
  });
}

function handleToggleProductType() {
  runProductGridTransition(() => {
    isAnnualMode.value = !isAnnualMode.value;
  });
}

function handleSearchBlur() {
  window.setTimeout(() => {
    isSearchFocused.value = false;
  }, 150);
}

function handleSearchSelect(product: Product) {
  searchQuery.value = '';
  isSearchFocused.value = false;
  emit('productClick', product);
}
</script>

<template>
  <div class="w-full overflow-x-hidden p-8 space-y-8">
    <header class="flex justify-between items-center">
      <div class="relative flex-1 max-w-lg">
         <div class="relative">
           <Search class="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400" :size="18" />
           <input
             v-model="searchQuery"
             type="text"
             placeholder="搜索商品..."
             class="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-gray-400 focus:outline-none"
             @focus="isSearchFocused = true"
             @blur="handleSearchBlur"
           />

           <div
             v-if="showSearchDropdown"
             class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
           >
             <button
               v-for="product in searchResults"
               :key="product.id"
               type="button"
               class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
               @mousedown.prevent
               @click="handleSearchSelect(product)"
             >
               <div class="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#F5F5F7]">
                 <img
                   :src="product.image"
                   :alt="product.name"
                   class="h-full w-full object-cover mix-blend-multiply opacity-90"
                   referrerpolicy="no-referrer"
                 />
               </div>
               <div class="min-w-0 flex-1">
                 <p class="truncate text-sm font-semibold text-gray-900">{{ product.name }}</p>
                 <p class="mt-0.5 text-sm font-bold text-[#A1D573]">¥{{ product.price.toFixed(2) }}</p>
               </div>
             </button>
             <p
               v-if="searchResults.length === 0"
               class="px-4 py-6 text-center text-sm text-gray-400"
             >
               没有找到相关商品
             </p>
           </div>
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
      <div class="mb-6">
         <h2 class="mb-4 text-2xl font-bold text-gray-800">{{ isAnnualMode ? '年框产品' : '普通产品' }}</h2>

         <div class="flex items-center justify-between gap-4">
           <div class="flex min-w-0 flex-1 items-center gap-3">
             <div class="flex min-w-0 flex-1 space-x-3 overflow-x-auto scrollbar-hide">
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

             <div v-if="isAnnualMode" class="flex shrink-0 items-center gap-2">
               <button
                 type="button"
                 :class="[
                   'annual-tab-btn annual-tab-btn-fixed flex items-center justify-center whitespace-nowrap rounded-xl border text-sm font-medium transition-colors duration-200',
                   shelfFlashActive ? 'annual-tab-btn-active' : 'annual-tab-btn-default',
                 ]"
                 @click="handleShelfCycleClick"
               >
                 {{ shelfCycleLabel }}
               </button>

               <div ref="regionDropdownRef" class="relative">
                 <button
                   type="button"
                   class="annual-tab-btn annual-tab-btn-fixed annual-tab-btn-default flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border text-sm font-medium transition-colors duration-200"
                   @click="handleRegionButtonClick"
                 >
                   <span
                     class="region-info-trigger relative flex shrink-0 items-center"
                     @mouseenter="showRegionInfo = true"
                     @mouseleave="showRegionInfo = false"
                     @click.stop
                   >
                     <Info :size="17" class="text-gray-400" />
                     <Transition name="region-info">
                       <div
                         v-if="showRegionInfo"
                         class="region-info-tooltip pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-white/20 bg-white/50 px-4 py-3 text-xs leading-relaxed text-gray-600 shadow-lg backdrop-blur-md"
                       >
                         <p class="mb-2 text-center text-sm font-bold text-gray-800">详情</p>
                         <p>年框开始日期：2026年6月12日</p>
                         <p>年框结束日期：2027年6月12日</p>
                         <p class="whitespace-normal">服务范围：北京、上海、广州、深圳</p>
                       </div>
                     </Transition>
                   </span>
                   <span>{{ selectedRegionLabel }}</span>
                 </button>

                 <Transition name="region-dropdown">
                   <div
                     v-if="showRegionDropdown"
                     class="region-dropdown-panel absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[7.75rem] overflow-hidden rounded-xl border border-white/20 bg-white/50 p-1 shadow-lg backdrop-blur-md"
                   >
                     <button
                       v-for="region in otherAnnualRegions"
                       :key="region.key"
                       type="button"
                       :class="[
                         'block w-full rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors duration-200',
                         flashingDropdownRegion === region.key
                           ? 'annual-tab-btn-active'
                           : 'text-gray-600 hover:bg-white/60 hover:text-gray-900',
                       ]"
                       @click="selectAnnualRegion(region.key, $event)"
                     >
                       {{ region.label }}
                     </button>
                   </div>
                 </Transition>
               </div>
             </div>
           </div>

           <button
             type="button"
             class="shrink-0 pl-4 text-sm text-gray-800 transition-colors hover:text-gray-600"
             @click="handleToggleProductType"
           >
             <span class="font-light">切换</span>
             <span class="font-bold">{{ isAnnualMode ? ' 普通产品' : ' 年框产品' }}</span>
           </button>
         </div>

         <Transition name="sub-tags" mode="out-in">
           <div
             v-if="showSubCategoryRow"
             :key="activeCategory"
             class="sub-tags-row flex flex-wrap gap-2"
           >
             <button
               v-for="sub in currentSubCategories"
               :key="sub"
               type="button"
               :class="[
                 'px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                 activeSubCategory === sub
                   ? 'bg-[#B0D4C5]/80 text-white'
                   : 'bg-white/80 text-gray-500 border border-gray-100 hover:border-gray-300',
               ]"
               @click="handleSubCategoryClick(sub)"
             >
               {{ sub }}
             </button>
           </div>
         </Transition>
      </div>

      <div :style="gridShellMinHeight ? { minHeight: `${gridShellMinHeight}px` } : undefined">
      <Transition name="shop-products" mode="out-in">
        <div
          v-if="showProductGrid && showProductListTable"
          ref="productGridRef"
          key="shop-list-view"
          class="shop-list-view"
        >
          <div class="min-w-0 overflow-hidden rounded-[32px] border border-white/30 bg-white/40 shadow-xl backdrop-blur-xl">
            <div class="overflow-x-auto">
            <table class="shop-list-table w-full min-w-[960px] border-collapse text-left">
              <thead>
                <tr class="border-b border-white/10 text-sm font-medium text-gray-500">
                  <th
                    v-for="column in LIST_TABLE_COLUMNS"
                    :key="column"
                    :class="[
                      'h-[3.75rem] px-6 align-middle whitespace-nowrap',
                      column === '工作内容及特征描述' ? 'min-w-[8rem]' : '',
                    ]"
                  >
                    {{ column }}
                  </th>
                </tr>
              </thead>
              <tbody class="shop-list-table-body">
                <tr
                  v-for="(row, index) in productListRows"
                  :key="row.id"
                  :class="[
                    'shop-list-data-row h-[3.75rem] cursor-pointer transition-colors',
                    isListRowSelected(row.id)
                      ? 'bg-[#9FE870]/60'
                      : 'hover:bg-white/30',
                    index < productListRows.length - 1 ? 'border-b border-white/10' : '',
                  ]"
                  @click="selectListRow(row.id)"
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
                      class="desc-tooltip-trigger inline-block"
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
                </tr>
              </tbody>
            </table>
            </div>

          <div class="flex items-center justify-between border-t border-white/10 p-6 text-sm text-gray-500">
            <p>
              显示 {{ listPageStart }} 到 {{ listPageEnd }} 条，共 {{ filteredProducts.length }} 条记录
            </p>
            <div class="flex space-x-2">
              <button
                type="button"
                class="rounded-lg border border-white/20 bg-white/50 px-3 py-1 transition-colors hover:bg-white/80 disabled:opacity-50"
                :disabled="currentPage === 1"
                @click="prevPage"
              >
                上一页
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                type="button"
                :class="[
                  'rounded-lg border px-3 py-1 shadow-sm transition-colors tabular-nums',
                  currentPage === page
                    ? 'border-[#FFEB69] bg-[#FFEB69] text-[#3A341C]'
                    : 'border-white/20 bg-white/50 text-[#3A341C] hover:bg-white/80',
                ]"
                @click="setCurrentPage(page)"
              >
                {{ page }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-white/20 bg-white/50 px-3 py-1 transition-colors hover:bg-white/80 disabled:opacity-50"
                :disabled="currentPage === totalPages"
                @click="nextPage"
              >
                下一页
              </button>
            </div>
          </div>
          </div>
        </div>

        <div
          v-else-if="showProductGrid && showBrandTable"
          ref="productGridRef"
          key="shop-brand-view"
          class="shop-brand-view"
        >
          <div class="min-w-0 overflow-hidden rounded-[32px] border border-white/30 bg-white/40 shadow-xl backdrop-blur-xl">
            <div class="overflow-x-auto">
            <table class="shop-brand-table w-full min-w-[960px] border-collapse text-left">
              <thead>
                <tr class="border-b border-white/10 text-sm font-medium text-gray-500">
                  <th
                    v-for="column in BRAND_TABLE_HEADERS"
                    :key="column.key"
                    :class="[
                      'h-[3.75rem] px-6 align-middle whitespace-nowrap',
                      column.key === 'remark' ? 'min-w-[8rem]' : '',
                      column.key === 'materialName' ? 'min-w-[9rem]' : '',
                    ]"
                  >
                    {{ column.label }}
                  </th>
                </tr>
              </thead>
              <tbody class="shop-brand-table-body">
                <tr
                  v-for="(row, index) in brandTableRows"
                  :key="row.id"
                  :class="[
                    'shop-brand-data-row h-[3.75rem] transition-colors hover:bg-white/30',
                    index < brandTableRows.length - 1 ? 'border-b border-white/10' : '',
                  ]"
                >
                  <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.major }}</td>
                  <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.materialCode }}</td>
                  <td class="h-[3.75rem] px-6 align-middle font-medium text-gray-800">{{ row.materialName }}</td>
                  <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.materialGrade }}</td>
                  <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.brand }}</td>
                  <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.specModel }}</td>
                  <td class="h-[3.75rem] px-6 align-middle text-gray-600">{{ row.unit }}</td>
                  <td class="h-[3.75rem] px-6 align-middle text-gray-500">
                    <span
                      class="desc-tooltip-trigger inline-block"
                      @mouseenter="showDescTooltip(row.remark, $event)"
                      @mouseleave="hideDescTooltip"
                    >
                      {{ truncateDescription(row.remark) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            </div>

          <div class="flex items-center justify-between border-t border-white/10 p-6 text-sm text-gray-500">
            <p>
              显示 {{ listPageStart }} 到 {{ listPageEnd }} 条，共 {{ filteredProducts.length }} 条记录
            </p>
            <div class="flex space-x-2">
              <button
                type="button"
                class="rounded-lg border border-white/20 bg-white/50 px-3 py-1 transition-colors hover:bg-white/80 disabled:opacity-50"
                :disabled="currentPage === 1"
                @click="prevPage"
              >
                上一页
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                type="button"
                :class="[
                  'rounded-lg border px-3 py-1 shadow-sm transition-colors tabular-nums',
                  currentPage === page
                    ? 'border-[#FFEB69] bg-[#FFEB69] text-[#3A341C]'
                    : 'border-white/20 bg-white/50 text-[#3A341C] hover:bg-white/80',
                ]"
                @click="setCurrentPage(page)"
              >
                {{ page }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-white/20 bg-white/50 px-3 py-1 transition-colors hover:bg-white/80 disabled:opacity-50"
                :disabled="currentPage === totalPages"
                @click="nextPage"
              >
                下一页
              </button>
            </div>
          </div>
          </div>
        </div>

        <div
          v-else-if="showProductGrid"
          ref="productGridRef"
          :key="productViewKey"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
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
                   <Star :size="16" :fill="isInWishlist(product) ? 'currentColor' : 'none'" />
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
      </Transition>
      </div>

      <div v-if="!showAnnualTableView" class="mt-12 flex items-center justify-center space-x-4">
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
    </section>

    <Teleport to="body">
      <Transition name="region-info">
        <div
          v-if="hoveredDescTooltip"
          class="desc-tooltip pointer-events-none fixed z-[200] max-w-[22rem] rounded-xl border border-white/20 bg-white/70 px-4 py-3 text-sm leading-relaxed text-gray-700 shadow-xl backdrop-blur-md"
          :style="{
            left: `${hoveredDescTooltip.x}px`,
            top: `${hoveredDescTooltip.y - 10}px`,
            transform: 'translateY(-100%)',
          }"
        >
          {{ hoveredDescTooltip.description }}
        </div>
      </Transition>

      <Transition name="list-action-bar">
        <div
          v-if="showProductListTable && hasListSelection"
          class="list-action-bar fixed bottom-8 right-8 z-[150] flex flex-col gap-3.5"
        >
          <button
            type="button"
            :class="[
              'list-action-btn flex min-w-[10.5rem] items-center justify-center gap-2.5 rounded-full border px-7 py-4 text-base font-bold shadow-lg backdrop-blur-md transition-all',
              allSelectedInWishlist
                ? 'border-[#9FE870] bg-[#9FE870]/80 text-gray-900'
                : 'border-white/30 bg-white/60 text-gray-800 hover:bg-white/80',
            ]"
            @click="handleListFavorite"
          >
            <Star :size="22" :fill="allSelectedInWishlist ? 'currentColor' : 'none'" />
            {{ allSelectedInWishlist ? '已收藏' : '收藏' }}
          </button>
          <button
            type="button"
            class="list-action-btn flex min-w-[10.5rem] items-center justify-center gap-2.5 rounded-full border border-white/30 bg-white/60 px-7 py-4 text-base font-bold text-gray-800 shadow-lg backdrop-blur-md transition-all hover:bg-white/80"
            @click="handleListConsult"
          >
            <MessageCircle :size="22" />
            咨询
          </button>
          <button
            type="button"
            class="list-action-btn flex min-w-[10.5rem] items-center justify-center gap-2.5 rounded-full border border-[#9FE870] bg-[#9FE870] px-7 py-4 text-base font-bold text-gray-900 shadow-lg shadow-[#9FE870]/30 backdrop-blur-md transition-all hover:bg-[#8ed65f]"
            @click="handleListAddToCart"
          >
            <ShoppingBag :size="22" />
            加入购物车
          </button>
        </div>
      </Transition>
    </Teleport>
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

.sub-tags-row {
  margin-top: 0.75rem;
}

.sub-tags-enter-active,
.sub-tags-leave-active {
  overflow: hidden;
  max-height: 3.5rem;
  transition:
    opacity 0.26s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.26s cubic-bezier(0.4, 0, 0.2, 1),
    max-height 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    margin-top 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.sub-tags-enter-from,
.sub-tags-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
  margin-top: 0;
}

.sub-tags-enter-to,
.sub-tags-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 3.5rem;
  margin-top: 0.75rem;
}

.annual-tab-btn-fixed {
  width: 7.75rem;
  min-height: 2.375rem;
  padding-inline: 0.75rem;
  padding-block: 0.5rem;
}

.annual-tab-btn-default {
  border-color: rgb(255 255 255 / 0.2);
  background-color: rgb(255 255 255 / 0.5);
  color: rgb(75 85 99);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.annual-tab-btn-default:hover {
  border-color: rgb(255 255 255 / 0.35);
  background-color: rgb(255 255 255 / 0.65);
}

.annual-tab-btn-active {
  border-color: #9fe870;
  background-color: #9fe870;
  color: rgb(17 24 39);
}

.region-dropdown-enter-active,
.region-dropdown-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.region-dropdown-enter-from,
.region-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.region-info-enter-active,
.region-info-leave-active {
  transition: opacity 0.18s ease;
}

.region-info-enter-from,
.region-info-leave-to {
  opacity: 0;
}

.region-info-tooltip {
  min-width: 13.5rem;
}

.list-action-bar-enter-active,
.list-action-bar-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.list-action-bar-enter-from,
.list-action-bar-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.desc-tooltip {
  min-width: 14rem;
}
</style>
