<template>
  <div class="h-full flex flex-col text-white">
    <!-- Capsule Navigation -->
    <div class="px-6 pt-2 pb-10 flex gap-3">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-8 py-2 rounded-full text-sm font-bold transition-all duration-300 border"
        :class="activeTab === tab.id 
          ? 'bg-[#FFC091] border-[#FFC091] text-[#260A2F] shadow-[0_0_15px_rgba(255,192,145,0.3)]' 
          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="(report, index) in activeReports" 
          :key="index"
          @click="$emit('enterDetail', report)"
          class="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/10 transition-all group cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center flex-shrink-0">
              <FileText :size="20" class="text-blue-400" />
            </div>
            <h4 class="text-white font-bold text-lg leading-tight line-clamp-1">
              {{ report.name }}
            </h4>
          </div>
          
          <div class="space-y-2">
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
import { FileText, Calendar, User } from 'lucide-vue-next';

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
