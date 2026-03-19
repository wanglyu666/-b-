<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  ArrowLeft, 
  X, 
  FileText, 
  ClipboardCheck, 
  Headset, 
  FolderCheck, 
  MapPin, 
  Star, 
  ShieldCheck,
  Search,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  AlertTriangle,
  Plus,
  Image as ImageIcon,
  Trash2,
  Calendar
} from 'lucide-vue-next';
import { engineeringProjects } from '../data';
import type { EngineeringProject } from '../types';

const props = defineProps<{
  initialStatus?: string;
}>();

const emit = defineEmits(['back']);

const statuses = ['待开工', '施工中', '已完工', '已结算', '保修中', '保修外'];
const activeStatus = ref(props.initialStatus || '施工中');
const selectedProject = ref<EngineeringProject | null>(null);
const viewMode = ref<'details' | 'acceptance' | 'material_detail' | 'progress_detail' | 'defect_report' | 'defect_detail' | 'defect_add'>('details');
const acceptanceTab = ref<'material' | 'progress'>('material');
const progressDetailTab = ref<'acceptance_check' | 'defect_rectification'>('acceptance_check');

const defaultDefects = [
  { 
    id: 1, 
    image: 'https://picsum.photos/seed/defect1/800/600', 
    rectifiedImage: 'https://picsum.photos/seed/rectified1/800/600',
    description: '吊顶龙骨安装间距不符合规范，局部存在下垂现象，需重新加固。', 
    date: '2026-03-10', 
    planDate: '2026-03-15',
    finishDate: '2026-03-14',
    status: '已完成' 
  },
  { 
    id: 2, 
    image: 'https://picsum.photos/seed/defect2/800/600', 
    rectifiedImage: '',
    description: '墙面乳胶漆涂刷不均匀，存在明显流坠和透底，需重新打磨涂刷。', 
    date: '2026-03-12', 
    planDate: '2026-03-18',
    finishDate: '',
    status: '整改中' 
  },
  { 
    id: 3, 
    image: 'https://picsum.photos/seed/defect3/800/600', 
    rectifiedImage: '',
    description: '地面瓷砖空鼓率超标，共计5处，需拆除重新铺贴。', 
    date: '2026-03-14', 
    planDate: '2026-03-20',
    finishDate: '',
    status: '待整改' 
  },
];

const defaultReportDefects = [
  { 
    id: 101, 
    image: 'https://picsum.photos/seed/report1/800/600', 
    rectifiedImage: '',
    description: '现场堆放杂乱，未按规定区域分类堆放材料。', 
    date: '2026-03-15', 
    planDate: '2026-03-20',
    finishDate: '',
    status: '待处理' 
  },
  { 
    id: 102, 
    image: 'https://picsum.photos/seed/report2/800/600', 
    rectifiedImage: 'https://picsum.photos/seed/report2_rect/800/600',
    description: '部分工人未佩戴安全帽进入施工区域。', 
    date: '2026-03-16', 
    planDate: '2026-03-17',
    finishDate: '2026-03-16',
    status: '已处理' 
  }
];

const defaultMaterialData = [
  { pro: '装饰', cat: '轻钢龙骨板材', code: 'KMB-LP-001', name: '矿棉板', brand: '龙牌', model: '/', spec: '600*1200*14', unit: '平方', qty: 100, plan: '2025-12-30', actual: '2026-03-13', note: '' },
  { pro: '装饰', cat: '轻钢龙骨板材', code: 'KMB-LP-002', name: '矿棉板', brand: '龙牌', model: '/', spec: '600*1200*15', unit: '平方', qty: '', plan: '2025-12-31', actual: '', note: '' },
  { pro: '装饰', cat: '轻钢龙骨板材', code: 'BLM-HM-001', name: '玻璃棉', brand: '华美', model: '/', spec: '5公分24K', unit: '平方', qty: '', plan: '2025-12-31', actual: '', note: '' },
];

const defaultProgressData = [
  { node: '竣工验收', planDate: '2026-01-31', appointmentDate: '2026-03-16', type: '现场验收', status: '未通过' },
  { node: '电气测试', planDate: '2026-01-25', appointmentDate: '2026-03-13', type: '现场验收', status: '未通过' },
  { node: '放线验收', planDate: '2026-01-19', appointmentDate: '2026-03-13', type: '现场验收', status: '已通过' },
];

interface ProjectData {
  defects: any[];
  reportDefects: any[];
  materialData: any[];
  progressData: any[];
  submittedMaterials: string[];
  submittedProgressItems: string[];
}

const projectDataMap = ref<Record<string, ProjectData>>({});

const getProjectData = (projectId: string) => {
  if (!projectDataMap.value[projectId]) {
    const seedSuffix = projectId.substring(0, 4);
    projectDataMap.value[projectId] = {
      defects: JSON.parse(JSON.stringify(defaultDefects)).map((d: any) => ({
        ...d,
        image: d.image.replace('defect', `defect_${seedSuffix}_`),
        rectifiedImage: d.rectifiedImage ? d.rectifiedImage.replace('rectified', `rectified_${seedSuffix}_`) : ''
      })),
      reportDefects: JSON.parse(JSON.stringify(defaultReportDefects)).map((d: any) => ({
        ...d,
        image: d.image.replace('report', `report_${seedSuffix}_`),
        rectifiedImage: d.rectifiedImage ? d.rectifiedImage.replace('report', `report_${seedSuffix}_`) : ''
      })),
      materialData: JSON.parse(JSON.stringify(defaultMaterialData)).map((m: any) => ({
        ...m,
        code: `${m.code}-${seedSuffix}`
      })),
      progressData: JSON.parse(JSON.stringify(defaultProgressData)),
      submittedMaterials: [],
      submittedProgressItems: []
    };
  }
  return projectDataMap.value[projectId];
};

const currentProjectData = computed(() => {
  if (!selectedProject.value) return null;
  return getProjectData(selectedProject.value.id);
});

const defects = computed({
  get: () => currentProjectData.value?.defects || [],
  set: (val) => {
    if (currentProjectData.value) currentProjectData.value.defects = val;
  }
});

const reportDefects = computed({
  get: () => currentProjectData.value?.reportDefects || [],
  set: (val) => {
    if (currentProjectData.value) currentProjectData.value.reportDefects = val;
  }
});

const materialData = computed(() => currentProjectData.value?.materialData || []);
const progressData = computed(() => currentProjectData.value?.progressData || []);

const submittedMaterials = computed({
  get: () => currentProjectData.value?.submittedMaterials || [],
  set: (val) => {
    if (currentProjectData.value) currentProjectData.value.submittedMaterials = val;
  }
});

const submittedProgressItems = computed({
  get: () => currentProjectData.value?.submittedProgressItems || [],
  set: (val) => {
    if (currentProjectData.value) currentProjectData.value.submittedProgressItems = val;
  }
});

const selectedDefect = ref<any>(null);
const lastViewMode = ref<string>('');
const selectedMaterialItem = ref<any>(null);
const selectedProgressItem = ref<any>(null);
const evaluation = ref<'pass' | 'fail' | null>(null);
const isSubmittedSuccess = ref(false);
const isImageZoomed = ref(false);
const searchQuery = ref('');

// New Defect Form State
const newDefectImage = ref('');
const newDefectDescription = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const currentPage = ref(1);
const itemsPerPage = 9; // 3 rows * 3 columns

const windowSize = ref({ width: window.innerWidth, height: window.innerHeight });
window.addEventListener('resize', () => {
  windowSize.value = { width: window.innerWidth, height: window.innerHeight };
});

const modalDimensions = computed(() => {
  if (viewMode.value === 'details') {
    return { width: '768px', height: '760px', radius: '40px', scale: 1 };
  }
  if (viewMode.value === 'defect_report' || viewMode.value === 'defect_detail' || viewMode.value === 'defect_add') {
    // If we are in the "Process Acceptance" flow, keep the large size
    if (lastViewMode.value === 'progress_detail' || lastViewMode.value === 'acceptance' || lastViewMode.value === 'material_detail') {
      const w = Math.round(windowSize.value.width * 0.95);
      const h = Math.round(windowSize.value.height * 0.9);
      return { width: `${w}px`, height: `${h}px`, radius: '24px', scale: 1.02 };
    }
    return { width: '1000px', height: '800px', radius: '32px', scale: 1 };
  }
  // Convert 95vw and 90vh to pixels for perfect interpolation
  const w = Math.round(windowSize.value.width * 0.95);
  const h = Math.round(windowSize.value.height * 0.9);
  return { width: `${w}px`, height: `${h}px`, radius: '24px', scale: 1.02 };
});

const headerTitle = computed(() => {
  if (viewMode.value === 'details') return '项目详情';
  if (viewMode.value === 'acceptance' || viewMode.value === 'progress_detail' || viewMode.value === 'material_detail') return '过程验收';
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

// Reset page when status or search changes
watch([activeStatus, searchQuery], () => {
  currentPage.value = 1;
});

const getStatusColor = (status: string) => {
  switch (status) {
    case '待开工': return 'bg-yellow-50 text-yellow-600';
    case '施工中': return 'bg-[#163300]/10 text-[#163300]';
    case '已完工': return 'bg-[#A1D573]/20 text-[#5a8632]';
    case '已结算': return 'bg-blue-50 text-blue-600';
    case '保修中': return 'bg-gray-100 text-gray-600';
    case '保修外': return 'bg-red-50 text-red-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

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
  acceptanceTab.value = 'material';
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
  newDefectImage.value = '';
  newDefectDescription.value = '';
  lastViewMode.value = viewMode.value;
  viewMode.value = 'defect_add';
};

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      newDefectImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(target.files[0]);
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const confirmAddDefect = () => {
  if (!newDefectImage.value || !newDefectDescription.value) {
    alert('请上传照片并输入描述');
    return;
  }

  const newDefect = {
    id: Date.now(),
    image: newDefectImage.value,
    rectifiedImage: '',
    description: newDefectDescription.value,
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
  evaluation.value = null;
  isSubmittedSuccess.value = false;
  viewMode.value = 'material_detail';
};

const viewProgressDetail = (item: any) => {
  selectedProgressItem.value = item;
  evaluation.value = null;
  isSubmittedSuccess.value = false;
  viewMode.value = 'progress_detail';
  progressDetailTab.value = 'acceptance_check';
};

const handleSubmit = () => {
  if (evaluation.value) {
    if (viewMode.value === 'material_detail' && selectedMaterialItem.value) {
      submittedMaterials.value.push(selectedMaterialItem.value.code);
    } else if (viewMode.value === 'progress_detail' && selectedProgressItem.value) {
      submittedProgressItems.value.push(selectedProgressItem.value.node);
    }
    isSubmittedSuccess.value = true;
  }
};

const goBack = () => {
  isSubmittedSuccess.value = false;
  if (viewMode.value === 'defect_detail' || viewMode.value === 'defect_add') {
    viewMode.value = lastViewMode.value as any;
    return;
  }
  
  if (viewMode.value === 'material_detail' || viewMode.value === 'progress_detail') {
    viewMode.value = 'acceptance';
  } else if (viewMode.value === 'acceptance' || viewMode.value === 'defect_report') {
    viewMode.value = 'details';
  }
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
      <div 
        v-for="project in paginatedProjects" 
        :key="project.id"
        @click="openModal(project)"
        class="cursor-pointer group bg-white/50 backdrop-blur-md border border-white/20 rounded-[32px] overflow-hidden transition-all hover:bg-white/60 hover:shadow-lg"
      >
        <div class="p-6 w-full">
          <h3 class="text-xl font-bold text-gray-800 mb-1 transition-colors mt-2">{{ project.name }}</h3>
          <p class="text-sm text-gray-500 mb-6 font-mono">{{ project.no }}</p>
          
          <div class="grid grid-cols-2 gap-y-5 gap-x-4">
            <div>
              <p class="text-xs text-gray-500 font-medium mb-1">合同金额</p>
              <p class="font-bold text-gray-800 text-lg">{{ project.amount }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium mb-1">项目负责人</p>
              <p class="font-bold text-gray-800 text-base">{{ project.manager }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium mb-1">联系方式</p>
              <p class="font-bold text-gray-800 font-mono">{{ project.contact }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium mb-1">开工日期</p>
              <p class="font-bold text-gray-800 text-sm">{{ project.startDate || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
      
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
              <div v-if="viewMode === 'details'" :key="'details'" class="animate-in slide-in-from-left-4 duration-500">
              <div class="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 mb-8 border border-white/10 shadow-inner">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                  <div>
                    <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">项目编号</p>
                    <p class="font-bold text-white text-xl font-mono tracking-tight">{{ selectedProject.no }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">项目名称</p>
                    <p class="font-bold text-white text-xl tracking-tight">{{ selectedProject.name }}</p>
                  </div>
                  <div class="sm:col-span-2">
                    <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">项目地址</p>
                    <p class="font-bold text-white text-xl tracking-tight">{{ selectedProject.address }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">合同金额</p>
                    <p class="font-bold text-white text-3xl tracking-tighter">{{ selectedProject.amount }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">项目状态</p>
                    <div class="inline-flex items-center px-3 py-1 rounded-full bg-[#A1D573]/20 border border-[#A1D573]/30 text-[#A1D573] text-sm font-bold">
                      {{ selectedProject.status }}
                    </div>
                  </div>
                  <div>
                    <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">项目负责人</p>
                    <p class="font-bold text-white text-xl tracking-tight">{{ selectedProject.manager }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">联系方式</p>
                    <p class="font-bold text-white text-xl font-mono tracking-tight">{{ selectedProject.contact }}</p>
                  </div>
                </div>
              </div>
              
              <!-- 操作按钮组 -->
              <h3 class="text-sm font-bold text-white/40 uppercase tracking-widest mb-6 px-2">项目操作指令</h3>
              <div class="flex flex-col gap-4">
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <button class="py-4 px-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-all flex flex-col items-center justify-center gap-3 group">
                    <div class="text-blue-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] transition-all"><FileText :size="20" /></div>
                    <span class="tracking-wide">施工报告</span>
                  </button>
                  <button @click="enterAcceptance" class="py-4 px-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-all flex flex-col items-center justify-center gap-3 group">
                    <div class="text-orange-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(251,146,60,0.5)] transition-all"><ClipboardCheck :size="20" /></div>
                    <span class="tracking-wide">过程验收</span>
                  </button>
                  <button class="py-4 px-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-all flex flex-col items-center justify-center gap-3 group">
                    <div class="text-pink-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(244,114,182,0.5)] transition-all"><Headset :size="20" /></div>
                    <span class="tracking-wide">售后计划</span>
                  </button>
                  <button class="py-4 px-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-all flex flex-col items-center justify-center gap-3 group">
                    <div class="text-indigo-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.5)] transition-all"><FolderCheck :size="20" /></div>
                    <span class="tracking-wide">竣工资料</span>
                  </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button @click="enterDefects" class="py-4 px-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-4 group">
                    <div class="text-rose-400 group-hover:scale-110 transition-all"><AlertTriangle :size="20" /></div>
                    <span class="tracking-wide">缺陷汇报</span>
                  </button>
                  <button class="py-4 px-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-4 group">
                    <div class="text-yellow-400 group-hover:scale-110 transition-all"><Star :size="20" /></div>
                    <span class="tracking-wide">项目评价</span>
                  </button>
                  <button class="py-4 px-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-4 group">
                    <div class="text-[#A1D573] group-hover:scale-110 transition-all"><ShieldCheck :size="20" /></div>
                    <span class="tracking-wide">巡检服务</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Defect Report Mode -->
            <div v-else-if="viewMode === 'defect_report'" :key="'defect_report'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full relative">
              <!-- Top Header with Add Button -->
              <div class="flex justify-between items-center mb-6 px-2">
                <div class="flex items-center gap-2">
                  <div class="w-1 h-4 bg-orange-400 rounded-full"></div>
                  <span class="text-white/40 text-xs font-bold uppercase tracking-widest">缺陷记录列表</span>
                </div>
                <button 
                  @click="addDefect"
                  class="px-4 py-2 rounded-xl bg-[#FFC091] text-[#260A2F] text-xs font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/10"
                >
                  <Plus :size="16" />
                  新增缺陷
                </button>
              </div>

              <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                  <div 
                    v-for="(defect, index) in reportDefects" 
                    :key="defect.id"
                    @click="viewDefectDetail(defect)"
                    class="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500 cursor-pointer hover:border-white/20"
                    :style="{ animationDelay: `${index * 80}ms` }"
                  >
                    <div class="aspect-[4/3] overflow-hidden relative">
                      <img :src="defect.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                      <div class="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-md" 
                        :class="(defect.status === '已完成' || defect.status === '已处理') ? 'bg-[#A1D573]/20 text-[#A1D573]' : 'bg-orange-500/20 text-orange-400'">
                        {{ defect.status }}
                      </div>
                    </div>
                    <div class="p-4">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-white/30 text-[9px] font-mono uppercase tracking-widest">{{ defect.date }}</span>
                      </div>
                      <p class="text-white/70 leading-relaxed text-xs line-clamp-2">
                        {{ defect.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Defect Detail Mode -->
            <div v-else-if="viewMode === 'defect_detail' && selectedDefect" :key="'defect_detail'" class="animate-in zoom-in-95 duration-500 flex flex-col h-full relative">
              <!-- Top: Images -->
              <div class="grid grid-cols-2 gap-6 mb-8">
                <div class="space-y-3">
                  <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold text-center">缺陷照片</p>
                  <div class="aspect-video rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative group">
                    <img :src="selectedDefect.image" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Search :size="24" class="text-white" />
                    </div>
                  </div>
                </div>
                <div class="space-y-3">
                  <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold text-center">整改完成照片</p>
                  <div class="aspect-video rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative group flex items-center justify-center">
                    <img v-if="selectedDefect.rectifiedImage" :src="selectedDefect.rectifiedImage" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div v-else class="flex flex-col items-center gap-2 text-white/20">
                      <ImageIcon :size="48" />
                      <span class="text-[10px] font-bold uppercase tracking-widest">暂无整改照片</span>
                    </div>
                    <div v-if="selectedDefect.rectifiedImage" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Search :size="24" class="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bottom: Info and Delete -->
              <div class="flex-1 flex items-end justify-between gap-12 pb-2">
                <!-- Left: Info -->
                <div class="flex-1 grid grid-cols-2 gap-x-12 gap-y-6">
                  <div class="col-span-2">
                    <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-2">缺陷描述</p>
                    <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p class="text-white/80 text-sm leading-relaxed">{{ selectedDefect.description }}</p>
                    </div>
                  </div>
                  <div>
                    <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-2">计划完成时间</p>
                    <div class="flex items-center gap-3 text-white">
                      <Calendar :size="16" class="text-orange-400" />
                      <span class="text-lg font-bold font-mono">{{ selectedDefect.planDate }}</span>
                    </div>
                  </div>
                  <div>
                    <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-2">实际完成时间</p>
                    <div class="flex items-center gap-3 text-white">
                      <CheckCircle :size="16" :class="selectedDefect.finishDate ? 'text-[#A1D573]' : 'text-white/20'" />
                      <span class="text-lg font-bold font-mono" :class="!selectedDefect.finishDate && 'text-white/20'">
                        {{ selectedDefect.finishDate || '尚未完成' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Right: Delete Button -->
                <div class="pb-1">
                  <button 
                    @click="deleteDefect(selectedDefect.id)"
                    class="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-bold transition-all border border-rose-500/20"
                  >
                    <Trash2 :size="18" />
                    删除记录
                  </button>
                </div>
              </div>
            </div>

            <!-- Defect Add Mode -->
            <div v-else-if="viewMode === 'defect_add'" :key="'defect_add'" class="animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full relative">
              <div class="flex-1 flex flex-col gap-8">
                <!-- Image Upload Section -->
                <div class="space-y-4">
                  <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">缺陷照片上传</p>
                  <div 
                    @click="triggerFileInput"
                    class="w-[550px] h-[325px] rounded-3xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group overflow-hidden relative mx-auto"
                  >
                    <input 
                      type="file" 
                      ref="fileInput" 
                      class="hidden" 
                      accept="image/*" 
                      @change="handleImageUpload" 
                    />
                    
                    <template v-if="newDefectImage">
                      <img :src="newDefectImage" class="w-full h-full object-cover" />
                      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon :size="32" class="text-white" />
                        <span class="text-white text-xs font-bold ml-2">更换图片</span>
                      </div>
                    </template>
                    <template v-else>
                      <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus :size="32" class="text-white/40" />
                      </div>
                      <div class="text-center">
                        <p class="text-white/60 font-bold text-sm">点击上传缺陷照片</p>
                        <p class="text-white/20 text-[10px] mt-1 uppercase tracking-widest">支持 JPG, PNG 格式</p>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Description Section -->
                <div class="space-y-4">
                  <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">缺陷描述</p>
                  <textarea 
                    v-model="newDefectDescription"
                    placeholder="请输入缺陷详细描述，例如：位置、具体问题、整改要求等..."
                    class="w-full h-[100px] bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm leading-relaxed focus:outline-none focus:border-orange-400/50 transition-all placeholder:text-white/10 resize-none"
                  ></textarea>
                </div>
              </div>

              <!-- Bottom Action -->
              <div class="flex justify-end pt-6">
                <button 
                  @click="confirmAddDefect"
                  class="px-12 py-4 rounded-2xl bg-[#FFC091] text-[#260A2F] font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20 flex items-center gap-2"
                >
                  确定发布
                </button>
              </div>
            </div>

                <!-- Acceptance Mode -->
                <div v-else-if="viewMode === 'acceptance'" :key="'acceptance'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
              <!-- Sub Tabs -->
              <div class="flex gap-3">
                <button 
                  @click="acceptanceTab = 'material'"
                  :class="['px-6 py-2 rounded-full text-sm font-bold transition-all', 
                    acceptanceTab === 'material' ? 'bg-[#FFC091] text-[#260A2F]' : 'bg-white/5 text-white/60 hover:bg-white/10']"
                >
                  材料管控
                </button>
                <button 
                  @click="acceptanceTab = 'progress'"
                  :class="['px-6 py-2 rounded-full text-sm font-bold transition-all', 
                    acceptanceTab === 'progress' ? 'bg-[#FFC091] text-[#260A2F]' : 'bg-white/5 text-white/60 hover:bg-white/10']"
                >
                  进度管控
                </button>
              </div>

              <Transition name="fade-slide" mode="out-in">
                <!-- Material Content -->
                <div v-if="acceptanceTab === 'material'" :key="'material'" class="flex flex-col gap-8">
                <!-- Table 1: Material List -->
                <div class="bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-inner">
                  <div class="px-8 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 class="text-white font-bold flex items-center gap-2">
                       <div class="w-1 h-4 bg-[#FFC091] rounded-full shadow-[0_0_8px_rgba(255,192,145,0.4)]"></div>
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
                        <tr v-for="(item, i) in materialData" :key="i" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td class="px-6 py-4">{{ item.pro }}</td>
                          <td class="px-6 py-4">{{ item.cat }}</td>
                          <td class="px-6 py-4 font-mono">{{ item.code }}</td>
                          <td class="px-6 py-4">{{ item.name }}</td>
                          <td class="px-6 py-4">{{ item.brand }}</td>
                          <td class="px-6 py-4">{{ item.spec }}</td>
                          <td class="px-6 py-4">{{ item.unit }}</td>
                          <td class="px-6 py-4 text-white/40 italic">{{ item.note || '-' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Table 2: Entry Plan -->
                <div class="bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-inner">
                  <div class="px-8 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 class="text-white font-bold flex items-center gap-2">
                       <div class="w-1 h-4 bg-[#FFC091] rounded-full shadow-[0_0_8px_rgba(255,192,145,0.4)]"></div>
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
                          <th class="px-6 py-3"></th>
                        </tr>
                      </thead>
                      <tbody class="text-white/80 text-xs">
                        <tr v-for="(item, i) in materialData" :key="i" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td class="px-6 py-4">{{ item.pro }}</td>
                          <td class="px-6 py-4">{{ item.cat }}</td>
                          <td class="px-6 py-4 font-mono">{{ item.code }}</td>
                          <td class="px-6 py-4">{{ item.name }}</td>
                          <td class="px-6 py-4">{{ item.brand }}</td>
                          <td class="px-6 py-4">{{ item.model }}</td>
                          <td class="px-6 py-4">{{ item.spec }}</td>
                          <td class="px-6 py-4">{{ item.unit }}</td>
                          <td class="px-6 py-4 font-bold">{{ item.qty || '-' }}</td>
                          <td class="px-6 py-4 font-mono">{{ item.plan }}</td>
                          <td class="px-6 py-4 font-mono text-white/80">{{ item.actual || '-' }}</td>
                          <td class="px-6 py-4 text-white/40 italic">{{ item.note || '-' }}</td>
                          <td class="px-6 py-4">
                            <button @click="viewMaterialDetail(item)" class="p-1 hover:bg-white/10 rounded-full transition-colors">
                              <MoreHorizontal :size="16" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Progress Content -->
              <div v-else :key="'progress'" class="flex flex-col gap-8">
                <div class="bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-inner">
                  <div class="px-8 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 class="text-white font-bold flex items-center gap-2">
                       <div class="w-1 h-4 bg-[#FFC091] rounded-full shadow-[0_0_8px_rgba(255,192,145,0.4)]"></div>
                       进度验收节点
                    </h3>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                      <thead>
                        <tr class="bg-white/5 text-white/40 text-[10px] uppercase tracking-widest font-bold">
                          <th class="px-6 py-3">验收节点名称</th>
                          <th class="px-6 py-3">计划验收时间</th>
                          <th class="px-6 py-3">预约验收时间</th>
                          <th class="px-6 py-3">验收类型</th>
                          <th class="px-6 py-3">验收状态</th>
                          <th class="px-6 py-3"></th>
                        </tr>
                      </thead>
                      <tbody class="text-white/80 text-xs">
                        <tr v-for="(item, i) in progressData" :key="i" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td class="px-6 py-4">{{ item.node }}</td>
                          <td class="px-6 py-4 font-mono">{{ item.planDate }}</td>
                          <td class="px-6 py-4 font-mono">{{ item.appointmentDate }}</td>
                          <td class="px-6 py-4">{{ item.type }}</td>
                          <td class="px-6 py-4">
                            <span :class="[
                              'px-3 py-1 rounded-full text-[10px] font-bold',
                              item.status === '已通过' ? 'bg-[#A1D573]/20 text-[#A1D573]' : 'bg-rose-500/20 text-rose-400'
                            ]">
                              {{ item.status }}
                            </span>
                          </td>
                          <td class="px-6 py-4">
                            <button @click="viewProgressDetail(item)" class="p-1 hover:bg-white/10 rounded-full transition-colors">
                              <MoreHorizontal :size="16" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

                <!-- Material Detail Mode -->
                <div v-else-if="viewMode === 'material_detail'" :key="'material_detail'" class="animate-in zoom-in-95 duration-500 flex flex-col gap-16">
              <Transition name="fade-slide" mode="out-in">
                <div v-if="isSubmittedSuccess" :key="'success'" class="flex flex-col items-center justify-center py-20 gap-8 animate-in fade-in zoom-in-95 duration-500">
                <div class="w-24 h-24 rounded-full bg-[#A1D573]/20 flex items-center justify-center text-[#A1D573] shadow-[0_0_30px_rgba(161,213,115,0.3)]">
                  <CheckCircle :size="64" />
                </div>
                <div class="text-center">
                  <h3 class="text-3xl font-bold text-white mb-2">已完成提交</h3>
                  <p class="text-white/40">您的验收评价已成功记录到系统中</p>
                </div>
                <button 
                  @click="goBack"
                  class="h-14 px-12 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl transition-all border border-white/10"
                >
                  返回上级页面
                </button>
              </div>

              <div v-else :key="'detail'">
                <!-- Top Section: Info & Image -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <!-- Left: Material Info (Red Box Area) -->
                  <div class="grid grid-cols-2 gap-y-12 gap-x-16 py-6">
                    <div>
                      <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">品类</p>
                      <p class="text-white text-2xl font-bold tracking-tight">{{ selectedMaterialItem?.cat }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">物料编码</p>
                      <p class="text-white text-2xl font-bold font-mono tracking-tight">{{ selectedMaterialItem?.code }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">物料名称</p>
                      <p class="text-white text-2xl font-bold tracking-tight">{{ selectedMaterialItem?.name }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">品牌</p>
                      <p class="text-white text-2xl font-bold tracking-tight">{{ selectedMaterialItem?.brand }}</p>
                    </div>
                  </div>

                  <!-- Right: Image (Blue Box Area) -->
                  <div class="relative group cursor-pointer overflow-hidden rounded-[48px] border border-white/10 bg-white/5 backdrop-blur-xl aspect-[16/9] flex items-center justify-center shadow-2xl" @click="isImageZoomed = true">
                    <img src="https://picsum.photos/seed/construction/1200/675" alt="Material" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div class="bg-white/20 backdrop-blur-md p-5 rounded-full border border-white/30 shadow-lg">
                        <Search :size="32" class="text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Bottom Section: Evaluation & Buttons -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-white/5 items-center">
                  <!-- Left: Evaluation (Yellow Box Area) -->
                  <div class="lg:col-span-7 flex items-center gap-10">
                    <template v-if="!submittedMaterials.includes(selectedMaterialItem?.code)">
                      <span class="text-xl font-bold text-white whitespace-nowrap tracking-tight">验收评价</span>
                      <div class="flex items-center gap-12">
                        <button 
                          v-for="opt in [
                            {id: 'pass', label: '通过'}, 
                            {id: 'fail', label: '不通过'}
                          ]" 
                          :key="opt.id"
                          @click="evaluation = opt.id as any"
                          class="flex items-center gap-4 group cursor-pointer"
                        >
                          <div 
                            :class="[
                              'w-7 h-7 rounded-full border-2 transition-all duration-300 flex items-center justify-center',
                              evaluation === opt.id ? 'border-[#FFC091] bg-[#FFC091]/10' : 'border-white/20 group-hover:border-white/40'
                            ]"
                          >
                            <div 
                              v-if="evaluation === opt.id"
                              class="w-3 h-3 rounded-full bg-[#FFC091] shadow-[0_0_12px_rgba(255,192,145,0.8)]"
                            ></div>
                          </div>
                          <span :class="['text-xl font-bold transition-colors', evaluation === opt.id ? 'text-white' : 'text-white/40 group-hover:text-white/60']">
                            {{ opt.label }}
                          </span>
                        </button>
                      </div>
                    </template>
                    <div v-else class="flex items-center gap-3 text-[#A1D573]">
                      <CheckCircle :size="24" />
                      <span class="text-xl font-bold tracking-tight">验收已完成</span>
                    </div>
                  </div>

                  <!-- Right: Buttons (Green & Pink Box Areas) -->
                  <div class="lg:col-span-5 flex items-center justify-end gap-6">
                    <!-- Download Button (Green Box) -->
                    <button class="h-18 px-10 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 text-white rounded-2xl transition-all flex items-center gap-5 group shadow-lg">
                      <div class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <FileText :size="24" />
                      </div>
                      <div class="text-left">
                        <p class="font-bold text-base">下载材料质量证明文件</p>
                      </div>
                    </button>

                    <!-- Submit Button (Pink Box) -->
                    <button 
                      v-if="!submittedMaterials.includes(selectedMaterialItem?.code)"
                      @click="handleSubmit"
                      :disabled="!evaluation"
                      :class="[
                        'h-18 px-16 font-bold text-xl rounded-2xl transition-all shadow-[0_10px_40px_rgba(255,192,145,0.3)] active:scale-[0.95]',
                        evaluation ? 'bg-[#FFC091] hover:bg-[#ffad70] text-[#260A2F]' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5 shadow-none'
                      ]"
                    >
                      提交
                    </button>
                    <button 
                      v-else
                      disabled
                      class="h-18 px-12 bg-white/5 text-white/40 font-bold text-xl rounded-2xl border border-white/10 cursor-not-allowed"
                    >
                      已完成提交
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

                <!-- Progress Detail Mode -->
                <div v-else-if="viewMode === 'progress_detail'" :key="'progress_detail'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
                  <!-- Sub Tabs -->
                  <div v-if="!isSubmittedSuccess" class="flex gap-3">
                <button 
                  @click="progressDetailTab = 'acceptance_check'"
                  :class="['px-6 py-2 rounded-full text-sm font-bold transition-all', 
                    progressDetailTab === 'acceptance_check' ? 'bg-[#FFC091] text-[#260A2F]' : 'bg-white/5 text-white/60 hover:bg-white/10']"
                >
                  验收
                </button>
                <button 
                  @click="progressDetailTab = 'defect_rectification'"
                  :class="['px-6 py-2 rounded-full text-sm font-bold transition-all', 
                    progressDetailTab === 'defect_rectification' ? 'bg-[#FFC091] text-[#260A2F]' : 'bg-white/5 text-white/60 hover:bg-white/10']"
                >
                  缺陷整改
                </button>
              </div>

              <Transition name="fade-slide" mode="out-in">
                <!-- Success Screen -->
                <div v-if="isSubmittedSuccess" :key="'success'" class="flex flex-col items-center justify-center py-20 gap-8 animate-in fade-in zoom-in-95 duration-500">
                <div class="w-24 h-24 rounded-full bg-[#A1D573]/20 flex items-center justify-center text-[#A1D573] shadow-[0_0_30px_rgba(161,213,115,0.3)]">
                  <CheckCircle :size="64" />
                </div>
                <div class="text-center">
                  <h3 class="text-3xl font-bold text-white mb-2">已完成提交</h3>
                  <p class="text-white/40">您的验收评价已成功记录到系统中</p>
                </div>
                <button 
                  @click="goBack"
                  class="h-14 px-12 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl transition-all border border-white/10"
                >
                  返回上级页面
                </button>
              </div>

              <!-- Acceptance Check Content -->
              <div v-else-if="progressDetailTab === 'acceptance_check'" :key="'check'" class="flex flex-col gap-16">
                  <!-- Top Section: Info & Image -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <!-- Left: Progress Info -->
                      <div class="grid grid-cols-2 gap-y-12 gap-x-16 py-6">
                        <div>
                          <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">验收节点名称</p>
                          <p class="text-white text-2xl font-bold tracking-tight">{{ selectedProgressItem?.node }}</p>
                        </div>
                        <div class="flex flex-col gap-12">
                          <div>
                            <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">计划验收时间</p>
                            <p class="text-white text-2xl font-bold font-mono tracking-tight">{{ selectedProgressItem?.planDate }}</p>
                          </div>
                          <div>
                            <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">预约验收时间</p>
                            <p class="text-white text-2xl font-bold font-mono tracking-tight">{{ selectedProgressItem?.appointmentDate }}</p>
                          </div>
                        </div>
                      </div>

                      <!-- Right: Image -->
                      <div class="relative group cursor-pointer overflow-hidden rounded-[48px] border border-white/10 bg-white/5 backdrop-blur-xl aspect-[16/9] max-h-[280px] flex items-center justify-center shadow-2xl" @click="isImageZoomed = true">
                      <img src="https://picsum.photos/seed/progress/1200/675" alt="Progress" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div class="bg-white/20 backdrop-blur-md p-5 rounded-full border border-white/30 shadow-lg">
                          <Search :size="32" class="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Bottom Section: Evaluation & Buttons -->
                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-white/5 items-center">
                    <!-- Left: Evaluation -->
                    <div class="lg:col-span-7 flex items-center gap-10">
                      <template v-if="!submittedProgressItems.includes(selectedProgressItem?.node)">
                        <span class="text-xl font-bold text-white whitespace-nowrap tracking-tight">验收评价</span>
                        <div class="flex items-center gap-12">
                          <button 
                            v-for="opt in [
                              {id: 'pass', label: '通过'}, 
                              {id: 'fail', label: '不通过'}
                            ]" 
                            :key="opt.id"
                            @click="evaluation = opt.id as any"
                            class="flex items-center gap-4 group cursor-pointer"
                          >
                            <div 
                              :class="[
                                'w-7 h-7 rounded-full border-2 transition-all duration-300 flex items-center justify-center',
                                evaluation === opt.id ? 'border-[#FFC091] bg-[#FFC091]/10' : 'border-white/20 group-hover:border-white/40'
                              ]"
                            >
                              <div 
                                v-if="evaluation === opt.id"
                                class="w-3 h-3 rounded-full bg-[#FFC091] shadow-[0_0_12px_rgba(255,192,145,0.8)]"
                              ></div>
                            </div>
                            <span :class="['text-xl font-bold transition-colors', evaluation === opt.id ? 'text-white' : 'text-white/40 group-hover:text-white/60']">
                              {{ opt.label }}
                            </span>
                          </button>
                        </div>
                      </template>
                      <div v-else class="flex items-center gap-3 text-[#A1D573]">
                        <CheckCircle :size="24" />
                        <span class="text-xl font-bold tracking-tight">验收已完成</span>
                      </div>
                    </div>

                    <!-- Right: Submit Button -->
                    <div class="lg:col-span-5 flex items-center justify-end gap-6">
                      <button 
                        v-if="!submittedProgressItems.includes(selectedProgressItem?.node)"
                        @click="handleSubmit"
                        :disabled="!evaluation"
                        :class="[
                          'h-18 px-16 font-bold text-xl rounded-2xl transition-all shadow-[0_10px_40px_rgba(255,192,145,0.3)] active:scale-[0.95]',
                          evaluation ? 'bg-[#FFC091] hover:bg-[#ffad70] text-[#260A2F]' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5 shadow-none'
                        ]"
                      >
                        提交
                      </button>
                      <button 
                        v-else
                        disabled
                        class="h-18 px-12 bg-white/5 text-white/40 font-bold text-xl rounded-2xl border border-white/10 cursor-not-allowed"
                      >
                        已完成提交
                      </button>
                    </div>
                  </div>
                </div>

              <!-- Defect Rectification Content -->
              <div v-else-if="progressDetailTab === 'defect_rectification'" class="flex-1 flex flex-col h-full relative min-h-[400px]">
                <!-- Top Header with Add Button -->
                <div class="flex justify-between items-center mb-6 px-2">
                  <div class="flex items-center gap-2">
                    <div class="w-1 h-4 bg-orange-400 rounded-full"></div>
                    <span class="text-white/40 text-xs font-bold uppercase tracking-widest">缺陷记录列表</span>
                  </div>
                  <button 
                    @click="addDefect"
                    class="px-4 py-2 rounded-xl bg-[#FFC091] text-[#260A2F] text-xs font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/10"
                  >
                    <Plus :size="16" />
                    新增缺陷
                  </button>
                </div>

                <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                    <div 
                      v-for="(defect, index) in defects" 
                      :key="defect.id"
                      @click="viewDefectDetail(defect)"
                      class="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500 cursor-pointer hover:border-white/20"
                      :style="{ animationDelay: `${index * 80}ms` }"
                    >
                      <div class="aspect-[4/3] overflow-hidden relative">
                        <img :src="defect.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                        <div class="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-md" 
                          :class="defect.status === '已完成' ? 'bg-[#A1D573]/20 text-[#A1D573]' : 'bg-orange-500/20 text-orange-400'">
                          {{ defect.status }}
                        </div>
                      </div>
                      <div class="p-4">
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-white/30 text-[9px] font-mono uppercase tracking-widest">{{ defect.date }}</span>
                        </div>
                        <p class="text-white/70 leading-relaxed text-xs line-clamp-2">
                          {{ defect.description }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
          </Transition>
        </div>
        </div>
      </div>
    </div>

    <!-- Image Lightbox -->
    <div v-if="isImageZoomed" class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300" @click="isImageZoomed = false">
      <img src="https://picsum.photos/seed/construction/1600/900" alt="Material Zoomed" class="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500" />
      <button class="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/20">
        <X :size="32" />
      </button>
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
