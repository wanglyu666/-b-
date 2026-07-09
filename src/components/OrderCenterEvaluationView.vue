<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ArrowLeft, Star } from 'lucide-vue-next';
import checkMarkImg from '../../image asset/check mark.png';
import type { OrderCenterItem } from '../data/orderCenterSample';

const props = defineProps<{
  order: OrderCenterItem;
  editable?: boolean;
  existingRating?: number;
  existingFeedback?: string;
}>();

const emit = defineEmits<{
  back: [];
  submit: [data: { rating: number; feedback: string }];
}>();

type EvaluationStep = 'form' | 'success';

const step = ref<EvaluationStep>('form');
const rating = ref(props.existingRating ?? 0);
const hoverRating = ref(0);
const feedback = ref(props.existingFeedback ?? '');

const isEditable = computed(() => props.editable !== false);

watch(
  () => props.existingRating,
  (value) => {
    rating.value = value ?? 0;
  },
);

watch(
  () => props.existingFeedback,
  (value) => {
    feedback.value = value ?? '';
  },
);

const ratingText = computed(() => {
  const current = hoverRating.value || rating.value;
  switch (current) {
    case 1:
      return '非常不满意';
    case 2:
      return '不满意';
    case 3:
      return '一般';
    case 4:
      return '满意';
    case 5:
      return '非常满意';
    default:
      return '';
  }
});

const isValid = computed(() => rating.value > 0 && feedback.value.trim().length > 0);

function setRating(value: number) {
  if (isEditable.value) {
    rating.value = value;
  }
}

function handleSubmit() {
  if (!isValid.value || !isEditable.value) return;
  step.value = 'success';
}

function handleSuccessReturn() {
  emit('submit', {
    rating: rating.value,
    feedback: feedback.value.trim(),
  });
}

function handleBack() {
  if (step.value === 'success') {
    handleSuccessReturn();
    return;
  }
  emit('back');
}
</script>

<template>
  <div class="relative min-h-screen w-full overflow-x-hidden bg-transparent">
    <div
      class="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] animate-in flex-col px-4 py-8 duration-500 fade-in slide-in-from-bottom-4 sm:px-6 md:px-8"
    >
      <header class="flex flex-shrink-0 items-center gap-4">
        <button
          type="button"
          class="rounded-full border border-gray-200 bg-white p-2 transition-colors hover:bg-gray-50"
          @click="handleBack"
        >
          <ArrowLeft :size="20" />
        </button>
        <Transition name="evaluation-header-fade" mode="out-in">
          <div v-if="step === 'success'" key="success-header">
            <h1 class="text-2xl font-bold text-gray-900">提交成功</h1>
          </div>
          <div v-else key="form-header">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ isEditable ? '订单评价' : '查看评价' }}
            </h1>
            <p class="mt-1 text-sm text-gray-500">
              订单编号 <span class="font-mono text-gray-700">{{ order.orderNo }}</span>
              · {{ order.productTitle }}
            </p>
          </div>
        </Transition>
      </header>

      <div
        class="mt-6 flex min-h-[calc(100vh-10rem)] flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
      >
        <div class="evaluation-step-shell flex min-h-0 flex-1 flex-col overflow-hidden">
          <Transition name="evaluation-step-fade" mode="out-in">
            <div
              v-if="step === 'success'"
              key="success"
              class="flex h-full min-h-0 flex-1 flex-col items-center justify-center px-8 py-12"
            >
              <img :src="checkMarkImg" alt="" class="mb-6 h-36 w-56 object-contain" />
              <h2 class="mb-4 text-3xl font-bold tracking-tight text-gray-800">已完成提交</h2>
              <p class="mb-12 text-center text-gray-500">您的订单评价已成功记录到系统中</p>
              <button
                type="button"
                class="rounded-xl border border-gray-200 bg-white px-8 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
                @click="handleSuccessReturn"
              >
                返回订单中心
              </button>
            </div>

            <div v-else key="form" class="flex h-full min-h-0 flex-1 flex-col">
              <div class="custom-scrollbar flex flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-8 py-10">
                <div class="flex w-full max-w-md flex-col items-center gap-4">
                  <p class="mb-2 text-lg font-medium text-gray-700">
                    {{ isEditable ? '请对本订单进行打分' : '评价结果' }}
                  </p>
                  <div class="flex items-center gap-3 sm:gap-4">
                    <button
                      v-for="star in 5"
                      :key="star"
                      type="button"
                      class="transition-transform focus:outline-none"
                      :class="isEditable ? 'hover:scale-110' : 'cursor-not-allowed'"
                      :disabled="!isEditable"
                      @click="setRating(star)"
                      @mouseenter="isEditable && (hoverRating = star)"
                      @mouseleave="hoverRating = 0"
                    >
                      <Star
                        :size="44"
                        :class="[
                          'transition-colors duration-200',
                          (hoverRating ? star <= hoverRating : star <= rating)
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.45)]'
                            : 'text-gray-200',
                        ]"
                      />
                    </button>
                  </div>
                  <p class="mt-2 h-8 text-xl font-bold text-amber-500">
                    {{ ratingText }}
                  </p>
                </div>

                <div class="mt-2 flex w-full max-w-2xl flex-col gap-3">
                  <label class="pl-1 text-sm font-medium text-gray-700">文字评价</label>
                  <textarea
                    v-model="feedback"
                    :disabled="!isEditable"
                    placeholder="请输入您对本订单的评价内容..."
                    class="custom-scrollbar h-40 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#FFEB69] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFEB69]/30 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>
              </div>

              <div class="mt-auto flex h-[4.5rem] shrink-0 items-center justify-end border-t border-gray-100 px-8">
                <button
                  v-if="isEditable"
                  type="button"
                  class="rounded-xl bg-[#9fe870] px-8 py-2.5 text-sm font-bold text-[#163300] transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!isValid"
                  @click="handleSubmit"
                >
                  确认提交
                </button>
                <button
                  v-else
                  type="button"
                  disabled
                  class="cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-8 py-2.5 text-sm font-bold text-gray-400"
                >
                  已评价
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.evaluation-step-fade-enter-active,
.evaluation-step-fade-leave-active {
  transition: opacity 0.35s ease;
}

.evaluation-step-fade-enter-from,
.evaluation-step-fade-leave-to {
  opacity: 0;
}

.evaluation-header-fade-enter-active,
.evaluation-header-fade-leave-active {
  transition: opacity 0.25s ease;
}

.evaluation-header-fade-enter-from,
.evaluation-header-fade-leave-to {
  opacity: 0;
}

.evaluation-step-shell :deep(> *) {
  display: flex;
  height: 100%;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 10px;
}
</style>
