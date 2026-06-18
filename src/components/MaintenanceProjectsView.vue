<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, X, Star } from 'lucide-vue-next';
import type { MaintenanceProject } from '../types';
import { fetchMaintenanceProjects, fetchSpotOrderWorkerList, confirmSpotOrderCustomer, fetchEvaluation, submitEvaluation as submitEvaluationApi, fetchDictData, getDictLabel, type SpotOrderWorkerItem, type DictItem } from '../api/projectApi';
import type { EvaluationData } from '../api/projectApi';
import MaintenanceProjectCard from './maintenance/MaintenanceProjectCard.vue';
import MaintenanceOverview from './maintenance/MaintenanceOverview.vue';
import checkMarkImg from '../../image asset/check mark.png';

const props = defineProps<{
  initialStatus?: string;
  projects?: MaintenanceProject[];
}>();

const emit = defineEmits(['back']);

const statuses = ['待开工', '施工中', '已完工'] as const;
const activeStatus = ref(props.initialStatus || '待开工');
const projectList = ref<MaintenanceProject[]>([]);
const searchQuery = ref('');
const selectedProject = ref<MaintenanceProject | null>(null);
const viewMode = ref<'details' | 'evaluation' | 'evaluation_success' | 'appointment' | 'confirm_time' | 'confirm_change' | 'confirm_accept' | 'appointment_success' | 'order_suspended' | 'order_abnormal' | 'pending_acceptance' | 'completed'>('details');

const currentPage = ref(1);
const itemsPerPage = 9;
const totalItems = ref(0);
const isLoading = ref(false);

/** 加载维保项目数据 */
async function loadProjects() {
  isLoading.value = true;
  try {
    const result = await fetchMaintenanceProjects(
      activeStatus.value,
      currentPage.value,
      itemsPerPage,
      searchQuery.value || undefined
    );
    projectList.value = result.list as unknown as MaintenanceProject[];
    totalItems.value = result.total;
  } catch (error) {
    console.error('加载维保项目失败:', error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadProjects();
});

watch(activeStatus, () => {
  currentPage.value = 1;
  loadProjects();
});

/** 搜索防抖 */

/** 搜索防抖 */
let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    loadProjects();
  }, 300);
});

watch(currentPage, () => {
  loadProjects();
});

// ==================== 评价 ====================

const evalRating = ref(0);
const evalHoverRating = ref(0);
const evalFeedback = ref('');
const evalLoading = ref(false);
const evalExistingData = ref<EvaluationData | null>(null);

/** 是否可编辑评价（isEvaluate === '1' 且未提交过评价） */
const isEvaluationEditable = computed(() => {
  return selectedProject.value?.isEvaluate === '1';
});

/** 是否已评价过（有回显数据） */
const isAlreadyEvaluated = computed(() => {
  return evalExistingData.value !== null;
});

const evalRatingText = computed(() => {
  const current = evalHoverRating.value || evalRating.value;
  switch (current) {
    case 1: return '非常不满意';
    case 2: return '不满意';
    case 3: return '一般';
    case 4: return '满意';
    case 5: return '非常满意';
    default: return '';
  }
});

const evalIsValid = computed(() => evalRating.value > 0 && evalFeedback.value.trim().length > 0);

const setEvalRating = (val: number) => {
  if (isEvaluationEditable.value && !isAlreadyEvaluated.value) evalRating.value = val;
};

const submitEvaluation = async () => {
  if (!evalIsValid.value || !isEvaluationEditable.value || isAlreadyEvaluated.value || !selectedProject.value) return;
  evalLoading.value = true;
  try {
    await submitEvaluationApi({
      spotOrderId: selectedProject.value.id,
      projectId: selectedProject.value.projectId || selectedProject.value.id,
      syntheticScore: evalRating.value,
      content: evalFeedback.value,
    });
    viewMode.value = 'evaluation_success';
  } catch (e) {
    console.error('提交评价失败:', e);
    alert('提交失败，请稍后重试');
  } finally {
    evalLoading.value = false;
  }
};

// ==================== 预约管理 ====================

const appointmentData = ref<SpotOrderWorkerItem[]>([]);
const appointmentsLoading = ref(false);
const selectedAppointment = ref<SpotOrderWorkerItem | null>(null);
const confirmSubmitLoading = ref(false);

// 预约列表分页
const apptPageNum = ref(1);
const apptPageSize = 10;
const apptTotal = ref(0);
const apptTotalPages = computed(() => Math.max(1, Math.ceil(apptTotal.value / apptPageSize)));

// 状态字典缓存
const wxStatusDict = ref<DictItem[]>([]);

/** 获取预约状态标签 */
const getWxStatusLabel = (item: SpotOrderWorkerItem): string => {
  if (item.wxStatus === '2' && item.yuyueNumber && item.yuyueNumber > 1) {
    return '二次预约上门时间';
  }
  return getDictLabel(wxStatusDict.value, item.wxStatus);
};

/** 加载预约列表 */
async function loadAppointmentData() {
  if (!selectedProject.value) return;
  appointmentsLoading.value = true;
  try {
    // 并行获取列表和字典
    const [result, dictItems] = await Promise.all([
      fetchSpotOrderWorkerList(
        selectedProject.value.projectId || selectedProject.value.id,
        apptPageNum.value,
        apptPageSize
      ),
      fetchDictData('spot_order_wx_status'),
    ]);
    appointmentData.value = result.list;
    apptTotal.value = result.total;
    wxStatusDict.value = dictItems;
  } catch (e) {
    console.error('加载预约列表失败:', e);
  } finally {
    appointmentsLoading.value = false;
  }
}

/** 确认按钮 */
const handleConfirmAppointment = (item: SpotOrderWorkerItem) => {
  selectedAppointment.value = item;
  if (item.wxStatus === '2') {
    viewMode.value = 'confirm_time';
  } else if (item.wxStatus === '3') {
    viewMode.value = 'confirm_change';
  } else if (item.wxStatus === '4') {
    viewMode.value = 'confirm_accept';
  }
};

/** 提交确认 */
const submitConfirm = async () => {
  if (!selectedAppointment.value || confirmSubmitLoading.value) return;
  confirmSubmitLoading.value = true;
  try {
    await confirmSpotOrderCustomer(selectedAppointment.value.id);
    // 刷新当前页数据
    await loadAppointmentData();
    viewMode.value = 'appointment_success';
  } catch (e) {
    console.error('确认失败:', e);
    alert('确认失败，请稍后重试');
  } finally {
    confirmSubmitLoading.value = false;
  }
};

const confirmAcceptance = () => {
  if (selectedAppointment.value && selectedAppointment.value.wxStatus === '4') {
    submitConfirm();
  }
};

const modalDimensions = computed(() => {
  if (viewMode.value === 'details') {
    return { width: '768px', height: '680px', radius: '40px', scale: 1 };
  }
  if (viewMode.value === 'evaluation' || viewMode.value === 'evaluation_success') {
    return { width: '800px', height: '700px', radius: '32px', scale: 1.02 };
  }
  if (viewMode.value === 'appointment') {
    return { width: '960px', height: '720px', radius: '32px', scale: 1.02 };
  }
  if (viewMode.value === 'confirm_time') {
    return { width: '600px', height: '400px', radius: '32px', scale: 1 };
  }
  if (viewMode.value === 'confirm_change') {
    return { width: '600px', height: '500px', radius: '32px', scale: 1 };
  }
  if (viewMode.value === 'confirm_accept') {
    return { width: '860px', height: '680px', radius: '32px', scale: 1.02 };
  }
  if (viewMode.value === 'appointment_success') {
    return { width: '600px', height: '480px', radius: '32px', scale: 1 };
  }
  return { width: '768px', height: '680px', radius: '40px', scale: 1 };
});

const headerTitle = computed(() => {
  if (viewMode.value === 'details') return '项目详情';
  if (viewMode.value === 'evaluation') return '项目评价';
  if (viewMode.value === 'evaluation_success') return '项目评价';
  if (viewMode.value === 'appointment') return '预约管理';
  if (viewMode.value === 'confirm_time') return '确认预约时间';
  if (viewMode.value === 'confirm_change') return '确认变更时间';
  if (viewMode.value === 'confirm_accept') return '确认验收';
  if (viewMode.value === 'appointment_success') return '预约管理';
  return '项目详情';
});

const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage)));

const openModal = (project: MaintenanceProject) => {
  selectedProject.value = project;
  viewMode.value = 'details';
};

const closeModal = () => {
  selectedProject.value = null;
  viewMode.value = 'details';
  evalRating.value = 0;
  evalHoverRating.value = 0;
  evalFeedback.value = '';
  evalExistingData.value = null;
};

const handleAppointment = async () => {
  viewMode.value = 'appointment';
  appointmentData.value = [];
  apptPageNum.value = 1;
  await loadAppointmentData();
};

const handleEvaluation = async () => {
  evalRating.value = 0;
  evalFeedback.value = '';
  evalHoverRating.value = 0;
  evalExistingData.value = null;
  viewMode.value = 'evaluation';

  // 如果已评价过，拉取评价数据回显
  if (selectedProject.value) {
    evalLoading.value = true;
    try {
      const existing = await fetchEvaluation(selectedProject.value.id);
      if (existing) {
        evalExistingData.value = existing;
        evalRating.value = Number(existing.syntheticScore) || 0;
        evalFeedback.value = existing.content || '';
      }
    } catch (e) {
      console.error('获取评价数据失败:', e);
    } finally {
      evalLoading.value = false;
    }
  }
};

const goBack = async () => {
  if (viewMode.value === 'confirm_time' || viewMode.value === 'confirm_change' || viewMode.value === 'confirm_accept') {
    selectedAppointment.value = null;
    viewMode.value = 'appointment';
    // 返回预约列表时刷新数据
    await loadAppointmentData();
  } else if (viewMode.value === 'appointment_success') {
    viewMode.value = 'appointment';
    await loadAppointmentData();
  } else if (viewMode.value === 'evaluation' || viewMode.value === 'evaluation_success' || viewMode.value === 'appointment') {
    viewMode.value = 'details';
  }
};
</script>

<template>
  <div class="min-h-screen bg-transparent relative overflow-x-hidden">
    <div class="relative z-10 p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <header class="flex justify-between items-center flex-shrink-0">
        <div class="flex items-center space-x-4">
          <button
            @click="$emit('back')"
            class="p-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/80 transition-all active:scale-95"
          >
            <ArrowLeft :size="20" class="text-gray-600" />
          </button>
          <div>
            <h1 class="text-3xl font-bold text-gray-800">维保项目</h1>
            <p class="text-gray-500 mt-1">查看和管理所有维保项目信息</p>
          </div>
        </div>

        <div class="relative shrink-0">
          <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索维保项目..."
            class="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-md border border-white/20 rounded-xl w-64 transition-all focus:outline-none focus:ring-0 focus:border-white/20 focus-visible:ring-0"
          />
        </div>
      </header>

      <!-- 状态胶囊 -->
      <div class="mt-8 md:mt-12 flex space-x-3 overflow-x-auto pb-2 scrollbar-hide mb-6">
        <button
          v-for="status in statuses"
          :key="status"
          @click="() => { activeStatus = status; searchQuery = ''; }"
          :class="['px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm',
            activeStatus === status
              ? 'bg-[#FFE600] text-[#260A2F]'
              : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300 hover:text-gray-800'
          ]"
        >
          {{ status }}
        </button>
      </div>

      <!-- 项目卡片网格 -->
      <div v-if="isLoading" class="col-span-full py-20 flex flex-col items-center justify-center text-gray-500">
        <p class="text-lg font-medium text-gray-600">加载中...</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MaintenanceProjectCard
          v-for="project in projectList"
          :key="project.id"
          :project="project"
          @click="openModal(project)"
        />

        <div v-if="projectList.length === 0" class="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 bg-white/30 backdrop-blur-md rounded-3xl border border-dashed border-white/40">
          <p class="text-lg font-medium text-gray-600">{{ searchQuery ? '没有找到匹配的项目' : '暂无该状态的项目' }}</p>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalItems > 0" class="flex justify-center items-center space-x-4 mt-12 pb-8">
        <span class="text-sm text-gray-500">共 {{ totalItems }} 条</span>
        <button
          @click="currentPage > 1 && currentPage--"
          :disabled="currentPage === 1"
          class="p-2 rounded-full bg-white border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft :size="20" />
        </button>

        <div class="flex items-center space-x-2">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            :class="['w-10 h-10 rounded-full text-sm font-bold transition-all',
              currentPage === page
                ? 'bg-[#FFE600] text-[#260A2F] shadow-sm'
                : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300'
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="currentPage < totalPages && currentPage++"
          :disabled="currentPage === totalPages"
          class="p-2 rounded-full bg-white border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronRight :size="20" />
        </button>
      </div>

      <!-- 详情弹窗 -->
      <div 
        v-if="selectedProject" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" 
        @click.self="closeModal"
      >
        <div class="modal-morph shadow-2xl bg-white/10 backdrop-blur-2xl border border-white/20 overflow-hidden flex flex-col">
          <div class="w-full flex flex-col h-full">
            <!-- Header -->
            <div class="px-8 py-6 border-b border-white/10 flex justify-between items-center flex-shrink-0">
              <div class="flex items-center gap-3">
                <div class="w-1.5 h-6 bg-[#FFE600] rounded-full shadow-[0_0_15px_rgba(255,230,0,0.5)]"></div>
                <h2 class="text-2xl font-bold text-white tracking-tight">{{ headerTitle }}</h2>
              </div>
              <div class="flex items-center gap-4">
                <button v-if="viewMode !== 'details'" @click="goBack" class="text-white/60 hover:text-white text-sm font-bold transition-colors">返回</button>
                <button @click="closeModal" class="p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-all">
                  <X :size="24" />
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="p-8 overflow-y-auto flex-1 custom-scrollbar relative">
              <Transition name="fade-slide" mode="out-in">
                <!-- 项目详情 -->
                <MaintenanceOverview 
                  v-if="viewMode === 'details'"
                  :key="'details'"
                  :project="selectedProject"
                  @enterAppointment="handleAppointment"
                  @enterEvaluation="handleEvaluation"
                />

                <!-- 评价页面 -->
                <div v-else-if="viewMode === 'evaluation'" :key="'evaluation'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <div v-if="evalLoading" class="flex-1 flex items-center justify-center">
                    <p class="text-white/60">加载中...</p>
                  </div>
                  <template v-else>
                    <!-- 非可评价提示 -->
                    <div v-if="!isEvaluationEditable" class="mb-6 px-4 py-3 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
                      <p class="text-yellow-400/80 text-sm">该项目暂未开放评价功能，仅可查看已有评价</p>
                    </div>

                    <div class="flex-1 flex flex-col gap-8 items-center justify-center">
                      <!-- Rating Stars -->
                      <div class="flex flex-col items-center gap-4 w-full max-w-md">
                        <div class="text-white/80 text-lg font-medium mb-2">
                          {{ isEvaluationEditable && !isAlreadyEvaluated ? '请对本项目进行打分' : '评价结果' }}
                        </div>
                        <div class="flex items-center gap-4">
                          <button 
                            v-for="star in 5" 
                            :key="star"
                            @click="setEvalRating(star)"
                            @mouseenter="isEvaluationEditable && !isAlreadyEvaluated && (evalHoverRating = star)"
                            @mouseleave="evalHoverRating = 0"
                            :disabled="!isEvaluationEditable || isAlreadyEvaluated"
                            class="transition-transform focus:outline-none"
                            :class="(isEvaluationEditable && !isAlreadyEvaluated) ? 'hover:scale-110' : 'cursor-not-allowed'"
                          >
                            <Star 
                              :size="48" 
                              :class="[
                                'transition-colors duration-200',
                                (evalHoverRating ? star <= evalHoverRating : star <= evalRating) 
                                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
                                  : 'text-white/20'
                              ]" 
                            />
                          </button>
                        </div>
                        <div class="text-yellow-400 font-bold text-xl h-8 mt-2">
                          {{ evalRatingText }}
                        </div>
                      </div>

                      <!-- Evaluation Text -->
                      <div class="w-full max-w-2xl flex flex-col gap-3 mt-4">
                        <label class="text-white/80 text-sm font-medium pl-2">文字评价</label>
                        <textarea 
                          v-model="evalFeedback"
                          :disabled="!isEvaluationEditable || isAlreadyEvaluated"
                          placeholder="请输入您对本项目的评价内容..."
                          class="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400/50 transition-colors resize-none custom-scrollbar disabled:opacity-70 disabled:cursor-not-allowed"
                        ></textarea>
                      </div>
                    </div>

                    <!-- Footer -->
                    <div class="pt-4 flex justify-end flex-shrink-0">
                      <button 
                        v-if="isEvaluationEditable && !isAlreadyEvaluated"
                        @click="submitEvaluation"
                        :disabled="!evalIsValid || evalLoading"
                        class="px-8 py-2.5 bg-[#FFE600] text-[#260A2F] text-sm font-bold rounded-xl hover:bg-[#e6cf00] transition-colors shadow-[0_0_15px_rgba(255,230,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {{ evalLoading ? '提交中...' : '确认提交' }}
                      </button>
                      <button 
                        v-else-if="isAlreadyEvaluated"
                        disabled
                        class="px-8 py-2.5 bg-white/10 text-white/40 text-sm font-bold rounded-xl cursor-not-allowed"
                      >
                        已评价
                      </button>
                    </div>
                  </template>
                </div>

                <!-- 评价成功页面 -->
                <div v-else-if="viewMode === 'evaluation_success'" :key="'evaluation_success'" class="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center h-full min-h-[500px]">
                  <img :src="checkMarkImg" alt="" class="mb-6 h-36 w-56 object-contain" />
                  <h2 class="text-3xl font-bold text-white mb-4 tracking-tight">已完成提交</h2>
                  <p class="text-white/60 mb-12">您的验收评价已成功记录到系统中</p>
                  <button 
                    @click="goBack"
                    class="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors border border-white/10"
                  >
                    返回上级页面
                  </button>
                </div>

                <!-- 预约管理页面 -->
                <div v-else-if="viewMode === 'appointment'" :key="'appointment'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
                  <div v-if="appointmentsLoading" class="text-center py-8 text-white/60">加载中...</div>
                  <div v-else class="bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-inner">
                    <div class="flex items-center justify-between border-b border-white/10 bg-white/5 px-8 py-4">
                      <h3 class="flex items-center gap-2 font-bold text-white">
                        <div class="h-4 w-1 rounded-full bg-[#FFE600] shadow-[0_0_8px_rgba(255,230,0,0.4)]" />
                        预约列表
                      </h3>
                    </div>
                    <div v-if="appointmentData.length === 0" class="text-center py-12 text-white/40 text-sm">
                      暂无预约数据
                    </div>
                    <div v-else class="overflow-x-auto">
                      <table class="w-full border-collapse text-left">
                        <thead>
                          <tr class="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                            <th class="px-6 py-3">序号</th>
                            <th class="px-6 py-3">项目名称</th>
                            <th class="px-6 py-3">倒计时</th>
                            <th class="px-6 py-3">预约时间</th>
                            <th class="px-6 py-3">状态</th>
                            <th class="px-6 py-3">操作</th>
                          </tr>
                        </thead>
                        <tbody class="text-xs text-white/80">
                          <tr
                            v-for="(item, idx) in appointmentData"
                            :key="item.id"
                            class="border-b border-white/5 transition-colors hover:bg-white/5"
                          >
                            <td class="px-6 py-4 font-mono">{{ idx + 1 }}</td>
                            <td class="px-6 py-4">{{ item.projectName }}</td>
                            <td class="px-6 py-4 font-mono">{{ item.distanceDateTime }}</td>
                            <td class="px-6 py-4 font-mono">{{ item.yuyueTime }}</td>
                            <td class="px-6 py-4">{{ getWxStatusLabel(item) }}</td>
                            <td class="px-6 py-4">
                              <button
                                v-if="item.authorityType === '2' && (item.wxStatus === '2' || item.wxStatus === '3' || item.wxStatus === '4')"
                                class="px-3 py-1 bg-[#FFE600] text-[#260A2F] text-xs font-bold rounded-lg hover:bg-[#e6cf00] transition-colors"
                                @click.stop="handleConfirmAppointment(item)"
                              >
                                确认
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <!-- 预约列表分页 -->
                  <div v-if="apptTotal > 0" class="flex justify-center items-center gap-3 mt-6 pb-2">
                    <span class="text-xs text-white/40">共 {{ apptTotal }} 条</span>
                    <button
                      @click="apptPageNum > 1 && apptPageNum--; loadAppointmentData()"
                      :disabled="apptPageNum === 1"
                      class="p-2 rounded-lg bg-white/10 border border-white/10 text-white/60 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                    >
                      <ChevronLeft :size="16" />
                    </button>
                    <div class="flex items-center gap-1">
                      <button
                        v-for="page in apptTotalPages"
                        :key="page"
                        @click="apptPageNum = page; loadAppointmentData()"
                        :class="['w-8 h-8 rounded-lg text-xs font-bold transition-all',
                          apptPageNum === page
                            ? 'bg-[#FFE600] text-[#260A2F]'
                            : 'bg-white/10 text-white/50 hover:bg-white/20'
                        ]"
                      >
                        {{ page }}
                      </button>
                    </div>
                    <button
                      @click="apptPageNum < apptTotalPages && apptPageNum++; loadAppointmentData()"
                      :disabled="apptPageNum === apptTotalPages"
                      class="p-2 rounded-lg bg-white/10 border border-white/10 text-white/60 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
                    >
                      <ChevronRight :size="16" />
                    </button>
                  </div>
                </div>

                <!-- 确认预约时间页面 -->
                <div v-else-if="viewMode === 'confirm_time'" :key="'confirm_time'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <div class="flex-1 flex flex-col gap-8 justify-center">
                    <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                      <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-3">预约时间</p>
                      <p class="text-white text-xl font-bold font-mono tracking-tight">{{ selectedAppointment?.kfqryyTime || selectedAppointment?.yuyueTime }}</p>
                    </div>
                  </div>
                  <div class="pt-4 flex justify-end gap-3 flex-shrink-0">
                    <button @click="goBack" class="px-6 py-2.5 bg-white/10 text-white text-sm rounded-xl hover:bg-white/20 transition-colors">取消</button>
                    <button 
                      @click="submitConfirm"
                      :disabled="confirmSubmitLoading"
                      class="px-8 py-2.5 bg-[#FFE600] text-[#260A2F] text-sm font-bold rounded-xl hover:bg-[#e6cf00] transition-colors shadow-[0_0_15px_rgba(255,230,0,0.3)] disabled:opacity-50"
                    >
                      {{ confirmSubmitLoading ? '提交中...' : '确定' }}
                    </button>
                  </div>
                </div>

                <!-- 确认变更时间页面 -->
                <div v-else-if="viewMode === 'confirm_change'" :key="'confirm_change'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <div class="flex-1 flex flex-col gap-6 justify-center">
                    <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                      <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-3">更改原因</p>
                      <p class="text-white/80 text-sm leading-relaxed">{{ selectedAppointment?.changeReasonRemark || selectedAppointment?.changeReason || '-' }}</p>
                    </div>
                    <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                      <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-3">变更时间</p>
                      <p class="text-white text-xl font-bold font-mono tracking-tight">{{ selectedAppointment?.kfqrbgTime || selectedAppointment?.yuyueTime || '-' }}</p>
                    </div>
                  </div>
                  <div class="pt-4 flex justify-end gap-3 flex-shrink-0">
                    <button @click="goBack" class="px-6 py-2.5 bg-white/10 text-white text-sm rounded-xl hover:bg-white/20 transition-colors">取消</button>
                    <button 
                      @click="submitConfirm"
                      :disabled="confirmSubmitLoading"
                      class="px-8 py-2.5 bg-[#FFE600] text-[#260A2F] text-sm font-bold rounded-xl hover:bg-[#e6cf00] transition-colors shadow-[0_0_15px_rgba(255,230,0,0.3)] disabled:opacity-50"
                    >
                      {{ confirmSubmitLoading ? '提交中...' : '确定' }}
                    </button>
                  </div>
                </div>

                <!-- 确认验收页面 -->
                <div v-else-if="viewMode === 'confirm_accept'" :key="'confirm_accept'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <div class="flex-1 overflow-y-auto custom-scrollbar">
                    <div v-if="selectedAppointment?.ysImgs" class="grid grid-cols-3 gap-4">
                      <div v-for="(img, i) in selectedAppointment.ysImgs.split(',')" :key="i" class="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                        <img :src="img" :alt="'验收图片 ' + (i + 1)" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    </div>
                    <div v-else class="text-center py-12 text-white/40 text-sm">暂无验收图片</div>
                  </div>
                  <div class="pt-4 flex justify-end gap-3 flex-shrink-0">
                    <button @click="goBack" class="px-6 py-2.5 bg-white/10 text-white text-sm rounded-xl hover:bg-white/20 transition-colors">取消</button>
                    <button
                      type="button"
                      @click="confirmAcceptance"
                      :disabled="confirmSubmitLoading"
                      class="px-8 py-2.5 bg-[#FFE600] text-[#260A2F] text-sm font-bold rounded-xl hover:bg-[#e6cf00] transition-colors shadow-[0_0_15px_rgba(255,230,0,0.3)] disabled:opacity-50"
                    >
                      {{ confirmSubmitLoading ? '提交中...' : '确认验收' }}
                    </button>
                  </div>
                </div>

                <!-- 预约确认成功页面 -->
                <div v-else-if="viewMode === 'appointment_success'" :key="'appointment_success'" class="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center h-full min-h-[350px]">
                  <img :src="checkMarkImg" alt="" class="mb-6 h-36 w-56 object-contain" />
                  <h2 class="text-3xl font-bold text-white mb-4 tracking-tight">已完成提交</h2>
                  <p class="text-white/60 mb-12">您的确认已成功提交</p>
                  <button 
                    @click="goBack"
                    class="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors border border-white/10"
                  >
                    返回预约列表
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-active {
  transition-delay: 0.5s;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px) scale(0.98);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(0.98);
}

.menu-pop-enter-active,
.menu-pop-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.menu-pop-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-4px);
}
.menu-pop-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-4px);
}

.modal-morph {
  width: v-bind('modalDimensions.width') !important;
  height: v-bind('modalDimensions.height') !important;
  border-radius: v-bind('modalDimensions.radius');
  background-color: v-bind('viewMode === "details" ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.15)"');
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
              height 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              border-radius 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              background-color 0.8s ease;
  will-change: width, height, transform, border-radius;
  transform: translateZ(0) scale(v-bind('modalDimensions.scale'));
  backface-visibility: hidden;
}
</style>
