<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, X, Star, MoreHorizontal } from 'lucide-vue-next';
import { maintenanceProjects } from '../data';
import type { MaintenanceProject } from '../types';
import MaintenanceProjectCard from './maintenance/MaintenanceProjectCard.vue';
import MaintenanceOverview from './maintenance/MaintenanceOverview.vue';
import checkMarkImg from '../../image asset/check mark.png';

const props = defineProps<{
  initialStatus?: string;
}>();

const emit = defineEmits(['back']);

const statuses = ['待开工', '施工中', '已完工'] as const;
const activeStatus = ref(props.initialStatus || '待开工');
const searchQuery = ref('');
const selectedProject = ref<MaintenanceProject | null>(null);
const viewMode = ref<'details' | 'evaluation' | 'evaluation_success' | 'appointment' | 'confirm_time' | 'confirm_change' | 'appointment_success' | 'order_suspended' | 'order_abnormal' | 'pending_acceptance' | 'completed'>('details');

const currentPage = ref(1);
const itemsPerPage = 9;

// Evaluation state
const maintenanceEvaluations = ref<Record<string, { rating: number; feedback: string }>>({});
const evalRating = ref(0);
const evalHoverRating = ref(0);
const evalFeedback = ref('');

const acceptanceImages = [
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=600&h=450&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=450&fit=crop',
];

const appointmentData = ref([
  { id: 1, name: '客户端UI设计', countdown: '-9小时-12分-16秒', appointmentTime: '2026-03-25 00:00', status: '待客户验收', changeReason: '', statusReason: '', images: acceptanceImages },
  { id: 2, name: '客户端UI设计', countdown: '-19小时-22分-5秒', appointmentTime: '2026-03-24 13:50:11', status: '待客户确认预约时间', changeReason: '', statusReason: '', images: [] as string[] },
  { id: 3, name: '客户端UI设计', countdown: '-19小时-21分-31秒', appointmentTime: '2026-03-24 13:50:45', status: '待客户确认变更时间', changeReason: '因施工现场发现隐蔽管线，需要重新规划施工方案，原定时间无法满足安全施工要求', statusReason: '', images: [] as string[] },
  { id: 4, name: '客户端UI设计', countdown: '-19小时-21分-15秒', appointmentTime: '2026-03-24 13:51:01', status: '订单挂起', changeReason: '', statusReason: '客户要求暂停施工，等待设计方案变更确认后再恢复', images: [] as string[] },
  { id: 5, name: '客户端UI设计', countdown: '-18小时-12分-16秒', appointmentTime: '2026-03-24 15:00:00', status: '预约异常', changeReason: '', statusReason: '预约时间已超时未确认，系统自动标记为异常，请联系客户重新预约', images: [] as string[] },
  { id: 6, name: '空调系统巡检', countdown: '2天-5小时-30分', appointmentTime: '2026-03-27 10:00:00', status: '待上门', changeReason: '', statusReason: '', images: [] as string[] },
  { id: 7, name: '消防管道维修', countdown: '-', appointmentTime: '2026-03-20 09:00:00', status: '已完工', changeReason: '', statusReason: '', images: acceptanceImages.slice(0, 4) },
]);

const appointmentMenuOpen = ref<number | null>(null);
const selectedAppointment = ref<typeof appointmentData.value[0] | null>(null);

const toggleAppointmentMenu = (id: number) => {
  appointmentMenuOpen.value = appointmentMenuOpen.value === id ? null : id;
};

const closeAppointmentMenu = () => {
  appointmentMenuOpen.value = null;
};

const handleAppointmentAction = (item: typeof appointmentData.value[0]) => {
  selectedAppointment.value = item;
  if (item.status === '待客户确认预约时间') {
    viewMode.value = 'confirm_time';
  } else if (item.status === '待客户确认变更时间') {
    viewMode.value = 'confirm_change';
  } else if (item.status === '订单挂起') {
    viewMode.value = 'order_suspended';
  } else if (item.status === '预约异常') {
    viewMode.value = 'order_abnormal';
  } else if (item.status === '待客户验收') {
    viewMode.value = 'pending_acceptance';
  } else if (item.status === '已完工') {
    viewMode.value = 'completed';
  }
};

const confirmAppointmentTime = () => {
  if (selectedAppointment.value) {
    selectedAppointment.value.status = '待上门';
    viewMode.value = 'appointment_success';
  }
};

const confirmChangeTime = () => {
  if (selectedAppointment.value) {
    selectedAppointment.value.status = '待上门';
    viewMode.value = 'appointment_success';
  }
};

const confirmAcceptance = () => {
  if (selectedAppointment.value) {
    selectedAppointment.value.status = '已完工';
    viewMode.value = 'appointment_success';
  }
};

const selectedProjectId = computed(() => selectedProject.value?.id);
const isEvaluated = computed(() => {
  if (!selectedProjectId.value) return false;
  return !!maintenanceEvaluations.value[selectedProjectId.value];
});

watch(() => selectedProject.value, (newVal) => {
  if (newVal && maintenanceEvaluations.value[newVal.id]) {
    const existing = maintenanceEvaluations.value[newVal.id];
    evalRating.value = existing.rating;
    evalFeedback.value = existing.feedback;
  } else {
    evalRating.value = 0;
    evalFeedback.value = '';
  }
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
  if (!isEvaluated.value) evalRating.value = val;
};

const submitEvaluation = () => {
  if (evalIsValid.value && !isEvaluated.value && selectedProjectId.value) {
    maintenanceEvaluations.value[selectedProjectId.value] = {
      rating: evalRating.value,
      feedback: evalFeedback.value
    };
    viewMode.value = 'evaluation_success';
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
  if (viewMode.value === 'appointment_success') {
    return { width: '600px', height: '480px', radius: '32px', scale: 1 };
  }
  if (viewMode.value === 'order_suspended' || viewMode.value === 'order_abnormal') {
    return { width: '600px', height: '380px', radius: '32px', scale: 1 };
  }
  if (viewMode.value === 'pending_acceptance' || viewMode.value === 'completed') {
    return { width: '860px', height: '680px', radius: '32px', scale: 1.02 };
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
  if (viewMode.value === 'appointment_success') return '预约管理';
  if (viewMode.value === 'order_suspended') return '订单挂起';
  if (viewMode.value === 'order_abnormal') return '预约异常';
  if (viewMode.value === 'pending_acceptance') return '待客户验收';
  if (viewMode.value === 'completed') return '验收完成';
  return '项目详情';
});

const filteredProjects = computed(() => {
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    return maintenanceProjects.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.no.toLowerCase().includes(query) ||
      p.manager.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query)
    );
  }
  return maintenanceProjects.filter(p => p.status === activeStatus.value);
});

const totalPages = computed(() => Math.ceil(filteredProjects.value.length / itemsPerPage));

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredProjects.value.slice(start, start + itemsPerPage);
});

watch([activeStatus, searchQuery], () => {
  currentPage.value = 1;
});

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
};

const handleAppointment = () => {
  appointmentMenuOpen.value = null;
  viewMode.value = 'appointment';
};

const handleEvaluation = () => {
  if (selectedProjectId.value && maintenanceEvaluations.value[selectedProjectId.value]) {
    const existing = maintenanceEvaluations.value[selectedProjectId.value];
    evalRating.value = existing.rating;
    evalFeedback.value = existing.feedback;
  } else {
    evalRating.value = 0;
    evalFeedback.value = '';
  }
  evalHoverRating.value = 0;
  viewMode.value = 'evaluation';
};

const goBack = () => {
  if (viewMode.value === 'confirm_time' || viewMode.value === 'confirm_change' || viewMode.value === 'order_suspended' || viewMode.value === 'order_abnormal' || viewMode.value === 'pending_acceptance' || viewMode.value === 'completed') {
    selectedAppointment.value = null;
    viewMode.value = 'appointment';
  } else if (viewMode.value === 'appointment_success') {
    selectedAppointment.value = null;
    viewMode.value = 'appointment';
  } else if (viewMode.value === 'evaluation' || viewMode.value === 'evaluation_success' || viewMode.value === 'appointment') {
    appointmentMenuOpen.value = null;
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
            activeStatus === status && !searchQuery
              ? 'bg-[#FFE600] text-[#260A2F]'
              : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300 hover:text-gray-800'
          ]"
        >
          {{ status }}
        </button>
      </div>

      <!-- 项目卡片网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MaintenanceProjectCard
          v-for="project in paginatedProjects"
          :key="project.id"
          :project="project"
          @click="openModal(project)"
        />

        <div v-if="paginatedProjects.length === 0" class="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 bg-white/30 backdrop-blur-md rounded-3xl border border-dashed border-white/40">
          <p class="text-lg font-medium text-gray-600">{{ searchQuery ? '没有找到匹配的项目' : '暂无该状态的项目' }}</p>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="flex justify-center items-center space-x-4 mt-12 pb-8">
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
                  <div class="flex-1 flex flex-col gap-8 items-center justify-center">
                    <!-- Rating Stars -->
                    <div class="flex flex-col items-center gap-4 w-full max-w-md">
                      <div class="text-white/80 text-lg font-medium mb-2">请对本项目进行打分</div>
                      <div class="flex items-center gap-4">
                        <button 
                          v-for="star in 5" 
                          :key="star"
                          @click="setEvalRating(star)"
                          @mouseenter="evalHoverRating = star"
                          @mouseleave="evalHoverRating = 0"
                          :disabled="isEvaluated"
                          class="transition-transform hover:scale-110 focus:outline-none disabled:cursor-not-allowed disabled:hover:scale-100"
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
                        :disabled="isEvaluated"
                        placeholder="请输入您对本项目的评价内容..."
                        class="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400/50 transition-colors resize-none custom-scrollbar disabled:opacity-70 disabled:cursor-not-allowed"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div class="pt-4 flex justify-end flex-shrink-0">
                    <button 
                      v-if="!isEvaluated"
                      @click="submitEvaluation"
                      :disabled="!evalIsValid"
                      class="px-8 py-2.5 bg-[#FFE600] text-[#260A2F] text-sm font-bold rounded-xl hover:bg-[#e6cf00] transition-colors shadow-[0_0_15px_rgba(255,230,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      确认提交
                    </button>
                    <button 
                      v-else
                      disabled
                      class="px-8 py-2.5 bg-white/10 text-white/40 text-sm font-bold rounded-xl cursor-not-allowed"
                    >
                      已评价
                    </button>
                  </div>
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
                  <div class="bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-inner">
                    <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse">
                        <thead>
                          <tr class="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest font-bold">
                            <th class="px-6 py-3">序号</th>
                            <th class="px-6 py-3">项目名称</th>
                            <th class="px-6 py-3">倒计时</th>
                            <th class="px-6 py-3">预约时间</th>
                            <th class="px-6 py-3">状态</th>
                            <th class="px-6 py-3 w-12"></th>
                          </tr>
                        </thead>
                        <tbody class="text-white/80 text-xs">
                          <tr v-for="item in appointmentData" :key="item.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4 font-mono">{{ item.id }}</td>
                            <td class="px-6 py-4">{{ item.name }}</td>
                            <td class="px-6 py-4 font-mono">{{ item.countdown }}</td>
                            <td class="px-6 py-4 font-mono">{{ item.appointmentTime }}</td>
                            <td class="px-6 py-4">{{ item.status }}</td>
                            <td class="px-6 py-4">
                              <button @click.stop="handleAppointmentAction(item)" class="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                                <MoreHorizontal :size="16" class="text-white/60" />
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <!-- 确认预约时间页面 -->
                <div v-else-if="viewMode === 'confirm_time'" :key="'confirm_time'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <div class="flex-1 flex flex-col gap-8 justify-center">
                    <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                      <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-3">预约时间</p>
                      <p class="text-white text-xl font-bold font-mono tracking-tight">{{ selectedAppointment?.appointmentTime }}</p>
                    </div>
                  </div>
                  <div class="pt-4 flex justify-end flex-shrink-0">
                    <button 
                      @click="confirmAppointmentTime"
                      class="px-8 py-2.5 bg-[#FFE600] text-[#260A2F] text-sm font-bold rounded-xl hover:bg-[#e6cf00] transition-colors shadow-[0_0_15px_rgba(255,230,0,0.3)]"
                    >
                      确认
                    </button>
                  </div>
                </div>

                <!-- 确认变更时间页面 -->
                <div v-else-if="viewMode === 'confirm_change'" :key="'confirm_change'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <div class="flex-1 flex flex-col gap-6 justify-center">
                    <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                      <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-3">更改原因</p>
                      <p class="text-white/80 text-sm leading-relaxed">{{ selectedAppointment?.changeReason }}</p>
                    </div>
                    <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                      <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-3">预约时间</p>
                      <p class="text-white text-xl font-bold font-mono tracking-tight">{{ selectedAppointment?.appointmentTime }}</p>
                    </div>
                  </div>
                  <div class="pt-4 flex justify-end flex-shrink-0">
                    <button 
                      @click="confirmChangeTime"
                      class="px-8 py-2.5 bg-[#FFE600] text-[#260A2F] text-sm font-bold rounded-xl hover:bg-[#e6cf00] transition-colors shadow-[0_0_15px_rgba(255,230,0,0.3)]"
                    >
                      确认
                    </button>
                  </div>
                </div>

                <!-- 预约确认成功页面 -->
                <div v-else-if="viewMode === 'appointment_success'" :key="'appointment_success'" class="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center h-full min-h-[350px]">
                  <img :src="checkMarkImg" alt="" class="mb-6 h-36 w-56 object-contain" />
                  <h2 class="text-3xl font-bold text-white mb-4 tracking-tight">已完成提交</h2>
                  <p class="text-white/60 mb-12">
                    {{
                      selectedAppointment?.status === '已完工'
                        ? '您的验收确认已成功提交'
                        : '您的预约确认已成功提交'
                    }}
                  </p>
                  <button 
                    @click="goBack"
                    class="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors border border-white/10"
                  >
                    返回上级页面
                  </button>
                </div>

                <!-- 订单挂起页面 -->
                <div v-else-if="viewMode === 'order_suspended'" :key="'order_suspended'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <div class="flex-1 flex flex-col justify-center">
                    <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                      <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-3">状态原因</p>
                      <p class="text-white/80 text-sm leading-relaxed">{{ selectedAppointment?.statusReason }}</p>
                    </div>
                  </div>
                </div>

                <!-- 预约异常页面 -->
                <div v-else-if="viewMode === 'order_abnormal'" :key="'order_abnormal'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <div class="flex-1 flex flex-col justify-center">
                    <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                      <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-3">状态原因</p>
                      <p class="text-white/80 text-sm leading-relaxed">{{ selectedAppointment?.statusReason }}</p>
                    </div>
                  </div>
                </div>

                <!-- 待客户验收页面 -->
                <div v-else-if="viewMode === 'pending_acceptance'" :key="'pending_acceptance'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <div class="flex-1 overflow-y-auto custom-scrollbar">
                    <h3 class="text-white/40 text-xs uppercase tracking-widest font-bold mb-4">验收图片</h3>
                    <div class="grid grid-cols-3 gap-4">
                      <div v-for="(img, i) in selectedAppointment?.images" :key="i" class="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                        <img :src="img" :alt="'验收图片 ' + (i + 1)" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                  <div class="pt-4 flex justify-end flex-shrink-0">
                    <button
                      @click="confirmAcceptance"
                      class="px-8 py-2.5 bg-[#FFE600] text-[#260A2F] text-sm font-bold rounded-xl hover:bg-[#e6cf00] transition-colors shadow-[0_0_15px_rgba(255,230,0,0.3)]"
                    >
                      确认
                    </button>
                  </div>
                </div>

                <!-- 已完工页面 -->
                <div v-else-if="viewMode === 'completed'" :key="'completed'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <div class="flex-1 overflow-y-auto custom-scrollbar">
                    <h3 class="text-white/40 text-xs uppercase tracking-widest font-bold mb-4">验收图片</h3>
                    <div class="grid grid-cols-3 gap-4">
                      <div v-for="(img, i) in selectedAppointment?.images" :key="i" class="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                        <img :src="img" :alt="'验收图片 ' + (i + 1)" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
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
