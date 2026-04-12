<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { 
  ArrowLeft, 
  X, 
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next';
import type { EngineeringProject } from '../types';
import { engineeringProjects as engineeringProjectsFallback } from '../data';
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
import WeeklyReportDetail from './engineering/WeeklyReportDetail.vue';
import EHSReportDetail from './engineering/EHSReportDetail.vue';

const props = defineProps<{
  initialStatus?: string;
  autoOpenProjectId?: string | null;
  autoOpenViewMode?: string | null;
  projects?: EngineeringProject[];
}>();

const emit = defineEmits(['back', 'autoOpenConsumed']);

const statuses = ['待开工', '施工中', '已完工', '已结算', '保修中', '保修外'];
const activeStatus = ref(props.initialStatus || '施工中');
const selectedProject = ref<EngineeringProject | null>(null);
const selectedProjectId = computed(() => selectedProject.value?.id);

const viewMode = ref<'details' | 'acceptance' | 'material_detail' | 'progress_detail' | 'progress_schedule' | 'progress_schedule_success' | 'defect_report' | 'defect_detail' | 'defect_add' | 'after_sales' | 'after_sales_schedule' | 'after_sales_success' | 'evaluation' | 'evaluation_success' | 'completion' | 'standards' | 'reports' | 'report_detail'>('details');
const lastViewMode = ref<string>('');
const defectReportOrigin = ref<string>('');
const successSource = ref<'progress_schedule' | 'defect_add' | ''>('');
const acceptanceTab = ref<'material' | 'progress'>('material');
const progressDetailTab = ref<'acceptance_check' | 'defect_rectification'>('acceptance_check');

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
const projectList = computed(() => props.projects ?? engineeringProjectsFallback);

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
  if (viewMode.value === 'after_sales' || viewMode.value === 'after_sales_schedule' || viewMode.value === 'after_sales_success' || viewMode.value === 'progress_schedule' || viewMode.value === 'progress_schedule_success') {
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
  /** 过程验收：材料管控表格多、占宽；进度管控内容紧凑，缩小弹窗（尺寸变化由 .modal-morph 过渡） */
  if (viewMode.value === 'acceptance') {
    if (acceptanceTab.value === 'progress') {
      return {
        width: 'min(800px, 94vw)',
        height: 'min(620px, 86vh)',
        radius: '32px',
        scale: 1,
      };
    }
    return {
      width: 'min(1300px, 96vw)',
      height: 'min(900px, 90vh)',
      radius: '32px',
      scale: 1.02,
    };
  }
  const w = Math.round(windowSize.value.width * 0.95);
  const h = Math.round(windowSize.value.height * 0.9);
  return { width: `${w}px`, height: `${h}px`, radius: '24px', scale: 1.02 };
});

const headerTitle = computed(() => {
  if (viewMode.value === 'details') return '项目详情';
  if (viewMode.value === 'acceptance' || viewMode.value === 'progress_detail' || viewMode.value === 'material_detail' || viewMode.value === 'progress_schedule') return '过程验收';
  if (viewMode.value === 'progress_schedule_success') {
    return successSource.value === 'defect_add' ? (lastViewMode.value === 'defect_report' ? '缺陷汇报' : '缺陷整改') : '过程验收';
  }
  if (viewMode.value === 'after_sales' || viewMode.value === 'after_sales_schedule' || viewMode.value === 'after_sales_success') return '售后计划';
  if (viewMode.value === 'evaluation' || viewMode.value === 'evaluation_success') return '项目评价';
  if (viewMode.value === 'completion') return '竣工资料';
  if (viewMode.value === 'standards') return '施工标准';
  if (viewMode.value === 'reports') return '施工报告';
  if (viewMode.value === 'report_detail') {
    if (selectedReport.value?.type === 'weekly') return '周报详情';
    if (selectedReport.value?.type === 'ehs') return 'EHS周报详情';
    return '日报详情';
  }
  if (viewMode.value === 'defect_report') return '缺陷汇报';
  if (viewMode.value === 'defect_add' || viewMode.value === 'defect_detail') {
    if (lastViewMode.value === 'defect_report') return '缺陷汇报';
    return (lastViewMode.value === 'progress_detail' || lastViewMode.value === 'acceptance' || lastViewMode.value === 'material_detail') ? '过程验收' : '缺陷整改';
  }
  return '详细信息';
});

const filteredProjects = computed(() => {
  let projects = projectList.value;
  
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

const handleProgressScheduleSubmit = (formData: any) => {
  if (selectedProgressItem.value) {
    const index = progressData.value.findIndex(item => item.node === selectedProgressItem.value.node);
    if (index !== -1) {
      progressData.value[index] = {
        ...progressData.value[index],
        appointmentDate: formData.scheduledDate
      };
    }
  }
  successSource.value = 'progress_schedule';
  viewMode.value = 'progress_schedule_success';
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
  defectReportOrigin.value = viewMode.value;
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

const handleDefectReview = (payload: { id: number, status: 'pass' | 'fail', description: string }) => {
  const targetArray = lastViewMode.value === 'defect_report' ? reportDefects.value : defects.value;
  const index = targetArray.findIndex(d => d.id === payload.id);
  
  if (index !== -1) {
    if (payload.status === 'pass') {
      targetArray[index].status = '已通过';
    } else {
      targetArray[index].status = lastViewMode.value === 'defect_report' ? '待处理' : '待整改';
      targetArray[index].description = payload.description;
      targetArray[index].finishDate = '';
      targetArray[index].rectifiedImage = '';
    }
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
  
  successSource.value = 'defect_add';
  viewMode.value = 'progress_schedule_success';
};

const viewMaterialDetail = (item: any) => {
  selectedMaterialItem.value = item;
  viewMode.value = 'material_detail';
};

const viewProgressDetail = (item: any) => {
  selectedProgressItem.value = item;
  progressDetailTab.value = 'acceptance_check';
  viewMode.value = 'progress_detail';
};

const scheduleProgressAcceptance = (item: any) => {
  selectedProgressItem.value = item;
  viewMode.value = 'progress_schedule';
};

const handleMaterialSubmit = (code: string) => {
  submittedMaterials.value.push(code);
};

const handleProgressSubmit = (node: string) => {
  submittedProgressItems.value.push(node);
};



const goBack = () => {
  if (viewMode.value === 'defect_detail' || viewMode.value === 'defect_add') {
    // If we are in defect_detail or defect_add, we should go back to where we came from.
    // This is stored in lastViewMode.
    const prevMode = lastViewMode.value;
    viewMode.value = prevMode as any;
    
    // If we go back to defect_report, we need to ensure the next back goes to details or acceptance.
    // We don't have a full stack, but we know defect_report is usually accessed from 'details' or 'acceptance'/'progress_detail'.
    // If we came from 'progress_detail', lastViewMode was 'progress_detail'.
    // If we came from 'defect_report', lastViewMode was 'defect_report'.
    // We need to preserve the origin of defect_report if we are going back to it.
    // Let's rely on the fact that if we are in defect_report, we can just go to 'details' or 'acceptance' based on context.
    // Actually, if we are in defect_report, we don't know where we came from unless we store it.
    // Let's add a `defectReportOrigin` ref to track where `defect_report` was opened from.
    return;
  }

  if (viewMode.value === 'material_detail' || viewMode.value === 'progress_detail' || viewMode.value === 'progress_schedule') {
    viewMode.value = 'acceptance';
  } else if (viewMode.value === 'progress_schedule_success') {
     if (successSource.value === 'defect_add') {
       viewMode.value = lastViewMode.value as any; // Go back to where defect_add was called from (defect_report or progress_detail)
     } else {
       viewMode.value = 'acceptance';
     }
  } else if (viewMode.value === 'defect_report') {
    if (defectReportOrigin.value === 'progress_detail' || defectReportOrigin.value === 'acceptance' || defectReportOrigin.value === 'material_detail') {
      viewMode.value = 'acceptance';
    } else {
      viewMode.value = 'details';
    }
  } else if (viewMode.value === 'report_detail') {
    viewMode.value = 'reports';
  } else if (viewMode.value === 'acceptance' || viewMode.value === 'after_sales' || viewMode.value === 'evaluation' || viewMode.value === 'evaluation_success' || viewMode.value === 'completion' || viewMode.value === 'standards' || viewMode.value === 'reports') {
    viewMode.value = 'details';
  } else if (viewMode.value === 'after_sales_schedule' || viewMode.value === 'after_sales_success') {
    viewMode.value = 'after_sales';
  }
};

const zoomImage = (url: string) => {
  zoomedImageUrl.value = url;
  isImageZoomed.value = true;
};

onMounted(async () => {
  if (props.autoOpenProjectId) {
    await nextTick();
    const target = projectList.value.find(p => p.id === props.autoOpenProjectId);
    if (target) {
      activeStatus.value = target.status;
      await nextTick();
      selectedProject.value = target;
      const vm = props.autoOpenViewMode;
      if (vm === 'reports') {
        viewMode.value = 'reports';
      } else if (vm === 'completion') {
        viewMode.value = 'completion';
      } else if (vm === 'acceptance') {
        viewMode.value = 'acceptance';
      } else if (vm === 'evaluation') {
        viewMode.value = 'evaluation';
      } else if (vm === 'standards') {
        viewMode.value = 'standards';
      } else {
        viewMode.value = 'details';
      }
    }
    emit('autoOpenConsumed');
  }
});
</script>

<template>
  <div class="min-h-screen bg-transparent relative overflow-x-hidden">
    <!-- Content Area -->
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
           <h1 class="text-3xl font-bold text-gray-800">工程项目</h1>
           <p class="text-gray-500 mt-1">查看和管理所有工程项目信息</p>
         </div>
      </div>
      
      <div class="relative shrink-0">
        <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="全局搜索项目..."
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
              <div class="w-1.5 h-6 bg-[#FFE600] rounded-full shadow-[0_0_15px_rgba(255,230,0,0.5)]"></div>
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
              @submitReview="handleDefectReview"
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
                    :initialTab="acceptanceTab"
                    @update:tab="acceptanceTab = $event"
                    @viewMaterialDetail="viewMaterialDetail"
                    @viewProgressDetail="viewProgressDetail"
                    @scheduleAcceptance="scheduleProgressAcceptance"
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
                    :initialTab="progressDetailTab"
                    @update:tab="progressDetailTab = $event"
                    @goBack="goBack"
                    @zoomImage="zoomImage"
                    @submit="handleProgressSubmit"
                    @addDefect="addDefect"
                    @viewDefectDetail="viewDefectDetail"
                  />
                </div>

                <!-- Progress Schedule Mode -->
                <div v-else-if="viewMode === 'progress_schedule'" :key="'progress_schedule'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
                  <AfterSalesSchedule
                    :plan="{ nodeName: selectedProgressItem?.node, plannedTime: selectedProgressItem?.planDate }"
                    @submit="handleProgressScheduleSubmit"
                    @cancel="goBack"
                  />
                </div>

                <!-- Progress Schedule Success Mode -->
                <div v-else-if="viewMode === 'progress_schedule_success'" :key="'progress_schedule_success'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
                  <AfterSalesSuccess
                    title="已完成提交"
                    :message="successSource === 'defect_add' ? '您的缺陷记录已成功发布到系统中' : '您的预约验收时间已成功记录到系统中'"
                    @return="goBack"
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

                <!-- Daily/Weekly/EHS Report Detail Mode -->
                <div v-else-if="viewMode === 'report_detail'" :key="'report_detail'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                  <WeeklyReportDetail
                    v-if="selectedReport?.type === 'weekly'"
                    :report="selectedReport"
                  />
                  <EHSReportDetail
                    v-else-if="selectedReport?.type === 'ehs'"
                    :report="selectedReport"
                  />
                  <DailyReportDetail
                    v-else
                    :report="selectedReport"
                  />
                </div>
                <div v-else :key="'fallback'" class="hidden"></div>
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
