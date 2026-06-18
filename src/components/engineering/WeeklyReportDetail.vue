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
        <p class="text-sm">加载周报详情...</p>
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
        <!-- 进度与内容 Tab -->
        <div v-if="activeTab === 'progress'" :key="'progress'" class="flex flex-col gap-8">
          <!-- Progress Bars -->
          <div class="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8">
            <!-- 当前总进度 -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2 text-[#FFE600]">
                  <TrendingUp :size="16" />
                  <span class="font-bold text-xs tracking-widest uppercase">当前总进度</span>
                </div>
                <span class="text-[#FFE600] font-bold text-lg">{{ animatedCurrentProgress }}%</span>
              </div>
              <div class="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  class="h-full bg-gradient-to-r from-[#FFE600] to-[#FF8C42] rounded-full transition-all duration-1500 ease-out"
                  :style="{ width: `${animatedCurrentProgress}%` }"
                ></div>
              </div>
            </div>

            <!-- 原计划进度 -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2 text-[#FFE600]">
                  <Calendar :size="16" />
                  <span class="font-bold text-xs tracking-widest uppercase">原计划进度</span>
                </div>
                <span class="text-[#FFE600] font-bold text-lg">{{ animatedPlannedProgress }}%</span>
              </div>
              <div class="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  class="h-full bg-gradient-to-r from-[#FFE600] to-[#FF8C42] rounded-full transition-all duration-1500 ease-out opacity-50"
                  :style="{ width: `${animatedPlannedProgress}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- 主要施工内容及劳动力安排 & 进度偏差分析 -->
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-[#FFE600]">
                <Hammer :size="16" />
                <span class="font-bold text-xs tracking-widest uppercase">主要施工内容及劳动力安排</span>
              </div>
              <div class="w-full h-[220px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
                {{ mainContent }}
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-2 text-[#FFE600]">
                <AlertCircle :size="16" />
                <span class="font-bold text-xs tracking-widest uppercase">进度偏差分析与应对措施</span>
              </div>
              <div class="w-full h-[220px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
                {{ deviationAnalysis }}
              </div>
            </div>
          </div>
        </div>

        <!-- 质量检查 Tab -->
        <div v-else-if="activeTab === 'quality'" :key="'quality'" class="flex flex-col gap-8">
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <ShieldCheck :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">质量检查与验收</span>
            </div>
            <div class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ qualityCheck }}
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <ClipboardList :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">问题整改</span>
            </div>
            <div class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ qualityRectification }}
            </div>
          </div>
        </div>

        <!-- 问题与解决 Tab -->
        <div v-else-if="activeTab === 'issues'" :key="'issues'" class="grid grid-cols-2 gap-8">
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <AlertCircle :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">现场问题</span>
            </div>
            <div class="w-full h-[250px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ siteIssues }}
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <FileCheck :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">解决方案与进展</span>
            </div>
            <div class="w-full h-[250px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ solutions }}
            </div>
          </div>
        </div>

        <!-- 下周计划与内容 Tab -->
        <div v-else-if="activeTab === 'next_week'" :key="'next_week'" class="flex flex-col gap-8">
          <!-- 计划施工内容 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <Calendar :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">计划施工内容</span>
            </div>
            <div class="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar" style="max-height:320px">
              <div v-if="nextWeekPlanItems.length > 0">
                <div v-for="(item, idx) in nextWeekPlanItems" :key="idx" class="mb-4 last:mb-0">
                  <div class="text-[#FFE600]/70 text-xs mb-1">#{{ idx + 1 }}</div>
                  <div v-if="item.text1" class="text-sm">施工区域：{{ item.text1 }}</div>
                  <div v-if="item.text2" class="text-sm">施工内容：{{ item.text2 }}</div>
                  <div v-if="item.text3" class="text-sm">计划完成时间：{{ item.text3 }}</div>
                  <div v-if="item.text4" class="text-sm">备注：{{ item.text4 }}</div>
                </div>
              </div>
              <div v-else class="text-white/30">暂无计划</div>
            </div>
          </div>

          <!-- 资源需求 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <Package :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">资源需求</span>
            </div>
            <div class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ resourceNeeds }}
            </div>
          </div>
        </div>

        <!-- 其他事项 Tab -->
        <div v-else-if="activeTab === 'others'" :key="'others'" class="flex flex-col gap-8">
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <MessageSquare :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">需甲方确认事项</span>
            </div>
            <div class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ clientConfirmation }}
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[#FFE600]">
              <MoreHorizontal :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">其他未尽事项</span>
            </div>
            <div class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm overflow-y-auto whitespace-pre-wrap custom-scrollbar">
              {{ otherMatters }}
            </div>
          </div>
        </div>

        <!-- 现场照片 Tab -->
        <div v-else-if="activeTab === 'photos'" :key="'photos'" class="flex flex-col gap-6">
          <div class="flex items-center gap-2 text-[#FFE600]">
            <Camera :size="16" />
            <span class="font-bold text-xs tracking-widest uppercase">现场施工照片</span>
          </div>
          <div class="grid grid-cols-3 gap-6">
            <div 
              v-for="(photo, index) in photos" 
              :key="index"
              @click="selectedPhoto = photo.imgUrl"
              class="group relative aspect-[4/3] bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#FFE600]/50 transition-all duration-300"
            >
              <img 
                :src="photo.imgUrl" 
                :alt="photo.text"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <span class="text-white text-xs font-medium">{{ photo.text }}</span>
              </div>
            </div>
          </div>
          <div v-if="photos.length === 0" class="h-64 flex items-center justify-center opacity-50">
            <p class="text-sm">暂无现场照片</p>
          </div>
        </div>

        <!-- 验收记录 Tab -->
        <div v-else-if="activeTab === 'acceptance'" :key="'acceptance'" class="flex flex-col gap-6">
          <div class="flex items-center gap-2 text-[#FFE600]">
            <FileCheck :size="16" />
            <span class="font-bold text-xs tracking-widest uppercase">验收记录与报告</span>
          </div>
          <div class="grid grid-cols-3 gap-6">
            <div 
              v-for="(doc, index) in acceptanceRecords" 
              :key="index"
              class="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-6 hover:bg-white/10 transition-all duration-300"
            >
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-[#FFE600]/10 flex items-center justify-center text-[#FFE600]">
                  <FileText :size="24" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-white font-bold text-sm leading-tight break-all">{{ doc.name }}</h4>
                  <!-- 大小和日期暂不展示 -->
                  <!-- <p class="text-gray-400 text-xs">{{ doc.size }} · {{ doc.date }}</p> -->
                </div>
              </div>
              <button
                @click="handleAcceptanceDownload(doc.fileUrl)"
                class="w-full py-2.5 bg-white/5 hover:bg-[#FFE600] hover:text-[#260A2F] border border-white/10 hover:border-[#FFE600] rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Download :size="14" />
                下载文件
              </button>
            </div>
          </div>
          <div v-if="acceptanceRecords.length === 0" class="h-64 flex items-center justify-center opacity-50">
            <p class="text-sm">暂无验收记录</p>
          </div>
        </div>

        <!-- Fallback -->
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
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { 
  TrendingUp, Calendar, Hammer, AlertCircle,
  ShieldCheck, ClipboardList, MoreHorizontal,
  Camera, FileCheck, Package, MessageSquare,
  Download, FileText, X, Maximize2, Minimize2
} from 'lucide-vue-next';
import { fetchWeeklyReportDetail, downloadFileFromUrl } from '../../api/projectApi';

const props = defineProps<{
  report: any;
}>();

const tabs = [
  { id: 'progress', label: '进度与内容' },
  { id: 'quality', label: '质量检查' },
  { id: 'issues', label: '问题与解决' },
  { id: 'next_week', label: '下周计划与内容' },
  { id: 'others', label: '其他事项' },
  { id: 'photos', label: '现场照片' },
  { id: 'acceptance', label: '验收记录' },
];

const activeTab = ref('progress');
const selectedPhoto = ref<string | null>(null);
const isFullscreen = ref(false);
const loading = ref(false);
const error = ref('');

// ========== 数据字段 ==========
// 进度
const rawCurrentProgress = ref(0);
const rawPlannedProgress = ref(0);
const animatedCurrentProgress = ref(0);
const animatedPlannedProgress = ref(0);
const mainContent = ref('');
const deviationAnalysis = ref('');

// 质量
const qualityCheck = ref('');
const qualityRectification = ref('');

// 问题与解决
const siteIssues = ref('');
const solutions = ref('');

// 下周计划
const nextWeekPlanItems = ref<any[]>([]);
const resourceNeeds = ref('');

// 其他事项
const clientConfirmation = ref('');
const otherMatters = ref('');

// 现场照片
const photos = ref<any[]>([]);

// 验收记录
const acceptanceRecords = ref<any[]>([]);

const safeStr = (v: any): string => (v == null ? '' : String(v));

/** 解析百分比数字 */
function parsePercent(val: any): number {
  const s = safeStr(val).replace('%', '').trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : Math.min(100, Math.max(0, n));
}

/** 触发进度条动画 */
function animateProgressBars() {
  animatedCurrentProgress.value = 0;
  animatedPlannedProgress.value = 0;
  nextTick(() => {
    setTimeout(() => {
      animatedCurrentProgress.value = rawCurrentProgress.value;
      animatedPlannedProgress.value = rawPlannedProgress.value;
    }, 100);
  });
}

/** 加载周报详情 */
async function loadDetail() {
  const reportId = props.report?.id;
  if (!reportId) return;

  loading.value = true;
  error.value = '';

  try {
    const { weeklyJson: wj } = await fetchWeeklyReportDetail(reportId);

    // === 进度与内容 ===
    rawCurrentProgress.value = parsePercent(wj.bzsgjdhz?.text1);
    rawPlannedProgress.value = parsePercent(wj.bzsgjdhz?.text2);
    // mainContent.value = [safeStr(wj.bzsgnrgs?.text1), safeStr(wj.bzsgnrgs?.text2)]
    //   .filter(Boolean).join('\n');
    mainContent.value = safeStr(wj.bzsgnrgs?.text1)
    deviationAnalysis.value = safeStr(wj.bzsgjdhz?.text3)

    // === 质量检查 ===
    qualityCheck.value = safeStr(wj.bzzljc?.text1);
    qualityRectification.value = safeStr(wj.bzzljc?.text2);

    // === 问题与解决 ===
    siteIssues.value = safeStr(wj.wtyjj?.text1)
    solutions.value = safeStr(wj.wtyjj?.text4)

    // === 下周计划 ===
    nextWeekPlanItems.value = wj.jhsgnr || [];

    resourceNeeds.value = safeStr(wj.xzsgjhywcsx?.text1)

    // === 其他事项 ===
    clientConfirmation.value = safeStr(wj.qtsx?.text1);
    otherMatters.value = safeStr(wj.qtsx?.text3);

    // === 现场照片 ===
    photos.value = wj.xczp || [];

    // === 验收记录 ===
    acceptanceRecords.value = wj.ysjlybg || [];

    // 触发进度条动画
    animateProgressBars();

  } catch (e: any) {
    console.error('加载周报详情失败:', e);
    error.value = '加载周报详情失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}

/** 下载验收记录文件 */
async function handleAcceptanceDownload(fileUrl: string) {
  if (!fileUrl) return;
  try {
    const fileName = fileUrl.split('/').pop() || '验收文件';
    await downloadFileFromUrl(fileUrl, fileName);
  } catch (e) {
    console.error('下载验收文件失败:', e);
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

// 切换周报时重新加载
watch(() => props.report?.id, () => {
  activeTab.value = 'progress';
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
