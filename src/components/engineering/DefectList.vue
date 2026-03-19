<template>
  <div class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full relative">
    <!-- Top Header with Add Button -->
    <div class="flex justify-between items-center mb-6 px-2">
      <div class="flex items-center gap-2">
        <div class="w-1 h-4 bg-orange-400 rounded-full"></div>
        <span class="text-white/40 text-xs font-bold uppercase tracking-widest">{{ title }}</span>
      </div>
      <button 
        @click="$emit('add')"
        class="px-4 py-2 rounded-xl bg-[#FFC091] text-[#260A2F] text-xs font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/10"
      >
        <Plus :size="16" />
        新增缺陷
      </button>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
        <div 
          v-for="(defect, index) in defects" 
          :key="defect.id"
          @click="$emit('viewDetail', defect)"
          class="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500 cursor-pointer hover:border-white/20"
          :style="{ animationDelay: `${index * 80}ms` }"
        >
          <div class="aspect-[4/3] overflow-hidden relative">
            <img :src="defect.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
            <div class="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-md" 
              :class="(defect.status === '已完成' || defect.status === '已处理') ? 'bg-[#A1D573]/20 text-[#A1D573]' : 'bg-orange-500/20 text-orange-400'">
              {{ defect.status }}
            </div>
          </div>
          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-white/30 text-[9px] font-mono uppercase tracking-widest">{{ defect.date }}</span>
            </div>
            <p class="text-white/70 leading-relaxed text-xs line-clamp-2">
              {{ defect.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next';

defineProps<{
  title: string;
  defects: any[];
}>();

defineEmits(['add', 'viewDetail']);
</script>
