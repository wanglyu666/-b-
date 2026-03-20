<template>
  <div class="h-full flex flex-col text-white">
    <!-- Tab Navigation -->
    <div class="px-6 pt-2 pb-8 flex flex-wrap gap-3">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border"
        :class="activeTab === tab.id 
          ? 'bg-[#FFC091] border-[#FFC091] text-[#260A2F] shadow-[0_0_15px_rgba(255,192,145,0.3)]' 
          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-hidden px-6 pb-6 relative">
      <Transition name="fade-slide" mode="out-in">
        <!-- Construction Content Tab -->
        <div v-if="activeTab === 'content'" :key="'content'" class="h-full flex flex-col gap-6">
          <!-- Top Row: Area and Progress -->
          <div class="grid grid-cols-2 gap-6">
            <!-- 施工区域 -->
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-[#FFC091]">
                <MapPin :size="16" />
                <span class="font-bold text-xs tracking-widest uppercase">施工区域</span>
              </div>
              <textarea 
                v-model="reportData.area"
                placeholder="请输入施工区域..."
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors h-[150px] resize-none"
              ></textarea>
            </div>

            <!-- 完成进度 -->
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-[#FFC091]">
                <TrendingUp :size="16" />
                <span class="font-bold text-xs tracking-widest uppercase">完成进度</span>
              </div>
              <textarea 
                v-model="reportData.progressDesc"
                placeholder="请输入进度说明..."
                class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors h-[150px] resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Bottom Row: Content -->
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <Hammer :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">施工内容</span>
            </div>
            <textarea 
              v-model="reportData.content"
              placeholder="请输入详细施工内容..."
              class="w-full h-[300px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none"
            ></textarea>
          </div>
        </div>

        <!-- 工种与材料 Tab -->
        <div v-else-if="activeTab === 'materials'" :key="'materials'" class="h-full flex flex-col gap-8">
          <!-- 进场材料 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <Package :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">进场材料</span>
            </div>
            <textarea 
              v-model="reportData.materials"
              placeholder="请输入进场材料信息..."
              class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none"
            ></textarea>
          </div>

          <!-- 工种表格 -->
          <div class="flex-1 flex flex-col min-h-0">
            <div class="flex items-center gap-2 text-[#FFC091] mb-2">
              <Users :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">工种人员</span>
            </div>
            
            <div class="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
              <!-- Table Header -->
              <div class="grid grid-cols-2 px-6 py-3 border-b border-white/10 bg-white/5 text-xs font-bold text-white/40 uppercase tracking-widest">
                <div>工种</div>
                <div class="text-center">数量</div>
              </div>
              
              <!-- Table Body -->
              <div class="flex-1 overflow-y-auto custom-scrollbar">
                <div 
                  v-for="(worker, index) in reportData.workers" 
                  :key="index"
                  class="grid grid-cols-2 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center"
                >
                  <div class="text-sm text-white font-medium">{{ worker.type }}</div>
                  <div class="text-center text-sm text-white font-medium">{{ worker.count }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 问题与次日计划 Tab -->
        <div v-else-if="activeTab === 'issues'" :key="'issues'" class="h-full grid grid-cols-2 grid-rows-2 gap-6">
          <!-- 现场问题与解决 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <AlertCircle :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">现场问题与解决</span>
            </div>
            <textarea 
              v-model="reportData.issues"
              placeholder="请输入现场问题及解决方案..."
              class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none"
            ></textarea>
          </div>

          <!-- 次日施工区域 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <MapPin :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">次日施工区域</span>
            </div>
            <textarea 
              v-model="reportData.nextDayArea"
              placeholder="请输入次日施工区域..."
              class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none"
            ></textarea>
          </div>

          <!-- 次日施工内容 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <Hammer :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">次日施工内容</span>
            </div>
            <textarea 
              v-model="reportData.nextDayContent"
              placeholder="请输入次日施工内容..."
              class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none"
            ></textarea>
          </div>

          <!-- 次日人员安排 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <Users :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">次日人员安排</span>
            </div>
            <textarea 
              v-model="reportData.nextDayWorkers"
              placeholder="请输入次日人员安排..."
              class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none"
            ></textarea>
          </div>
        </div>

        <!-- 施工照片 Tab -->
        <div v-else-if="activeTab === 'photos'" :key="'photos'" class="h-full overflow-y-auto custom-scrollbar pr-2">
          <div class="grid grid-cols-3 gap-4">
            <div 
              v-for="(photo, index) in reportData.photos" 
              :key="index"
              @click="selectedPhoto = photo"
              class="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer hover:border-[#FFC091]/50 transition-all group relative"
            >
              <img 
                :src="photo" 
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                referrerPolicy="no-referrer"
              />
              <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera :size="24" class="text-white/70" />
              </div>
            </div>
          </div>
        </div>

        <!-- Other Tabs Placeholder -->
      </Transition>
    </div>

    <!-- Photo Preview Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="selectedPhoto" 
          class="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
          @click="closePhoto"
        >
          <!-- Controls -->
          <div class="absolute top-6 right-6 flex gap-4 z-[10000]">
            <!-- Fullscreen Toggle -->
            <button 
              @click.stop="toggleFullscreen"
              class="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
              title="全屏切换"
            >
              <Maximize2 v-if="!isFullscreen" :size="20" />
              <Minimize2 v-else :size="20" />
            </button>

            <!-- Close Button -->
            <button 
              @click="closePhoto"
              class="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
              title="关闭"
            >
              <X :size="24" />
            </button>
          </div>

          <!-- Image Container -->
          <div class="w-full h-full flex items-center justify-center p-0">
            <img 
              :src="selectedPhoto" 
              class="max-w-full max-h-full object-contain select-none transition-all duration-300" 
              referrerPolicy="no-referrer"
              @click.stop
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { MapPin, Hammer, TrendingUp, Users, Package, AlertCircle, Camera, X, Maximize2, Minimize2 } from 'lucide-vue-next';

const props = defineProps<{
  report: any;
}>();

const tabs = [
  { id: 'content', label: '施工内容', icon: Hammer },
  { id: 'materials', label: '工种与材料', icon: Package },
  { id: 'issues', label: '问题与次日计划', icon: AlertCircle },
  { id: 'photos', label: '施工照片', icon: Camera },
];

const activeTab = ref('content');
const selectedPhoto = ref<string | null>(null);
const isFullscreen = ref(false);

const closePhoto = () => {
  if (isFullscreen.value && document.fullscreenElement) {
    document.exitFullscreen();
  }
  selectedPhoto.value = null;
  isFullscreen.value = false;
};

const toggleFullscreen = async () => {
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen();
      isFullscreen.value = true;
    } catch (err) {
      console.error('无法进入全屏模式:', err);
    }
  } else {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
      isFullscreen.value = false;
    }
  }
};

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});

const activeTabIcon = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.icon;
});

const reportData = ref({
  area: '客厅、主卧、次卧',
  content: '1. 客厅吊顶骨架安装完成；\n2. 主卧墙面找平处理；\n3. 次卧地面清理，准备铺设地暖。',
  progress: 65,
  progressDesc: '整体进度符合预期，木工进场顺利。',
  materials: '1. 轻钢龙骨：50支\n2. 石膏板：30张\n3. 腻子粉：10袋',
  workers: [
    { type: '装饰木工', count: 2 },
    { type: '装修水工', count: 2 },
    { type: '瓦工 (贴砖)', count: 2 },
    { type: '电工', count: 2 },
  ],
  issues: '暂无重大问题，现场施工环境整洁。',
  nextDayArea: '客厅、走廊',
  nextDayContent: '1. 客厅吊顶封板；\n2. 走廊灯具线路铺设。',
  nextDayWorkers: '木工2人，电工1人。',
  photos: [
    'https://picsum.photos/seed/const1/800/600',
    'https://picsum.photos/seed/const2/800/600',
    'https://picsum.photos/seed/const3/800/600',
    'https://picsum.photos/seed/const4/800/600',
    'https://picsum.photos/seed/const5/800/600',
    'https://picsum.photos/seed/const6/800/600',
    'https://picsum.photos/seed/const7/800/600',
    'https://picsum.photos/seed/const8/800/600',
    'https://picsum.photos/seed/const9/800/600',
  ]
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

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
