<template>
  <div class="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center h-full min-h-[500px]">
    <img :src="checkMarkImg" alt="" class="mb-6 h-36 w-56 object-contain" />
    <h2 class="text-3xl font-bold text-white mb-4 tracking-tight">{{ title || '已完成提交' }}</h2>
    <p class="text-white/60 mb-12">{{ message || '您的验收评价已成功记录到系统中' }}</p>
    
    <button 
      @click="$emit('return')"
      class="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors border border-white/10"
    >
      返回上级页面
    </button>
  </div>
</template>

<script setup lang="ts">
import checkMarkImg from '../../../image asset/check mark.png';

defineProps<{
  title?: string;
  message?: string;
}>();

defineEmits(['return']);
</script>
