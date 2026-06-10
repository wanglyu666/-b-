<template>
  <div class="h-full flex flex-col text-white">
    <!-- Capsule Navigation -->
    <div class="flex items-center justify-between gap-4 px-6 pb-10 pt-2">
      <div class="flex flex-wrap gap-3">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="switchTab(tab.id)"
          class="rounded-full border px-8 py-2 text-sm font-bold transition-all duration-300"
          :class="activeTab === tab.id 
            ? 'border-[#FFE600] bg-[#FFE600] text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.3)]' 
            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10'"
        >
          {{ tab.label }}
        </button>
      </div>
      <button
        v-if="activeTab === 'daily'"
        type="button"
        class="shrink-0 rounded-full border border-white/10 bg-white/5 px-8 py-2 text-sm font-bold text-white transition-all duration-300 hover:border-white/20 hover:bg-white/10"
        @click="handleDownloadAll"
      >
        全部下载
      </button>
    </div>

    <!-- Daily Reports: use API with pagination -->
    <template v-if="activeTab === 'daily'">
      <div class="flex-1 overflow-y-auto px-6 pb-4 custom-scrollbar">
        <!-- Loading -->
        <div v-if="loading" class="col-span-full h-64 flex flex-col items-center justify-center opacity-50">
          <div class="w-10 h-10 border-2 border-white/20 border-t-[#FFE600] rounded-full animate-spin mb-4"></div>
          <p class="text-sm">加载中...</p>
        </div>

        <!-- Report Cards -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="report in dailyReports" 
            :key="report.id"
            @click="$emit('enterDetail', { ...report, type: 'daily' })"
            class="group relative cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-400/10">
                <FileText :size="20" class="text-blue-400" />
              </div>
              <h4 class="line-clamp-1 text-lg font-bold leading-tight text-white">
                {{ report.type }}
              </h4>
            </div>
            
            <div class="mt-4 space-y-2 pr-12">
              <div class="flex items-center gap-2 text-gray-400">
                <Calendar :size="14" />
                <span class="text-xs">{{ report.date }}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-400">
                <User :size="14" />
                <span class="text-xs">负责人：{{ report.name }}</span>
              </div>
            </div>

            <button
              type="button"
              class="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/70 transition-all hover:bg-white/15 hover:text-white active:scale-95"
              aria-label="下载报告"
              @click.stop="handleDownload(report.id)"
            >
              <Download :size="16" />
            </button>
          </div>

          <!-- Empty State -->
          <div v-if="dailyReports.length === 0" class="col-span-full h-64 flex flex-col items-center justify-center opacity-50">
            <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <FileText :size="32" />
            </div>
            <p class="text-lg font-medium">暂无日报数据</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 px-6 pb-6 pt-2">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/70 transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          上一页
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          class="w-9 h-9 rounded-lg border text-sm font-bold transition-all"
          :class="page === currentPage
            ? 'border-[#FFE600] bg-[#FFE600] text-[#260A2F]'
            : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'"
        >
          {{ page }}
        </button>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/70 transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>
    </template>

    <!-- Weekly / EHS tabs keep mock data for now -->
    <div v-else class="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="(report, index) in otherReports" 
          :key="index"
          @click="$emit('enterDetail', report)"
          class="group relative cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10"
        >
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-400/10">
              <FileText :size="20" class="text-blue-400" />
            </div>
            <h4 class="line-clamp-1 text-lg font-bold leading-tight text-white">
              {{ report.name }}
            </h4>
          </div>
          
          <div class="mt-4 space-y-2 pr-12">
            <div class="flex items-center gap-2 text-gray-400">
              <Calendar :size="14" />
              <span class="text-xs">{{ report.date }}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-400">
              <User :size="14" />
              <span class="text-xs">负责人：{{ report.manager }}</span>
            </div>
          </div>
        </div>

        <div v-if="otherReports.length === 0" class="col-span-full h-64 flex flex-col items-center justify-center opacity-50">
          <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <FileText :size="32" />
          </div>
          <p class="text-lg font-medium">暂无{{ activeTabLabel }}数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { FileText, Calendar, User, Download } from 'lucide-vue-next';
import { fetchDailyReports, downloadReportPdf, downloadReportZip, type DailyReportItem } from '../../api/projectApi';

const props = defineProps<{
  projectId: string;
}>();

const emit = defineEmits(['enterDetail']);

const tabs = [
  { id: 'daily', label: '日报' },
  { id: 'weekly', label: '周报' },
  { id: 'ehs', label: 'EHS周报' },
];

const activeTab = ref('daily');

const activeTabLabel = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.label;
});

// ========== 日报 API 数据 ==========
const dailyReports = ref<DailyReportItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const total = ref(0);
const pageSize = 9;

const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1);

/** 可见的页码按钮 */
const visiblePages = computed(() => {
  const pages: number[] = [];
  const tp = totalPages.value;
  const cp = currentPage.value;

  let start = Math.max(1, cp - 2);
  let end = Math.min(tp, cp + 2);

  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(tp, start + 4);
    } else {
      start = Math.max(1, end - 4);
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

async function loadDailyReports() {
  if (!props.projectId) return;
  loading.value = true;
  try {
    const res = await fetchDailyReports(props.projectId, currentPage.value, pageSize);
    dailyReports.value = res.list;
    total.value = res.total;
  } catch (e) {
    console.error('加载日报列表失败:', e);
    dailyReports.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  loadDailyReports();
}

function switchTab(tabId: string) {
  activeTab.value = tabId;
  if (tabId === 'daily') {
    currentPage.value = 1;
    loadDailyReports();
  }
}

async function handleDownload(id: number) {
  try {
    await downloadReportPdf(id);
  } catch (e) {
    console.error('下载日报失败:', e);
  }
}

async function handleDownloadAll() {
  if (!props.projectId) return;
  try {
    await downloadReportZip(props.projectId);
  } catch (e) {
    console.error('下载全部日报失败:', e);
  }
}

// ========== 周报 / EHS 周报（保持 mock） ==========
const mockReports: Record<string, any[]> = {
  weekly: [
    { id: 6, type: 'weekly', name: '2024年3月第3周施工周报', date: '2024-03-15 ~ 2024-03-21', manager: '王经理' },
    { id: 7, type: 'weekly', name: '2024年3月第2周施工周报', date: '2024-03-08 ~ 2024-03-14', manager: '王经理' },
    { id: 8, type: 'weekly', name: '2024年3月第1周施工周报', date: '2024-03-01 ~ 2024-03-07', manager: '王经理' },
  ],
  ehs: [
    { id: 9, type: 'ehs', name: '2024年3月第3周 EHS周报', date: '2024-03-15 ~ 2024-03-21', manager: '赵工' },
    { id: 10, type: 'ehs', name: '2024年3月第2周 EHS周报', date: '2024-03-08 ~ 2024-03-14', manager: '赵工' },
  ]
};

const otherReports = computed(() => {
  return mockReports[activeTab.value] || [];
});

// 项目切换时重新加载
watch(() => props.projectId, () => {
  currentPage.value = 1;
  loadDailyReports();
}, { immediate: true });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
