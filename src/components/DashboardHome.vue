<script setup lang="ts">
import { MoreHorizontal, ChevronLeft, ChevronRight, FileText, FolderCheck, ClipboardCheck, Star, CalendarClock, ChevronRight as ChevronRightSmall } from 'lucide-vue-next';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { get } from '../utils/request';
import TopBarActions from './TopBarActions.vue';
import { useAppStore } from '../stores/appStore';
import { 
  pieDataStatus, 
  pieDataWarranty, 
  distributionData, 
  COLORS_DIST 
} from '../data';

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import VChart from 'vue-echarts';

use([
  CanvasRenderer,
  PieChart,
  TooltipComponent,
  GridComponent,
  LegendComponent
]);

type TodoItem = {
  id: number;
  title: string;
  content: string;
  projectName: string;
  projectId: string;
  projectStatus: string;
  viewMode: string;
  time: string;
  kind: 'report' | 'completion' | 'acceptance' | 'evaluation' | 'standards';
};

const props = defineProps<{
  cartCount: number;
  wishlistCount: number;
  messageCount: number;
  todoItems: TodoItem[];
}>();

const emit = defineEmits(['cartClick', 'wishlistClick', 'messageClick', 'openProjectView']);

const appStore = useAppStore();

const iconMap = {
  report: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  completion: { icon: FolderCheck, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  acceptance: { icon: CalendarClock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  evaluation: { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  standards: { icon: ClipboardCheck, color: 'text-teal-400', bg: 'bg-teal-400/10' },
} as const;

const latestTodoItems = computed(() => props.todoItems.slice(0, 3));

const handleTodoClick = (item: TodoItem) => {
  emit('openProjectView', {
    projectId: item.projectId,
    projectStatus: item.projectStatus,
    viewMode: item.viewMode
  });
};

const currentSlide = ref(0);
const bannerLoading = ref(false);
interface BannerSlide {
  image: string;
  title?: string;
  subtitle?: string;
}
const slides = ref<BannerSlide[]>([]);

/** 获取首页轮播图 */
async function fetchBanners() {
  bannerLoading.value = true;
  try {
    const res = await get('/app/homepagemanage');
    const banners = res?.data?.banner;
    if (Array.isArray(banners) && banners.length > 0) {
      slides.value = banners.map((item: any) => ({
        image: item.fileUrl || '',
        title: item.title || '',
        subtitle: item.subtitle || '',
      }));
    }
  } catch (e) {
    console.error('获取轮播图失败:', e);
  } finally {
    bannerLoading.value = false;
  }
}

let interval: any;
let reviewInterval: ReturnType<typeof setInterval> | undefined;

function startAutoSlide() {
  clearInterval(interval);
  interval = setInterval(() => {
    if (slides.value.length > 0) {
      currentSlide.value = (currentSlide.value + 1) % slides.value.length;
    }
  }, 5000);
}

type ReviewShareItem = {
  id: number;
  name: string;
  rating: number;
  content: string;
};

const reviewShares: ReviewShareItem[] = [
  { id: 1, name: '张明', rating: 5, content: '安装师傅很专业，家具质量也好，整体服务非常满意。' },
  { id: 2, name: '李婷', rating: 4, content: '沙发按时送达，安装顺利，希望售后也能保持这个水准。' },
  { id: 3, name: '王浩', rating: 5, content: '储物架组装牢固，师傅还帮忙做了墙面固定，非常贴心。' },
  { id: 4, name: '陈静', rating: 5, content: '沟通顺畅、响应及时，项目落地效果超出预期。' },
  { id: 5, name: '赵磊', rating: 4, content: '施工过程规范，现场整洁，交付节点都按期完成。' },
  { id: 6, name: '刘芳', rating: 5, content: '设计方案细致，材料品质可靠，推荐给同事了。' },
  { id: 7, name: '周杰', rating: 4, content: '售后跟进很快，小问题当天就处理好了。' },
  { id: 8, name: '吴倩', rating: 5, content: '从咨询到完工体验很流畅，会继续合作。' },
];

const reviewStartIndex = ref(0);

const visibleReviews = computed(() => {
  const list = reviewShares;
  const result: ReviewShareItem[] = [];
  for (let i = 0; i < 3; i++) {
    result.push(list[(reviewStartIndex.value + i) % list.length]);
  }
  return result;
});

function reviewCardScale(slotIndex: number) {
  if (slotIndex === 1) return 1;
  return 0.92;
}

function reviewCardOpacity(slotIndex: number) {
  if (slotIndex === 1) return 1;
  return 0.68;
}

function startReviewScroll() {
  clearInterval(reviewInterval);
  reviewInterval = setInterval(() => {
    reviewStartIndex.value = (reviewStartIndex.value + 1) % reviewShares.length;
  }, 2800);
}

onMounted(() => {
  fetchBanners().then(() => startAutoSlide());
  startReviewScroll();
});

onUnmounted(() => {
  clearInterval(interval);
  clearInterval(reviewInterval);
});

const statusOption = {
  tooltip: { trigger: 'item' },
  color: pieDataStatus.map(d => d.color),
  series: [
    {
      type: 'pie',
      radius: ['65%', '85%'],
      avoidLabelOverlap: false,
      label: { show: false },
      itemStyle: {
        borderRadius: 10
      },
      padAngle: 5,
      data: pieDataStatus
    }
  ]
};

const warrantyOption = {
  tooltip: { trigger: 'item' },
  color: pieDataWarranty.map(d => d.color),
  series: [
    {
      type: 'pie',
      radius: ['65%', '85%'],
      avoidLabelOverlap: false,
      label: { show: false },
      itemStyle: {
        borderRadius: 10
      },
      padAngle: 5,
      data: pieDataWarranty
    }
  ]
};


const processedDistributionData = computed(() => {
  const sorted = [...distributionData].sort((a, b) => b.value - a.value);
  const top4 = sorted.slice(0, 4);
  const others = sorted.slice(4).reduce((sum, item) => sum + item.value, 0);
  
  const finalData = [...top4];
  if (others > 0) {
    finalData.push({ name: '其他城市', value: others });
  }
  return finalData;
});

const totalValue = computed(() => processedDistributionData.value.reduce((a, b) => a + b.value, 0));

const distributionOption = computed(() => ({
  tooltip: { trigger: 'item' },
  color: COLORS_DIST,
  series: [
    {
      type: 'pie',
      radius: ['100%', '160%'],
      center: ['50%', '95%'],
      startAngle: 180,
      label: { show: false },
      emphasis: { scale: false },
      data: [
        ...processedDistributionData.value,
        {
          value: totalValue.value,
          itemStyle: { color: 'transparent', opacity: 0 },
          tooltip: { show: false }
        }
      ]
    }
  ]
}));
</script>

<template>
  <div class="relative min-h-screen bg-transparent overflow-x-hidden">
    <!-- Content Area -->
    <div class="relative z-10 p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">欢迎回来，JustPai！</h1>
        <p class="text-gray-500 mt-1">这是您目前的工作概览</p>
      </div>
      <TopBarActions 
        :isShop="false" 
        :showBell="true"
        :cartCount="cartCount" 
        @cartClick="$emit('cartClick')" 
        @wishlistClick="$emit('wishlistClick')" 
        :wishlistCount="wishlistCount" 
        @bellClick="$emit('messageClick')" 
        :messageCount="messageCount" 
        :userName="appStore.customerName"
      />
    </header>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Carousel Card -->
      <div class="lg:col-span-8 h-[340px] relative overflow-hidden rounded-3xl shadow-sm group">
        <div v-if="bannerLoading" class="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <p class="text-gray-400">加载中...</p>
        </div>
        <template v-else-if="slides.length > 0">
          <div class="absolute inset-0 transition-transform duration-700 ease-in-out flex" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div v-for="(slide, index) in slides" :key="index" class="min-w-full h-full relative">
              <img :src="slide.image" class="w-full h-full object-cover" alt="Banner" />
              <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-12">
                <h2 v-if="slide.title" class="text-4xl font-bold text-white mb-2">{{ slide.title }}</h2>
                <p v-if="slide.subtitle" class="text-white/80 text-lg">{{ slide.subtitle }}</p>
              </div>
            </div>
          </div>
          
          <!-- Controls -->
          <div v-if="slides.length > 1" class="absolute bottom-6 left-12 flex space-x-2">
            <div v-for="(_, index) in slides" :key="index" 
              @click="currentSlide = index"
              class="w-2 h-2 rounded-full cursor-pointer transition-all duration-300"
              :class="currentSlide === index ? 'bg-white w-6' : 'bg-white/40'"
            ></div>
          </div>
          
          <button @click="currentSlide = (currentSlide - 1 + slides.length) % slides.length" class="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft :size="24" />
          </button>
          <button @click="currentSlide = (currentSlide + 1) % slides.length" class="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight :size="24" />
          </button>
        </template>
        <div v-else class="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <p class="text-gray-400">暂无轮播图</p>
        </div>
      </div>

      <!-- 评价分享 -->
      <div class="lg:col-span-4 bg-white/50 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-white/20 hover:shadow-md transition-shadow h-[340px] flex flex-col overflow-hidden">
        <div class="flex justify-between items-center mb-3 flex-shrink-0">
          <h3 class="font-bold text-xl text-gray-800">评价分享</h3>
          <MoreHorizontal :size="20" class="text-gray-400 cursor-pointer" />
        </div>
        <div class="flex-1 min-h-0 relative overflow-hidden px-1">
          <TransitionGroup
            name="review-scroll"
            tag="div"
            class="absolute inset-x-1 inset-y-0 flex flex-col gap-3"
          >
            <div
              v-for="(review, slotIndex) in visibleReviews"
              :key="review.id"
              class="review-scroll-item flex-1 min-h-0"
            >
              <div
                class="review-share-card h-full origin-center rounded-2xl bg-white/80 border border-white/60 px-4 py-3 shadow-sm flex flex-col justify-center"
                :style="{
                  transform: `scale(${reviewCardScale(slotIndex)})`,
                  opacity: reviewCardOpacity(slotIndex),
                  zIndex: slotIndex === 1 ? 10 : 5 - Math.abs(slotIndex - 1),
                  boxShadow: slotIndex === 1 ? '0 8px 24px rgba(0,0,0,0.08)' : undefined,
                }"
              >
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <span class="text-sm font-bold text-gray-800 truncate">{{ review.name }}</span>
                  <div class="flex items-center gap-0.5 flex-shrink-0 text-yellow-400">
                    <Star
                      v-for="star in 5"
                      :key="star"
                      :size="13"
                      :fill="star <= review.rating ? 'currentColor' : 'none'"
                      :class="star <= review.rating ? '' : 'text-gray-200'"
                    />
                  </div>
                </div>
                <p class="text-xs leading-relaxed text-gray-600 line-clamp-2">{{ review.content }}</p>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
      <div class="lg:col-span-5 bg-white/50 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-shadow h-[340px] flex flex-col">
        <div class="flex justify-between items-center mb-4"><h3 class="font-bold text-xl text-gray-800">订单状态概览</h3><MoreHorizontal :size="20" class="text-gray-400 cursor-pointer" /></div>
        <div class="flex-1 grid grid-cols-2 gap-4 items-center">
           <div class="flex flex-col items-center">
              <div class="w-32 h-32 relative">
                <v-chart class="w-full h-full" :option="statusOption" autoresize />
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span class="text-xs text-gray-400">进度</span><span class="text-lg font-bold text-gray-800">70%</span></div>
              </div>
              <div class="flex gap-2 mt-2 justify-center flex-wrap"><div v-for="item in pieDataStatus" :key="item.name" class="flex items-center text-[10px] text-gray-600"><span class="w-2 h-2 rounded-full mr-1" :style="{ backgroundColor: item.color }"></span>{{ item.name }}</div></div>
           </div>
           <div class="flex flex-col items-center border-l border-gray-50 pl-4">
              <div class="w-32 h-32 relative">
                <v-chart class="w-full h-full" :option="warrantyOption" autoresize />
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span class="text-xs text-gray-400">保修</span><span class="text-lg font-bold text-gray-800">85%</span></div>
              </div>
              <div class="flex gap-2 mt-2 justify-center flex-wrap"><div v-for="item in pieDataWarranty" :key="item.name" class="flex items-center text-[10px] text-gray-600"><span class="w-2 h-2 rounded-full mr-1" :style="{ backgroundColor: item.color }"></span>{{ item.name }}</div></div>
           </div>
        </div>
      </div>
      <div class="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-[340px] flex flex-col">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-xl text-gray-800">待办事项</h3>
          <span class="text-xs text-gray-400 font-medium">{{ props.todoItems.length }} 条新通知</span>
        </div>
        <div class="flex-1 -mx-1 px-1 space-y-2.5">
          <div
            v-for="item in latestTodoItems"
            :key="item.id"
            @click="handleTodoClick(item)"
            class="flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors group border border-gray-100/70"
          >
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconMap[item.kind].bg]">
              <component :is="iconMap[item.kind].icon" :size="20" :class="iconMap[item.kind].color" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="font-bold text-sm text-gray-800 truncate">{{ item.title }}</span>
                <span class="text-[10px] text-gray-400 flex-shrink-0">{{ item.time }}</span>
              </div>
              <p class="text-xs text-gray-500 truncate">{{ item.projectName }} · {{ item.content }}</p>
            </div>
            <ChevronRightSmall :size="16" class="text-gray-300 flex-shrink-0 group-hover:text-gray-500 transition-colors" />
          </div>
        </div>
      </div>
      <div class="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-[280px] flex flex-col justify-center">
          <h3 class="font-bold text-xl text-gray-800 mb-6">结算状态</h3>
          <div class="space-y-8 pr-4">
            <div><div class="flex justify-between text-sm mb-2"><span class="text-gray-500">未结算 (34单)</span><span class="font-bold text-[#B0D4C5] text-base">70%</span></div><div class="w-full bg-gray-100 rounded-full h-3"><div class="bg-[#B0D4C5] h-3 rounded-full" style="width: 70%;"></div></div></div>
            <div><div class="flex justify-between text-sm mb-2"><span class="text-gray-500">已结算 (10单)</span><span class="font-bold text-[#B2C4D7] text-base">30%</span></div><div class="w-full bg-gray-100 rounded-full h-3"><div class="bg-[#B2C4D7] h-3 rounded-full" style="width: 30%;"></div></div></div>
          </div>
      </div>
      <div class="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-[280px] flex flex-col">
          <h3 class="font-bold text-xl text-gray-800 mb-2">区域分布</h3>
          <div class="flex-1 flex flex-col">
              <div class="flex-1 relative">
                <v-chart class="w-full h-full" :option="distributionOption" autoresize />
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center pb-4">
                  <span class="text-xs text-gray-400">总计</span>
                  <span class="text-2xl font-bold text-gray-800">{{ totalValue }}</span>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-y-2 gap-x-4 mt-2">
                <div v-for="(entry, index) in processedDistributionData" :key="entry.name" class="flex items-center justify-between text-sm">
                  <div class="flex items-center">
                    <span class="w-2.5 h-2.5 rounded-full mr-2" :style="{ backgroundColor: COLORS_DIST[index % COLORS_DIST.length] }"></span>
                    <span class="text-gray-600 text-xs truncate max-w-[60px]">{{ entry.name }}</span>
                  </div>
                  <span class="font-bold text-gray-800 text-xs">{{ entry.value }}</span>
                </div>
              </div>
          </div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.review-share-card {
  transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.65s ease, box-shadow 0.65s ease;
}

.review-scroll-move {
  transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}

.review-scroll-enter-active,
.review-scroll-leave-active {
  transition: all 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}

.review-scroll-enter-from {
  opacity: 0;
  transform: translateY(28px);
}

.review-scroll-leave-to {
  opacity: 0;
  transform: translateY(-28px);
}

.review-scroll-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
}
</style>

