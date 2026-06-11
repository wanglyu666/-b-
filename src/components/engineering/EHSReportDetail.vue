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
        <p class="text-sm">加载EHS周报详情...</p>
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
    <div v-else class="flex-1 overflow-y-auto px-6 pb-10 relative custom-scrollbar">
      <Transition name="fade-slide" mode="out-in">
        <!-- 工作总结 Tab -->
        <div v-if="activeTab === 'summary'" :key="'summary'" class="flex flex-col gap-6">
          <!-- 本周开展的特殊作业 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <Zap :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">本周开展的特殊作业</span>
            </div>
            <div class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar" style="max-height:200px">
              {{ specialWork }}
            </div>
          </div>

          <!-- 安全教育次数 & 培训总结 -->
          <div class="grid grid-cols-2 gap-6">
            <div class="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center gap-4">
              <div class="flex items-center gap-2 text-[#FFE600] whitespace-nowrap">
                <GraduationCap :size="18" />
                <span class="font-bold text-sm">本周开展的安全教育次数：</span>
              </div>
              <span class="text-[#FFE600] font-bold text-2xl">{{ educationCount }}</span>
              <span class="text-sm text-gray-400">次</span>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center gap-4">
              <div class="flex items-center gap-2 text-[#FFE600] whitespace-nowrap">
                <ClipboardList :size="18" />
                <span class="font-bold text-sm">共开展教育与培训总结：</span>
              </div>
              <span class="text-[#FFE600] font-bold text-2xl">{{ trainingSummaryCount }}</span>
              <span class="text-sm text-gray-400">次</span>
            </div>
          </div>

          <!-- 教育与培训 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <BookOpen :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">教育与培训</span>
            </div>
            <div class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar" style="max-height:200px">
              {{ training }}
            </div>
          </div>
        </div>

        <!-- 下周工作计划 Tab -->
        <div v-else-if="activeTab === 'plan'" :key="'plan'" class="flex flex-col gap-8">
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <ShieldCheck :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">工作内容及控制措施</span>
            </div>
            <div class="w-full h-[250px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ planContent }}
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <BookOpen :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">教育与培训计划</span>
            </div>
            <div class="w-full h-[250px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ planTraining }}
            </div>
          </div>
        </div>

        <!-- 隐患排查和其他事项 Tab -->
        <div v-else-if="activeTab === 'hazard'" :key="'hazard'" class="flex flex-col gap-8">
          <!-- 现场检查与隐患排查 -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <Search :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">现场检查与隐患排查</span>
            </div>

            <div v-if="hazardInspections.length > 0" class="bg-white/5 border border-white/10 rounded-xl overflow-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-white/10 bg-white/5">
                    <th class="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">位置</th>
                    <th class="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">隐患描述</th>
                    <th class="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">隐患照片</th>
                    <th class="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">整改措施</th>
                    <th class="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">整改完成照片</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr v-for="(item, index) in hazardInspections" :key="index" class="hover:bg-white/5 transition-colors">
                    <td class="px-4 py-4 text-sm text-white">{{ item.text1 }}</td>
                    <td class="px-4 py-4 text-sm text-gray-300">{{ item.text2 }}</td>
                    <td class="px-4 py-4">
                      <div class="flex justify-center">
                        <img v-if="item.text3" :src="item.text3" class="w-20 h-15 object-cover rounded-lg border border-white/10 cursor-pointer hover:scale-110 transition-transform" referrerPolicy="no-referrer" @click.stop="selectedPhoto = item.text3" />
                        <span v-else class="text-xs text-gray-500">--</span>
                      </div>
                    </td>
                    <td class="px-4 py-4 text-sm text-gray-300">{{ item.text4 }}</td>
                    <td class="px-4 py-4">
                      <div class="flex justify-center">
                        <img v-if="item.text5" :src="item.text5" class="w-20 h-15 object-cover rounded-lg border border-white/10 cursor-pointer hover:scale-110 transition-transform" referrerPolicy="no-referrer" @click.stop="selectedPhoto = item.text5" />
                        <span v-else class="text-xs text-gray-500">--</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="h-32 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl opacity-50">
              <p class="text-sm">暂无隐患排查数据</p>
            </div>
          </div>

          <!-- 其他重要事项 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <AlertCircle :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">其他重要事项</span>
            </div>
            <div class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ otherMatters }}
            </div>
          </div>
        </div>

        <!-- 培训照片 Tab -->
        <div v-else-if="activeTab === 'photos'" :key="'photos'" class="flex flex-col gap-6">
          <div class="flex items-center gap-2 text-[#FFE600]">
            <Camera :size="16" />
            <span class="font-bold text-xs tracking-widest uppercase">EHS培训及现场照片</span>
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div 
              v-for="(photo, index) in trainingPhotos" 
              :key="index"
              @click="selectedPhoto = photo.url"
              class="group relative aspect-[4/3] bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#FFE600]/50 transition-all duration-300"
            >
              <img 
                :src="photo.url" 
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div v-if="trainingPhotos.length === 0" class="h-64 flex items-center justify-center opacity-50">
            <p class="text-sm">暂无培训照片</p>
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
            >
              <Maximize2 v-if="!isFullscreen" :size="20" />
              <Minimize2 v-else :size="20" />
            </button>
            <button 
              @click="closePhoto"
              class="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
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
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { 
  ClipboardList, AlertCircle, Camera, Zap,
  GraduationCap, BookOpen, ShieldCheck, Search,
  X, Maximize2, Minimize2
} from 'lucide-vue-next';
import { fetchEHSReportDetail } from '../../api/projectApi';

const props = defineProps<{
  report: any;
}>();

const tabs = [
  { id: 'summary', label: '工作总结' },
  { id: 'plan', label: '下周工作计划' },
  { id: 'hazard', label: '隐患排查和其他事项' },
  { id: 'photos', label: '培训照片' },
];

const activeTab = ref('summary');
const selectedPhoto = ref<string | null>(null);
const isFullscreen = ref(false);
const loading = ref(false);
const error = ref('');

// ========== 数据字段 ==========
// 工作总结
const specialWork = ref('');
const educationCount = ref('');
const trainingSummaryCount = ref('');
const training = ref('');

// 下周工作计划
const planContent = ref('');
const planTraining = ref('');

// 隐患排查和其他事项
const hazardInspections = ref<any[]>([]);
const otherMatters = ref('');

// 培训照片
const trainingPhotos = ref<{ url: string }[]>([]);

const safeStr = (v: any): string => (v == null ? '' : String(v));

/** 加载 EHS 周报详情 */
async function loadDetail() {
  const reportId = props.report?.id;
  if (!reportId) return;

  loading.value = true;
  error.value = '';

  try {
    const { secureWeekly: sw } = await fetchEHSReportDetail(reportId);

    // === 工作总结 ===
    specialWork.value = safeStr(sw.aqgzzj?.text1);
    educationCount.value = safeStr(sw.aqgzzj?.text2);
    trainingSummaryCount.value = safeStr(sw.aqgzzj?.text3);
    training.value = safeStr(sw.aqgzzj?.text9);

    // === 下周工作计划 ===
    planContent.value = safeStr(sw.aqxzgzjh?.text1);
    planTraining.value = safeStr(sw.aqxzgzjh?.text2);

    // === 隐患排查 ===
    hazardInspections.value = sw.aqjcyyhpc || [];

    // === 其他重要事项 ===
    otherMatters.value = safeStr(sw.aqqtzysx?.text1);

    // === 培训照片（四张固定） ===
    const photoUrls = [
      safeStr(sw.xchjjkgkgzzj?.text5),
      safeStr(sw.xchjjkgkgzzj?.text6),
      safeStr(sw.xchjjkgkgzzj?.text7),
      safeStr(sw.xchjjkgkgzzj?.text8),
    ].filter(Boolean);
    trainingPhotos.value = photoUrls.map(url => ({ url }));

  } catch (e: any) {
    console.error('加载EHS周报详情失败:', e);
    error.value = '加载EHS周报详情失败，请稍后重试';
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

// 切换EHS周报时重新加载
watch(() => props.report?.id, () => {
  activeTab.value = 'summary';
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
