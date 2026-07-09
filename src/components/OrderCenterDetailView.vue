<script setup lang="ts">
import { computed } from 'vue';
import { ArrowLeft } from 'lucide-vue-next';
import { buildOrderCustomerInfo, type OrderCenterItem } from '../data/orderCenterSample';
import { useAppStore } from '../stores/appStore';

const LIST_TABLE_COLUMNS = [
  '专业',
  '科目编号',
  '科目名称',
  '计算规则',
  '品牌',
  '系列/型号',
  '规格',
  '工作内容及特征描述',
  '单位',
  '综合含税单价',
] as const;

const DESCRIPTION_MAX_LEN = 10;

const props = defineProps<{
  order: OrderCenterItem;
}>();

defineEmits<{
  back: [];
}>();

const appStore = useAppStore();

const customerInfo = computed(() =>
  buildOrderCustomerInfo(props.order, appStore.customerName, '138-0013-8000'),
);

function truncateDescription(text: string, max = DESCRIPTION_MAX_LEN) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
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
          @click="$emit('back')"
        >
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">订单详情</h1>
          <p class="mt-1 text-sm text-gray-500">
            订单编号 <span class="font-mono text-gray-700">{{ order.orderNo }}</span>
          </p>
        </div>
      </header>

      <div
        class="mt-6 flex min-h-[calc(100vh-10rem)] flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
      >
        <div class="custom-scrollbar flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          <section class="mb-10">
            <h2 class="mb-4 text-base font-bold text-gray-900">产品信息</h2>
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div class="overflow-x-auto">
                <table class="w-full min-w-[960px] border-collapse text-left">
                  <thead>
                    <tr class="border-b border-gray-100 bg-gray-50/80 text-sm font-medium text-gray-500">
                      <th
                        v-for="column in LIST_TABLE_COLUMNS"
                        :key="column"
                        :class="[
                          'h-[3.75rem] px-6 align-middle whitespace-nowrap',
                          column === '工作内容及特征描述' ? 'min-w-[8rem]' : '',
                        ]"
                      >
                        {{ column }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, index) in order.lineItems"
                      :key="row.id"
                      :class="[
                        'h-[3.75rem] text-gray-700',
                        index < order.lineItems.length - 1 ? 'border-b border-gray-100' : '',
                      ]"
                    >
                      <td class="px-6 align-middle text-gray-600">{{ row.major }}</td>
                      <td class="px-6 align-middle text-gray-600">{{ row.subjectCode }}</td>
                      <td class="px-6 align-middle font-medium text-gray-800">
                        {{ row.subjectName }}
                      </td>
                      <td class="px-6 align-middle text-gray-600">{{ row.calcRule }}</td>
                      <td class="px-6 align-middle text-gray-600">{{ row.brand }}</td>
                      <td class="px-6 align-middle text-gray-600">{{ row.model }}</td>
                      <td class="px-6 align-middle text-gray-600">{{ row.spec }}</td>
                      <td class="px-6 align-middle text-gray-500">
                        {{ truncateDescription(row.description) }}
                      </td>
                      <td class="px-6 align-middle text-gray-600">{{ row.unit }}</td>
                      <td class="whitespace-nowrap px-6 align-middle font-medium text-gray-800">
                        ¥{{ row.taxIncludedPrice.toFixed(2) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 class="mb-4 text-base font-bold text-gray-900">客户信息</h2>
            <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <table class="w-full border-collapse text-left text-sm">
                <tbody>
                  <tr
                    v-for="(row, index) in customerInfo"
                    :key="row.label"
                    :class="index < customerInfo.length - 1 ? 'border-b border-gray-100' : ''"
                  >
                    <th
                      class="w-36 shrink-0 bg-gray-50/80 px-6 py-4 align-top font-medium text-gray-500 sm:w-44"
                    >
                      {{ row.label }}
                    </th>
                    <td class="px-6 py-4 text-gray-800">{{ row.value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
