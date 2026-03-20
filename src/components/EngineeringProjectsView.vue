<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  ArrowLeft, 
  X, 
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next';
import { engineeringProjects } from '../data';
import type { EngineeringProject } from '../types';
import { useProjectData } from '../composables/useProjectData';

import ProjectCard from './engineering/ProjectCard.vue';
import ImagePreviewModal from './engineering/ImagePreviewModal.vue';
import ProjectOverview from './engineering/ProjectOverview.vue';
import DefectList from './engineering/DefectList.vue';
import DefectDetail from './engineering/DefectDetail.vue';
import DefectForm from './engineering/DefectForm.vue';
import ProcessAcceptance from './engineering/ProcessAcceptance.vue';
import MaterialDetail from './engineering/MaterialDetail.vue';
import ProgressDetail from './engineering/ProgressDetail.vue';
import AfterSalesPlan from './engineering/AfterSalesPlan.vue';
import AfterSalesSchedule from './engineering/AfterSalesSchedule.vue';
import AfterSalesSuccess from './engineering/AfterSalesSuccess.vue';
import ProjectEvaluation from './engineering/ProjectEvaluation.vue';
import ProjectEvaluationSuccess from './engineering/ProjectEvaluationSuccess.vue';
import CompletionMaterials from './engineering/CompletionMaterials.vue';
import ConstructionStandards from './engineering/ConstructionStandards.vue';
import ConstructionReports from './engineering/ConstructionReports.vue';
import DailyReportDetail from './engineering/DailyReportDetail.vue';

const props = defineProps<{
  initialStatus?: string;
}>();

const emit = defineEmits(['back']);

const statuses = ['待开工', '施工中', '已完工', '已结算', '保修中', '保修外'];
const activeStatus = ref(props.initialStatus || '施工中');
const selectedProject = ref<EngineeringProject | null>(null);
const selectedProjectId = computed(() => selectedProject.value?.id);

const viewMode = ref<'details' | 'acceptance' | 'material_detail' | 'progress_detail' | 'defect_report' | 'defect_detail' | 'defect_add' | 'after_sales' | 'after_sales_schedule' | 'after_sales_success' | 'evaluation' | 'evaluation_success' | 'completion' | 'standards' | 'reports' | 'report_detail'>('details');
const lastViewMode = ref<string>('');

const {
  defects,
  reportDefects,
  materialData,
  progressData,
  afterSalesData,
  submittedMaterials,
  submittedProgressItems
} = useProjectData(selectedProjectId);

const selectedDefect = ref<any>(null);
const selectedMaterialItem = ref<any>(null);
const selectedProgressItem = ref<any>(null);
const isImageZoomed = ref(false);
const zoomedImageUrl = ref('');
const searchQuery = ref('');

const currentPage = ref(1);
const itemsPerPage = 9;

const windowSize = ref({ width: window.innerWidth, height: window.innerHeight });
window.addEventListener('resize', () => {
  windowSize.value = { width: window.innerWidth, height: window.innerHeight };
});

const modalDimensions = computed(() => {
  if (viewMode.value === 'details') {
    return { width: '768px', height: '760px', radius: '40px', scale: 1 };
  }
  if (viewMode.value === 'after_sales' || viewMode.value === 'after_sales_schedule' || viewMode.value === 'after_sales_success') {
    return { width: '800px', height: '700px', radius: '32px', scale: 1.02 };
  }
  if (viewMode.value === 'evaluation' || viewMode.value === 'evaluation_success') {
    return { width: '800px', height: '700px', radius: '32px', scale: 1.02 };
  }
  if (viewMode.value === 'completion' || viewMode.value === 'standards' || viewMode.value === 'reports' || viewMode.value === 'report_detail') {
    return { width: '900px', height: '800px', radius: '32px', scale: 1.02 };
  }
  if (viewMode.value === 'defect_report' || viewMode.value === 'defect_detail' || viewMode.value === 'defect_add') {
    if (lastViewMode.value === 'progress_detail' || lastViewMode.value === 'acceptance' || lastViewMode.value === 'material_detail') {
      const w = Math.round(windowSize.value.width * 0.95);
      const h = Math.round(windowSize.value.height * 0.9);
      return { width: `${w}px`, height: `${h}px`, radius: '24px', scale: 1.02 };
    }
    return { width: '1000px', height: '800px', radius: '32px', scale: 1 };
  }
  const w = Math.round(windowSize.value.width * 0.95);
  const h = Math.round(windowSize.value.height * 0.9);
  return { width: `${w}px`, height: `${h}px`, radius: '24px', scale: 1.02 };
});

const headerTitle = computed(() => {
  if (viewMode.value === 'details') return '项目详情';
  if (viewMode.value === 'acceptance' || viewMode.value === 'progress_detail' || viewMode.value === 'material_detail') return '过程验收';
  if (viewMode.value === 'after_sales' || viewMode.value === 'after_sales_schedule' || viewMode.value === 'after_sales_success') return '售后计划';
  if (viewMode.value === 'evaluation' || viewMode.value === 'evaluation_success') return '项目评价';
  if (viewMode.value === 'completion') return '竣工资料';
  if (viewMode.value === 'standards') return '施工标准';
  if (viewMode.value === 'reports') return '施工报告';
  if (viewMode.value === 'report_detail') return '日报详情';
  if (viewMode.value === 'defect_report') return '缺陷汇报';
  if (viewMode.value === 'defect_add' || viewMode.value === 'defect_detail') {
    if (lastViewMode.value === 'defect_report') return '缺陷汇报';
    return (lastViewMode.value === 'progress_detail' || lastViewMode.value === 'acceptance' || lastViewMode.value === 'material_detail') ? '过程验收' : '缺陷整改';
  }
  return '详细信息';
});

const filteredProjects = computed(() => {
  let projects = engineeringProjects;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    projects = projects.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.no.toLowerCase().includes(query) ||
      p.manager.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query)
    );
  } else {
    projects = projects.filter(p => p.status === activeStatus.value);
  }
  
  return projects;
});

const totalPages = computed(() => Math.ceil(filteredProjects.value.length / itemsPerPage));

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProjects.value.slice(start, end);
});

watch([activeStatus, searchQuery], () => {
  currentPage.value = 1;
});

const openModal = (project: EngineeringProject) => {
  selectedProject.value = project;
  viewMode.value = 'details';
};

const closeModal = () => {
  selectedProject.value = null;
  viewMode.value = 'details';
};

const enterAcceptance = () => {
  viewMode.value = 'acceptance';
};

const selectedAfterSalesPlan = ref<any>(null);

const enterAfterSales = () => {
  viewMode.value = 'after_sales';
};

const handleScheduleAcceptance = (plan: any) => {
  selectedAfterSalesPlan.value = plan;
  viewMode.value = 'after_sales_schedule';
};

const handleScheduleSubmit = (formData: any) => {
  console.log('Submitting schedule:', formData);
  // Here you would typically make an API call to save the schedule
  // For now, we'll just simulate success and update the local state
  
  if (selectedAfterSalesPlan.value) {
    selectedAfterSalesPlan.value.isConfirmed = true;
    selectedAfterSalesPlan.value.scheduledTime = formData.scheduledDate;
  }
  
  viewMode.value = 'after_sales_success';
};

const projectEvaluations = ref<Record<string, { rating: number; feedback: string }>>({});

const enterEvaluation = () => {
  viewMode.value = 'evaluation';
};

const enterCompletion = () => {
  viewMode.value = 'completion';
};

const enterStandards = () => {
  viewMode.value = 'standards';
};

const enterReports = () => {
  viewMode.value = 'reports';
};

const selectedReport = ref<any>(null);
const enterReportDetail = (report: any) => {
  selectedReport.value = report;
  viewMode.value = 'report_detail';
};

const handleEvaluationSubmit = (data: { rating: number; feedback: string }) => {
  if (selectedProjectId.value) {
    projectEvaluations.value[selectedProjectId.value] = data;
  }
  viewMode.value = 'evaluation_success';
};

const enterDefects = () => {
  lastViewMode.value = viewMode.value;
  viewMode.value = 'defect_report';
};

const viewDefectDetail = (defect: any) => {
  selectedDefect.value = defect;
  lastViewMode.value = viewMode.value;
  viewMode.value = 'defect_detail';
};

const deleteDefect = (id: number) => {
  if (lastViewMode.value === 'defect_report') {
    reportDefects.value = reportDefects.value.filter(d => d.id !== id);
  } else {
    defects.value = defects.value.filter(d => d.id !== id);
  }
  goBack();
};

const addDefect = () => {
  lastViewMode.value = viewMode.value;
  viewMode.value = 'defect_add';
};

const confirmAddDefect = (payload: { image: string, description: string }) => {
  const newDefect = {
    id: Date.now(),
    image: payload.image,
    rectifiedImage: '',
    description: payload.description,
    date: new Date().toISOString().split('T')[0],
    planDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    finishDate: '',
    status: lastViewMode.value === 'defect_report' ? '待处理' : '待整改'
  };
  
  if (lastViewMode.value === 'defect_report') {
    reportDefects.value.unshift(newDefect);
  } else {
    defects.value.unshift(newDefect);
  }
  viewMode.value = lastViewMode.value as any;
};

const viewMaterialDetail = (item: any) => {
  selectedMaterialItem.value = item;
  viewMode.value = 'material_detail';
};

const viewProgressDetail = (item: any) => {
  selectedProgressItem.value = item;
  viewMode.value = 'progress_detail';
};

const handleMaterialSubmit = (code: string) => {
  submittedMaterials.value.push(code);
};

const handleProgressSubmit = (node: string) => {
  submittedProgressItems.value.push(node);
};



const goBack = () => {
  if (viewMode.value === 'defect_detail' || viewMode.value === 'defect_add') {
    viewMode.value = lastViewMode.value as any;
    return;
  }
  
  if (viewMode.value === 'material_detail' || viewMode.value === 'progress_detail') {
    viewMode.value = 'acceptance';
  } else if (viewMode.value === 'report_detail') {
    viewMode.value = 'reports';
  } else if (viewMode.value === 'acceptance' || viewMode.value === 'defect_report' || viewMode.value === 'after_sales' || viewMode.value === 'evaluation' || viewMode.value === 'evaluation_success' || viewMode.value === 'completion' || viewMode.value === 'standards' || viewMode.value === 'reports') {
    viewMode.value = 'details';
  } else if (viewMode.value === 'after_sales_schedule' || viewMode.value === 'after_sales_success') {
    viewMode.value = 'after_sales';
  }
};

const zoomImage = (url: string) => {
  zoomedImageUrl.value = url;
  isImageZoomed.value = true;
};
</script>

<template>
  <div class="min-h-screen bg-transparent relative overflow-x-hidden">
    <!-- Content Area -->
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
           <h1 class="text-3xl font-bold text-gray-800">工程项目</h1>
           <p class="text-gray-500 mt-1">查看和管理所有工程项目信息</p>
         </div>
      </div>
      
      <div class="flex items-center space-x-4">
        <div class="flex items-center bg-white rounded-full border border-gray-100 shadow-sm px-4 py-2 space-x-3 h-12 w-64">
          <Search :size="18" class="text-gray-400 flex-shrink-0" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="全局搜索项目..." 
            class="bg-transparent border-none focus:outline-none text-sm w-full text-gray-700 placeholder-gray-400" 
          />
        </div>
        <div class="flex items-center space-x-3 bg-white pl-2 pr-4 py-1.5 rounded-full shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors h-12">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Cooper" alt="User" class="w-9 h-9 rounded-full bg-gray-100" />
          <div class="flex items-center space-x-2">
            <span class="text-sm font-bold text-gray-700">管理员</span>
          </div>
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
      <ProjectCard
        v-for="project in paginatedProjects" 
        :key="project.id"
        :project="project"
        @click="openModal(project)"
      />
      
      <div v-if="paginatedProjects.length === 0" class="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 bg-white/30 backdrop-blur-md rounded-3xl border border-dashed border-white/40">
        <p class="text-lg font-medium text-gray-600">{{ searchQuery ? '没有找到匹配的项目' : '暂无该状态的项目' }}</p>
      </div>
    </div>

    <!-- Pagination -->
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
    <div v-if="selectedProject" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" @click.self="closeModal">
      <div 
        :class="[
          'modal-morph shadow-2xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] overflow-hidden flex flex-col',
        ]"
      >
        <div class="w-full flex flex-col">
          <!-- Header -->
          <div class="px-8 py-6 border-b border-white/10 flex justify-between items-center flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-1.5 h-6 bg-[#FFC091] rounded-full shadow-[0_0_15px_rgba(255,192,145,0.5)]"></div>
              <h2 class="text-2xl font-bold text-white tracking-tight">
                {{ headerTitle }}
              </h2>
            </div>
            <div class="flex items-center gap-4">
              <button v-if="viewMode !== 'details'" @click="goBack" class="text-white/60 hover:text-white text-sm font-bold transition-colors">返回</button>
              <button @click="closeModal" class="p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-all">
                <X :size="24" />
              </button>
            </div>
          </div>
          
          <!-- Content -->
          <div class="p-8 overflow-y-auto max-h-[80vh] custom-scrollbar relative transition-all duration-700 ease-in-out">
            <Transition name="fade-slide" mode="out-in">
              <!-- Details Mode -->
              <ProjectOverview 
                v-if="viewMode === 'details'" 
                :key="'details'" 
                :project="selectedProject" 
                @enterAcceptance="enterAcceptance" 
                @enterDefects="enterDefects" 
                @enterAfterSales="enterAfterSales"
                @enterEvaluation="enterEvaluation"
                @enterCompletion="enterCompletion"
                @enterStandards="enterStandards"
                @enterReports="enterReports"
              />

              <!-- Defect Report Mode -->
              <DefectList 
                v-else-if="viewMode === 'defect_report'" 
                :key="'defect_report'" 
                title="缺陷记录列表" 
                :defects="reportDefects" 
                @add="addDefect" 
                @viewDetail="viewDefectDetail" 
              />

              <!-- Defect Detail Mode -->
            <!-- Defect Detail Mode -->
            <DefectDetail 
              v-else-if="viewMode === 'defect_detail' && selectedDefect"
              :key="'defect_detail'"
              :defect="selectedDefect"
              @zoomImage="zoomImage"
              @delete="deleteDefect"
            />

            <!-- Defect Add Mode -->
            <DefectForm 
              v-else-if="viewMode === 'defect_add'"
              :key="'defect_add'"
              @submit="confirmAddDefect"
            />

                <!-- Acceptance Mode -->
                <div v-else-if="viewMode === 'acceptance'" :key="'acceptance'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
                  <ProcessAcceptance
                    :materialData="materialData"
                    :progressData="progressData"
                    @viewMaterialDetail="viewMaterialDetail"
                    @viewProgressDetail="viewProgressDetail"
                  />
                </div>

                <!-- Material Detail Mode -->
                <div v-else-if="viewMode === 'material_detail'" :key="'material_detail'" class="animate-in zoom-in-95 duration-500 flex flex-col gap-16">
                  <MaterialDetail
                    :material="selectedMaterialItem"
                    :isSubmitted="submittedMaterials.includes(selectedMaterialItem?.code)"
                    @goBack="goBack"
                    @zoomImage="zoomImage"
                    @submit="handleMaterialSubmit"
                  />
                </div>

                <!-- Progress Detail Mode -->
                <div v-else-if="viewMode === 'progress_detail'" :key="'progress_detail'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
                  <ProgressDetail
                    :progressItem="selectedProgressItem"
                    :defects="defects"
                    :isSubmitted="submittedProgressItems.includes(selectedProgressItem?.node)"
                    @goBack="goBack"
                    @zoomImage="zoomImage"
                    @submit="handleProgressSubmit"
                    @addDefect="addDefect"
                    @viewDefectDetail="viewDefectDetail"
                  />
                </div>

                <!-- After Sales Plan Mode -->
                <div v-else-if="viewMode === 'after_sales'" :key="'after_sales'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
                  <AfterSalesPlan
                    :afterSalesData="afterSalesData"
                    @scheduleAcceptance="handleScheduleAcceptance"
                  />
                </div>

                <!-- After Sales Schedule Mode -->
                <div v-else-if="viewMode === 'after_sales_schedule'" :key="'after_sales_schedule'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
                  <AfterSalesSchedule
                    :plan="selectedAfterSalesPlan"
                    @submit="handleScheduleSubmit"
                    @cancel="goBack"
                  />
                </div>

                <!-- After Sales Success Mode -->
                <div v-else-if="viewMode === 'after_sales_success'" :key="'after_sales_success'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
                  <AfterSalesSuccess
                    @return="goBack"
                  />
                </div>

                <!-- Evaluation Mode -->
                <div v-else-if="viewMode === 'evaluation'" :key="'evaluation'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
                  <ProjectEvaluation
                    :existingEvaluation="selectedProjectId ? projectEvaluations[selectedProjectId] : null"
                    @submit="handleEvaluationSubmit"
                  />
                </div>

                <!-- Evaluation Success Mode -->
                <div v-else-if="viewMode === 'evaluation_success'" :key="'evaluation_success'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
                  <ProjectEvaluationSuccess
                    @return="goBack"
                  />
                </div>

                <!-- Completion Materials Mode -->
                <div v-else-if="viewMode === 'completion'" :key="'completion'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <CompletionMaterials
                    :projectId="selectedProject?.id || ''"
                    @zoomImage="zoomImage"
                  />
                </div>

                <!-- Construction Standards Mode -->
                <div v-else-if="viewMode === 'standards'" :key="'standards'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <ConstructionStandards
                    :projectId="selectedProject?.id || ''"
                  />
                </div>

                <!-- Construction Reports Mode -->
                <div v-else-if="viewMode === 'reports'" :key="'reports'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <ConstructionReports
                    :projectId="selectedProject?.id || ''"
                    @enterDetail="enterReportDetail"
                  />
                </div>

                <!-- Daily Report Detail Mode -->
                <div v-else-if="viewMode === 'report_detail'" :key="'report_detail'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <DailyReportDetail
                    :report="selectedReport"
                  />
                </div>
          </Transition>
        </div>
        </div>
      </div>
    </div>

    <!-- Image Lightbox -->
    <ImagePreviewModal
      :isOpen="isImageZoomed"
      :imageUrl="zoomedImageUrl || 'https://picsum.photos/seed/construction/1600/900'"
      @close="isImageZoomed = false"
    />
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
  transition-delay: 0.5s; /* Increased delay for a more distinct two-stage animation */
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px) scale(0.98);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(0.98);
}

/* Silky smooth modal morphing */
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
