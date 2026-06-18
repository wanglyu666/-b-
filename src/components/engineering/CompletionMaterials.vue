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
          ? 'bg-[#FFE600] border-[#FFE600] text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.3)]' 
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
          @click="$emit('zoomImage', photo.imgUrl)"
        >
          <img 
            :src="photo.imgUrl" 
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
            <div class="w-10 h-10 rounded-xl bg-[#FFE600]/10 flex items-center justify-center flex-shrink-0">
              <FileText :size="20" class="text-[#FFE600]" />
            </div>
            <h4 class="text-white font-medium leading-tight line-clamp-2">
              {{ file.name }}
            </h4>
          </div>
          
          <div class="flex justify-end">
            <button 
              class="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-[#FFE600] hover:text-[#260A2F] text-white text-sm font-bold rounded-xl transition-all"
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
import type { CompletedPhotoItem, CompletedFileItem, CompletedData } from '../../api/projectApi';
import { downloadFileFromUrl } from '../../api/projectApi';

const props = defineProps<{
  projectId: string;
  completedPhotos?: CompletedPhotoItem[];
  completedData?: CompletedData;
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

const activeTabData = computed(() => {
  if (activeTab.value === 'photos') return [];
  const data = props.completedData;
  if (!data) return [];
  const map: Record<string, CompletedFileItem[]> = {
    acceptance: data.acceptance,
    documents: data.documents,
    materials: data.materials,
    handover: data.handover,
  };
  return map[activeTab.value] || [];
});

const handleDownload = async (file: CompletedFileItem) => {
  if (!file.attachment) return;
  try {
    await downloadFileFromUrl(file.attachment, file.name || '文件');
  } catch (e) {
    console.error('下载文件失败:', e);
  }
};

const completionPhotos = computed(() => {
  return props.completedPhotos || [];
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
