<template>
  <div class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
    <!-- Sub Tabs -->
    <div class="flex gap-3">
      <button 
        @click="setTab('material')"
        :class="['px-6 py-2 rounded-full text-sm font-bold transition-all', 
          acceptanceTab === 'material' ? 'bg-[#FFE600] text-[#260A2F]' : 'bg-white/5 text-white/60 hover:bg-white/10']"
      >
        材料管控
      </button>
      <button 
        @click="setTab('progress')"
        :class="['px-6 py-2 rounded-full text-sm font-bold transition-all', 
          acceptanceTab === 'progress' ? 'bg-[#FFE600] text-[#260A2F]' : 'bg-white/5 text-white/60 hover:bg-white/10']"
      >
        进度管控
      </button>
    </div>

    <Transition name="fade-slide" mode="out-in">
      <!-- Material Content -->
      <div v-if="acceptanceTab === 'material'" :key="'material'" class="flex flex-col gap-8">
        <!-- Loading -->
        <div v-if="materialLoading" class="h-64 flex flex-col items-center justify-center opacity-50">
          <div class="w-10 h-10 border-2 border-white/20 border-t-[#FFE600] rounded-full animate-spin mb-4"></div>
          <p class="text-sm text-white/40">加载中...</p>
        </div>

        <template v-else>
          <!-- Table 1: Material List -->
          <div class="bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-inner">
            <div class="px-8 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h3 class="text-white font-bold flex items-center gap-2">
                  <div class="w-1 h-4 bg-[#FFE600] rounded-full shadow-[0_0_8px_rgba(255,230,0,0.4)]"></div>
                  材料清单
              </h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest font-bold">
                    <th class="px-6 py-3">专业</th>
                    <th class="px-6 py-3">品类</th>
                    <th class="px-6 py-3">物料编码</th>
                    <th class="px-6 py-3">物料名称</th>
                    <th class="px-6 py-3">品牌</th>
                    <th class="px-6 py-3">规格型号</th>
                    <th class="px-6 py-3">单位</th>
                    <th class="px-6 py-3">备注</th>
                  </tr>
                </thead>
                <tbody class="text-white/80 text-xs">
                  <tr v-for="(item, i) in materialBrandList" :key="i" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td class="px-6 py-4">{{ getProfessionLabel(item.professionType) }}</td>
                    <td class="px-6 py-4">{{ item.categoryName }}</td>
                    <td class="px-6 py-4 font-mono">{{ item.materialCode }}</td>
                    <td class="px-6 py-4">{{ item.materialName }}</td>
                    <td class="px-6 py-4">{{ item.brand }}</td>
                    <td class="px-6 py-4">{{ item.specification }}</td>
                    <td class="px-6 py-4">{{ item.unit }}</td>
                    <td class="px-6 py-4 text-white/40 italic">{{ item.remark || '-' }}</td>
                  </tr>
                  <tr v-if="materialBrandList.length === 0">
                    <td colspan="8" class="px-6 py-12 text-center text-white/30">暂无材料清单数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Table 2: Entry Plan -->
          <div class="bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-inner">
            <div class="px-8 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h3 class="text-white font-bold flex items-center gap-2">
                  <div class="w-1 h-4 bg-[#FFE600] rounded-full shadow-[0_0_8px_rgba(255,230,0,0.4)]"></div>
                  材料进场计划
              </h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest font-bold">
                    <th class="px-6 py-3">专业</th>
                    <th class="px-6 py-3">品类</th>
                    <th class="px-6 py-3">物料编码</th>
                    <th class="px-6 py-3">物料名称</th>
                    <th class="px-6 py-3">品牌</th>
                    <th class="px-6 py-3">型号</th>
                    <th class="px-6 py-3">规格</th>
                    <th class="px-6 py-3">单位</th>
                    <th class="px-6 py-3">数量</th>
                    <th class="px-6 py-3">计划进场时间</th>
                    <th class="px-6 py-3">实际进场时间</th>
                    <th class="px-6 py-3">备注</th>
                  </tr>
                </thead>
                <tbody class="text-white/80 text-xs">
                  <tr v-for="(item, i) in materialEntryPlanList" :key="i" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td class="px-6 py-4">{{ getProfessionLabel(item.professionType) }}</td>
                    <td class="px-6 py-4">{{ item.categoryName }}</td>
                    <td class="px-6 py-4 font-mono">{{ item.materialCode }}</td>
                    <td class="px-6 py-4">{{ item.materialName }}</td>
                    <td class="px-6 py-4">{{ item.brand }}</td>
                    <td class="px-6 py-4">{{ item.model }}</td>
                    <td class="px-6 py-4">{{ item.specification }}</td>
                    <td class="px-6 py-4">{{ item.unit }}</td>
                    <td class="px-6 py-4 font-bold">{{ item.num || '-' }}</td>
                    <td class="px-6 py-4 font-mono">{{ item.entrytime }}</td>
                    <td class="px-6 py-4 font-mono text-white/80">{{ item.actualentrytime || '-' }}</td>
                    <td class="px-6 py-4 text-white/40 italic">{{ item.remark || '-' }}</td>
                  </tr>
                  <tr v-if="materialEntryPlanList.length === 0">
                    <td colspan="12" class="px-6 py-12 text-center text-white/30">暂无材料进场计划数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
      </div>

      <!-- Progress Content -->
      <div v-else :key="'progress'" class="flex flex-col gap-8">
        <!-- Loading -->
        <div v-if="progressLoading" class="h-64 flex flex-col items-center justify-center opacity-50">
          <div class="w-10 h-10 border-2 border-white/20 border-t-[#FFE600] rounded-full animate-spin mb-4"></div>
          <p class="text-sm text-white/40">加载中...</p>
        </div>

        <template v-else>
          <div class="w-full max-w-3xl mx-auto bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-inner">
            <div class="px-4 sm:px-5 py-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h3 class="text-white font-bold flex items-center gap-2">
                  <div class="w-1 h-4 bg-[#FFE600] rounded-full shadow-[0_0_8px_rgba(255,230,0,0.4)]"></div>
                  进度验收节点
              </h3>
            </div>
            <div class="px-3 sm:px-4 pb-4">
              <div class="overflow-x-auto rounded-xl">
                <table class="w-full table-fixed border-collapse text-left">
                  <colgroup>
                    <col class="w-[24%]" />
                    <col class="w-[15%]" />
                    <col class="w-[15%]" />
                    <col class="w-[14%]" />
                    <col class="w-[12%]" />
                    <col class="w-[20%]" />
                  </colgroup>
                  <thead>
                    <tr class="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest font-bold">
                      <th class="px-3 py-2.5">验收节点名称</th>
                      <th class="px-3 py-2.5 whitespace-nowrap">计划验收时间</th>
                      <th class="px-3 py-2.5 whitespace-nowrap">预约验收时间</th>
                      <th class="px-3 py-2.5">验收类型</th>
                      <th class="px-3 py-2.5">验收状态</th>
                      <th class="px-3 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody class="text-white/80 text-xs">
                    <tr v-for="(item, i) in progressNodeList" :key="i" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td class="px-3 py-3 align-middle truncate" :title="item.nodeName">{{ item.nodeName }}</td>
                      <td class="px-3 py-3 font-mono whitespace-nowrap align-middle">{{ item.planTime }}</td>
                      <td class="px-3 py-3 font-mono whitespace-nowrap align-middle">
                        {{ item.status === '1' ? item.xmzYuyueTime : item.kfYuyueTime }}
                      </td>
                      <td class="px-3 py-3 align-middle">
                        {{ item.status === '1' 
                          ? (item.xmzType === '1' ? '线上验收' : item.xmzType === '2' ? '现场验收' : '')
                          : (item.kfType === '1' ? '线上验收' : item.kfType === '2' ? '现场验收' : '') }}
                      </td>
                      <td class="px-3 py-3 align-middle">
                        <span :class="[
                          'inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap',
                          item.ysStatus === '2' ? 'bg-[#A1D573]/20 text-[#A1D573]' : 'bg-rose-500/20 text-rose-400'
                        ]">
                          {{ item.ysStatus === '1' ? '未通过' : item.ysStatus === '2' ? '已通过' : '拒绝' }}
                        </span>
                      </td>
                      <td class="px-3 py-3 align-middle min-w-0">
                        <div class="w-full flex items-center justify-between gap-2">
                          <button 
                            v-if="item.status === '1'"
                            @click="$emit('scheduleAcceptance', item)"
                           
                            :class="[
                              'px-4 py-1.5 rounded-full text-xs font-bold transition-colors','bg-[#FFE600] hover:bg-[#e6cf00] text-[#260A2F]'
                            ]"
                          >
                         预约时间
                          </button>
                          <span v-else class="h-7"></span>
                          <button @click="$emit('viewProgressDetail', item)" class="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <MoreHorizontal :size="16" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="progressNodeList.length === 0">
                      <td colspan="6" class="px-3 py-12 text-center text-white/30">暂无进度验收节点数据</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Progress Pagination -->
          <div v-if="progressTotalPages > 1" class="flex items-center justify-center gap-2 pt-2">
            <button
              @click="goToProgressPage(progressCurrentPage - 1)"
              :disabled="progressCurrentPage <= 1"
              class="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/70 transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >上一页</button>
            <button
              v-for="page in progressVisiblePages"
              :key="page"
              @click="goToProgressPage(page)"
              class="w-9 h-9 rounded-lg border text-sm font-bold transition-all"
              :class="page === progressCurrentPage
                ? 'border-[#FFE600] bg-[#FFE600] text-[#260A2F]'
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'"
            >{{ page }}</button>
            <button
              @click="goToProgressPage(progressCurrentPage + 1)"
              :disabled="progressCurrentPage >= progressTotalPages"
              class="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/70 transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >下一页</button>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { MoreHorizontal } from 'lucide-vue-next';
import {
  fetchBidOrderDetail,
  fetchDictData,
  getDictLabel,
  fetchProgressNodes,
  type DictItem,
  type ProgressNodeItem,
} from '../../api/projectApi';

const props = defineProps<{
  spotOrderId: string;
  initialTab?: 'material' | 'progress';
}>();

const emit = defineEmits(['viewProgressDetail', 'scheduleAcceptance', 'update:tab']);

// ========== 所有 ref 声明必须在 watch 之前 ==========

// 标签页
const acceptanceTab = ref<'material' | 'progress'>(props.initialTab || 'material');

// 材料管控
const materialBrandList = ref<any[]>([]);
const materialEntryPlanList = ref<any[]>([]);
const materialLoading = ref(false);
const professionDict = ref<DictItem[]>([]);

// 进度管控
const progressNodeList = ref<ProgressNodeItem[]>([]);
const progressLoading = ref(false);
const progressCurrentPage = ref(1);
const progressTotal = ref(0);
const progressPageSize = 10;

// ========== computed ==========

const progressTotalPages = computed(() => Math.ceil(progressTotal.value / progressPageSize) || 1);

const progressVisiblePages = computed(() => {
  const pages: number[] = [];
  const tp = progressTotalPages.value;
  const cp = progressCurrentPage.value;
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

function getProfessionLabel(value: string): string {
  return getDictLabel(professionDict.value, value);
}

async function loadMaterialData() {
  if (!props.spotOrderId) return;
  materialLoading.value = true;
  try {
    const [dictRes, detailRes] = await Promise.all([
      fetchDictData('xyw_material_profession_type'),
      fetchBidOrderDetail(props.spotOrderId),
    ]);
    professionDict.value = dictRes;
    const draftData = detailRes.draftData;
    materialBrandList.value = draftData.xywmaterialbrandList || [];
    materialEntryPlanList.value = draftData.materialentryplanList || [];
  } catch (e) {
    console.error('加载材料管控数据失败:', e);
    materialBrandList.value = [];
    materialEntryPlanList.value = [];
  } finally {
    materialLoading.value = false;
  }
}

async function loadProgressData() {
  if (!props.spotOrderId) return;
  progressLoading.value = true;
  try {
    const res = await fetchProgressNodes(props.spotOrderId, progressCurrentPage.value, progressPageSize);
    progressNodeList.value = res.list;
    progressTotal.value = res.total;
  } catch (e) {
    console.error('加载进度节点失败:', e);
    progressNodeList.value = [];
    progressTotal.value = 0;
  } finally {
    progressLoading.value = false;
  }
}

function goToProgressPage(page: number) {
  if (page < 1 || page > progressTotalPages.value) return;
  progressCurrentPage.value = page;
  loadProgressData();
}

const setTab = (tab: 'material' | 'progress') => {
  acceptanceTab.value = tab;
  emit('update:tab', tab);
  if (tab === 'material') loadMaterialData();
  if (tab === 'progress') loadProgressData();
};

// ========== watch 必须放在所有 ref 声明之后 ==========

watch(() => props.initialTab, (newVal) => {
  if (newVal) acceptanceTab.value = newVal;
});

watch(() => props.spotOrderId, (newVal) => {
  if (!newVal) return;
  if (acceptanceTab.value === 'material') loadMaterialData();
  if (acceptanceTab.value === 'progress') loadProgressData();
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
</style>
