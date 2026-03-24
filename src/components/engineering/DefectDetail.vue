<template>
  <div class="animate-in zoom-in-95 duration-500 flex flex-col h-full relative">
    <!-- Top: Images -->
    <div class="grid grid-cols-2 gap-6 mb-8">
      <div class="space-y-3">
        <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold text-center">缺陷照片</p>
        <div class="h-[240px] rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative group cursor-pointer" @click="$emit('zoomImage', defect.image)">
          <img :src="defect.image" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Search :size="24" class="text-white" />
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold text-center">整改完成照片</p>
        <div class="h-[240px] rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative group flex items-center justify-center" :class="{'cursor-pointer': defect.rectifiedImage}" @click="defect.rectifiedImage && $emit('zoomImage', defect.rectifiedImage)">
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
          <div v-if="reviewStatus === 'fail'" class="bg-white/5 border border-rose-500/30 rounded-2xl p-4 focus-within:border-rose-500/50 transition-colors">
            <textarea 
              v-model="newDescription" 
              class="w-full bg-transparent text-white/80 text-sm leading-relaxed focus:outline-none resize-none min-h-[60px]"
              placeholder="请重新填写缺陷描述..."
            ></textarea>
          </div>
          <div v-else class="bg-white/5 border border-white/10 rounded-2xl p-4">
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

      <!-- Right: Actions -->
      <div class="pb-1 flex items-center gap-4">
        <template v-if="defect.status === '已完成' || defect.status === '已处理'">
          <div class="flex items-center gap-6 mr-4">
            <label class="flex items-center gap-2 cursor-pointer group">
              <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                   :class="reviewStatus === 'pass' ? 'border-[#A1D573]' : 'border-white/30 group-hover:border-white/50'">
                <div v-if="reviewStatus === 'pass'" class="w-2.5 h-2.5 rounded-full bg-[#A1D573]"></div>
              </div>
              <span class="text-white/70 font-bold" :class="reviewStatus === 'pass' && 'text-[#A1D573]'">通过</span>
              <input type="radio" value="pass" v-model="reviewStatus" class="hidden" />
            </label>
            <label class="flex items-center gap-2 cursor-pointer group">
              <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                   :class="reviewStatus === 'fail' ? 'border-rose-400' : 'border-white/30 group-hover:border-white/50'">
                <div v-if="reviewStatus === 'fail'" class="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
              </div>
              <span class="text-white/70 font-bold" :class="reviewStatus === 'fail' && 'text-rose-400'">不通过</span>
              <input type="radio" value="fail" v-model="reviewStatus" class="hidden" />
            </label>
          </div>
          
          <button 
            v-if="reviewStatus"
            @click="handleSubmit"
            :disabled="reviewStatus === 'fail' && !newDescription.trim()"
            class="px-6 py-3 rounded-2xl bg-[#FFC091] hover:bg-[#ffb078] text-[#260A2F] text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            提交
          </button>
        </template>

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
import { ref, watch } from 'vue';
import { Search, Image as ImageIcon, Calendar, CheckCircle, Trash2 } from 'lucide-vue-next';

const props = defineProps<{
  defect: any;
}>();

const emit = defineEmits(['zoomImage', 'delete', 'submitReview']);

const reviewStatus = ref<'pass' | 'fail' | null>(null);
const newDescription = ref(props.defect.description);

watch(() => props.defect, (newDefect) => {
  reviewStatus.value = null;
  newDescription.value = newDefect.description;
}, { immediate: true });

const handleSubmit = () => {
  if (reviewStatus.value === 'fail' && !newDescription.value.trim()) return;
  emit('submitReview', {
    id: props.defect.id,
    status: reviewStatus.value,
    description: reviewStatus.value === 'fail' ? newDescription.value : props.defect.description
  });
};
</script>
