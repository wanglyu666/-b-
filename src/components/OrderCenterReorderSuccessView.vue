<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import checkMarkImg from '../../image asset/check mark.png';
import type { OrderCenterItem } from '../data/orderCenterSample';

defineProps<{
  order: OrderCenterItem;
}>();

const emit = defineEmits<{
  back: [];
}>();
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
          @click="emit('back')"
        >
          <ArrowLeft :size="20" />
        </button>
        <h1 class="text-2xl font-bold text-gray-900">提交成功</h1>
      </header>

      <div
        class="mt-6 flex min-h-[calc(100vh-10rem)] flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
      >
        <div
          class="flex h-full min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-8 py-12"
        >
          <img :src="checkMarkImg" alt="" class="mb-6 h-36 w-56 object-contain" />
          <h2 class="mb-4 text-3xl font-bold tracking-tight text-gray-800">已完成提交</h2>
          <p class="mb-12 text-center text-gray-500">
            您的再次下单请求已成功提交，商品将加入购物车并为您安排后续流程
          </p>
          <button
            type="button"
            class="rounded-xl border border-gray-200 bg-white px-8 py-3 font-bold text-[#3A341C] shadow-sm transition-colors hover:bg-gray-50"
            @click="emit('back')"
          >
            返回上级页面
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
