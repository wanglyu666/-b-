<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import {
  CONSULTATION_STATUSES,
  type ConsultationSheetStatus,
  consultationsInStatus,
} from '../../data/consultations';
import { truncateWithEllipsis } from '../../utils/string';

const REQUIREMENT_MAX_LEN = 50;

const props = defineProps<{
  initialStatus?: ConsultationSheetStatus;
}>();

const emit = defineEmits<{
  back: [];
}>();

const statuses = CONSULTATION_STATUSES;
const activeStatus = ref<ConsultationSheetStatus>(props.initialStatus ?? '待回复');
const searchQuery = ref('');

watch(
  () => props.initialStatus,
  (s) => {
    if (s) activeStatus.value = s;
  },
);

const currentPage = ref(1);
const itemsPerPage = 9;

const filteredList = computed(() => {
  let list = consultationsInStatus(activeStatus.value);
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.no.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q) ||
        c.requirement.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.contactPhone.includes(q),
    );
  }
  return list;
});

const totalPages = computed(() => Math.ceil(filteredList.value.length / itemsPerPage) || 1);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredList.value.slice(start, start + itemsPerPage);
});

watch([activeStatus, searchQuery], () => {
  currentPage.value = 1;
});

function requirementPreview(text: string) {
  return truncateWithEllipsis(text, REQUIREMENT_MAX_LEN);
}
</script>

<template>
  <div class="min-h-screen bg-transparent relative overflow-x-hidden">
    <div class="relative z-10 p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <header class="flex justify-between items-center flex-shrink-0 gap-4 flex-wrap">
        <div class="flex items-center space-x-4 min-w-0">
          <button
            type="button"
            @click="emit('back')"
            class="p-2 shrink-0 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/80 transition-all active:scale-95"
            aria-label="返回"
          >
            <ArrowLeft :size="20" class="text-gray-600" />
          </button>
          <div class="min-w-0">
            <h1 class="text-3xl font-bold text-gray-800">全部咨询</h1>
            <p class="text-gray-500 mt-1">查看与筛选当前状态下的所有咨询单</p>
          </div>
        </div>

        <div class="relative shrink-0 w-full sm:w-auto">
          <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="全局搜索咨询..."
            class="pl-10 pr-4 py-2 w-full sm:w-64 bg-white/50 backdrop-blur-md border border-white/20 rounded-xl transition-all focus:outline-none focus:ring-0 focus:border-white/20 focus-visible:ring-0"
          />
        </div>
      </header>

      <div class="mt-8 md:mt-12 flex space-x-3 overflow-x-auto pb-2 scrollbar-hide mb-6">
        <button
          v-for="status in statuses"
          :key="status"
          type="button"
          @click="
            activeStatus = status;
            searchQuery = '';
          "
          :class="[
            'px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm border',
            activeStatus === status && !searchQuery.trim()
              ? 'bg-[#9FE870] text-[#163300] border-[#9FE870]/40'
              : 'bg-white/45 text-[#163300]/85 border-white/35 backdrop-blur-md hover:bg-white/55',
          ]"
        >
          {{ status }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          v-for="item in paginatedItems"
          :key="item.id"
          type="button"
          class="flex h-[220px] w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/90 p-5 text-left shadow-sm ring-1 ring-gray-100/80 transition-all hover:border-[#9FE870]/50 hover:bg-white hover:shadow-md"
        >
          <h3 class="mb-4 line-clamp-2 shrink-0 text-base font-bold leading-snug text-gray-900">
            {{ item.title }}
          </h3>
          <div class="mb-4 shrink-0">
            <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">咨询时间</p>
            <p class="mt-1.5 font-mono text-sm font-semibold tabular-nums text-gray-800">
              {{ item.time }}
            </p>
          </div>
          <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
            <p class="shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              需求
            </p>
            <p
              class="mt-2 min-h-0 flex-1 text-left text-sm leading-[1.75] text-gray-600"
              :title="item.requirement.length > REQUIREMENT_MAX_LEN ? item.requirement : undefined"
            >
              {{ requirementPreview(item.requirement) }}
            </p>
          </div>
        </button>

        <div
          v-if="paginatedItems.length === 0"
          class="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 bg-white/30 backdrop-blur-md rounded-3xl border border-dashed border-white/40"
        >
          <p class="text-lg font-medium text-gray-600">
            {{ searchQuery.trim() ? '没有找到匹配的咨询单' : '该状态下暂无咨询单' }}
          </p>
        </div>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center items-center space-x-4 mt-12 pb-8">
        <button
          type="button"
          @click="currentPage > 1 && currentPage--"
          :disabled="currentPage === 1"
          class="p-2 rounded-full bg-white border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft :size="20" />
        </button>

        <div class="flex items-center space-x-2">
          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            @click="currentPage = page"
            :class="[
              'w-10 h-10 rounded-full text-sm font-bold transition-all',
              currentPage === page
                ? 'bg-[#FFE600] text-[#260A2F] shadow-sm'
                : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300',
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          type="button"
          @click="currentPage < totalPages && currentPage++"
          :disabled="currentPage === totalPages"
          class="p-2 rounded-full bg-white border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronRight :size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
