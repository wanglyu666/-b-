<template>
  <div class="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-6">
    <!-- Sub Tabs -->
    <div v-if="!isSubmittedSuccess" class="flex gap-3">
      <button 
        @click="setTab('acceptance_check')"
        :class="['px-6 py-2 rounded-full text-sm font-bold transition-all', 
          progressDetailTab === 'acceptance_check' ? 'bg-[#FFC091] text-[#260A2F]' : 'bg-white/5 text-white/60 hover:bg-white/10']"
      >
        验收
      </button>
      <button 
        @click="setTab('defect_rectification')"
        :class="['px-6 py-2 rounded-full text-sm font-bold transition-all', 
          progressDetailTab === 'defect_rectification' ? 'bg-[#FFC091] text-[#260A2F]' : 'bg-white/5 text-white/60 hover:bg-white/10']"
      >
        缺陷整改
      </button>
    </div>

    <Transition name="fade-slide" mode="out-in">
      <!-- Success Screen -->
      <div v-if="isSubmittedSuccess" :key="'success'" class="flex flex-col items-center justify-center py-20 gap-8 animate-in fade-in zoom-in-95 duration-500">
        <div class="w-24 h-24 rounded-full bg-[#A1D573]/20 flex items-center justify-center text-[#A1D573] shadow-[0_0_30px_rgba(161,213,115,0.3)]">
          <CheckCircle :size="64" />
        </div>
        <div class="text-center">
          <h3 class="text-3xl font-bold text-white mb-2">已完成提交</h3>
          <p class="text-white/40">您的验收评价已成功记录到系统中</p>
        </div>
        <button 
          @click="$emit('goBack')"
          class="h-14 px-12 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl transition-all border border-white/10"
        >
          返回上级页面
        </button>
      </div>

      <!-- Acceptance Check Content -->
      <div v-else-if="progressDetailTab === 'acceptance_check'" :key="'check'" class="flex flex-col gap-16">
        <!-- Top Section: Info & Image -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Left: Progress Info -->
          <div class="grid grid-cols-2 gap-y-12 gap-x-16 py-6">
            <div>
              <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">验收节点名称</p>
              <p class="text-white text-2xl font-bold tracking-tight">{{ progressItem?.node }}</p>
            </div>
            <div class="flex flex-col gap-12">
              <div>
                <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">计划验收时间</p>
                <p class="text-white text-2xl font-bold font-mono tracking-tight">{{ progressItem?.planDate }}</p>
              </div>
              <div>
                <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">预约验收时间</p>
                <p class="text-white text-2xl font-bold font-mono tracking-tight">{{ progressItem?.appointmentDate }}</p>
              </div>
            </div>
          </div>

          <!-- Right: Image -->
          <div class="relative group cursor-pointer overflow-hidden rounded-[48px] border border-white/10 bg-white/5 backdrop-blur-xl aspect-[16/9] max-h-[280px] flex items-center justify-center shadow-2xl" @click="$emit('zoomImage', 'https://picsum.photos/seed/progress/1200/675')">
            <img src="https://picsum.photos/seed/progress/1200/675" alt="Progress" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
            <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div class="bg-white/20 backdrop-blur-md p-5 rounded-full border border-white/30 shadow-lg">
                <Search :size="32" class="text-white" />
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Section: Evaluation & Buttons -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-white/5 items-center">
          <!-- Left: Evaluation -->
          <div class="lg:col-span-7 flex items-center gap-10">
            <template v-if="!isSubmitted">
              <span class="text-xl font-bold text-white whitespace-nowrap tracking-tight">验收评价</span>
              <div class="flex items-center gap-12">
                <button 
                  v-for="opt in [
                    {id: 'pass', label: '通过'}, 
                    {id: 'fail', label: '不通过'}
                  ]" 
                  :key="opt.id"
                  @click="evaluation = opt.id as any"
                  class="flex items-center gap-4 group cursor-pointer"
                >
                  <div 
                    :class="[
                      'w-7 h-7 rounded-full border-2 transition-all duration-300 flex items-center justify-center',
                      evaluation === opt.id ? 'border-[#FFC091] bg-[#FFC091]/10' : 'border-white/20 group-hover:border-white/40'
                    ]"
                  >
                    <div 
                      v-if="evaluation === opt.id"
                      class="w-3 h-3 rounded-full bg-[#FFC091] shadow-[0_0_12px_rgba(255,192,145,0.8)]"
                    ></div>
                  </div>
                  <span :class="['text-xl font-bold transition-colors', evaluation === opt.id ? 'text-white' : 'text-white/40 group-hover:text-white/60']">
                    {{ opt.label }}
                  </span>
                </button>
              </div>
            </template>
            <div v-else class="flex items-center gap-3 text-[#A1D573]">
              <CheckCircle :size="24" />
              <span class="text-xl font-bold tracking-tight">验收已完成</span>
            </div>
          </div>

          <!-- Right: Submit Button -->
          <div class="lg:col-span-5 flex items-center justify-end gap-6">
            <button 
              v-if="!isSubmitted"
              @click="submit"
              :disabled="!evaluation"
              :class="[
                'h-18 px-16 font-bold text-xl rounded-2xl transition-all shadow-[0_10px_40px_rgba(255,192,145,0.3)] active:scale-[0.95]',
                evaluation ? 'bg-[#FFC091] hover:bg-[#ffad70] text-[#260A2F]' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5 shadow-none'
              ]"
            >
              提交
            </button>
            <button 
              v-else
              disabled
              class="h-18 px-12 bg-white/5 text-white/40 font-bold text-xl rounded-2xl border border-white/10 cursor-not-allowed"
            >
              已完成提交
            </button>
          </div>
        </div>
      </div>

      <!-- Defect Rectification Content -->
      <div v-else-if="progressDetailTab === 'defect_rectification'" :key="'defect'" class="flex-1 flex flex-col h-full relative min-h-[400px]">
        <!-- Top Header with Add Button -->
        <div class="flex justify-between items-center mb-6 px-2">
          <div class="flex items-center gap-2">
            <div class="w-1 h-4 bg-orange-400 rounded-full"></div>
            <span class="text-white/40 text-xs font-bold uppercase tracking-widest">缺陷记录列表</span>
          </div>
          <button 
            @click="$emit('addDefect')"
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
              @click="$emit('viewDefectDetail', defect)"
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
      <div v-else :key="'fallback'" class="hidden"></div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Search, CheckCircle, Plus } from 'lucide-vue-next';

const props = defineProps<{
  progressItem: any;
  defects: any[];
  isSubmitted: boolean;
  initialTab?: 'acceptance_check' | 'defect_rectification';
}>();

const emit = defineEmits(['goBack', 'zoomImage', 'submit', 'addDefect', 'viewDefectDetail', 'update:tab']);

const progressDetailTab = ref(props.initialTab || 'acceptance_check');

watch(() => props.initialTab, (newVal) => {
  if (newVal) {
    progressDetailTab.value = newVal;
  }
});

const setTab = (tab: 'acceptance_check' | 'defect_rectification') => {
  progressDetailTab.value = tab;
  emit('update:tab', tab);
};
const isSubmittedSuccess = ref(false);
const evaluation = ref<'pass' | 'fail' | null>(null);

const submit = () => {
  if (!evaluation.value) return;
  isSubmittedSuccess.value = true;
  emit('submit', props.progressItem.node);
};
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

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
</style>
