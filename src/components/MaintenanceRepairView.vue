<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronLeft, MoreHorizontal, Search, X, Play } from 'lucide-vue-next';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumb?: string;
}

interface RepairItem {
  id: number;
  no: string;
  projectName: string;
  address: string;
  managerName: string;
  managerPhone: string;
  status: string;
  teamInfo: string;
  startDate: string;
  completionDate: string;
  warrantyPeriod: string;
  reportType: string;
  visitTime: string;
  reason: string;
  images: string[];
  media?: MediaItem[];
}

const props = defineProps<{
  data: RepairItem[];
}>();

const emit = defineEmits(['back']);

const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 6;

const selectedItem = ref<RepairItem | null>(null);
const previewMedia = ref<MediaItem | null>(null);

const allMedia = computed<MediaItem[]>(() => {
  if (!selectedItem.value) return [];
  if (selectedItem.value.media && selectedItem.value.media.length > 0) {
    return selectedItem.value.media;
  }
  return (selectedItem.value.images || []).map(url => ({ type: 'image' as const, url }));
});

const openDetail = (item: RepairItem) => {
  selectedItem.value = item;
};

const closeDetail = () => {
  selectedItem.value = null;
};

const openPreview = (media: MediaItem) => {
  previewMedia.value = media;
};

const closePreview = () => {
  previewMedia.value = null;
};

const filteredData = computed(() => {
  if (!searchQuery.value) return props.data;
  const q = searchQuery.value.toLowerCase();
  return props.data.filter(item =>
    item.no.toLowerCase().includes(q) ||
    item.projectName.toLowerCase().includes(q)
  );
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredData.value.length / itemsPerPage)));

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredData.value.slice(start, start + itemsPerPage);
});

</script>

<template>
  <div class="p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header -->
    <header class="flex justify-between items-center mb-8">
      <div class="flex items-center space-x-4">
        <button 
          @click="emit('back')"
          class="p-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/80 transition-all active:scale-95"
        >
          <ChevronLeft :size="20" class="text-gray-600" />
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-800">维保报修管理</h1>
          <p class="text-gray-500 mt-1">查看与管理所有维保报修工单</p>
        </div>
      </div>
      
      <div class="relative">
        <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="搜索维保编号/项目名称..." 
          class="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-md border border-white/20 rounded-xl w-64 transition-all focus:outline-none focus:ring-0 focus:border-white/20 focus-visible:ring-0"
        />
      </div>
    </header>

    <!-- Table Container (Glassmorphism Style) -->
    <div class="bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/30 shadow-xl overflow-hidden">
      <!-- Table Header Title -->
      <div class="p-6 border-b border-white/20 flex items-center space-x-3">
        <div class="w-1.5 h-6 bg-[#FFEB69] rounded-full"></div>
        <h2 class="text-xl font-bold text-gray-800">维保工单列表</h2>
      </div>

      <!-- Table Content -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-gray-500 text-sm font-medium border-b border-white/10">
              <th class="py-5 px-6">序号</th>
              <th class="py-5 px-6">维保编号</th>
              <th class="py-5 px-6">项目名称</th>
              <th class="py-5 px-6">项目地址</th>
              <th class="py-5 px-6">项目主管姓名</th>
              <th class="py-5 px-6">项目主管电话</th>
              <th class="py-5 px-6">工单状态</th>
              <th class="py-5 px-6 w-20"></th> <!-- Empty header for Operation -->
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr 
              v-for="(item, index) in paginatedData" 
              :key="item.id"
              class="group hover:bg-white/30 transition-colors"
            >
              <td class="py-5 px-6 text-gray-600">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td class="py-5 px-6 font-medium text-gray-800">{{ item.no }}</td>
              <td class="py-5 px-6 text-gray-700">{{ item.projectName }}</td>
              <td class="py-5 px-6 text-gray-500 max-w-xs truncate" :title="item.address">{{ item.address }}</td>
              <td class="py-5 px-6 text-gray-600">{{ item.managerName }}</td>
              <td class="py-5 px-6 text-gray-600">{{ item.managerPhone }}</td>
              <td class="py-5 px-6">
                <span 
                  class="px-3 py-1 rounded-full text-xs font-bold"
                  :class="{
                    'bg-orange-500/20 text-orange-600': item.status === '维保中',
                    'bg-blue-500/20 text-blue-600': item.status === '待处理',
                    'bg-[#A1D573]/20 text-[#163300]': item.status === '已完成'
                  }"
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="py-5 px-6">
                <button @click="openDetail(item)" class="p-2 text-gray-400 hover:text-[#E2943A] hover:bg-white/50 rounded-lg transition-all">
                  <MoreHorizontal :size="20" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-6 border-t border-white/10 flex justify-between items-center text-sm text-gray-500">
        <p>显示 {{ (currentPage - 1) * itemsPerPage + 1 }} 到 {{ Math.min(currentPage * itemsPerPage, filteredData.length) }} 条，共 {{ filteredData.length }} 条记录</p>
        <div class="flex space-x-2">
          <button @click="currentPage > 1 && currentPage--" :disabled="currentPage <= 1" class="px-3 py-1 bg-white/50 rounded-lg border border-white/20 hover:bg-white/80 disabled:opacity-50 transition-colors">上一页</button>
          <button 
            v-for="page in totalPages" :key="page"
            @click="currentPage = page"
            :class="['px-3 py-1 rounded-lg border shadow-sm transition-colors tabular-nums', currentPage === page ? 'bg-[#FFEB69] text-[#3A341C] border-[#FFEB69]' : 'bg-white/50 border-white/20 hover:bg-white/80 text-[#3A341C]']"
          >{{ page }}</button>
          <button @click="currentPage < totalPages && currentPage++" :disabled="currentPage >= totalPages" class="px-3 py-1 bg-white/50 rounded-lg border border-white/20 hover:bg-white/80 disabled:opacity-50 transition-colors">下一页</button>
        </div>
      </div>
    </div>
    <!-- 工单详情弹窗 -->
    <Teleport to="body">
      <div
        v-if="selectedItem"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
        @click.self="closeDetail"
      >
        <div class="w-full max-w-[960px] shadow-2xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] overflow-hidden animate-in zoom-in-95 duration-300">
          <!-- Header -->
          <div class="px-8 py-5 border-b border-white/10 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-1.5 h-6 bg-[#FFC091] rounded-full shadow-[0_0_15px_rgba(255,192,145,0.5)]"></div>
              <h2 class="text-xl font-bold text-white tracking-tight">工单详情</h2>
            </div>
            <button @click="closeDetail" class="p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-all">
              <X :size="22" />
            </button>
          </div>

          <!-- Body -->
          <div class="px-8 py-5">
            <!-- 合并卡片：项目信息 + 日期 -->
            <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 mb-4">
              <div class="grid grid-cols-2 gap-x-10 gap-y-4">
                <div>
                  <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">项目</p>
                  <p class="font-bold text-white text-base">{{ selectedItem.projectName }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">项目组信息</p>
                  <p class="font-bold text-white/70 text-base">{{ selectedItem.teamInfo || '暂无' }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">开工日期</p>
                  <p class="font-bold text-white text-sm font-mono">{{ selectedItem.startDate || '—' }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">竣工日期</p>
                  <p class="font-bold text-white text-sm font-mono">{{ selectedItem.completionDate || '—' }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">质保期</p>
                  <p class="font-bold text-white text-sm">{{ selectedItem.warrantyPeriod || '—' }}</p>
                </div>
              </div>
            </div>

            <!-- 报修类型 / 上门时间 / 工单状态 -->
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 flex flex-col items-center gap-1.5">
                <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold">报修类型</p>
                <span
                  class="px-3 py-1 rounded-full text-xs font-bold"
                  :class="selectedItem.reportType === '紧急' ? 'bg-red-500/20 text-red-400' : 'bg-sky-400/20 text-sky-400'"
                >{{ selectedItem.reportType || '普通' }}</span>
              </div>
              <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 flex flex-col items-center gap-1.5">
                <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold">上门时间</p>
                <span class="text-white font-bold text-sm font-mono">{{ selectedItem.visitTime || '待安排' }}</span>
              </div>
              <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 flex flex-col items-center gap-1.5">
                <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold">工单状态</p>
                <span
                  class="px-3 py-1 rounded-full text-xs font-bold"
                  :class="{
                    'bg-orange-500/20 text-orange-400': selectedItem.status === '维保中',
                    'bg-sky-400/20 text-sky-400': selectedItem.status === '待处理',
                    'bg-[#A1D573]/20 text-[#A1D573]': selectedItem.status === '已完成'
                  }"
                >{{ selectedItem.status }}</span>
              </div>
            </div>

            <!-- 报修原因 -->
            <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mb-4">
              <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1.5">报修原因</p>
              <p class="text-white/80 text-sm leading-relaxed">{{ selectedItem.reason || '暂无报修原因描述' }}</p>
            </div>

            <!-- 图片与视频 -->
            <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
              <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">图片/视频</p>
              <div v-if="allMedia.length > 0" class="grid grid-cols-4 gap-3">
                <div
                  v-for="(m, i) in allMedia"
                  :key="i"
                  class="aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-white/5 cursor-pointer relative group"
                  @click="openPreview(m)"
                >
                  <img
                    v-if="m.type === 'image'"
                    :src="m.url"
                    :alt="'图片 ' + (i + 1)"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <template v-else>
                    <img
                      v-if="m.thumb"
                      :src="m.thumb"
                      :alt="'视频 ' + (i + 1)"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div v-else class="w-full h-full bg-black/30 flex items-center justify-center">
                      <Play :size="28" class="text-white/60" />
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                        <Play :size="18" class="text-white ml-0.5" />
                      </div>
                    </div>
                  </template>
                </div>
              </div>
              <p v-else class="text-white/30 text-sm">暂无上传图片或视频</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 全屏预览 -->
      <div
        v-if="previewMedia"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
        @click.self="closePreview"
      >
        <button @click="closePreview" class="absolute top-6 right-6 p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-all z-10">
          <X :size="28" />
        </button>
        <img
          v-if="previewMedia.type === 'image'"
          :src="previewMedia.url"
          class="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
        />
        <video
          v-else
          :src="previewMedia.url"
          controls
          autoplay
          class="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
        />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Glassmorphism table specific styles if needed */
table {
  border-spacing: 0;
}
</style>
