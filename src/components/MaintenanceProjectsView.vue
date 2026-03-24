<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, X, CheckCircle2, Star } from 'lucide-vue-next';
import { maintenanceProjects } from '../data';
import type { MaintenanceProject } from '../types';
import MaintenanceProjectCard from './maintenance/MaintenanceProjectCard.vue';
import MaintenanceOverview from './maintenance/MaintenanceOverview.vue';

const props = defineProps<{
  initialStatus?: string;
}>();

const emit = defineEmits(['back']);

const statuses = ['待开工', '施工中', '已完工'] as const;
const activeStatus = ref(props.initialStatus || '待开工');
const searchQuery = ref('');
const selectedProject = ref<MaintenanceProject | null>(null);
const viewMode = ref<'details' | 'evaluation' | 'evaluation_success'>('details');

const currentPage = ref(1);
const itemsPerPage = 9;

// Evaluation state
const maintenanceEvaluations = ref<Record<string, { rating: number; feedback: string }>>({});
const evalRating = ref(0);
const evalHoverRating = ref(0);
const evalFeedback = ref('');

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

// Modal dimensions with morphing animation
const modalDimensions = computed(() => {
  if (viewMode.value === 'details') {
    return { width: '768px', height: '680px', radius: '40px', scale: 1 };
  }
  if (viewMode.value === 'evaluation' || viewMode.value === 'evaluation_success') {
    return { width: '800px', height: '700px', radius: '32px', scale: 1.02 };
  }
  return { width: '768px', height: '680px', radius: '40px', scale: 1 };
});

const headerTitle = computed(() => {
  if (viewMode.value === 'details') return '项目详情';
  if (viewMode.value === 'evaluation') return '项目评价';
  if (viewMode.value === 'evaluation_success') return '项目评价';
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
  console.log('预约管理:', selectedProject.value?.no);
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
  if (viewMode.value === 'evaluation') {
    viewMode.value = 'details';
  } else if (viewMode.value === 'evaluation_success') {
    viewMode.value = 'details';
  }
};
</script>

<template>
  <div class="min-h-screen bg-transparent relative overflow-x-hidden">
    <div class="relative z-10 p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <header class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <button
            @click="$emit('back')"
            class="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft :size="20" />
          </button>
          <div>
            <h1 class="text-3xl font-bold text-gray-800">维保项目</h1>
            <p class="text-gray-500 mt-1">查看和管理所有维保项目信息</p>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <div class="flex items-center bg-white rounded-full border border-gray-100 shadow-sm px-4 py-2 space-x-3 h-12 w-64">
            <Search :size="18" class="text-gray-400 flex-shrink-0" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索维保项目..."
              class="bg-transparent border-none focus:outline-none text-sm w-full text-gray-700 placeholder-gray-400"
            />
          </div>
          <div class="flex items-center space-x-3 bg-white pl-2 pr-4 py-1.5 rounded-full shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors h-12">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Cooper" alt="User" class="w-9 h-9 rounded-full bg-gray-100" />
            <span class="text-sm font-bold text-gray-700">管理员</span>
          </div>
        </div>
      </header>

      <!-- 状态胶囊 -->
      <div class="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide mb-6">
        <button
          v-for="status in statuses"
          :key="status"
          @click="() => { activeStatus = status; searchQuery = ''; }"
          :class="['px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm',
            activeStatus === status && !searchQuery
              ? 'bg-[#FFC091] text-[#260A2F]'
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
                ? 'bg-[#FFC091] text-[#260A2F] shadow-sm'
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
                <div class="w-1.5 h-6 bg-[#FFC091] rounded-full shadow-[0_0_15px_rgba(255,192,145,0.5)]"></div>
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
                      class="px-8 py-2.5 bg-[#FFC091] text-[#260A2F] text-sm font-bold rounded-xl hover:bg-[#ffad70] transition-colors shadow-[0_0_15px_rgba(255,192,145,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div class="w-24 h-24 rounded-full bg-[#A1D573]/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(161,213,115,0.3)]">
                    <CheckCircle2 :size="48" class="text-[#A1D573]" />
                  </div>
                  <h2 class="text-3xl font-bold text-white mb-4 tracking-tight">已完成提交</h2>
                  <p class="text-white/60 mb-12">您的验收评价已成功记录到系统中</p>
                  <button 
                    @click="goBack"
                    class="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors border border-white/10"
                  >
                    返回上级页面
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
