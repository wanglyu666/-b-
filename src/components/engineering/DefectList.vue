<template>
  <div class="relative flex h-full animate-in slide-in-from-right-4 duration-500 flex-col">
    <div class="mb-6 flex justify-end px-2">
      <button
        type="button"
        class="flex items-center gap-2 rounded-full bg-[#FFE600] px-6 py-2 text-sm font-bold text-[#260A2F] transition-all hover:bg-[#e6cf00] active:scale-95"
        @click="$emit('add')"
      >
        <Plus :size="16" />
        新增缺陷
      </button>
    </div>

    <div class="custom-scrollbar flex-1 overflow-y-auto pr-2">
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
              :class="(defect.status === '已完成' || defect.status === '已处理' || defect.status === '已通过') ? 'bg-[#A1D573]/20 text-[#A1D573]' : 'bg-orange-500/20 text-orange-400'">
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
