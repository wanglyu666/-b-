<template>
  <div class="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center h-full min-h-[500px]">
    <div class="w-24 h-24 rounded-full bg-[#A1D573]/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(161,213,115,0.3)]">
      <CheckCircle2 :size="48" class="text-[#A1D573]" />
    </div>
    <h2 class="text-3xl font-bold text-white mb-4 tracking-tight">已完成提交</h2>
    <p class="text-white/60 mb-12">您的验收评价已成功记录到系统中</p>
    
    <button 
      @click="$emit('return')"
      class="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors border border-white/10"
    >
      返回上级页面
    </button>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next';

defineEmits(['return']);
</script>
