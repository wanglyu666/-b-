<template>
  <div class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
    <!-- Sub Tabs -->
    <div v-if="!isSubmittedSuccess" class="mb-6 flex items-center justify-between gap-4">
      <div class="flex gap-3">
        <button 
          v-if="props.nodeStatus !== '1'"
          @click="setTab('acceptance_check')"
          :class="['px-6 py-2 rounded-full text-sm font-bold transition-all', 
            progressDetailTab === 'acceptance_check' ? 'bg-[#FFE600] text-[#260A2F]' : 'bg-white/5 text-white/60 hover:bg-white/10']"
        >
          验收
        </button>
        <button 
          @click="setTab('defect_rectification')"
          :class="['px-6 py-2 rounded-full text-sm font-bold transition-all', 
            progressDetailTab === 'defect_rectification' ? 'bg-[#FFE600] text-[#260A2F]' : 'bg-white/5 text-white/60 hover:bg-white/10']"
        >
          缺陷整改
        </button>
      </div>
      <button
        v-if="progressDetailTab === 'defect_rectification'"
        type="button"
        class="flex shrink-0 items-center gap-2 rounded-full bg-[#FFE600] px-6 py-2 text-sm font-bold text-[#260A2F] transition-all hover:bg-[#e6cf00] active:scale-95"
        @click="$emit('addDefect')"
      >
        <Plus :size="16" />
        新增缺陷
      </button>
    </div>

    <Transition name="fade-slide" mode="out-in">
      <!-- Success Screen -->
      <div v-if="isSubmittedSuccess" :key="'success'" class="flex flex-col items-center justify-center py-20 gap-8 animate-in fade-in zoom-in-95 duration-500">
        <img :src="checkMarkImg" alt="" class="h-36 w-56 object-contain" />
        <div class="text-center">
          <h3 class="text-3xl font-bold text-white mb-2">已完成提交</h3>
          <p class="text-white/40">您的验收评价已成功记录到系统中</p>
        </div>
        <button 
          @click="$emit('goBack')"
          class="h-14 px-12 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl transition-all border border-white/10"
        >
          返回上级页面
        </button>
      </div>

      <!-- Acceptance Check Content -->
      <div v-else-if="progressDetailTab === 'acceptance_check'" :key="'check'" class="flex flex-col gap-16">
        <!-- Loading -->
        <div v-if="detailLoading" class="h-64 flex items-center justify-center opacity-50">
          <div class="w-10 h-10 border-2 border-white/20 border-t-[#FFE600] rounded-full animate-spin mb-4"></div>
        </div>

        <template v-else>
          <!-- Top Section: Info & Images -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Left: Progress Info -->
            <div class="grid grid-cols-2 gap-y-12 gap-x-16 py-6">
              <div>
                <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">验收节点名称</p>
                <p class="text-white text-2xl font-bold tracking-tight">{{ nodeForm.nodeName }}</p>
              </div>
              <div class="flex flex-col gap-12">
                <div>
                  <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">计划验收时间</p>
                  <p class="text-white text-2xl font-bold font-mono tracking-tight">{{ nodeForm.planTime }}</p>
                </div>
                <div>
                  <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">预约验收时间</p>
                  <p class="text-white text-2xl font-bold font-mono tracking-tight">{{ nodeForm.xmzYuyueTime }}</p>
                </div>
              </div>
            </div>

            <!-- Right: Images -->
            <div v-if="controlImages.length > 0" class="relative group cursor-pointer overflow-hidden rounded-[48px] border border-white/10 bg-white/5 backdrop-blur-xl aspect-[16/9] max-h-[280px] flex items-center justify-center shadow-2xl">
              <!-- Image carousel -->
              <div class="relative w-full h-full">
                <div 
                  class="flex h-full transition-transform duration-500 ease-out"
                  :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }"
                >
                  <img 
                    v-for="(img, idx) in controlImages" 
                    :key="idx"
                    :src="img" 
                    class="h-full w-full shrink-0 object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <!-- Nav arrows -->
                <button
                  v-if="controlImages.length > 1"
                  @click.stop="prevImage"
                  class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all"
                >
                  <ChevronLeft :size="22" />
                </button>
                <button
                  v-if="controlImages.length > 1"
                  @click.stop="nextImage"
                  class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all"
                >
                  <ChevronRight :size="22" />
                </button>
                <!-- Click to zoom -->
                <div @click="zoomCurrentImage" class="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div class="bg-white/20 backdrop-blur-md p-5 rounded-full border border-white/30 shadow-lg">
                    <Search :size="32" class="text-white" />
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flex items-center justify-center rounded-[48px] border border-white/10 bg-white/5 aspect-[16/9] max-h-[280px] text-white/30">
              暂无验收图片
            </div>
          </div>

          <!-- Bottom Section: Evaluation & Buttons -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-white/5 items-center">
            <div class="lg:col-span-7 flex items-center gap-10">
              <template v-if="props.ysStatus === '1' && !isSubmitted">
                <span class="text-xl font-bold text-white whitespace-nowrap tracking-tight">验收评价</span>
                <div class="flex items-center gap-12">
                  <button 
                    v-for="opt in [{id: 'pass', label: '通过'}, {id: 'fail', label: '不通过'}]" 
                    :key="opt.id"
                    @click="evaluation = opt.id as any"
                    class="flex items-center gap-4 group cursor-pointer"
                  >
                    <div 
                      :class="[
                        'w-7 h-7 rounded-full border-2 transition-all duration-300 flex items-center justify-center',
                        evaluation === opt.id ? 'border-[#FFE600] bg-[#FFE600]/10' : 'border-white/20 group-hover:border-white/40'
                      ]"
                    >
                      <div v-if="evaluation === opt.id" class="w-3 h-3 rounded-full bg-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.8)]"></div>
                    </div>
                    <span :class="['text-xl font-bold transition-colors', evaluation === opt.id ? 'text-white' : 'text-white/40 group-hover:text-white/60']">{{ opt.label }}</span>
                  </button>
                </div>
              </template>
              <template v-else-if="props.ysStatus !== '1' && !isSubmitted">
                <span class="text-xl font-bold text-white whitespace-nowrap tracking-tight">验收评价</span>
                <div class="flex items-center gap-12">
                  <div class="flex items-center gap-4 opacity-40">
                    <div class="w-7 h-7 rounded-full border-2 border-white/20 flex items-center justify-center">
                      <div class="w-3 h-3 rounded-full bg-white/20"></div>
                    </div>
                    <span class="text-xl font-bold text-white/40">通过</span>
                  </div>
                  <div class="flex items-center gap-4 opacity-40">
                    <div class="w-7 h-7 rounded-full border-2 border-white/20 flex items-center justify-center"></div>
                    <span class="text-xl font-bold text-white/40">不通过</span>
                  </div>
                </div>
              </template>
              <div v-else class="flex items-center gap-3 text-[#A1D573]">
                <CheckCircle :size="24" />
                <span class="text-xl font-bold tracking-tight">验收已完成</span>
              </div>
            </div>

            <div class="lg:col-span-5 flex items-center justify-end gap-6">
              <button 
                v-if="props.ysStatus === '1' && !isSubmitted"
                @click="submit"
                :disabled="!evaluation"
                :class="[
                  'h-18 px-16 font-bold text-xl rounded-2xl transition-all shadow-[0_10px_40px_rgba(255,230,0,0.3)] active:scale-[0.95]',
                  evaluation ? 'bg-[#FFE600] hover:bg-[#e6cf00] text-[#260A2F]' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5 shadow-none'
                ]"
              >
                提交
              </button>
              <button v-else-if="isSubmitted" disabled class="h-18 px-12 bg-white/5 text-white/40 font-bold text-xl rounded-2xl border border-white/10 cursor-not-allowed">
                已完成提交
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Defect Rectification Content -->
      <div v-else-if="progressDetailTab === 'defect_rectification'" :key="'defect'" class="relative flex h-full min-h-[400px] flex-1 flex-col">
        <!-- Loading -->
        <div v-if="defectLoading" class="h-64 flex items-center justify-center opacity-50">
          <div class="w-10 h-10 border-2 border-white/20 border-t-[#FFE600] rounded-full animate-spin mb-4"></div>
        </div>

        <template v-else>
          <div class="custom-scrollbar flex-1 overflow-y-auto pr-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
              <div 
                v-for="(defect, index) in defectList" 
                :key="defect.id"
                @click="$emit('viewDefectDetail', defect)"
                class="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500 cursor-pointer hover:border-white/20"
                :style="{ animationDelay: `${index * 80}ms` }"
              >
                <div class="aspect-[4/3] overflow-hidden relative">
                  <img :src="defect.defectFile" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                </div>
                <div class="p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-white/30 text-[9px] font-mono uppercase tracking-widest">{{ defect.createTime }}</span>
                  </div>
                  <p class="text-white/70 leading-relaxed text-xs line-clamp-2">{{ defect.defectDescribe }}</p>
                </div>
              </div>

              <div v-if="defectList.length === 0" class="col-span-full h-40 flex items-center justify-center text-white/30">
                暂无缺陷整改数据
              </div>
            </div>
          </div>

          <!-- Defect Pagination -->
          <div v-if="defectTotalPages > 1" class="flex items-center justify-center gap-2 pt-4 pb-2">
            <button @click="goToDefectPage(defectCurrentPage - 1)" :disabled="defectCurrentPage <= 1"
              class="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/70 transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed">上一页</button>
            <button v-for="page in defectVisiblePages" :key="page" @click="goToDefectPage(page)"
              class="w-9 h-9 rounded-lg border text-sm font-bold transition-all"
              :class="page === defectCurrentPage ? 'border-[#FFE600] bg-[#FFE600] text-[#260A2F]' : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'">{{ page }}</button>
            <button @click="goToDefectPage(defectCurrentPage + 1)" :disabled="defectCurrentPage >= defectTotalPages"
              class="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/70 transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed">下一页</button>
          </div>
        </template>
      </div>
      <div v-else :key="'fallback'" class="hidden"></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Search, CheckCircle, Plus, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import checkMarkImg from '../../../image asset/check mark.png';
import { fetchProgressNodeDetail, fetchDefectList, updateYsStatus, type DefectItem } from '../../api/projectApi';

const props = defineProps<{
  nodeId: number;
  nodeName: string;
  spotOrderId: string;
  isSubmitted: boolean;
  nodeStatus?: string;
  ysStatus?: string;
  initialTab?: 'acceptance_check' | 'defect_rectification';
}>();

const emit = defineEmits(['goBack', 'zoomImage', 'submit', 'addDefect', 'viewDefectDetail', 'update:tab']);

// ========== 所有 ref 声明必须在 watch 之前 ==========

// 标签页
const progressDetailTab = ref(props.initialTab || 'acceptance_check');

// 验收标签页
const detailLoading = ref(false);
const nodeForm = ref<Record<string, any>>({});
const controlImages = ref<string[]>([]);
const currentImageIndex = ref(0);

// 缺陷整改标签页
const defectLoading = ref(false);
const defectList = ref<DefectItem[]>([]);
const defectCurrentPage = ref(1);
const defectTotal = ref(0);
const defectPageSize = 10;

// 提交相关
const isSubmittedSuccess = ref(false);
const evaluation = ref<'pass' | 'fail' | null>(null);

// ========== computed ==========

const defectTotalPages = computed(() => Math.ceil(defectTotal.value / defectPageSize) || 1);

const defectVisiblePages = computed(() => {
  const pages: number[] = [];
  const tp = defectTotalPages.value;
  const cp = defectCurrentPage.value;
  let start = Math.max(1, cp - 2);
  let end = Math.min(tp, cp + 2);
  if (end - start < 4) {
    if (start === 1) end = Math.min(tp, start + 4);
    else start = Math.max(1, end - 4);
  }
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// ========== 函数声明 ==========

async function loadNodeDetail() {
  if (!props.nodeId) return;
  detailLoading.value = true;
  try {
    const res = await fetchProgressNodeDetail(props.nodeId);
    nodeForm.value = res.form;
    controlImages.value = res.controlDataList.map(item => item.fileUrl).filter(Boolean);
    currentImageIndex.value = 0;
  } catch (e) {
    console.error('加载节点详情失败:', e);
  } finally {
    detailLoading.value = false;
  }
}

function prevImage() {
  if (controlImages.value.length > 1) {
    currentImageIndex.value = (currentImageIndex.value - 1 + controlImages.value.length) % controlImages.value.length;
  }
}

function nextImage() {
  if (controlImages.value.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % controlImages.value.length;
  }
}

function zoomCurrentImage() {
  if (controlImages.value[currentImageIndex.value]) {
    emit('zoomImage', controlImages.value[currentImageIndex.value]);
  }
}

async function loadDefectList() {
  if (!props.spotOrderId || !props.nodeName) return;
  defectLoading.value = true;
  try {
    const res = await fetchDefectList(props.spotOrderId, props.nodeName, defectCurrentPage.value, defectPageSize);
    defectList.value = res.list;
    defectTotal.value = res.total;
  } catch (e) {
    console.error('加载缺陷列表失败:', e);
  } finally {
    defectLoading.value = false;
  }
}

function goToDefectPage(page: number) {
  if (page < 1 || page > defectTotalPages.value) return;
  defectCurrentPage.value = page;
  loadDefectList();
}

const setTab = (tab: 'acceptance_check' | 'defect_rectification') => {
  progressDetailTab.value = tab;
  emit('update:tab', tab);
  if (tab === 'acceptance_check') loadNodeDetail();
  if (tab === 'defect_rectification') loadDefectList();
};

const submit = async () => {
  if (!evaluation.value) return;
  // 通过→2 拒绝→3
  nodeForm.value.ysStatus = evaluation.value === 'pass' ? '2' : '3';
  try {
    await updateYsStatus(nodeForm.value);
    isSubmittedSuccess.value = true;
    emit('submit', props.nodeName);
  } catch (error) {
    console.error('提交验收评价失败:', error);
    alert('提交失败，请稍后重试');
  }
};

// ========== watch 必须放在所有 ref 声明之后 ==========

watch(() => props.initialTab, (newVal) => {
  if (newVal) progressDetailTab.value = newVal;
});

watch(() => props.nodeId, (newVal) => {
  if (!newVal) return;
  if (progressDetailTab.value === 'acceptance_check') loadNodeDetail();
  if (progressDetailTab.value === 'defect_rectification') loadDefectList();
}, { immediate: true });
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

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
</style>
