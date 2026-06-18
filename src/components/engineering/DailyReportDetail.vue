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
          ? 'bg-[#FFE600] border-[#FFE600] text-[#260A2F] shadow-[0_0_15px_rgba(255,230,0,0.3)]' 
          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3 opacity-50">
        <div class="w-10 h-10 border-2 border-white/20 border-t-[#FFE600] rounded-full animate-spin"></div>
        <p class="text-sm">加载日报详情...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4 opacity-50">
        <AlertCircle :size="48" class="text-red-400" />
        <p class="text-lg">{{ error }}</p>
      </div>
    </div>

    <!-- Content Area -->
    <div v-else class="flex-1 overflow-hidden px-6 pb-6 relative">
      <Transition name="fade-slide" mode="out-in">
        <!-- Construction Content Tab -->
        <div v-if="activeTab === 'content'" :key="'content'" class="h-full flex flex-col gap-6">
          <div class="grid grid-cols-2 gap-6">
            <!-- 施工区域 -->
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-[#FFE600]">
                <MapPin :size="16" />
                <span class="font-bold text-xs tracking-widest uppercase">施工区域</span>
              </div>
              <div class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm h-[150px] overflow-y-auto whitespace-pre-wrap custom-scrollbar">
                {{ area }}
              </div>
            </div>

            <!-- 完成进度 -->
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-[#FFE600]">
                <TrendingUp :size="16" />
                <span class="font-bold text-xs tracking-widest uppercase">完成进度</span>
              </div>
              <div class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm h-[150px] overflow-y-auto whitespace-pre-wrap custom-scrollbar">
                {{ progress }}
              </div>
            </div>
          </div>

          <!-- 施工内容 -->
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <Hammer :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">施工内容</span>
            </div>
            <div class="w-full h-[300px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ content }}
            </div>
          </div>
        </div>

        <!-- 工种与材料 Tab -->
        <div v-else-if="activeTab === 'materials'" :key="'materials'" class="h-full flex flex-col gap-8">
          <!-- 进场材料 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <Package :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">进场材料</span>
            </div>
            <div class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ materials }}
            </div>
          </div>

          <!-- 工种表格 -->
          <div class="flex-1 flex flex-col min-h-0">
            <div class="flex items-center gap-2 text-[#FFE600] mb-2">
              <Users :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">工种人员</span>
            </div>
            
            <div class="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
              <div class="grid grid-cols-2 px-6 py-3 border-b border-white/10 bg-white/5 text-xs font-bold text-white/40 uppercase tracking-widest">
                <div>工种</div>
                <div class="text-center">数量</div>
              </div>
              
              <div class="flex-1 overflow-y-auto custom-scrollbar">
                <div 
                  v-for="(worker, index) in workers" 
                  :key="index"
                  class="grid grid-cols-2 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center"
                >
                  <div class="text-sm text-white font-medium">{{ worker.type }}</div>
                  <div class="text-center text-sm text-white font-medium">{{ worker.count }}</div>
                </div>
                <div v-if="workers.length === 0" class="px-6 py-8 text-center text-sm text-white/30">
                  暂无工种数据
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 问题与次日计划 Tab -->
        <div v-else-if="activeTab === 'issues'" :key="'issues'" class="h-full grid grid-cols-2 grid-rows-2 gap-6">
          <!-- 现场问题与解决 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <AlertCircle :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">现场问题与解决</span>
            </div>
            <div class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ issues }}
            </div>
          </div>

          <!-- 次日施工区域 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <MapPin :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">次日施工区域</span>
            </div>
            <div class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ nextDayArea }}
            </div>
          </div>

          <!-- 次日施工内容 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <Hammer :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">次日施工内容</span>
            </div>
            <div class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ nextDayContent }}
            </div>
          </div>

          <!-- 次日人员安排 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <Users :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">次日人员安排</span>
            </div>
            <div class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ nextDayWorkers }}
            </div>
          </div>
        </div>

        <!-- 施工照片 Tab -->
        <div v-else-if="activeTab === 'photos'" :key="'photos'" class="h-full overflow-y-auto custom-scrollbar pr-2">
          <div class="grid grid-cols-3 gap-4">
            <div 
              v-for="(photo, index) in photos" 
              :key="index"
              @click="selectedPhoto = photo.imgUrl"
              class="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer hover:border-[#FFE600]/50 transition-all group relative"
            >
              <img 
                :src="photo.imgUrl" 
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                referrerPolicy="no-referrer"
              />
              <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera :size="24" class="text-white/70" />
              </div>
            </div>
          </div>
          <div v-if="photos.length === 0" class="h-64 flex items-center justify-center opacity-50">
            <p class="text-sm">暂无施工照片</p>
          </div>
        </div>

        <div v-else :key="'fallback'" class="hidden"></div>
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
          <div class="absolute top-6 right-6 flex gap-4 z-[10000]">
            <button 
              @click.stop="toggleFullscreen"
              class="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
              title="全屏切换"
            >
              <Maximize2 v-if="!isFullscreen" :size="20" />
              <Minimize2 v-else :size="20" />
            </button>
            <button 
              @click="closePhoto"
              class="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
              title="关闭"
            >
              <X :size="24" />
            </button>
          </div>

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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { MapPin, Hammer, TrendingUp, Users, Package, AlertCircle, Camera, X, Maximize2, Minimize2 } from 'lucide-vue-next';
import { fetchDailyReportDetail, fetchWorkTypeMap } from '../../api/projectApi';

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
const loading = ref(false);
const error = ref('');

// ========== 数据字段 ==========
const area = ref('');
const progress = ref('');
const content = ref('');
const materials = ref('');
const workers = ref<{ type: string; count: string | number }[]>([]);
const issues = ref('');
const nextDayArea = ref('');
const nextDayContent = ref('');
const nextDayWorkers = ref('');
const photos = ref<any[]>([]);

const safeStr = (v: any) => (v == null ? '' : String(v));

/** 加载日报详情 */
async function loadDetail() {
  const reportId = props.report?.id;
  if (!reportId) return;

  loading.value = true;
  error.value = '';

  try {
    const [detail, workTypeMap] = await Promise.all([
      fetchDailyReportDetail(reportId),
      fetchWorkTypeMap(),
    ]);

    const dj = detail.dailyJson;
    const dl = detail.dayLaborList;

    // 施工内容
    area.value = safeStr(dj.sgnr?.[0]?.text1);
    progress.value = safeStr(dj.sgnr?.[0]?.text3);
    content.value = safeStr(dj.sgnr?.[0]?.text2);

    // 进场材料
    materials.value = safeStr(dj.jrjccl?.text1);

    // 工种人员 —— 从 dayLaborList 查找 workType → 字典 name
    workers.value = (dl || []).map((item: any) => {
      const typeId = Number(item.workType);
      const typeName = workTypeMap.get(typeId) || `工种${typeId}`;
      const count = item.count ?? item.num ?? item.number ?? '-';
      return { type: typeName, count };
    });

    // 问题与次日计划
    issues.value = safeStr(dj.wtyjj?.text1);
    nextDayArea.value = safeStr(dj.crsgjh?.[0]?.text1);
    nextDayContent.value = safeStr(dj.crsgjh?.[0]?.text2);
    nextDayWorkers.value = safeStr(dj.crsgjh?.[0]?.text3);

    // 施工照片
    photos.value = dj.jrsgzp || [];
  } catch (e: any) {
    console.error('加载日报详情失败:', e);
    error.value = '加载日报详情失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}

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
  loadDetail();
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});

// 切换日报时重新加载
watch(() => props.report?.id, () => {
  activeTab.value = 'content';
  loadDetail();
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
