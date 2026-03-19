<template>
  <div class="h-full flex flex-col text-white">
    <!-- Capsule Navigation -->
    <div class="px-6 pt-2 pb-10 flex flex-wrap gap-3">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border"
        :class="activeTab === tab.id 
          ? 'bg-[#FFC091] border-[#FFC091] text-[#260A2F] shadow-[0_0_15px_rgba(255,192,145,0.3)]' 
          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
      <!-- Photos Tab -->
      <div v-if="activeTab === 'photos'" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div 
          v-for="(photo, index) in completionPhotos" 
          :key="index"
          class="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-white/5 cursor-pointer group relative"
          @click="$emit('zoomImage', photo)"
        >
          <img 
            :src="photo" 
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            referrerpolicy="no-referrer"
          />
          <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Maximize2 :size="20" class="text-white" />
            </div>
          </div>
        </div>
      </div>

      <!-- File List Tabs (Acceptance, Documents, Materials, Handover) -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="(file, index) in activeTabData" 
          :key="index"
          class="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-40 hover:bg-white/10 transition-colors group"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#FFC091]/10 flex items-center justify-center flex-shrink-0">
              <FileText :size="20" class="text-[#FFC091]" />
            </div>
            <h4 class="text-white font-medium leading-tight line-clamp-2">
              {{ file.name }}
            </h4>
          </div>
          
          <div class="flex justify-end">
            <button 
              class="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-[#FFC091] hover:text-[#260A2F] text-white text-sm font-bold rounded-xl transition-all"
              @click="handleDownload(file)"
            >
              <Download :size="16" />
              下载文件
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="activeTabData.length === 0" class="col-span-full h-64 flex flex-col items-center justify-center opacity-50">
          <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <component :is="activeTabIcon" :size="32" />
          </div>
          <p class="text-lg font-medium">暂无{{ activeTabLabel }}数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  Maximize2, 
  Camera, 
  ClipboardCheck, 
  FileText, 
  Package, 
  ArrowLeftRight,
  Download
} from 'lucide-vue-next';

const props = defineProps<{
  projectId: string;
}>();

defineEmits(['zoomImage']);

const tabs = [
  { id: 'photos', label: '完工照片', icon: Camera },
  { id: 'acceptance', label: '验收记录', icon: ClipboardCheck },
  { id: 'documents', label: '文件资料', icon: FileText },
  { id: 'materials', label: '材料设备', icon: Package },
  { id: 'handover', label: '交接记录', icon: ArrowLeftRight },
];

const activeTab = ref('photos');

const activeTabLabel = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.label;
});

const activeTabIcon = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.icon;
});

// Mock data for files
const mockFiles = {
  acceptance: [
    { name: '隐蔽工程验收记录表.pdf', size: '1.2MB' },
    { name: '分部分项工程质量验收单.docx', size: '850KB' },
    { name: '竣工预验收报告.pdf', size: '2.4MB' },
    { name: '水电工程验收合格证.pdf', size: '1.1MB' },
    { name: '防水工程闭水试验记录.pdf', size: '920KB' },
  ],
  documents: [
    { name: '工程竣工图纸全集.zip', size: '45.8MB' },
    { name: '设计变更通知单汇总.pdf', size: '3.2MB' },
    { name: '工程质量保修书.pdf', size: '1.5MB' },
    { name: '消防安全检查合格证.pdf', size: '1.8MB' },
  ],
  materials: [
    { name: '主要材料合格证及检测报告.pdf', size: '12.4MB' },
    { name: '设备安装调试运行记录.docx', size: '2.1MB' },
    { name: '进场材料报验单汇总.pdf', size: '5.6MB' },
    { name: '特种设备使用登记证.pdf', size: '1.2MB' },
  ],
  handover: [
    { name: '工程移交证书.pdf', size: '1.1MB' },
    { name: '物业管理交接清单.xlsx', size: '450KB' },
    { name: '钥匙及相关配件交接单.pdf', size: '320KB' },
    { name: '设施设备操作维护手册.pdf', size: '15.2MB' },
  ]
};

const activeTabData = computed(() => {
  if (activeTab.value === 'photos') return [];
  return mockFiles[activeTab.value as keyof typeof mockFiles] || [];
});

const handleDownload = (file: any) => {
  console.log('Downloading:', file.name);
  // In a real app, this would trigger a file download
};

// Mock data for completion photos
const completionPhotos = [
  'https://picsum.photos/seed/eng1/800/800',
  'https://picsum.photos/seed/eng2/800/800',
  'https://picsum.photos/seed/eng3/800/800',
  'https://picsum.photos/seed/eng4/800/800',
  'https://picsum.photos/seed/eng5/800/800',
  'https://picsum.photos/seed/eng6/800/800',
  'https://picsum.photos/seed/eng7/800/800',
  'https://picsum.photos/seed/eng8/800/800',
  'https://picsum.photos/seed/eng9/800/800',
];
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
