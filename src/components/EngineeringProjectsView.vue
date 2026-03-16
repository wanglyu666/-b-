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
  MoreHorizontal
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
const viewMode = ref<'details' | 'acceptance' | 'material_detail'>('details');
const acceptanceTab = ref<'material' | 'progress'>('material');
const selectedMaterialItem = ref<any>(null);
const evaluation = ref<'pass' | 'fail' | null>(null);
const submittedMaterials = ref<string[]>([]);
const isSubmittedSuccess = ref(false);
const isImageZoomed = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 9; // 3 rows * 3 columns

const materialData = [
  { pro: '装饰', cat: '轻钢龙骨板材', code: 'KMB-LP-001', name: '矿棉板', brand: '龙牌', model: '/', spec: '600*1200*14', unit: '平方', qty: 100, plan: '2025-12-30', actual: '2026-03-13', note: '' },
  { pro: '装饰', cat: '轻钢龙骨板材', code: 'KMB-LP-002', name: '矿棉板', brand: '龙牌', model: '/', spec: '600*1200*15', unit: '平方', qty: '', plan: '2025-12-31', actual: '', note: '' },
  { pro: '装饰', cat: '轻钢龙骨板材', code: 'BLM-HM-001', name: '玻璃棉', brand: '华美', model: '/', spec: '5公分24K', unit: '平方', qty: '', plan: '2025-12-31', actual: '', note: '' },
];

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

const viewMaterialDetail = (item: any) => {
  selectedMaterialItem.value = item;
  evaluation.value = null;
  isSubmittedSuccess.value = false;
  viewMode.value = 'material_detail';
};

const handleSubmit = () => {
  if (evaluation.value && selectedMaterialItem.value) {
    submittedMaterials.value.push(selectedMaterialItem.value.code);
    isSubmittedSuccess.value = true;
  }
};

const goBack = () => {
  isSubmittedSuccess.value = false;
  if (viewMode.value === 'material_detail') {
    viewMode.value = 'acceptance';
  } else if (viewMode.value === 'acceptance') {
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
          'transition-all duration-500 ease-in-out shadow-2xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] overflow-hidden flex flex-col',
          viewMode === 'details' ? 'max-w-3xl w-full' : 'max-w-[95vw] w-full'
        ]"
      >
        <div class="w-full flex flex-col">
          <!-- Header -->
          <div class="px-8 py-6 border-b border-white/10 flex justify-between items-center flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-1.5 h-6 bg-[#FFC091] rounded-full shadow-[0_0_15px_rgba(255,192,145,0.5)]"></div>
              <h2 class="text-2xl font-bold text-white tracking-tight">
                {{ viewMode === 'details' ? '项目详情' : (viewMode === 'acceptance' ? '过程验收' : '详细信息') }}
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
          <div class="p-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
            <!-- Details Mode -->
            <div v-if="viewMode === 'details'" class="animate-in slide-in-from-left-4 duration-500">
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
                  <button class="py-4 px-4 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-4 group">
                    <div class="text-rose-400 group-hover:scale-110 transition-all"><MapPin :size="20" /></div>
                    <span class="tracking-wide">现场巡查</span>
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

            <!-- Acceptance Mode -->
            <div v-else-if="viewMode === 'acceptance'" class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
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

              <!-- Material Content -->
              <div v-if="acceptanceTab === 'material'" class="flex flex-col gap-8">
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
              <div v-else class="flex items-center justify-center py-20 text-white/40 italic">
                进度管控模块正在开发中...
              </div>
            </div>

            <!-- Material Detail Mode -->
            <div v-else-if="viewMode === 'material_detail'" class="animate-in zoom-in-95 duration-500 flex flex-col gap-16">
              <div v-if="isSubmittedSuccess" class="flex flex-col items-center justify-center py-20 gap-8 animate-in fade-in zoom-in-95 duration-500">
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

              <template v-else>
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
              </template>
            </div>
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
