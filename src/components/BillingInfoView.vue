<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';

defineEmits<{
  back: [];
}>();

withDefaults(
  defineProps<{
    companyName?: string;
    creditCode?: string;
    registeredAddress?: string;
    registeredPhone?: string;
    bankName?: string;
    bankAccount?: string;
  }>(),
  {
    companyName: '这么派（上海）科技有限公司',
    creditCode: '91310000MA1FL2XXXX',
    registeredAddress: '上海市浦东新区张江高科技园区科苑路 88 号',
    registeredPhone: '021-5888-6600',
    bankName: '中国工商银行上海张江支行',
    bankAccount: '1001 2345 6789 0123 456',
  },
);

const fields = [
  { key: 'companyName', label: '企业全称' },
  { key: 'creditCode', label: '统一信用代码' },
  { key: 'registeredAddress', label: '注册地址' },
  { key: 'registeredPhone', label: '注册电话' },
  { key: 'bankName', label: '开户行' },
  { key: 'bankAccount', label: '银行账号' },
] as const;
</script>

<template>
  <div
    class="mx-auto flex w-full max-w-6xl flex-1 flex-col animate-in fade-in slide-in-from-bottom-2 duration-500"
  >
    <button
      type="button"
      class="mb-4 inline-flex w-fit items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-white/50 hover:text-gray-900"
      @click="$emit('back')"
    >
      <ArrowLeft :size="18" />
      返回
    </button>

    <div
      class="flex min-h-[calc(100vh-10rem)] flex-1 flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/70 shadow-sm backdrop-blur-md"
    >
      <div class="flex flex-1 flex-col px-6 py-10 sm:px-10 sm:py-12">
        <h2 class="text-xl font-bold text-gray-900 sm:text-2xl">开票信息</h2>

        <div class="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
          <div
            v-for="field in fields"
            :key="field.key"
            class="border-b border-gray-200/60 pb-5 last:border-b-0 last:pb-0 sm:pb-6"
          >
            <p class="text-sm text-gray-500 sm:text-base">{{ field.label }}</p>
            <p class="mt-1.5 text-base font-medium text-gray-900 sm:mt-2 sm:text-lg">
              {{ $props[field.key] }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
