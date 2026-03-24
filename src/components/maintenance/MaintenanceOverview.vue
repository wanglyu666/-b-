<template>
  <div class="animate-in slide-in-from-left-4 duration-500">
    <div class="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 mb-8 border border-white/10 shadow-inner">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
        <div>
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">维保编号</p>
          <p class="font-bold text-white text-xl font-mono tracking-tight">{{ project.no }}</p>
        </div>
        <div>
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">项目名称</p>
          <p class="font-bold text-white text-xl tracking-tight">{{ project.name }}</p>
        </div>
        <div class="sm:col-span-2">
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">项目地址</p>
          <p class="font-bold text-white text-xl tracking-tight">{{ project.address }}</p>
        </div>
        <div>
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">项目负责人</p>
          <p class="font-bold text-white text-xl tracking-tight">{{ project.manager }}</p>
        </div>
        <div>
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">联系方式</p>
          <p class="font-bold text-white text-xl font-mono tracking-tight">{{ project.contact }}</p>
        </div>
        <div>
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">施工状态</p>
          <div 
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
            :class="statusStyle"
          >
            {{ project.status }}
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮组 -->
    <h3 class="text-sm font-bold text-white/40 uppercase tracking-widest mb-6 px-2">项目操作</h3>
    <div class="flex gap-4">
      <button 
        @click="$emit('enterAppointment')"
        class="flex-1 py-4 px-6 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-full transition-all flex items-center justify-center gap-3 group"
      >
        <div class="text-orange-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(251,146,60,0.5)] transition-all">
          <CalendarClock :size="20" />
        </div>
        <span class="tracking-wide">预约管理</span>
      </button>
      <button 
        @click="$emit('enterEvaluation')"
        class="flex-1 py-4 px-6 bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-full transition-all flex items-center justify-center gap-3 group"
      >
        <div class="text-yellow-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] transition-all">
          <Star :size="20" />
        </div>
        <span class="tracking-wide">评价</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CalendarClock, Star } from 'lucide-vue-next';
import type { MaintenanceProject } from '@/types';

const props = defineProps<{
  project: MaintenanceProject;
}>();

defineEmits(['enterAppointment', 'enterEvaluation']);

const statusStyle = computed(() => {
  switch (props.project.status) {
    case '待开工': return 'bg-[#FFC091]/20 border border-[#FFC091]/30 text-[#FFC091]';
    case '施工中': return 'bg-[#FFEB69]/20 border border-[#FFEB69]/30 text-[#FFEB69]';
    case '已完工': return 'bg-[#A1D573]/20 border border-[#A1D573]/30 text-[#A1D573]';
    default: return 'bg-white/10 border border-white/20 text-white/60';
  }
});
</script>
