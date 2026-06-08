<template>
  <div class="h-full flex flex-col text-white">
    <!-- Capsule Navigation -->
    <div class="flex items-center justify-between gap-4 px-6 pb-10 pt-2">
      <div class="flex flex-wrap gap-3">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="rounded-full border px-8 py-2 text-sm font-bold transition-all duration-300"
          :class="activeTab === tab.id 
            ? 'border-[#FFE600] bg-[#FFE600] text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.3)]' 
            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10'"
        >
          {{ tab.label }}
        </button>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-full border border-white/10 bg-white/5 px-8 py-2 text-sm font-bold text-white transition-all duration-300 hover:border-white/20 hover:bg-white/10"
        @click="downloadAllReports"
      >
        全部下载
      </button>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="(report, index) in activeReports" 
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

          <button
            type="button"
            class="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white/70 transition-all hover:bg-white/15 hover:text-white active:scale-95"
            aria-label="下载报告"
            @click.stop="downloadReport(report)"
          >
            <Download :size="16" />
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="activeReports.length === 0" class="col-span-full h-64 flex flex-col items-center justify-center opacity-50">
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
import { ref, computed } from 'vue';
import { FileText, Calendar, User, Download } from 'lucide-vue-next';

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

const mockReports = {
  daily: [
    { id: 1, type: 'daily', name: '2024-03-20 施工日报', date: '2024-03-20', manager: '张工' },
    { id: 2, type: 'daily', name: '2024-03-19 施工日报', date: '2024-03-19', manager: '张工' },
    { id: 3, type: 'daily', name: '2024-03-18 施工日报', date: '2024-03-18', manager: '李工' },
    { id: 4, type: 'daily', name: '2024-03-17 施工日报', date: '2024-03-17', manager: '李工' },
    { id: 5, type: 'daily', name: '2024-03-16 施工日报', date: '2024-03-16', manager: '张工' },
  ],
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

const activeReports = computed(() => {
  return mockReports[activeTab.value as keyof typeof mockReports] || [];
});

function downloadReport(report: (typeof mockReports.daily)[0]) {
  void report;
  // 演示：实际对接下载接口
}

function downloadAllReports() {
  // 演示：下载当前 Tab 下全部报告
  void activeReports.value;
}
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
