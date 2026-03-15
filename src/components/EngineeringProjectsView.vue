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
  ChevronLeft,
  ChevronRight
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
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 12; // 3 rows * 4 columns

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
};

const closeModal = () => {
  selectedProject.value = null;
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
        class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
      >
        <h3 class="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#A1D573] transition-colors mt-2">{{ project.name }}</h3>
        <p class="text-sm text-gray-400 mb-6 font-mono">{{ project.no }}</p>
        
        <div class="grid grid-cols-2 gap-y-5 gap-x-4">
          <div>
            <p class="text-xs text-gray-400 font-medium mb-1">合同金额</p>
            <p class="font-bold text-gray-900 text-lg">{{ project.amount }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 font-medium mb-1">项目负责人</p>
            <p class="font-bold text-gray-900 text-base">{{ project.manager }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 font-medium mb-1">联系方式</p>
            <p class="font-bold text-gray-900 font-mono">{{ project.contact }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 font-medium mb-1">开工日期</p>
            <p class="font-bold text-gray-900 text-sm">{{ project.startDate || '-' }}</p>
          </div>
        </div>
      </div>
      
      <div v-if="paginatedProjects.length === 0" class="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
        <p class="text-lg font-medium">{{ searchQuery ? '没有找到匹配的项目' : '暂无该状态的项目' }}</p>
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
    <div v-if="selectedProject" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" @click.self="closeModal">
      <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div class="flex items-center gap-3">
            <div class="w-1.5 h-6 bg-[#A1D573] rounded-full"></div>
            <h2 class="text-2xl font-bold text-gray-900">项目详情</h2>
          </div>
          <button @click="closeModal" class="p-2 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-full transition-colors">
            <X :size="24" />
          </button>
        </div>
        
        <!-- Content -->
        <div class="p-8">
          <div class="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p class="text-sm text-gray-500 font-medium mb-1">项目编号</p>
                <p class="font-bold text-gray-900 text-lg font-mono">{{ selectedProject.no }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 font-medium mb-1">项目名称</p>
                <p class="font-bold text-gray-900 text-lg">{{ selectedProject.name }}</p>
              </div>
              <div class="sm:col-span-2">
                <p class="text-sm text-gray-500 font-medium mb-1">项目地址</p>
                <p class="font-bold text-gray-900 text-lg">{{ selectedProject.address }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 font-medium mb-1">合同金额</p>
                <p class="font-bold text-[#A1D573] text-2xl">{{ selectedProject.amount }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 font-medium mb-1">项目状态</p>
                <p class="font-bold text-gray-900 text-lg">{{ selectedProject.status }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 font-medium mb-1">项目负责人</p>
                <p class="font-bold text-gray-900 text-lg">{{ selectedProject.manager }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 font-medium mb-1">联系方式</p>
                <p class="font-bold text-gray-900 text-lg font-mono">{{ selectedProject.contact }}</p>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮组 -->
          <h3 class="text-lg font-bold text-gray-800 mb-4 px-1">项目操作</h3>
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button class="py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-700 font-medium text-sm rounded-full transition-all flex items-center justify-center gap-2 group">
                <div class="text-blue-500 group-hover:scale-110 transition-transform"><FileText :size="18" /></div>
                施工报告
              </button>
              <button class="py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-700 font-medium text-sm rounded-full transition-all flex items-center justify-center gap-2 group">
                <div class="text-orange-500 group-hover:scale-110 transition-transform"><ClipboardCheck :size="18" /></div>
                过程验收
              </button>
              <button class="py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-700 font-medium text-sm rounded-full transition-all flex items-center justify-center gap-2 group">
                <div class="text-pink-500 group-hover:scale-110 transition-transform"><Headset :size="18" /></div>
                售后计划
              </button>
              <button class="py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-700 font-medium text-sm rounded-full transition-all flex items-center justify-center gap-2 group">
                <div class="text-indigo-500 group-hover:scale-110 transition-transform"><FolderCheck :size="18" /></div>
                竣工资料
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button class="py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-700 font-medium text-sm rounded-full transition-all flex items-center justify-center gap-2 group">
                <div class="text-rose-500 group-hover:scale-110 transition-transform"><MapPin :size="18" /></div>
                现场巡查
              </button>
              <button class="py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-700 font-medium text-sm rounded-full transition-all flex items-center justify-center gap-2 group">
                <div class="text-yellow-500 group-hover:scale-110 transition-transform"><Star :size="18" /></div>
                项目评价
              </button>
              <button class="py-3 px-4 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-700 font-medium text-sm rounded-full transition-all flex items-center justify-center gap-2 group">
                <div class="text-[#5a8632] group-hover:scale-110 transition-transform"><ShieldCheck :size="18" /></div>
                巡检服务
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
