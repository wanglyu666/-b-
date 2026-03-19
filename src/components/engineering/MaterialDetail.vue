<template>
  <div class="animate-in zoom-in-95 duration-500 flex flex-col gap-16">
    <Transition name="fade-slide" mode="out-in">
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

      <div v-else :key="'detail'">
        <!-- Top Section: Info & Image -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Left: Material Info -->
          <div class="grid grid-cols-2 gap-y-12 gap-x-16 py-6">
            <div>
              <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">品类</p>
              <p class="text-white text-2xl font-bold tracking-tight">{{ material?.cat }}</p>
            </div>
            <div>
              <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">物料编码</p>
              <p class="text-white text-2xl font-bold font-mono tracking-tight">{{ material?.code }}</p>
            </div>
            <div>
              <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">物料名称</p>
              <p class="text-white text-2xl font-bold tracking-tight">{{ material?.name }}</p>
            </div>
            <div>
              <p class="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4">品牌</p>
              <p class="text-white text-2xl font-bold tracking-tight">{{ material?.brand }}</p>
            </div>
          </div>

          <!-- Right: Image -->
          <div class="relative group cursor-pointer overflow-hidden rounded-[48px] border border-white/10 bg-white/5 backdrop-blur-xl aspect-[16/9] flex items-center justify-center shadow-2xl" @click="$emit('zoomImage', 'https://picsum.photos/seed/construction/1200/675')">
            <img src="https://picsum.photos/seed/construction/1200/675" alt="Material" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
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

          <!-- Right: Buttons -->
          <div class="lg:col-span-5 flex items-center justify-end gap-6">
            <!-- Download Button -->
            <button class="h-18 px-10 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 text-white rounded-2xl transition-all flex items-center gap-5 group shadow-lg">
              <div class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <FileText :size="24" />
              </div>
              <div class="text-left">
                <p class="font-bold text-base">下载材料质量证明文件</p>
              </div>
            </button>

            <!-- Submit Button -->
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
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search, CheckCircle, FileText } from 'lucide-vue-next';

const props = defineProps<{
  material: any;
  isSubmitted: boolean;
}>();

const emit = defineEmits(['goBack', 'zoomImage', 'submit']);

const isSubmittedSuccess = ref(false);
const evaluation = ref<'pass' | 'fail' | null>(null);

const submit = () => {
  if (!evaluation.value) return;
  isSubmittedSuccess.value = true;
  emit('submit', props.material.code);
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
</style>
