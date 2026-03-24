<template>
  <div 
    class="cursor-pointer group bg-white/50 backdrop-blur-md border border-white/20 rounded-[32px] overflow-hidden transition-all hover:bg-white/60 hover:shadow-lg"
  >
    <div class="p-6 w-full relative">
      <div class="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-pink-100/40 to-transparent rounded-bl-full pointer-events-none"></div>
      
      <h3 class="text-xl font-bold text-gray-800 mb-1 mt-2 relative z-10">{{ project.name }}</h3>
      <p class="text-sm text-gray-500 mb-6 font-mono relative z-10">{{ project.no }}</p>
      
      <div class="grid grid-cols-2 gap-y-5 gap-x-4 relative z-10">
        <div>
          <p class="text-xs text-gray-500 font-medium mb-1">项目负责人</p>
          <p class="font-bold text-gray-800 text-base">{{ project.manager }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium mb-1">联系方式</p>
          <p class="font-bold text-gray-800 font-mono">{{ project.contact }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MaintenanceProject } from '@/types';

defineProps<{
  project: MaintenanceProject;
}>();
</script>
