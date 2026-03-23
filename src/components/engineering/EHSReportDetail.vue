<template>
  <div class="h-full flex flex-col text-white">
    <!-- Tab Navigation -->
    <div class="px-6 pt-2 pb-8 flex flex-wrap gap-3">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border"
        :class="activeTab === tab.id 
          ? 'bg-[#FFC091] border-[#FFC091] text-[#260A2F] shadow-[0_0_15px_rgba(255,192,145,0.3)]' 
          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto px-6 pb-10 relative custom-scrollbar">
      <Transition name="fade-slide" mode="out-in">
        <!-- 工作总结 Tab -->
        <div v-if="activeTab === 'summary'" :key="'summary'" class="flex flex-col gap-6">
          <!-- 特殊作业 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <Zap :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">本周开展的特殊作业</span>
            </div>
            <textarea 
              v-model="reportData.specialWork"
              placeholder="请输入本周开展的特殊作业内容..."
              class="w-full h-[180px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none custom-scrollbar"
            ></textarea>
          </div>

          <!-- 安全教育与培训次数 -->
          <div class="flex items-center gap-12 py-2">
            <!-- 本周开展的安全教育次数 -->
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2 text-[#FFC091]">
                <GraduationCap :size="18" />
                <span class="font-bold text-sm tracking-wide">本周开展的安全教育次数：</span>
              </div>
              <div class="flex items-center gap-2">
                <input 
                  v-model="reportData.educationCount"
                  type="number"
                  class="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-center text-[#FFC091] font-bold focus:outline-none focus:border-[#FFC091]/50"
                />
                <span class="text-sm text-gray-400 font-bold">次</span>
              </div>
            </div>

            <!-- 共开展教育与培训总结 -->
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2 text-[#FFC091]">
                <ClipboardList :size="18" />
                <span class="font-bold text-sm tracking-wide">共开展教育与培训总结：</span>
              </div>
              <div class="flex items-center gap-2">
                <input 
                  v-model="reportData.trainingSummaryCount"
                  type="number"
                  class="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-center text-[#FFC091] font-bold focus:outline-none focus:border-[#FFC091]/50"
                />
                <span class="text-sm text-gray-400 font-bold">次</span>
              </div>
            </div>
          </div>

          <!-- 教育与培训 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <BookOpen :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">教育与培训</span>
            </div>
            <textarea 
              v-model="reportData.training"
              placeholder="请输入教育与培训详细内容..."
              class="w-full h-[180px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none custom-scrollbar"
            ></textarea>
          </div>
        </div>

        <!-- 下周工作计划 Tab -->
        <div v-else-if="activeTab === 'plan'" :key="'plan'" class="flex flex-col gap-6">
          <!-- 工作内容及控制措施 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <ShieldCheck :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">工作内容及控制措施</span>
            </div>
            <textarea 
              v-model="reportData.planContent"
              placeholder="请输入下周工作内容及控制措施..."
              class="w-full h-[220px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none custom-scrollbar"
            ></textarea>
          </div>

          <!-- 教育与培训计划 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <BookOpen :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">教育与培训计划</span>
            </div>
            <textarea 
              v-model="reportData.planTraining"
              placeholder="请输入下周教育与培训计划..."
              class="w-full h-[220px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none custom-scrollbar"
            ></textarea>
          </div>
        </div>

        <!-- 隐患排查和其他事项 Tab -->
        <div v-else-if="activeTab === 'others'" :key="'others'" class="flex flex-col gap-8">
          <!-- 现场检查与隐患排查 -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <Search :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">现场检查与隐患排查</span>
            </div>
            
            <div class="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-white/10 bg-white/5">
                    <th class="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">位置</th>
                    <th class="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">隐患描述</th>
                    <th class="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">隐患照片</th>
                    <th class="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">整改措施</th>
                    <th class="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">整改完成照片</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr v-for="(item, index) in reportData.hazardInspections" :key="index" class="hover:bg-white/5 transition-colors">
                    <td class="px-4 py-4 text-sm text-white">{{ item.location }}</td>
                    <td class="px-4 py-4 text-sm text-gray-300">{{ item.description }}</td>
                    <td class="px-4 py-4">
                      <div class="flex justify-center">
                        <img :src="item.hazardPhoto" class="w-20 h-15 object-cover rounded-lg border border-white/10" referrerPolicy="no-referrer" />
                      </div>
                    </td>
                    <td class="px-4 py-4 text-sm text-gray-300">{{ item.measures }}</td>
                    <td class="px-4 py-4">
                      <div class="flex justify-center">
                        <img :src="item.completionPhoto" class="w-20 h-15 object-cover rounded-lg border border-white/10" referrerPolicy="no-referrer" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 其他重要事项 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <AlertCircle :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">其他重要事项</span>
            </div>
            <textarea 
              v-model="reportData.others"
              placeholder="请输入其他重要EHS事项..."
              class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none custom-scrollbar"
            ></textarea>
          </div>
        </div>

        <!-- 培训照片 Tab -->
        <div v-else-if="activeTab === 'photos'" :key="'photos'" class="flex flex-col gap-6">
          <div class="flex items-center gap-2 text-[#FFC091]">
            <Camera :size="16" />
            <span class="font-bold text-xs tracking-widest uppercase">EHS培训及现场照片</span>
          </div>
          <div class="grid grid-cols-3 gap-6">
            <div 
              v-for="(photo, index) in reportData.photos" 
              :key="index"
              class="group relative aspect-[4/3] bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#FFC091]/50 transition-all duration-300"
            >
              <img 
                :src="photo.url" 
                :alt="photo.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <span class="text-white text-xs font-medium">{{ photo.title }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else :key="'fallback'" class="hidden"></div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  ClipboardList, 
  Calendar, 
  AlertCircle, 
  Camera,
  Zap,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Search
} from 'lucide-vue-next';

const props = defineProps<{
  report: any;
}>();

const tabs = [
  { id: 'summary', label: '工作总结' },
  { id: 'plan', label: '下周工作计划' },
  { id: 'others', label: '隐患排查和其他事项' },
  { id: 'photos', label: '培训照片' },
];

const activeTab = ref('summary');

const reportData = ref({
  specialWork: '1. 本周三进行了2号库房顶部的防水补漏高空作业；\n2. 周四下午进行了配电房电力系统检修动火作业；\n3. 现场监护人员全程在岗，安全措施落实到位。',
  educationCount: 3,
  trainingSummaryCount: 5,
  training: '1. 开展了新入场工人的三级安全教育培训，共计5人参加；\n2. 进行了动火作业专项安全技术交底；\n3. 组织了全员夏季防暑降温常识普及讲座。',
  planContent: '1. 计划对3号厂房的脚手架进行全面安全检查；\n2. 落实地下室防水施工的通风及照明安全措施；\n3. 加强对施工现场临时用电的日常巡查。',
  planTraining: '1. 组织特种作业人员进行年度安全知识考核；\n2. 开展一次针对高空坠落事故的应急演练；\n3. 对新进场的防水班组进行专项安全教育。',
  hazardInspections: [
    { 
      location: '1层核心筒', 
      description: '梯子无防滑垫及连接片', 
      hazardPhoto: 'https://picsum.photos/seed/hazard1/200/150', 
      measures: '更换梯子', 
      completionPhoto: 'https://picsum.photos/seed/fixed1/200/150' 
    },
    { 
      location: '2层南侧', 
      description: '灭火器压力不足', 
      hazardPhoto: 'https://picsum.photos/seed/hazard2/200/150', 
      measures: '更换合格灭火器', 
      completionPhoto: 'https://picsum.photos/seed/fixed2/200/150' 
    }
  ],
  others: '1. 需采购一批新的安全帽；\n2. 现场临时用电许可证即将到期，需办理续期。',
  photos: [
    { title: '安全大检查', url: 'https://picsum.photos/seed/ehs1/800/600' },
    { title: '防暑降温培训', url: 'https://picsum.photos/seed/ehs2/800/600' },
    { title: '消防器材检查', url: 'https://picsum.photos/seed/ehs3/800/600' },
    { title: '文明施工现场', url: 'https://picsum.photos/seed/ehs4/800/600' },
    { title: '个人防护用品检查', url: 'https://picsum.photos/seed/ehs5/800/600' },
    { title: '安全警示标志设置', url: 'https://picsum.photos/seed/ehs6/800/600' },
  ]
});
</script>

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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
