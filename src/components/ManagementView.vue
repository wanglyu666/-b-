<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { HardHat, Clock, Wrench, CheckCircle, Banknote, Shield, ShieldAlert, AlertCircle, ClipboardList, UsersRound, MoreHorizontal, ShoppingCart, X } from 'lucide-vue-next';
import TopBarActions from './TopBarActions.vue';
import { members, engineeringProjects } from '../data';
import orderMgmtIllustration from '../../image asset/shopping cart icon.png';
import membersMgmtIllustration from '../../image asset/group icon.png';

const emit = defineEmits(['viewProjects', 'viewMaintenance', 'viewMaintenanceProjects']);

const showAddModal = ref(false);

// Filter projects for the dropdown
const availableProjects = computed(() => {
  return engineeringProjects.filter(p => 
    ['待开工', '施工中', '已完工'].includes(p.status)
  );
});

const newReport = ref({
  projectId: '',
  teamInfo: '',
  startDate: '',
  completionDate: '',
  warrantyPeriod: '',
  reportType: 'normal',
  visitTime: '',
  reason: '',
  files: [] as File[]
});

// Watch for project selection to auto-fill details
watch(() => newReport.value.projectId, (newId) => {
  if (newId) {
    const project = availableProjects.value.find(p => p.id === newId);
    if (project) {
      newReport.value.teamInfo = `${project.manager} (${project.contact})`;
      newReport.value.startDate = project.startDate || '2023-01-01';
      newReport.value.completionDate = project.endDate || '2024-01-01';
      newReport.value.warrantyPeriod = '1年'; // Defaulting to 1 year as it's not in the type
    }
  } else {
    newReport.value.teamInfo = '';
    newReport.value.startDate = '';
    newReport.value.completionDate = '';
    newReport.value.warrantyPeriod = '';
  }
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const newFiles = Array.from(target.files);
    const totalFiles = newReport.value.files.length + newFiles.length;
    
    if (totalFiles > 5) {
      alert('最多只能上传5个文件');
      // Only add up to 5 files
      const allowedNewFiles = newFiles.slice(0, 5 - newReport.value.files.length);
      newReport.value.files = [...newReport.value.files, ...allowedNewFiles];
    } else {
      newReport.value.files = [...newReport.value.files, ...newFiles];
    }
  }
  // Reset input value so the same file can be selected again if needed
  if (target) {
    target.value = '';
  }
};

const removeFile = (index: number) => {
  newReport.value.files.splice(index, 1);
};

const submitReport = () => {
  console.log('Submitting report:', newReport.value);
  // Reset and close
  showAddModal.value = false;
  newReport.value = {
    projectId: '',
    teamInfo: '',
    startDate: '',
    completionDate: '',
    warrantyPeriod: '',
    reportType: 'normal',
    visitTime: '',
    reason: '',
    files: []
  };
};
</script>

<template>
  <div class="min-h-screen bg-transparent relative overflow-x-hidden">
    <!-- Content Area -->
    <div class="relative z-10 p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <header class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">管理中心</h1>
        <p class="text-gray-500 mt-1">全局项目与人员管控</p>
      </div>
      <TopBarActions :isShop="false" />
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- 左侧与中间列 (Span 2) -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <!-- 维保项目管理 (红色框) -->
        <div class="bg-white/40 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/20 flex flex-col h-[280px]">
           <div class="flex justify-between items-center mb-6">
              <div class="flex items-center space-x-2">
                 <div class="w-1 h-5 bg-[#163300] rounded-full"></div>
                 <h3 class="font-bold text-lg text-gray-800">维保项目管理</h3>
              </div>
              <Wrench :size="18" class="text-gray-400" />
           </div>
           <div class="flex-1 grid grid-cols-3 gap-6 pl-32 pr-6 py-4">
               <button @click="emit('viewMaintenanceProjects', '待开工')" class="relative overflow-hidden rounded-3xl bg-[#FFC091] text-[#260A2F] transition-all hover:shadow-xl active:scale-95 border border-[#FFC091]/20 group">
                  <span class="absolute top-3 right-5 text-6xl font-black opacity-90 leading-none tracking-tighter transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-2 group-hover:drop-shadow-lg">12</span>
                  <span class="absolute bottom-5 left-5 text-2xl font-bold opacity-70 tracking-tight transition-all duration-700 group-hover:translate-y-1 group-hover:opacity-100">待开工</span>
               </button>
               <button @click="emit('viewMaintenanceProjects', '施工中')" class="relative overflow-hidden rounded-3xl bg-[#FFEB69] text-[#3A341C] transition-all hover:shadow-xl active:scale-95 border border-[#FFEB69]/20 group">
                  <span class="absolute top-3 right-5 text-6xl font-black opacity-90 leading-none tracking-tighter transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-2 group-hover:drop-shadow-lg">5</span>
                  <span class="absolute bottom-5 left-5 text-2xl font-bold opacity-70 tracking-tight transition-all duration-700 group-hover:translate-y-1 group-hover:opacity-100">施工中</span>
               </button>
               <button @click="emit('viewMaintenanceProjects', '已完工')" class="relative overflow-hidden rounded-3xl bg-[#A0E1E1] text-[#21231D] transition-all hover:shadow-xl active:scale-95 border border-[#A0E1E1]/20 group">
                  <span class="absolute top-4 right-6 text-6xl font-black opacity-90 leading-none tracking-tighter transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-2 group-hover:drop-shadow-lg">34</span>
                  <span class="absolute bottom-6 left-6 text-2xl font-bold opacity-70 tracking-tight transition-all duration-700 group-hover:translate-y-1 group-hover:opacity-100">已完工</span>
               </button>
           </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <!-- 工程项目管理 (粉色框) -->
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
             <div class="flex justify-between items-center mb-4">
                <div class="flex items-center space-x-2">
                   <div class="w-1 h-5 bg-[#A1D573] rounded-full"></div>
                   <h3 class="font-bold text-lg text-gray-800">工程项目管理</h3>
                </div>
                <HardHat :size="18" class="text-gray-400" />
             </div>
             
             <div class="flex-1 flex flex-col justify-between py-0.5">
                <div @click="$emit('viewProjects', '待开工')" class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                   <div class="flex items-center space-x-3">
                      <div class="p-1.5 bg-yellow-50 text-yellow-500 rounded-full"><Clock :size="14" /></div>
                      <span class="text-gray-600 font-medium text-sm">待开工</span>
                   </div>
                   <span class="font-bold text-lg text-gray-900">8</span>
                </div>

                <div @click="$emit('viewProjects', '施工中')" class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                   <div class="flex items-center space-x-3">
                      <div class="p-1.5 bg-[#163300]/10 text-[#163300] rounded-full"><Wrench :size="14" /></div>
                      <span class="text-gray-600 font-medium text-sm">施工中</span>
                   </div>
                   <span class="font-bold text-lg text-gray-900">15</span>
                </div>

                <div @click="$emit('viewProjects', '已完工')" class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                   <div class="flex items-center space-x-3">
                      <div class="p-1.5 bg-[#A1D573]/20 text-[#5a8632] rounded-full"><CheckCircle :size="14" /></div>
                      <span class="text-gray-600 font-medium text-sm">已完工</span>
                   </div>
                   <span class="font-bold text-lg text-gray-900">42</span>
                </div>

                <div @click="$emit('viewProjects', '已结算')" class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                   <div class="flex items-center space-x-3">
                      <div class="p-1.5 bg-[#A1D573]/20 text-[#5a8632] rounded-full"><Banknote :size="14" /></div>
                      <span class="text-gray-600 font-medium text-sm">已结算</span>
                   </div>
                   <span class="font-bold text-lg text-gray-900">28</span>
                </div>

                <div @click="$emit('viewProjects', '保修中')" class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                   <div class="flex items-center space-x-3">
                      <div class="p-1.5 bg-gray-100 text-gray-500 rounded-full"><Shield :size="14" /></div>
                      <span class="text-gray-600 font-medium text-sm">保修中</span>
                   </div>
                   <span class="font-bold text-lg text-gray-900">10</span>
                </div>

                <div @click="$emit('viewProjects', '保修外')" class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                   <div class="flex items-center space-x-3">
                      <div class="p-1.5 bg-gray-100 text-gray-400 rounded-full"><ShieldAlert :size="14" /></div>
                      <span class="text-gray-600 font-medium text-sm">保修外</span>
                   </div>
                   <span class="font-bold text-lg text-gray-900">3</span>
                </div>
             </div>
          </div>

          <!-- 成员管理 (绿色框) -->
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
             <div class="flex justify-between items-center mb-4">
                <div class="flex items-center space-x-2">
                   <div class="w-1 h-5 bg-[#163300] rounded-full"></div>
                   <h3 class="font-bold text-lg text-gray-800">成员管理</h3>
                </div>
                <UsersRound :size="18" class="text-gray-400" />
             </div>
             
             <div class="flex-1 min-h-0 flex flex-col gap-2">
                <!-- 图片仅在上方剩余空间内缩放，再大也不会挤占成员列表 -->
                <div class="min-h-0 flex-1 flex items-center justify-center overflow-hidden">
                   <img
                     :src="membersMgmtIllustration"
                     alt=""
                     class="max-h-full max-w-full w-auto h-auto object-contain"
                   />
                </div>

                <div class="flex-shrink-0 flex flex-col gap-0.5 mb-2">
                   <div v-for="member in members" :key="member.id" class="flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                      <div class="flex items-center space-x-3">
                         <div :class="['w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs', member.bgColor]">
                            {{ member.initial }}
                         </div>
                         <div class="flex flex-col">
                            <span class="font-bold text-gray-900 text-xs">{{ member.name }}</span>
                            <span class="text-[10px] text-gray-500">{{ member.role }}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             <button class="text-xs font-medium text-gray-400 hover:text-gray-800 transition-colors py-1.5 flex justify-center items-center gap-1 w-full border-t border-gray-50 pt-2">
                <MoreHorizontal :size="12" /> 查看全部成员
             </button>
          </div>
        </div>
      </div>

      <!-- 右侧列 (独立堆叠) -->
      <div class="flex flex-col gap-6">
        <!-- 订单管理 (蓝色框) -->
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[460px]">
           <div class="flex justify-between items-center mb-4">
              <div class="flex items-center space-x-2">
                 <div class="w-1 h-5 bg-[#A1D573] rounded-full"></div>
                 <h3 class="font-bold text-lg text-gray-800">订单管理</h3>
              </div>
              <ShoppingCart :size="18" class="text-gray-400" />
           </div>
           
           <div class="flex-1 min-h-0 flex flex-col">
              <!-- 图片只在中间弹性区域内缩放；总订单数区域固定贴在卡片下半部 -->
              <div class="min-h-0 flex-1 flex items-center justify-center overflow-hidden py-2">
                 <img
                   :src="orderMgmtIllustration"
                   alt=""
                   class="max-h-full max-w-full w-auto h-auto object-contain"
                 />
              </div>
              <div class="flex-shrink-0 flex flex-col items-center pb-1">
                 <span class="text-gray-500 font-medium mb-1 text-sm">总订单数</span>
                 <span class="font-bold text-5xl text-gray-900">156</span>
              </div>
           </div>
        </div>

        <!-- 维保报修管理 (黄色框) -->
        <div 
          @click="emit('viewMaintenance')"
          class="bg-white/50 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/20 flex flex-col justify-between h-[220px] cursor-pointer hover:bg-white/70 transition-all group"
        >
           <div class="flex justify-between items-center mb-4">
              <div class="flex items-center space-x-2">
                 <div class="w-1 h-5 bg-[#A1D573] rounded-full"></div>
                 <h3 class="font-bold text-lg text-gray-800">维保报修管理</h3>
              </div>
              <AlertCircle :size="18" class="text-gray-400 group-hover:text-[#A1D573] transition-colors" />
           </div>
           <div class="flex-1 flex flex-col justify-center space-y-3">
              <div class="flex items-center justify-between px-2">
                  <div class="flex items-center space-x-3 text-gray-600">
                     <ClipboardList :size="18" class="text-[#163300]" />
                     <span class="font-medium text-sm">项目数量</span>
                  </div>
                  <span class="font-bold text-3xl text-gray-900">42</span>
              </div>
              <button 
                @click.stop="showAddModal = true" 
                class="w-full py-2.5 bg-[#A1D573] text-[#163300] font-bold rounded-2xl shadow-sm hover:bg-[#8ec260] transition-colors"
              >
                 新增
              </button>
           </div>
        </div>
      </div>

    </div>
  </div>
</div>

  <!-- 新增维保报修 Modal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <!-- Blurred Background -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showAddModal = false"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
          
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 class="text-xl font-bold text-gray-800">新增维保报修</h2>
            <button @click="showAddModal = false" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X :size="20" />
            </button>
          </div>
          
          <!-- Body -->
          <div class="p-6 overflow-y-auto flex-1 space-y-6">
            
            <!-- 项目选择 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">项目</label>
                <select v-model="newReport.projectId" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#A1D573] focus:border-transparent transition-all">
                  <option value="" disabled>请选择项目</option>
                  <option v-for="project in availableProjects" :key="project.id" :value="project.id">
                    {{ project.name }} ({{ project.status }})
                  </option>
                </select>
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">项目组信息</label>
                <input type="text" v-model="newReport.teamInfo" readonly placeholder="自动获取" class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none transition-all" />
              </div>
            </div>

            <!-- 时间信息 -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">开工时间</label>
                <input type="date" v-model="newReport.startDate" readonly class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none transition-all" />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">竣工时间</label>
                <input type="date" v-model="newReport.completionDate" readonly class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none transition-all" />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">质保期</label>
                <input type="text" v-model="newReport.warrantyPeriod" readonly placeholder="自动获取" class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed focus:outline-none transition-all" />
              </div>
            </div>

            <div class="border-t border-gray-100 pt-6 space-y-6">
              <!-- 报修类型 -->
              <div class="flex items-center gap-4">
                <label class="text-sm font-medium text-gray-700 w-24">报修类型:</label>
                <div class="flex items-center gap-6">
                  <label class="flex items-center gap-2 cursor-pointer group">
                    <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors"
                         :class="newReport.reportType === 'normal' ? 'border-[#FFC091]' : 'border-gray-300 group-hover:border-gray-400'">
                      <div v-if="newReport.reportType === 'normal'" class="w-2 h-2 rounded-full bg-[#FFC091]"></div>
                    </div>
                    <span class="text-gray-600 font-medium" :class="newReport.reportType === 'normal' && 'text-[#FFC091]'">普通</span>
                    <input type="radio" value="normal" v-model="newReport.reportType" class="hidden" />
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer group">
                    <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors"
                         :class="newReport.reportType === 'urgent' ? 'border-[#FFC091]' : 'border-gray-300 group-hover:border-gray-400'">
                      <div v-if="newReport.reportType === 'urgent'" class="w-2 h-2 rounded-full bg-[#FFC091]"></div>
                    </div>
                    <span class="text-gray-600 font-medium" :class="newReport.reportType === 'urgent' && 'text-[#FFC091]'">紧急</span>
                    <input type="radio" value="urgent" v-model="newReport.reportType" class="hidden" />
                  </label>
                </div>
              </div>

              <!-- 上门时间 -->
              <div class="flex items-center gap-4">
                <label class="text-sm font-medium text-gray-700 w-24">上门时间:</label>
                <div class="flex-1 max-w-xs">
                  <div class="relative">
                    <input type="datetime-local" v-model="newReport.visitTime" class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFC091] focus:border-transparent transition-all" />
                    <Clock :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <!-- 报修原因 -->
              <div class="flex items-start gap-4">
                <label class="text-sm font-medium text-gray-700 w-24 pt-2">报修原因:</label>
                <textarea 
                  v-model="newReport.reason"
                  class="flex-1 h-32 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFC091] focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>

              <!-- 上传图片或视频 -->
              <div class="flex items-start gap-4">
                <label class="text-sm font-medium text-gray-700 w-24 pt-2">上传图片或视频:</label>
                <div class="flex-1 flex flex-col gap-3">
                  <div class="flex items-center gap-3">
                    <label class="px-4 py-2 bg-[#FFC091] hover:bg-[#ffb078] text-[#260A2F] text-sm font-medium rounded-lg cursor-pointer transition-colors shadow-sm" :class="{ 'opacity-50 cursor-not-allowed': newReport.files.length >= 5 }">
                      选取文件
                      <input type="file" @change="handleFileChange" class="hidden" accept="image/*,video/*" multiple :disabled="newReport.files.length >= 5" />
                    </label>
                    <span class="text-sm text-gray-500">最多上传5个文件 ({{ newReport.files.length }}/5)</span>
                  </div>
                  
                  <!-- Selected Files List -->
                  <div v-if="newReport.files.length > 0" class="flex flex-wrap gap-2 mt-2">
                    <div v-for="(file, index) in newReport.files" :key="index" class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 max-w-[200px]">
                      <span class="text-sm text-gray-600 truncate flex-1" :title="file.name">{{ file.name }}</span>
                      <button @click="removeFile(index)" class="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <X :size="14" />
                      </button>
                    </div>
                  </div>
                  <span class="text-sm text-gray-400" v-else>未选择任何文件</span>
                </div>
              </div>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button 
              @click="submitReport"
              class="px-8 py-2.5 bg-[#A1D573] hover:bg-[#8ec260] text-[#163300] font-bold rounded-xl shadow-sm transition-colors"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

