<template>
  <div class="flex h-full min-h-0 flex-col animate-in zoom-in-95 duration-500">
    <Transition name="fade-slide" mode="out-in">
      <div v-if="isSubmittedSuccess" :key="'success'" class="flex flex-col items-center justify-center py-20 gap-8 animate-in fade-in zoom-in-95 duration-500">
        <img :src="checkMarkImg" alt="" class="h-36 w-56 object-contain" />
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

      <div v-else :key="'detail'" class="flex h-full min-h-0 flex-1 flex-col">
        <!-- Top Section: Info & Image -->
        <div class="flex shrink-0 flex-col gap-6">
          <div class="grid grid-cols-4 gap-6">
            <div class="min-w-0">
              <p class="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">品类</p>
              <p class="truncate text-lg font-bold tracking-tight text-white sm:text-xl">{{ material?.cat }}</p>
            </div>
            <div class="min-w-0">
              <p class="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">物料编码</p>
              <p class="truncate font-mono text-lg font-bold tracking-tight text-white sm:text-xl">{{ material?.code }}</p>
            </div>
            <div class="min-w-0">
              <p class="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">物料名称</p>
              <p class="truncate text-lg font-bold tracking-tight text-white sm:text-xl">{{ material?.name }}</p>
            </div>
            <div class="min-w-0">
              <p class="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">品牌</p>
              <p class="truncate text-lg font-bold tracking-tight text-white sm:text-xl">{{ material?.brand }}</p>
            </div>
          </div>

          <!-- Image Carousel -->
          <div
            class="group relative mx-auto aspect-[16/9] w-full max-w-[460px] cursor-pointer overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl"
            @click="$emit('zoomImage', currentImage)"
          >
            <div
              class="flex h-full transition-transform duration-500 ease-out"
              :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }"
            >
              <img
                v-for="(img, index) in carouselImages"
                :key="index"
                :src="img"
                alt="验收图片"
                class="h-full w-full shrink-0 object-cover"
                referrerpolicy="no-referrer"
              />
            </div>
            <button
              type="button"
              class="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white opacity-0 shadow-lg backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-white/30"
              aria-label="上一张"
              @click.stop="prevImage"
            >
              <ChevronLeft :size="22" />
            </button>
            <button
              type="button"
              class="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white opacity-0 shadow-lg backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-white/30"
              aria-label="下一张"
              @click.stop="nextImage"
            >
              <ChevronRight :size="22" />
            </button>
            <div class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
              <div class="rounded-full border border-white/30 bg-white/20 p-5 shadow-lg backdrop-blur-md">
                <Search :size="32" class="text-white" />
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Section: Evaluation & Buttons -->
        <div class="mt-auto shrink-0 border-t border-white/5 pt-5 pb-1">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <!-- Left: Evaluation -->
          <div class="flex min-w-0 flex-wrap items-center gap-6 lg:gap-10">
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
                      evaluation === opt.id ? 'border-[#FFE600] bg-[#FFE600]/10' : 'border-white/20 group-hover:border-white/40'
                    ]"
                  >
                    <div 
                      v-if="evaluation === opt.id"
                      class="w-3 h-3 rounded-full bg-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.8)]"
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
          <div class="flex shrink-0 flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              class="inline-flex shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white shadow-lg backdrop-blur-xl transition-all hover:bg-white/10"
            >
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                <FileText :size="20" />
              </div>
              <span class="whitespace-nowrap text-sm font-bold">下载材料质量证明文件</span>
            </button>

            <button
              v-if="!isSubmitted"
              type="button"
              :disabled="!evaluation"
              :class="[
                'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-8 py-2.5 text-base font-bold transition-all active:scale-[0.95]',
                evaluation
                  ? 'bg-[#FFE600] text-[#260A2F] shadow-[0_6px_24px_rgba(255,230,0,0.32)] hover:bg-[#e6cf00]'
                  : 'cursor-not-allowed border border-white/5 bg-white/5 text-white/20 shadow-none',
              ]"
              @click="submit"
            >
              提交
            </button>
            <button
              v-else
              type="button"
              disabled
              class="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-white/10 bg-white/5 px-8 py-2.5 text-base font-bold text-white/40 cursor-not-allowed"
            >
              已完成提交
            </button>
          </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Search, CheckCircle, FileText, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import checkMarkImg from '../../../image asset/check mark.png';

const carouselImages = [
  'https://picsum.photos/seed/construction/1200/675',
  'https://picsum.photos/seed/material-acceptance-2/1200/675',
  'https://picsum.photos/seed/material-acceptance-3/1200/675',
  'https://picsum.photos/seed/material-acceptance-4/1200/675',
];

const props = defineProps<{
  material: any;
  isSubmitted: boolean;
}>();

const emit = defineEmits(['goBack', 'zoomImage', 'submit']);

const isSubmittedSuccess = ref(false);
const evaluation = ref<'pass' | 'fail' | null>(null);
const currentImageIndex = ref(0);

const currentImage = computed(() => carouselImages[currentImageIndex.value]);

function prevImage() {
  currentImageIndex.value =
    (currentImageIndex.value - 1 + carouselImages.length) % carouselImages.length;
}

function nextImage() {
  currentImageIndex.value = (currentImageIndex.value + 1) % carouselImages.length;
}

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
