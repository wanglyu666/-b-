<template>
  <div class="h-full flex flex-col text-white">
    <!-- Capsule Navigation -->
    <div class="px-6 pt-2 pb-10 flex flex-wrap gap-3">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border"
        :class="activeTab === tab.id 
          ? 'bg-[#FFC091] border-[#FFC091] text-[#260A2F] shadow-[0_0_15px_rgba(255,192,145,0.3)]' 
          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
      <div class="mb-6">
        <p class="text-xs text-gray-500">包含本项目中涉及的施工标准，点击查看更多</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="(item, index) in activeTabData" 
          :key="index"
          class="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col h-36 hover:bg-white/10 transition-colors group cursor-pointer"
        >
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-xl bg-[#A1D573]/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck :size="18" class="text-[#A1D573]" />
            </div>
            <div class="flex flex-col gap-1">
              <h4 class="text-white text-lg font-bold leading-tight line-clamp-1">
                {{ item.title }}
              </h4>
              <p class="text-[11px] text-gray-400 line-clamp-2">{{ item.description }}</p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="activeTabData.length === 0" class="col-span-full h-64 flex flex-col items-center justify-center opacity-50">
          <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <ShieldCheck :size="32" />
          </div>
          <p class="text-lg font-medium">暂无{{ activeTabLabel }}数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ShieldCheck } from 'lucide-vue-next';

const props = defineProps<{
  projectId: string;
}>();

const tabs = [
  { id: 'env', label: '环境管控' },
  { id: 'safety', label: '安全管控' },
  { id: 'health', label: '健康管控' },
  { id: 'product', label: '成品管控' },
  { id: 'hygiene', label: '卫生保洁' },
  { id: 'risk', label: '风险管控' },
];

const activeTab = ref('env');

const activeTabLabel = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.label;
});

const mockData = {
  env: [
    { title: '施工现场扬尘控制标准', description: '严格执行洒水降尘，土方堆放覆盖，确保PM2.5达标。' },
    { title: '噪音排放管理规定', description: '规定施工时段，使用低噪音设备，减少对周边居民影响。' },
    { title: '废弃物分类处置流程', description: '建筑垃圾分类堆放，定期清运，严禁乱堆乱放。' },
  ],
  safety: [
    { title: '高空作业安全防护规范', description: '必须佩戴安全带，搭设标准防护网，严禁违章作业。' },
    { title: '施工用电安全管理制度', description: '执行“一机一闸一漏一箱”，定期检查线路，严禁私拉乱接。' },
    { title: '消防器材配置及检查标准', description: '按规定配置灭火器，保持消防通道畅通，定期巡检。' },
  ],
  health: [
    { title: '施工人员职业健康体检要求', description: '定期组织体检，建立健康档案，确保人员身体状况良好。' },
    { title: '夏季防暑降温措施', description: '提供清凉饮料，调整作业时间，防止中暑事故发生。' },
    { title: '作业场所通风及照明标准', description: '保持空气流通，确保光线充足，改善作业环境。' },
  ],
  product: [
    { title: '进场材料质量验收标准', description: '核对规格型号，检查合格证件，确保材料质量合格。' },
    { title: '半成品现场保护措施', description: '采取覆盖、遮挡等方式，防止损坏、污染。' },
    { title: '成品交付前质量核查清单', description: '逐项检查外观、功能，确保达到交付标准。' },
  ],
  hygiene: [
    { title: '施工现场每日清扫制度', description: '做到工完场清，保持作业面整洁，无积水积尘。' },
    { title: '办公区及生活区环境卫生标准', description: '定期消毒，保持室内外卫生，营造良好生活环境。' },
    { title: '临时厕所管理及保洁要求', description: '专人负责清理，保持无异味，定期喷洒药剂。' },
  ],
  risk: [
    { title: '施工风险识别与评估指南', description: '定期开展风险排查，制定针对性防范措施。' },
    { title: '突发事件应急预案', description: '明确响应程序，配备应急物资，定期组织演练。' },
    { title: '重大危险源监控管理规定', description: '实行专人盯防，实时监测数据，确保安全受控。' },
  ],
};

const activeTabData = computed(() => {
  return mockData[activeTab.value as keyof typeof mockData] || [];
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
</style>
