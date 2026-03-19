<template>
  <div class="animate-in zoom-in-95 duration-500 flex flex-col h-full relative">
    <!-- Top: Images -->
    <div class="grid grid-cols-2 gap-6 mb-8">
      <div class="space-y-3">
        <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold text-center">缺陷照片</p>
        <div class="aspect-video rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative group cursor-pointer" @click="$emit('zoomImage', defect.image)">
          <img :src="defect.image" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Search :size="24" class="text-white" />
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold text-center">整改完成照片</p>
        <div class="aspect-video rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative group flex items-center justify-center" :class="{'cursor-pointer': defect.rectifiedImage}" @click="defect.rectifiedImage && $emit('zoomImage', defect.rectifiedImage)">
          <img v-if="defect.rectifiedImage" :src="defect.rectifiedImage" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div v-else class="flex flex-col items-center gap-2 text-white/20">
            <ImageIcon :size="48" />
            <span class="text-[10px] font-bold uppercase tracking-widest">暂无整改照片</span>
          </div>
          <div v-if="defect.rectifiedImage" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Search :size="24" class="text-white" />
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom: Info and Delete -->
    <div class="flex-1 flex items-end justify-between gap-12 pb-2">
      <!-- Left: Info -->
      <div class="flex-1 grid grid-cols-2 gap-x-12 gap-y-6">
        <div class="col-span-2">
          <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-2">缺陷描述</p>
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p class="text-white/80 text-sm leading-relaxed">{{ defect.description }}</p>
          </div>
        </div>
        <div>
          <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-2">计划完成时间</p>
          <div class="flex items-center gap-3 text-white">
            <Calendar :size="16" class="text-orange-400" />
            <span class="text-lg font-bold font-mono">{{ defect.planDate }}</span>
          </div>
        </div>
        <div>
          <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-2">实际完成时间</p>
          <div class="flex items-center gap-3 text-white">
            <CheckCircle :size="16" :class="defect.finishDate ? 'text-[#A1D573]' : 'text-white/20'" />
            <span class="text-lg font-bold font-mono" :class="!defect.finishDate && 'text-white/20'">
              {{ defect.finishDate || '尚未完成' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right: Delete Button -->
      <div class="pb-1">
        <button 
          @click="$emit('delete', defect.id)"
          class="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-bold transition-all border border-rose-500/20"
        >
          <Trash2 :size="18" />
          删除记录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Image as ImageIcon, Calendar, CheckCircle, Trash2 } from 'lucide-vue-next';

defineProps<{
  defect: any;
}>();

defineEmits(['zoomImage', 'delete']);
</script>
