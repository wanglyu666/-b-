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
        <!-- Progress & Content Tab -->
        <div v-if="activeTab === 'progress'" :key="'progress'" class="flex flex-col gap-8">
          <!-- Top Row: Progress Bars -->
          <div class="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8">
            <!-- Current Total Progress -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2 text-[#FFC091]">
                  <TrendingUp :size="16" />
                  <span class="font-bold text-xs tracking-widest uppercase">当前总进度</span>
                </div>
                <span class="text-[#FFC091] font-bold text-lg">{{ reportData.currentProgress }}%</span>
              </div>
              <div class="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  class="h-full bg-gradient-to-r from-[#FFC091] to-[#FF8C42] rounded-full transition-all duration-1000 ease-out"
                  :style="{ width: `${reportData.currentProgress}%` }"
                ></div>
              </div>
            </div>

            <!-- Original Planned Progress -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2 text-[#FFC091]">
                  <Calendar :size="16" />
                  <span class="font-bold text-xs tracking-widest uppercase">原计划进度</span>
                </div>
                <span class="text-[#FFC091] font-bold text-lg">{{ reportData.plannedProgress }}%</span>
              </div>
              <div class="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  class="h-full bg-gradient-to-r from-[#FFC091] to-[#FF8C42] rounded-full transition-all duration-1000 ease-out opacity-50"
                  :style="{ width: `${reportData.plannedProgress}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Bottom Row: Text Areas -->
          <div class="flex-1 grid grid-cols-2 gap-6 min-h-0">
            <!-- 主要施工内容及劳动力安排 -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-[#FFC091]">
                <Hammer :size="16" />
                <span class="font-bold text-xs tracking-widest uppercase">主要施工内容及劳动力安排</span>
              </div>
              <textarea 
                v-model="reportData.mainContent"
                placeholder="请输入主要施工内容及劳动力安排..."
                class="h-[220px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none custom-scrollbar"
              ></textarea>
            </div>

            <!-- 进度偏差分析与应对措施 -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-[#FFC091]">
                <AlertCircle :size="16" />
                <span class="font-bold text-xs tracking-widest uppercase">进度偏差分析与应对措施</span>
              </div>
              <textarea 
                v-model="reportData.deviationAnalysis"
                placeholder="请输入进度偏差分析与应对措施..."
                class="h-[220px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none custom-scrollbar"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 质量检查 Tab -->
        <div v-else-if="activeTab === 'quality'" :key="'quality'" class="flex flex-col gap-8">
          <!-- 质量检查与验收 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <ShieldCheck :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">质量检查与验收</span>
            </div>
            <textarea 
              v-model="reportData.qualityCheck"
              placeholder="请输入质量检查与验收情况..."
              class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none custom-scrollbar"
            ></textarea>
          </div>

          <!-- 问题整改 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <ClipboardList :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">问题整改</span>
            </div>
            <textarea 
              v-model="reportData.qualityRectification"
              placeholder="请输入问题整改情况..."
              class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none custom-scrollbar"
            ></textarea>
          </div>
        </div>

        <!-- 问题与解决 Tab -->
        <div v-else-if="activeTab === 'issues'" :key="'issues'" class="flex flex-col gap-8">
          <!-- 现场问题 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <AlertCircle :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">现场问题</span>
            </div>
            <textarea 
              v-model="reportData.siteIssues"
              placeholder="请输入现场发现的问题..."
              class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none custom-scrollbar"
            ></textarea>
          </div>

          <!-- 解决方案与进展 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <FileCheck :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">解决方案与进展</span>
            </div>
            <textarea 
              v-model="reportData.solutions"
              placeholder="请输入解决方案及当前进展..."
              class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none custom-scrollbar"
            ></textarea>
          </div>
        </div>

        <!-- 下周计划与内容 Tab -->
        <div v-else-if="activeTab === 'next_week'" :key="'next_week'" class="flex flex-col gap-8">
          <!-- 计划施工内容 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <Calendar :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">计划施工内容</span>
            </div>
            <textarea 
              v-model="reportData.nextWeekPlan"
              placeholder="请输入下周计划施工内容..."
              class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none custom-scrollbar"
            ></textarea>
          </div>

          <!-- 资源需求 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <Package :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">资源需求</span>
            </div>
            <textarea 
              v-model="reportData.resourceNeeds"
              placeholder="请输入下周所需资源（材料、人工、设备等）..."
              class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none custom-scrollbar"
            ></textarea>
          </div>
        </div>

        <!-- 其他事项 Tab -->
        <div v-else-if="activeTab === 'others'" :key="'others'" class="flex flex-col gap-8">
          <!-- 需甲方确认事项 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <MessageSquare :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">需甲方确认事项</span>
            </div>
            <textarea 
              v-model="reportData.clientConfirmation"
              placeholder="请输入需要甲方确认的事项..."
              class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none custom-scrollbar"
            ></textarea>
          </div>

          <!-- 其他未尽事项 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-[#FFC091]">
              <MoreHorizontal :size="16" />
              <span class="font-bold text-xs tracking-widest uppercase">其他未尽事项</span>
            </div>
            <textarea 
              v-model="reportData.otherMatters"
              placeholder="请输入其他需要说明的事项..."
              class="w-full h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FFC091]/50 transition-colors resize-none custom-scrollbar"
            ></textarea>
          </div>
        </div>

        <!-- 现场照片 Tab -->
        <div v-else-if="activeTab === 'photos'" :key="'photos'" class="flex flex-col gap-6">
          <div class="flex items-center gap-2 text-[#FFC091]">
            <Camera :size="16" />
            <span class="font-bold text-xs tracking-widest uppercase">现场施工照片</span>
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

        <!-- 验收记录 Tab -->
        <div v-else-if="activeTab === 'acceptance'" :key="'acceptance'" class="flex flex-col gap-6">
          <div class="flex items-center gap-2 text-[#FFC091]">
            <FileCheck :size="16" />
            <span class="font-bold text-xs tracking-widest uppercase">验收记录与报告</span>
          </div>
          <div class="grid grid-cols-3 gap-6">
            <div 
              v-for="(doc, index) in reportData.documents" 
              :key="index"
              class="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-6 hover:bg-white/10 transition-all duration-300"
            >
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-[#FFC091]/10 flex items-center justify-center text-[#FFC091]">
                  <FileText :size="24" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-white font-bold text-sm leading-tight mb-1 truncate">{{ doc.title }}</h4>
                  <p class="text-gray-400 text-xs">{{ doc.size }} · {{ doc.date }}</p>
                </div>
              </div>
              <button class="w-full py-2.5 bg-white/5 hover:bg-[#FFC091] hover:text-[#260A2F] border border-white/10 hover:border-[#FFC091] rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2">
                <Download :size="14" />
                下载文件
              </button>
            </div>
          </div>
        </div>

        <!-- Placeholder for other tabs -->
        <div v-else :key="activeTab" class="h-full flex items-center justify-center text-gray-500 italic">
          {{ tabs.find(t => t.id === activeTab)?.label }} 内容正在开发中...
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  TrendingUp, 
  Calendar, 
  Hammer, 
  AlertCircle,
  ShieldCheck,
  ClipboardList,
  MoreHorizontal,
  Camera,
  FileCheck,
  Package,
  MessageSquare,
  Download,
  FileText
} from 'lucide-vue-next';

const props = defineProps<{
  report: any;
}>();

const tabs = [
  { id: 'progress', label: '进度与内容' },
  { id: 'quality', label: '质量检查' },
  { id: 'issues', label: '问题与解决' },
  { id: 'next_week', label: '下周计划与内容' },
  { id: 'others', label: '其他事项' },
  { id: 'photos', label: '现场照片' },
  { id: 'acceptance', label: '验收记录' },
];

const activeTab = ref('progress');

const reportData = ref({
  currentProgress: 65,
  plannedProgress: 70,
  mainContent: '1. 客厅吊顶封板完成；\n2. 卧室墙面第一遍腻子施工；\n3. 厨房卫生间瓷砖铺贴完成50%。\n劳动力安排：木工2人，瓦工2人，油工1人。',
  deviationAnalysis: '由于本周连阴雨天气，导致腻子干燥缓慢，进度较计划滞后5%。\n应对措施：增加除湿机，并计划下周六加班赶工。',
  qualityCheck: '1. 吊顶龙骨间距符合要求；\n2. 腻子平整度偏差在2mm内；\n3. 瓷砖无空鼓，缝隙均匀。',
  qualityRectification: '1. 卫生间防水层局部破损已修补；\n2. 厨房插座位置偏移已调整。',
  siteIssues: '1. 现场材料堆放较乱；\n2. 临时用电存在私拉乱接现象。',
  solutions: '1. 已要求班组进行清理，并划定专门堆放区；\n2. 电工已对私拉乱接进行整改，并加强巡查。',
  nextWeekPlan: '1. 卧室墙面第二遍腻子施工完成；\n2. 客厅背景墙基层制作；\n3. 厨房卫生间瓷砖铺贴全部完成。',
  resourceNeeds: '1. 腻子粉50包；\n2. 木工板20张；\n3. 瓦工班组增加2人。',
  clientConfirmation: '1. 确认客厅背景墙石材款式；\n2. 确认卧室地板颜色。',
  otherMatters: '1. 申请下周三进行隐蔽工程中期验收；\n2. 现场垃圾需集中清运一次。',
  photos: [
    { title: '客厅吊顶封板', url: 'https://picsum.photos/seed/const1/800/450' },
    { title: '卧室墙面腻子', url: 'https://picsum.photos/seed/const2/800/450' },
    { title: '厨房瓷砖铺贴', url: 'https://picsum.photos/seed/const3/800/450' },
    { title: '卫生间防水施工', url: 'https://picsum.photos/seed/const4/800/450' },
    { title: '材料进场验收', url: 'https://picsum.photos/seed/const5/800/450' },
    { title: '强电管线敷设', url: 'https://picsum.photos/seed/const6/800/450' },
    { title: '给排水管路测试', url: 'https://picsum.photos/seed/const7/800/450' },
    { title: '现场清理情况', url: 'https://picsum.photos/seed/const8/800/450' },
  ],
  documents: [
    { title: '隐蔽工程验收记录表.pdf', size: '1.2 MB', date: '2024-03-15' },
    { title: '分部分项工程质量验收单.docx', size: '856 KB', date: '2024-03-18' },
    { title: '竣工预验收报告.pdf', size: '2.4 MB', date: '2024-03-20' },
    { title: '水电工程验收合格证.pdf', size: '512 KB', date: '2024-03-12' },
    { title: '防水工程闭水试验记录.pdf', size: '1.1 MB', date: '2024-03-14' },
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
