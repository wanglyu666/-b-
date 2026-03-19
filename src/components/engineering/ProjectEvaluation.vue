<template>
  <div class="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
    <div class="p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-8 items-center justify-center">
      
      <!-- Rating Stars -->
      <div class="flex flex-col items-center gap-4 w-full max-w-md">
        <div class="text-white/80 text-lg font-medium mb-2">请对本项目进行打分</div>
        <div class="flex items-center gap-4">
          <button 
            v-for="star in 5" 
            :key="star"
            @click="setRating(star)"
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0"
            :disabled="isEvaluated"
            class="transition-transform hover:scale-110 focus:outline-none disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Star 
              :size="48" 
              :class="[
                'transition-colors duration-200',
                (hoverRating ? star <= hoverRating : star <= rating) 
                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
                  : 'text-white/20'
              ]" 
            />
          </button>
        </div>
        <div class="text-yellow-400 font-bold text-xl h-8 mt-2">
          {{ ratingText }}
        </div>
      </div>

      <!-- Evaluation Text -->
      <div class="w-full max-w-2xl flex flex-col gap-3 mt-4">
        <label class="text-white/80 text-sm font-medium pl-2">文字评价</label>
        <textarea 
          v-model="feedback"
          :disabled="isEvaluated"
          placeholder="请输入您对本项目的评价内容..."
          class="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400/50 transition-colors resize-none custom-scrollbar disabled:opacity-70 disabled:cursor-not-allowed"
        ></textarea>
      </div>

    </div>
    
    <!-- Footer -->
    <div class="px-8 py-4 flex justify-end flex-shrink-0">
      <button 
        v-if="!isEvaluated"
        @click="submit"
        :disabled="!isValid"
        class="px-8 py-2.5 bg-[#FFC091] text-[#260A2F] text-sm font-bold rounded-xl hover:bg-[#ffad70] transition-colors shadow-[0_0_15px_rgba(255,192,145,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        确认提交
      </button>
      <button 
        v-else
        disabled
        class="px-8 py-2.5 bg-white/10 text-white/40 text-sm font-bold rounded-xl cursor-not-allowed"
      >
        已评价
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Star } from 'lucide-vue-next';

const props = defineProps<{
  existingEvaluation?: { rating: number; feedback: string } | null;
}>();

const emit = defineEmits(['submit']);

const rating = ref(0);
const hoverRating = ref(0);
const feedback = ref('');

const isEvaluated = computed(() => !!props.existingEvaluation);

watch(() => props.existingEvaluation, (newVal) => {
  if (newVal) {
    rating.value = newVal.rating;
    feedback.value = newVal.feedback;
  } else {
    rating.value = 0;
    feedback.value = '';
  }
}, { immediate: true });

const ratingText = computed(() => {
  const current = hoverRating.value || rating.value;
  switch (current) {
    case 1: return '非常不满意';
    case 2: return '不满意';
    case 3: return '一般';
    case 4: return '满意';
    case 5: return '非常满意';
    default: return '';
  }
});

const setRating = (val: number) => {
  if (!isEvaluated.value) {
    rating.value = val;
  }
};

const isValid = computed(() => {
  return rating.value > 0 && feedback.value.trim().length > 0;
});

const submit = () => {
  if (isValid.value && !isEvaluated.value) {
    emit('submit', {
      rating: rating.value,
      feedback: feedback.value
    });
  }
};
</script>

<style scoped>
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
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
